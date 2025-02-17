DROP TYPE IF EXISTS public.account_role;

CREATE TYPE public.account_role AS ENUM ('owner', 'member');

CREATE TABLE IF NOT EXISTS public.account_user (
    -- id of the user in the account
    user_id uuid references public.profiles not null,
    -- id of the account the user is in
    account_id uuid references public.workplaces not null,
    -- role of the user in the account
    account_role account_role not null,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL
);



CREATE OR REPLACE FUNCTION public.add_current_user_to_new_account()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
AS $$
BEGIN

    IF NEW.workplace_ref IS NOT NULL AND OLD.workplace_ref IS NULL THEN
        INSERT INTO public.account_user (account_id, user_id, account_role)
        VALUES (NEW.workplace_ref, NEW.id, 'member');
    END IF;
    
    IF NEW.institution_ref IS NOT NULL AND OLD.institution_ref IS NULL THEN
        INSERT INTO public.account_user (account_id, user_id, account_role)
        VALUES (NEW.institution_ref, NEW.id, 'member');
    END IF;

    IF NEW.workplace_ref <> OLD.workplace_ref THEN
        UPDATE public.account_user
        SET account_id = NEW.workplace_ref, account_role = 'member'
        WHERE account_user.account_id = OLD.workplace_ref AND account_user.user_id = NEW.id;
    END IF;        

    IF NEW.institution_ref <> OLD.institution_ref THEN
        UPDATE public.account_user
        SET account_id = NEW.institution_ref, account_role = 'member'
        WHERE account_user.account_id = OLD.institution_ref AND account_user.user_id = NEW.id;
    END IF;        

    RETURN NEW;
END;
$$;


CREATE TRIGGER add_current_user_to_new_account
    AFTER UPDATE
    ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION basejump.add_current_user_to_new_account();



/**
  * Let's you update a users role within an account if you are an owner of that account
  **/
create or replace function public.update_account_user_role(account_id uuid, user_id uuid,  new_account_role account_role)
returns text
security definer
set search_path=public
language plpgsql
as $$
    declare
        is_account_owner boolean;
        user_role_ text;
    begin
        -- check if the user is an owner, and if they are, allow them to update the role
        select (update_account_user_role.account_id IN ( SELECT public.get_accounts_for_current_user('owner') AS get_accounts_for_current_user)) into is_account_owner;
        select user_role into user_role_ from public.profiles where id = auth.uid();

        if is_account_owner or user_role_ = 'admin' then
            update public.account_user set account_role = new_account_role where account_user.account_id = update_account_user_role.account_id and account_user.user_id = update_account_user_role.user_id;
            return new_account_role;
        else
            raise exception 'You must be an owner of the account to update a users role';
        end if;
    end;
$$;

grant execute on function public.update_account_user_role(uuid, uuid, account_role) to authenticated;

/**
  * Returns account_ids that the current user is a member of. If you pass in a role,
  * it'll only return accounts that the user is a member of with that role.
  */
create or replace function public.get_accounts_for_current_user(passed_in_role account_role default null)
returns setof uuid
language sql
security definer
set search_path=public
as $$
    select account_id
    from public.account_user wu
    where wu.user_id = auth.uid()
      and
        (
            wu.account_role = passed_in_role
            or passed_in_role is null
        );
$$;

grant execute on function public.get_accounts_for_current_user(account_role) to authenticated;