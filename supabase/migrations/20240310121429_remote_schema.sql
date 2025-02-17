
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "public,auth";

ALTER SCHEMA "public,auth" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgtap" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."account_role" AS ENUM (
    'owner',
    'member',
    'super-owner'
);

ALTER TYPE "public"."account_role" OWNER TO "postgres";

CREATE TYPE "public"."billing_providers" AS ENUM (
    'stripe'
);

ALTER TYPE "public"."billing_providers" OWNER TO "postgres";

CREATE TYPE public.difficulty AS ENUM ('easy', 'medium', 'hard');

ALTER TYPE "public"."difficulty" OWNER TO "postgres";

CREATE TYPE "public"."invitation_type" AS ENUM (
    'one-time',
    '24-hour'
);

ALTER TYPE "public"."invitation_type" OWNER TO "postgres";

CREATE TYPE "public"."pricing_plan_interval" AS ENUM (
    'day',
    'week',
    'month',
    'year'
);

ALTER TYPE "public"."pricing_plan_interval" OWNER TO "postgres";

CREATE TYPE "public"."pricing_type" AS ENUM (
    'one_time',
    'recurring'
);

ALTER TYPE "public"."pricing_type" OWNER TO "postgres";

CREATE TYPE public.role_status AS ENUM ('admin', 'user');

ALTER TYPE "public"."role_status" OWNER TO "postgres";

CREATE TYPE "public"."subscription_status" AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid'
);

ALTER TYPE "public"."subscription_status" OWNER TO "postgres";

CREATE TYPE public.taskstate AS ENUM ('UNTOUCHED', 'ONGOING', 'COMPLETED');

ALTER TYPE "public"."taskstate" OWNER TO "postgres";

CREATE TYPE public.tasktype AS ENUM ('GAME', 'QUIZ', 'FLASHCARD');

ALTER TYPE "public"."tasktype" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."accept_invitation"("lookup_invitation_token" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE 
  lookup_account_id UUID;
  workplace_type TEXT;
  new_member_role ACCOUNT_ROLE;
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
    -- type FROM public.workplaces WHERE id = lookup_account_id;

    IF workplace_type = 'workplace' THEN
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

    -- Insert into account_user (account_id, user_id, account_role)
    -- VALUES (lookup_account_id, auth.uid(), new_member_role);
    -- Email types of invitations are only good for one usage
    DELETE FROM invitations
    WHERE
      token = lookup_invitation_token
      AND invitation_type = 'one-time';
  END IF;

  RETURN lookup_account_id;
END;$$;

ALTER FUNCTION "public"."accept_invitation"("lookup_invitation_token" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."add_current_user_to_new_account"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN

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
        SET account_id = NEW.workplace_ref
        WHERE account_user.account_id = OLD.workplace_ref AND account_user.user_id = NEW.id;
    END IF;        

    IF NEW.institution_ref <> OLD.institution_ref THEN
        UPDATE public.account_user
        SET account_id = NEW.institution_ref
        WHERE account_user.account_id = OLD.institution_ref AND account_user.user_id = NEW.id;
    END IF;        

    RETURN NEW;
END;$$;

ALTER FUNCTION "public"."add_current_user_to_new_account"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."ban_user_function"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE auth.users
  SET banned_until = '3024-01-01 00:00:00'
  WHERE id = user_id;
END;
$$;

ALTER FUNCTION "public"."ban_user_function"("user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_level_for_game_task"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."create_level_for_game_task"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_new_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin

insert into public.profiles(id, fdb_ref, email)
values(new.id, new.id, new.email);
return new;

end;
$$;

ALTER FUNCTION "public"."create_new_profile"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."generate_token"("length" integer) RETURNS "bytea"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    return replace(replace(replace(encode(gen_random_bytes(length)::bytea, 'base64'), '/', '-'), '+', '_'), '\', '-');
END
$$;

ALTER FUNCTION "public"."generate_token"("length" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_accounts_for_current_user"("passed_in_role" "public"."account_role" DEFAULT NULL::"public"."account_role") RETURNS SETOF "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    select account_id
    from public.account_user wu
    where wu.user_id = auth.uid()
      and
        (
            wu.account_role = passed_in_role
            or passed_in_role is null
        );
$$;

ALTER FUNCTION "public"."get_accounts_for_current_user"("passed_in_role" "public"."account_role") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_creation_date_record_count"("start_date" "date", "end_date" "date") RETURNS TABLE("creation_date" "date", "record_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY 
    SELECT created_at::date AS creation_date, COUNT(*)::INT AS record_count
    FROM profiles
    WHERE created_at::date >= start_date AND created_at::date <= end_date
    GROUP BY created_at::date
    ORDER BY creation_date;
END;
$$;

ALTER FUNCTION "public"."get_creation_date_record_count"("start_date" "date", "end_date" "date") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."game_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "levels_completed" boolean[],
    "onboarding_completed" boolean,
    "game_id" "text" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "durations" integer[]
);

ALTER TABLE "public"."game_info" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_game_info_by_workplace_id"("workplaceid" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("game_info" "public"."game_info")
    LANGUAGE "sql"
    AS $$
  SELECT game_info.*
  FROM game_info
  LEFT JOIN profiles ON game_info.profile_id = profiles.id
  WHERE profiles.workplace_ref = workplaceId OR profiles.institution_ref = workplaceId OR workplaceId IS NULL;
$$;

ALTER FUNCTION "public"."get_game_info_by_workplace_id"("workplaceid" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_top_cluster_class_counts"("workplaceid" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("cluster_class" "text", "goals_count" integer, "user_count" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."get_top_cluster_class_counts"("workplaceid" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_with_respect_date"("start_date" "date", "end_date" "date", "workplaceid" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("creation_date" "date", "record_count" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."get_user_with_respect_date"("start_date" "date", "end_date" "date", "workplaceid" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_users_with_goals_and_visions"() RETURNS TABLE("result_row" "record")
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."get_users_with_goals_and_visions"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."lookup_invitation"("lookup_invitation_token" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    team_name         text;
    invitation_active boolean;
begin
    select account_team_name,
           case when id IS NOT NULL then true else false end as active
    into team_name, invitation_active
    from invitations
    where token = lookup_invitation_token
      and created_at > now() - interval '24 hours'
    limit 1;
    return json_build_object('active', coalesce(invitation_active, false), 'team_name', team_name);
end;
$$;

ALTER FUNCTION "public"."lookup_invitation"("lookup_invitation_token" "text") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "email" "text" NOT NULL,
    "name" "text",
    "workplace" "text",
    "created_at" timestamp(3) without time zone DEFAULT "now"(),
    "updated_at" timestamp(3) without time zone DEFAULT "now"(),
    "fdb_ref" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topPos" smallint,
    "bottomPos" smallint,
    "leftPos" smallint,
    "rightPos" smallint,
    "profile_photo" "text",
    "user_role" "public"."role_status" DEFAULT 'user'::"public"."role_status" NOT NULL,
    "workplace_ref" "uuid",
    "institution_ref" "uuid",
    "employment_status" "text" DEFAULT 'Employed Adult 18+'::"text",
    "is_deleted" boolean DEFAULT false
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_posts"("keyword" "text") RETURNS SETOF "public"."profiles"
    LANGUAGE "sql"
    AS $$
select 
  * 
from 
  profiles
where 
  to_tsvector(name || ' ' || email ) -- concat columns, but be sure to include a space to separate them!
  @@ to_tsquery(keyword);
$$;

ALTER FUNCTION "public"."search_posts"("keyword" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_user"() RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY SELECT * FROM profiles WHERE to_tsvector(name || ' ' || email)  @@ to_tsquery('admin@lca.com');
END;
$$;

ALTER FUNCTION "public"."search_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_user"("keyword" "text") RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."search_user"("keyword" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."trigger_set_invitation_details"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- NEW.invited_by_user_id = (select id from public.profiles where id = NEW.account_id);
    NEW.account_team_name = (select workplace_name from public.workplaces where id = NEW.account_id);
    RETURN NEW;
END
$$;

ALTER FUNCTION "public"."trigger_set_invitation_details"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamps"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    if TG_OP = 'INSERT' then
        NEW.created_at = now();
        NEW.updated_at = now();
    else
        NEW.updated_at = now();
        NEW.created_at = OLD.created_at;
    end if;
    RETURN NEW;
END
$$;

ALTER FUNCTION "public"."trigger_set_timestamps"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_account_user_role"("account_id" "uuid", "user_id" "uuid", "new_account_role" "public"."account_role") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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

ALTER FUNCTION "public"."update_account_user_role"("account_id" "uuid", "user_id" "uuid", "new_account_role" "public"."account_role") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);

ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."account_user" (
    "user_id" "uuid" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "account_role" "public"."account_role" NOT NULL,
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL
);

ALTER TABLE "public"."account_user" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "category_id" bigint,
    "subcategory" character varying(255),
    "description" "text",
    "image_url" character varying(255),
    "thumbnail_url" character varying(255),
    "enabled" boolean NOT NULL,
    "meta_data" "jsonb",
    "featured" boolean DEFAULT false NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);

ALTER TABLE "public"."activities" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."activity_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "activity_id" "uuid" NOT NULL,
    "score" integer,
    "total_score" integer,
    "onboarding_completed" boolean,
    "current_task_order" integer DEFAULT 1 NOT NULL
);

ALTER TABLE "public"."activity_progress" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."answers" (
    "id" integer NOT NULL,
    "answered_at" timestamp(3) without time zone DEFAULT "now"() NOT NULL,
    "rating" integer NOT NULL,
    "question_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."answers" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."answers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."answers_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."answers_id_seq" OWNED BY "public"."answers"."id";

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying
);

ALTER TABLE "public"."categories" OWNER TO "postgres";
ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."constants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "json"
);

ALTER TABLE "public"."constants" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "url" "text" NOT NULL,
    "vision_id" "text" NOT NULL,
    "top_pos" double precision,
    "bottom_pos" double precision,
    "left_pos" double precision,
    "right_pos" double precision,
    "size_id" "text",
    "createdAt" timestamp(3) without time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT "now"() NOT NULL,
    "cluster_class" "text"
);

ALTER TABLE "public"."goals" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."image_search" (
    "id" "text" NOT NULL,
    "search_term" "text" NOT NULL,
    "url" "text" NOT NULL
);

ALTER TABLE "public"."image_search" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "account_role" "public"."account_role" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "token" "text" DEFAULT "public"."generate_token"(30) NOT NULL,
    "invited_by_user_id" "uuid" NOT NULL,
    "account_team_name" "text",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "invitation_type" "public"."invitation_type" NOT NULL
);

ALTER TABLE "public"."invitations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."obstacles" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "vision_id" "text",
    "goal_id" "text",
    "createdAt" timestamp without time zone DEFAULT "now"(),
    "updatedAt" timestamp without time zone DEFAULT "now"(),
    "is_completed" boolean DEFAULT false
);

ALTER TABLE "public"."obstacles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles_copy" (
    "email" "text" NOT NULL,
    "name" "text",
    "workplace" "text",
    "created_at" timestamp(3) without time zone DEFAULT "now"(),
    "updated_at" timestamp(3) without time zone DEFAULT "now"(),
    "fdb_ref" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topPos" smallint,
    "bottomPos" smallint,
    "leftPos" smallint,
    "rightPos" smallint,
    "profile_photo" "text",
    "user_role" "public"."role_status" DEFAULT 'user'::"public"."role_status" NOT NULL,
    "workplace_ref" "uuid",
    "institution_ref" "uuid",
    "employment_status" "text"
);

ALTER TABLE "public"."profiles_copy" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" integer NOT NULL,
    "question" "text" NOT NULL,
    "category" "text" NOT NULL,
    "feat_label" "text" NOT NULL
);

ALTER TABLE "public"."questions" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."questions_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."questions_id_seq" OWNED BY "public"."questions"."id";

CREATE TABLE IF NOT EXISTS "public"."scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "score" double precision,
    "updated_at" timestamp(3) without time zone DEFAULT "now"()
);

ALTER TABLE "public"."scores" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."sizes" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "height" double precision DEFAULT 200.0 NOT NULL,
    "width" double precision DEFAULT 200.0 NOT NULL
);

ALTER TABLE "public"."sizes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "state" "public"."taskstate" DEFAULT 'UNTOUCHED'::"public"."taskstate",
    "locked" boolean DEFAULT true,
    "progress" integer DEFAULT 0,
    "complete" boolean DEFAULT false,
    "started_at" timestamp(3) without time zone DEFAULT "now"(),
    "completed_at" timestamp without time zone
);

ALTER TABLE "public"."status" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."task_completion" (
    "profile_id" "uuid" NOT NULL,
    "task_id" "uuid" NOT NULL,
    "completion_timestamp" timestamp with time zone DEFAULT "now"(),
    "score" integer,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."task_completion" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "activity_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "max_score" integer DEFAULT 1 NOT NULL,
    "order" integer,
    "difficulty_level" "public"."difficulty"
);

ALTER TABLE "public"."tasks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "task_id" "uuid",
    "created_at" timestamp without time zone,
    "status_id" "uuid",
    "score_id" "uuid"
);

ALTER TABLE "public"."user_tasks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."vendor_ratings" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "rating" double precision DEFAULT '0'::double precision
);

ALTER TABLE "public"."vendor_ratings" OWNER TO "postgres";
ALTER TABLE "public"."vendor_ratings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."vendor_ratings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."vision_boards" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "img_url" "text",
    "created_at" timestamp(3) without time zone DEFAULT "now"(),
    "updated_at" timestamp(3) without time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."vision_boards" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."vision_log" (
    "id" "text" NOT NULL,
    "vision_id" "text" NOT NULL,
    "device_id" "text" NOT NULL,
    "edited_at" timestamp(3) without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(3) without time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."vision_log" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."workplaces" (
    "workplace_logo" "text",
    "workplace_address" "jsonb",
    "workplace_description" "text",
    "workplace_domain" "text",
    "workplace_email" character varying(255),
    "workplace_name" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);

ALTER TABLE "public"."workplaces" OWNER TO "postgres";

ALTER TABLE ONLY "public"."answers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."answers_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."account_user"
    ADD CONSTRAINT "account_user_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_token_key" UNIQUE ("token");

CREATE OR REPLACE TRIGGER "Cluster Goals" AFTER INSERT OR UPDATE ON "public"."goals" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://mtzwzsxblhulourliqvr.supabase.co/functions/v1/goals-clustering', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE OR REPLACE TRIGGER "Game Info - Algolia" AFTER INSERT OR DELETE OR UPDATE ON "public"."game_info" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://mtzwzsxblhulourliqvr.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE OR REPLACE TRIGGER "Goals - Algolia" AFTER INSERT OR DELETE OR UPDATE ON "public"."goals" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://mtzwzsxblhulourliqvr.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE OR REPLACE TRIGGER "Profiles - Algolia" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://mtzwzsxblhulourliqvr.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE OR REPLACE TRIGGER "Visions - Algolia" AFTER INSERT OR DELETE OR UPDATE ON "public"."vision_boards" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://mtzwzsxblhulourliqvr.supabase.co/functions/v1/algolia-sync-auto', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

CREATE OR REPLACE TRIGGER "add_current_user_to_new_account" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."add_current_user_to_new_account"();

CREATE OR REPLACE TRIGGER "set_invitations_timestamp" BEFORE INSERT OR UPDATE ON "public"."invitations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamps"();

CREATE OR REPLACE TRIGGER "trigger_set_invitation_details" BEFORE INSERT ON "public"."invitations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_invitation_details"();

ALTER TABLE "public"."vendor_ratings" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."accept_invitation"("lookup_invitation_token" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."accept_invitation"("lookup_invitation_token" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."add_current_user_to_new_account"() TO "service_role";

GRANT ALL ON FUNCTION "public"."ban_user_function"("user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."ban_user_function"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ban_user_function"("user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."create_level_for_game_task"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_level_for_game_task"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_level_for_game_task"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_new_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_profile"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_token"("length" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."generate_token"("length" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_accounts_for_current_user"("passed_in_role" "public"."account_role") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_accounts_for_current_user"("passed_in_role" "public"."account_role") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_creation_date_record_count"("start_date" "date", "end_date" "date") TO "service_role";

GRANT ALL ON TABLE "public"."game_info" TO "anon";
GRANT ALL ON TABLE "public"."game_info" TO "authenticated";
GRANT ALL ON TABLE "public"."game_info" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_game_info_by_workplace_id"("workplaceid" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_top_cluster_class_counts"("workplaceid" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_with_respect_date"("start_date" "date", "end_date" "date", "workplaceid" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_users_with_goals_and_visions"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_users_with_goals_and_visions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_with_goals_and_visions"() TO "service_role";

GRANT ALL ON FUNCTION "public"."lookup_invitation"("lookup_invitation_token" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."lookup_invitation"("lookup_invitation_token" "text") TO "authenticated";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON FUNCTION "public"."search_posts"("keyword" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_posts"("keyword" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_posts"("keyword" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."search_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."search_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."search_user"("keyword" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_user"("keyword" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_user"("keyword" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."trigger_set_invitation_details"() TO "service_role";

GRANT ALL ON FUNCTION "public"."trigger_set_timestamps"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_account_user_role"("account_id" "uuid", "user_id" "uuid", "new_account_role" "public"."account_role") TO "service_role";
GRANT ALL ON FUNCTION "public"."update_account_user_role"("account_id" "uuid", "user_id" "uuid", "new_account_role" "public"."account_role") TO "authenticated";

GRANT ALL ON TABLE "public"."_prisma_migrations" TO "anon";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "service_role";

GRANT ALL ON TABLE "public"."account_user" TO "anon";
GRANT ALL ON TABLE "public"."account_user" TO "authenticated";
GRANT ALL ON TABLE "public"."account_user" TO "service_role";

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";

GRANT ALL ON TABLE "public"."activity_progress" TO "anon";
GRANT ALL ON TABLE "public"."activity_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_progress" TO "service_role";

GRANT ALL ON TABLE "public"."answers" TO "anon";
GRANT ALL ON TABLE "public"."answers" TO "authenticated";
GRANT ALL ON TABLE "public"."answers" TO "service_role";

GRANT ALL ON SEQUENCE "public"."answers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."answers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."answers_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";

GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."constants" TO "anon";
GRANT ALL ON TABLE "public"."constants" TO "authenticated";
GRANT ALL ON TABLE "public"."constants" TO "service_role";

GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";

GRANT ALL ON TABLE "public"."image_search" TO "anon";
GRANT ALL ON TABLE "public"."image_search" TO "authenticated";
GRANT ALL ON TABLE "public"."image_search" TO "service_role";

GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";

GRANT ALL ON TABLE "public"."obstacles" TO "anon";
GRANT ALL ON TABLE "public"."obstacles" TO "authenticated";
GRANT ALL ON TABLE "public"."obstacles" TO "service_role";

GRANT ALL ON TABLE "public"."profiles_copy" TO "anon";
GRANT ALL ON TABLE "public"."profiles_copy" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_copy" TO "service_role";

GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."scores" TO "anon";
GRANT ALL ON TABLE "public"."scores" TO "authenticated";
GRANT ALL ON TABLE "public"."scores" TO "service_role";

GRANT ALL ON TABLE "public"."sizes" TO "anon";
GRANT ALL ON TABLE "public"."sizes" TO "authenticated";
GRANT ALL ON TABLE "public"."sizes" TO "service_role";

GRANT ALL ON TABLE "public"."status" TO "anon";
GRANT ALL ON TABLE "public"."status" TO "authenticated";
GRANT ALL ON TABLE "public"."status" TO "service_role";

GRANT ALL ON TABLE "public"."task_completion" TO "anon";
GRANT ALL ON TABLE "public"."task_completion" TO "authenticated";
GRANT ALL ON TABLE "public"."task_completion" TO "service_role";

GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";

GRANT ALL ON TABLE "public"."user_tasks" TO "anon";
GRANT ALL ON TABLE "public"."user_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_tasks" TO "service_role";

GRANT ALL ON TABLE "public"."vendor_ratings" TO "anon";
GRANT ALL ON TABLE "public"."vendor_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_ratings" TO "service_role";

GRANT ALL ON SEQUENCE "public"."vendor_ratings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vendor_ratings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vendor_ratings_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."vision_boards" TO "anon";
GRANT ALL ON TABLE "public"."vision_boards" TO "authenticated";
GRANT ALL ON TABLE "public"."vision_boards" TO "service_role";

GRANT ALL ON TABLE "public"."vision_log" TO "anon";
GRANT ALL ON TABLE "public"."vision_log" TO "authenticated";
GRANT ALL ON TABLE "public"."vision_log" TO "service_role";

GRANT ALL ON TABLE "public"."workplaces" TO "anon";
GRANT ALL ON TABLE "public"."workplaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workplaces" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
