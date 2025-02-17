import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import algoliasearch from "https://esm.sh/algoliasearch";
import { createFetchRequester } from "https://esm.sh/@algolia/requester-fetch";
import {
  ALGOLIA_DEV_API_KEY,
  ALGOLIA_DEV_APP_ID,
  ALGOLIA_PROD_API_KEY,
  ALGOLIA_PROD_APP_ID,
  SUPABASE_DEV_URL,
  SUPABASE_PROD_URL,
  transformRecordWithinSize,
} from "../_shared/helpers/index.ts";
const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;
const isDevEnv = supabase_url === SUPABASE_DEV_URL;
const isProdEnv = supabase_url === SUPABASE_PROD_URL;

const client = algoliasearch(
  isProdEnv ? ALGOLIA_PROD_APP_ID : ALGOLIA_DEV_APP_ID,
  isProdEnv ? ALGOLIA_PROD_API_KEY : ALGOLIA_DEV_API_KEY,
  {
    requester: createFetchRequester(),
  }
);

const Algolia = {
  users: client.initIndex("users"),
};

const supabaseAdmin = createClient(supabase_url, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

serve(async () => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, name, email, profile_photo, created_at, game_info(id, game_id, levels_completed, durations)"
      );
    if (error) throw error;

    if (Array.isArray(users)) {
      for (const user of users) {
        user.goals = user.vision_boards.reduce((acc, vision) => {
          acc.push(...vision.goals);
          return acc;
        }, []);

        user.vision_boards = user.vision_boards.map((vision) => {
          delete vision.goals;
          return vision;
        });

        user.objectID = user.id;
        delete user.id;
        transformRecordWithinSize(user, 10000); // 10kb
      }
      await Algolia.users.saveObjects(users);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        recordsSynced: users.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error?.message || "Something went wrong",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
