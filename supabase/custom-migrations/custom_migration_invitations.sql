/**
 * Invitation types are either email or link. Email invitations are sent to
 * a single user and can only be claimed once.  Link invitations can be used multiple times
 * Both expire after 24 hours
 */
DROP TYPE IF EXISTS public.invitation_type;

CREATE TYPE public.invitation_type AS ENUM ('one-time', '24-hour');

/**
 * Invitations are sent to users to join a account
 * They pre-define the role the user should have once they join
 */
CREATE
OR REPLACE FUNCTION public.generate_token(length int) RETURNS bytea AS $$ BEGIN return replace(
    replace(
        replace(
            encode(gen_random_bytes(length) :: bytea, 'base64'),
            '/',
            '-'
        ),
        '+',
        '_'
    ),
    '\', ' - ');
END
$$ LANGUAGE plpgsql;

grant execute on function public.generate_token(int) to authenticated;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamps()
    RETURNS TRIGGER AS
$$
BEGIN
    if TG_OP = '
    INSERT
        ' then
        NEW.created_at = now();
        NEW.updated_at = now();
    else
        NEW.updated_at = now();
        NEW.created_at = OLD.created_at;
    end if;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

create table public.invitations
(
    -- the id of the invitation
    id                 uuid unique                not null default uuid_generate_v4(),
    -- what role should invitation accepters be given in this account
    account_role       account_role               not null,
    -- the account the invitation is for
    account_id         uuid references public.workplaces   not null,
    -- unique token used to accept the invitation
    token              text unique                not null default public.generate_token(30),
    -- who created the invitation
    invited_by_user_id uuid references public.profiles not null,
    -- account name. filled in by a trigger
    account_team_name  text,
    -- when the invitation was last updated
    updated_at         timestamp with time zone,
    -- when the invitation was created
    created_at         timestamp with time zone,
    -- what type of invitation is this
    invitation_type    invitation_type            not null,
    primary key (id)
);

-- manage timestamps

CREATE TRIGGER set_invitations_timestamp
    BEFORE INSERT OR UPDATE
    ON public.invitations
    FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamps();

/**
  * This funciton fills in account info and inviting user email
  * so that the recipient can get more info about the invitation prior to
  * accepting.  It allows us to avoid complex permissions on accounts
 */
CREATE OR REPLACE FUNCTION public.trigger_set_invitation_details()
    RETURNS TRIGGER AS
$$
BEGIN
    -- NEW.invited_by_user_id = (select id from public.profiles where id = NEW.account_id);
    NEW.account_team_name = (select workplace_name from public.workplaces where id = NEW.account_id);
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_details
    BEFORE INSERT
    ON public.invitations
    FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_invitation_details();

-- enable RLS on invitations
-- alter table public.invitations
--     enable row level security;

-- create policy "Invitations viewable by account owners" on invitations
--     for select
--     to authenticated
--     using (
--             created_at > (now() - interval ' 24 hours ')
--         and
--             (account_id IN
--              (SELECT basejump.get_accounts_for_current_user(' owner ') AS get_accounts_for_current_user))
--     );


-- create policy "Invitations can be created by account owners" on invitations
--     for insert
--     to authenticated
--     with check (
--         -- team accounts should be enabled
--         basejump.is_set(' enable_team_accounts ') = true
--         -- this should not be a personal account
--         and (SELECT personal_account FROM public.accounts WHERE id = account_id) = false
--         -- the inserting user should be an owner of the account
--         and
--             (account_id IN
--              (SELECT basejump.get_accounts_for_current_user(' owner ') AS get_accounts_for_current_user))
--     );

-- create policy "Invitations can be deleted by account owners" on invitations
--     for delete
--     to authenticated
--     using (
--     (account_id IN
--      (SELECT basejump.get_accounts_for_current_user(' owner ') AS get_accounts_for_current_user))
--     );

/**
  * Allows a user to accept an existing invitation and join a account
  * This one exists in the public schema because we want it to be called
  * using the supabase rpc method
 */
create or replace function accept_invitation(lookup_invitation_token text)
    returns uuid
    language plpgsql
    security definer set search_path = public
as
$$
DECLARE 
  lookup_account_id UUID;
  workplace_type TEXT;
  new_member_role ACCOUNT_ROLE;
  user_emloyement_status TEXT;
  existing_role TEXT;
BEGIN
  SELECT 
    account_id,
    account_role
  INTO 
    lookup_account_id,
    new_member_role
  FROM 
    invitations
  WHERE 
    token = lookup_invitation_token
    AND created_at > NOW() - INTERVAL '24 hours';

  IF lookup_account_id IS NULL THEN 
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF lookup_account_id IS NOT NULL THEN
    -- We've validated the token is real, so grant the user access
    SELECT "type" INTO workplace_type FROM public.workplaces WHERE id = lookup_account_id;
    SELECT employment_status INTO user_emloyement_status FROM public.profiles WHERE id = auth.uid();
    -- type FROM public.workplaces WHERE id = lookup_account_id;

    IF user_emloyement_status = 'Employed Adult 18+' THEN
      UPDATE public.profiles
      SET
        workplace_ref = lookup_account_id
      WHERE
        id = auth.uid();
    ELSE
      UPDATE public.profiles
      SET
        institution_ref = lookup_account_id
      WHERE
        id = auth.uid();
    END IF;

    -- SELECT COALESCE((SELECT account_role FROM public.account_user WHERE account_id = lookup_account_id AND user_id = auth.uid()), NULL) INTO existing_role;

    -- -- Insert or update role
    -- IF existing_role IS NULL THEN
    --   INSERT INTO public.account_user(account_id, user_id, account_role)
    --   VALUES (lookup_account_id, auth.uid(), new_member_role);
    -- ELSE
    --   UPDATE public.account_user
    --   SET account_role = new_member_role
    --   WHERE account_id = lookup_account_id AND user_id = auth.uid();
    -- END IF;


    -- IF workplace_type = 'workplace' THEN
    --   UPDATE public.profiles
    --   SET
    --     workplace_ref = lookup_account_id
    --   WHERE
    --     id = auth.uid();
    -- ELSE
    --   UPDATE public.profiles
    --   SET
    --     institution_ref = lookup_account_id
    --   WHERE
    --     id = auth.uid();
    -- END IF;

    -- Insert into account_user (account_id, user_id, account_role)
    -- VALUES (lookup_account_id, auth.uid(), new_member_role);
    -- Email types of invitations are only good for one usage
    DELETE FROM invitations
    WHERE
      token = lookup_invitation_token
      AND invitation_type = 'one-time';
  END IF;

  RETURN lookup_account_id;
END;
$$;

/**
 * Allows a user to lookup an existing invitation and join a account
 * This one exists in the public schema because we want it to be called
 * using the supabase rpc method
 */
create
or replace function public.lookup_invitation(lookup_invitation_token text) returns json language plpgsql security definer
set
    search_path = public as $$ declare team_name text;

invitation_active boolean;

begin
select
    account_team_name,
    case
        when id IS NOT NULL then true
        else false
    end as active into team_name,
    invitation_active
from
    invitations
where
    token = lookup_invitation_token
    and created_at > now() - interval ' 24 hours '
limit
    1;

return json_build_object(
    ' active ',
    coalesce(invitation_active, false),
    ' team_name ',
    team_name
);

end;

$$;

-- CREATE OR REPLACE FUNCTION public.set_role_from_invitation()
--     RETURNS TRIGGER
--     LANGUAGE plpgsql
--     SECURITY DEFINER
--     SET search_path = public
-- AS $$
-- BEGIN
--     UPDATE public.account_user
--     SET account_role = NEW.account_role
--     WHERE account_id = NEW.account_id AND user_id IN (SELECT id FROM public.profiles WHERE email = NEW.invitee_email);

--     RETURN NEW;
-- END;
-- $$;


-- CREATE TRIGGER set_role_from_invitation
--     AFTER DELETE
--     ON public.invitations
--     FOR EACH ROW
--     EXECUTE FUNCTION public.set_role_from_invitation();

grant execute on function accept_invitation(text) to authenticated;

grant execute on function lookup_invitation(text) to authenticated;