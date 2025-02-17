drop trigger if exists "set_invitations_timestamp" on "public"."invitations";

drop trigger if exists "trigger_set_invitation_details" on "public"."invitations";

drop trigger if exists "Game Info - Algolia" on "public"."game_info";

drop trigger if exists "Cluster Goals" on "public"."goals";

drop trigger if exists "Goals - Algolia" on "public"."goals";

drop trigger if exists "Profiles - Algolia" on "public"."profiles";

drop trigger if exists "Visions - Algolia" on "public"."vision_boards";

create table "public"."assessments" (
    "id" uuid not null default gen_random_uuid(),
    "type" character varying(255) not null default 'rating'::character varying,
    "strategy" jsonb default '{}'::jsonb,
    "results_schema" jsonb default '{}'::jsonb,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "title" text not null,
    "description" text not null,
    "cover_url" text
);


create table "public"."evaluations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "assessment_id" uuid,
    "results" jsonb default '{}'::jsonb
);


alter table "public"."account_user" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."activities" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."activity_progress" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."answers" add column "assessment_id" uuid;

alter table "public"."answers" add column "response" jsonb default '{}'::jsonb;

alter table "public"."invitations" alter column "created_at" set default now();

alter table "public"."invitations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."invitations" alter column "updated_at" set default now();

alter table "public"."profiles" alter column "employment_status" drop default;

alter table "public"."questions" add column "assessment_id" uuid;

alter table "public"."questions" add column "metadata" jsonb default '{}'::jsonb;

alter table "public"."tasks" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."workplaces" drop column "created_at";

alter table "public"."workplaces" add column "enabled_assessments" jsonb;

CREATE UNIQUE INDEX assessment_pkey ON public.assessments USING btree (id);

CREATE UNIQUE INDEX evaluations_pkey ON public.evaluations USING btree (id);

alter table "public"."assessments" add constraint "assessment_pkey" PRIMARY KEY using index "assessment_pkey";

alter table "public"."evaluations" add constraint "evaluations_pkey" PRIMARY KEY using index "evaluations_pkey";

alter table "public"."answers" add constraint "answers_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE not valid;

alter table "public"."answers" validate constraint "answers_assessment_id_fkey";

alter table "public"."answers" validate constraint "answers_question_id_fkey";

alter table "public"."answers" validate constraint "answers_user_id_fkey";

alter table "public"."evaluations" add constraint "evaluations_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES assessments(id) not valid;

alter table "public"."evaluations" validate constraint "evaluations_assessment_id_fkey";

alter table "public"."evaluations" add constraint "evaluations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."evaluations" validate constraint "evaluations_user_id_fkey";

alter table "public"."questions" add constraint "fk_questions_assessment" FOREIGN KEY (assessment_id) REFERENCES assessments(id) not valid;

alter table "public"."questions" validate constraint "fk_questions_assessment";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_unanswered_questions(iuser_id uuid)
 RETURNS TABLE(id integer, question text, category text, feat_label text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question, q.category, q.feat_label
    FROM questions q
    LEFT JOIN answers a ON q.id = a.question_id AND a.user_id = iuser_id
    WHERE a.question_id IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unanswered_questions_count(iuser_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    unanswered_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unanswered_count
    FROM questions q
    LEFT JOIN answers a ON q.id = a.question_id AND a.user_id = iuser_id
    WHERE a.question_id IS NULL;
    
    RETURN unanswered_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.accept_invitation(lookup_invitation_token text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE 
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.add_current_user_to_new_account()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$BEGIN

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
END;$function$
;

CREATE OR REPLACE FUNCTION public.ban_user_function(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE auth.users
  SET banned_until = '3024-01-01 00:00:00'
  WHERE id = user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_level_for_game_task()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.specific_activity_id IS NOT NULL THEN
        DECLARE
            specific_activity_category TaskType;
        BEGIN
            SELECT category INTO specific_activity_category
            FROM specific_activities
            WHERE id = NEW.specific_activity_id;

            IF specific_activity_category = 'GAME' THEN
                INSERT INTO levels (id, duration, difficulty_level)
                VALUES (gen_random_uuid(), 10, 'chill')
                RETURNING id INTO NEW.level_id;
            END IF;
        END;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_new_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin

insert into public.profiles(id, fdb_ref, email)
values(new.id, new.id, new.email);
return new;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_token(length integer)
 RETURNS bytea
 LANGUAGE plpgsql
AS $function$ BEGIN return replace(
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_accounts_for_current_user(passed_in_role account_role DEFAULT NULL::account_role)
 RETURNS SETOF uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    select account_id
    from public.account_user wu
    where wu.user_id = auth.uid()
      and
        (
            wu.account_role = passed_in_role
            or passed_in_role is null
        );
$function$
;

CREATE OR REPLACE FUNCTION public.get_creation_date_record_count(start_date date, end_date date)
 RETURNS TABLE(creation_date date, record_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
    SELECT created_at::date AS creation_date, COUNT(*)::INT AS record_count
    FROM profiles
    WHERE created_at::date >= start_date AND created_at::date <= end_date
    GROUP BY created_at::date
    ORDER BY creation_date;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_game_info_by_workplace_id(workplaceid uuid DEFAULT NULL::uuid)
 RETURNS TABLE(game_info game_info)
 LANGUAGE sql
AS $function$
  SELECT game_info.*
  FROM game_info
  LEFT JOIN profiles ON game_info.profile_id = profiles.id
  WHERE profiles.workplace_ref = workplaceId OR profiles.institution_ref = workplaceId OR workplaceId IS NULL;
$function$
;

CREATE OR REPLACE FUNCTION public.get_top_cluster_class_counts(workplaceid uuid DEFAULT NULL::uuid)
 RETURNS TABLE(cluster_class text, goals_count integer, user_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        g.cluster_class,
        COUNT(*)::INT AS goals_count,
        COUNT(DISTINCT u.id)::INT AS user_count
    FROM 
        goals g
    JOIN 
        vision_boards v ON g.vision_id = v.id
    JOIN 
        profiles u ON v.user_id = u.id
    WHERE 
        g.cluster_class IS NOT NULL
        AND (workplaceId IS NULL OR u.workplace_ref = workplaceId OR u.institution_ref = workplaceId)
    GROUP BY 
        g.cluster_class
    ORDER BY 
        user_count DESC, 
        g.cluster_class
    LIMIT 5;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_with_respect_date(start_date date, end_date date, workplaceid uuid DEFAULT NULL::uuid)
 RETURNS TABLE(creation_date date, record_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
    SELECT created_at::date AS creation_date, COUNT(*)::INT AS record_count
    FROM profiles
    WHERE (workplaceId IS NULL OR
           workplace_ref = workplaceId OR
           institution_ref = workplaceId)
      AND created_at::date BETWEEN start_date AND end_date
    GROUP BY created_at::date
    ORDER BY creation_date;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_users_with_goals_and_visions()
 RETURNS TABLE(result_row record)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    profiles.*,  -- Include all user profile columns here
    vision_boards.*,  -- Include all vision columns here
    goals.*  -- Include all goal columns here
  FROM profiles
  JOIN vision_boards ON profiles.id = vision_boards.user_id
  JOIN goals ON vision_boards.id = goals.vision_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.lookup_invitation(lookup_invitation_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare team_name text;

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

$function$
;

CREATE OR REPLACE FUNCTION public.search_posts(keyword text)
 RETURNS SETOF profiles
 LANGUAGE sql
AS $function$
select 
  * 
from 
  profiles
where 
  to_tsvector(name || ' ' || email ) -- concat columns, but be sure to include a space to separate them!
  @@ to_tsquery(keyword);
$function$
;

CREATE OR REPLACE FUNCTION public.search_user()
 RETURNS SETOF profiles
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY SELECT * FROM profiles WHERE to_tsvector(name || ' ' || email)  @@ to_tsquery('admin@lca.com');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_user(keyword text)
 RETURNS SETOF profiles
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Replace spaces with & for full-text search
    keyword := REPLACE(keyword, ' ', ' & ');

    RETURN QUERY 
    SELECT *
    FROM profiles
    WHERE 
        (to_tsvector(COALESCE(' ' || email, '') || ' ' ||  COALESCE(' ' || name, '') || COALESCE(' ' || workplace, '')) @@ to_tsquery(keyword))
        OR
        (
            (position(keyword in name) > 0)
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        )
        OR
        (
            (position(keyword in workplace) > 0)
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        )
        OR
        (
            name ILIKE '%' || keyword || '%'
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        )
        OR
        (
            keyword ILIKE '%' || name || '%'
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        )
        OR
        (
            email ILIKE '%' || keyword || '%'
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        )
        OR
        (
            workplace ILIKE '%' || keyword || '%'
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        )
        OR
        (
            keyword ILIKE '%' || workplace || '%'
            AND
            NOT EXISTS (SELECT 1 FROM profiles WHERE to_tsvector(email) @@ to_tsquery(keyword))
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_account_user_role(account_id uuid, user_id uuid, new_account_role account_role)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

grant delete on table "public"."assessments" to "anon";

grant insert on table "public"."assessments" to "anon";

grant references on table "public"."assessments" to "anon";

grant select on table "public"."assessments" to "anon";

grant trigger on table "public"."assessments" to "anon";

grant truncate on table "public"."assessments" to "anon";

grant update on table "public"."assessments" to "anon";

grant delete on table "public"."assessments" to "authenticated";

grant insert on table "public"."assessments" to "authenticated";

grant references on table "public"."assessments" to "authenticated";

grant select on table "public"."assessments" to "authenticated";

grant trigger on table "public"."assessments" to "authenticated";

grant truncate on table "public"."assessments" to "authenticated";

grant update on table "public"."assessments" to "authenticated";

grant delete on table "public"."assessments" to "service_role";

grant insert on table "public"."assessments" to "service_role";

grant references on table "public"."assessments" to "service_role";

grant select on table "public"."assessments" to "service_role";

grant trigger on table "public"."assessments" to "service_role";

grant truncate on table "public"."assessments" to "service_role";

grant update on table "public"."assessments" to "service_role";

grant delete on table "public"."evaluations" to "anon";

grant insert on table "public"."evaluations" to "anon";

grant references on table "public"."evaluations" to "anon";

grant select on table "public"."evaluations" to "anon";

grant trigger on table "public"."evaluations" to "anon";

grant truncate on table "public"."evaluations" to "anon";

grant update on table "public"."evaluations" to "anon";

grant delete on table "public"."evaluations" to "authenticated";

grant insert on table "public"."evaluations" to "authenticated";

grant references on table "public"."evaluations" to "authenticated";

grant select on table "public"."evaluations" to "authenticated";

grant trigger on table "public"."evaluations" to "authenticated";

grant truncate on table "public"."evaluations" to "authenticated";

grant update on table "public"."evaluations" to "authenticated";

grant delete on table "public"."evaluations" to "service_role";

grant insert on table "public"."evaluations" to "service_role";

grant references on table "public"."evaluations" to "service_role";

grant select on table "public"."evaluations" to "service_role";

grant trigger on table "public"."evaluations" to "service_role";

grant truncate on table "public"."evaluations" to "service_role";

grant update on table "public"."evaluations" to "service_role";

CREATE TRIGGER "Game Info - Algolia" AFTER INSERT OR DELETE OR UPDATE ON public.game_info FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://kszrzybbmdzfsouztknz.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE TRIGGER "Cluster Goals" AFTER INSERT OR UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://kszrzybbmdzfsouztknz.supabase.co/functions/v1/goals-clustering', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE TRIGGER "Goals - Algolia" AFTER INSERT OR DELETE OR UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://kszrzybbmdzfsouztknz.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE TRIGGER "Profiles - Algolia" AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://kszrzybbmdzfsouztknz.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE TRIGGER "Visions - Algolia" AFTER INSERT OR DELETE OR UPDATE ON public.vision_boards FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://kszrzybbmdzfsouztknz.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');


