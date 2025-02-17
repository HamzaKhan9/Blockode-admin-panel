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

const getAlgoliaUser = async (id: string) => {
  let user: any = {};
  try {
    user = await Algolia.users.getObject(id);
  } catch (error) {
    console.error(error);
  }
  return user;
};

const getUserIdFromVisionId = async (id: string) => {
  const { data: vision, error } = await supabaseAdmin
    .from("vision_boards")
    .select("user_id")
    .eq("id", id)
    .single();
  if (error) throw error;
  return vision.user_id;
};

const getWokplaceData = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from("workplaces")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data || null;
};

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const table = payload.table;

    if (table === "profiles") {
      const data = payload;
      if (data.type === "INSERT") {
        const workplaceData = await getWokplaceData(
          data.record.workplace_ref || data.record.institution_ref
        );
        await Algolia.users.saveObject({
          objectID: data.record.id,
          email: data.record.email,
          name: data.record.name,
          profile_photo: data.record.profile_photo,
          created_at: data.record.created_at,
          workplace_ref: data.record.workplace_ref ? workplaceData : null,
          institution_ref: data.record.institution_ref ? workplaceData : null,
          employment_status: data.record.employment_status,
          is_deleted: data?.record?.is_deleted || null,
          vision_boards: [],
          goals: [],
          game_info: [],
        });
      } else if (data.type === "UPDATE") {
        const workplaceData = await getWokplaceData(
          data.record.workplace_ref || data.record.institution_ref
        );
        let updates = {
          objectID: data.record.id,
          email: data.record.email,
          name: data.record.name,
          profile_photo: data.record.profile_photo,
          created_at: data.record.created_at,
          workplace_ref: data.record.workplace_ref ? workplaceData : null,
          institution_ref: data.record.institution_ref ? workplaceData : null,
          employment_status: data.record.employment_status,
          is_deleted: data?.record?.is_deleted || null,
        };
        await Algolia.users.partialUpdateObject(updates, {
          createIfNotExists: true,
        });
      } else if (data.type === "DELETE")
        await Algolia.users.deleteObject(data.old_record.id);
    } else if (table === "vision_boards") {
      const data = payload;
      const userId = (data.record?.user_id ||
        data.old_record?.user_id) as string;
      const prev = await getAlgoliaUser(userId);

      if (data.type === "INSERT") {
        await Algolia.users.partialUpdateObject(
          transformRecordWithinSize(
            {
              ...prev,
              objectID: userId,
              visionBoards: [
                ...(prev.vision_boards || []),
                {
                  id: data.record.id,
                  name: data.record.name,
                  description: data.record.description,
                  img_url: data.record.img_url,
                  created_at: data.record.created_at,
                },
              ],
            },
            10000
          )
        );
      } else if (data.type === "UPDATE") {
        await Algolia.users.partialUpdateObject(
          transformRecordWithinSize(
            {
              ...prev,
              objectID: userId,
              visionBoards: [
                ...(prev.vision_boards || []).filter(
                  (vb) => vb.id !== data.record.id
                ),
                {
                  id: data.record.id,
                  name: data.record.name,
                  description: data.record.description,
                  img_url: data.record.img_url,
                  created_at: data.record.created_at,
                },
              ],
            },
            10000
          )
        );
      } else if (data.type === "DELETE") {
        await Algolia.users.partialUpdateObject({
          ...prev,
          objectID: userId,
          visionBoards: (prev.vision_boards || []).filter(
            (vb) => vb.id !== data.old_record.id
          ),
          goals: (prev.goals || []).filter(
            (g) => g.vision_id !== data.old_record.id
          ),
        });
      }
    } else if (table === "goals") {
      const data = payload;
      const visionId = (data.record?.vision_id ||
        data.old_record?.vision_id) as string;
      const userId = await getUserIdFromVisionId(visionId);
      const prev = await getAlgoliaUser(userId);

      if (data.type === "INSERT") {
        await Algolia.users.partialUpdateObject(
          transformRecordWithinSize(
            {
              ...prev,
              objectID: userId,
              goals: [
                ...(prev.goals || []),
                {
                  id: data.record.id,
                  name: data.record.name,
                  description: data.record.description,
                  url: data.record.url,
                  vision_id: data.record.vision_id,
                  createdAt: data.record.createdAt,
                },
              ],
            },
            10000
          )
        );
      } else if (data.type === "UPDATE") {
        await Algolia.users.partialUpdateObject(
          transformRecordWithinSize(
            {
              ...prev,
              objectID: userId,
              goals: [
                ...(prev.goals || []).filter((g) => g.id !== data.record.id),
                {
                  id: data.record.id,
                  name: data.record.name,
                  description: data.record.description,
                  url: data.record.url,
                  vision_id: data.record.vision_id,
                  createdAt: data.record.createdAt,
                },
              ],
            },
            10000
          )
        );
      } else if (data.type === "DELETE") {
        await Algolia.users.partialUpdateObject({
          ...prev,
          objectID: userId,
          goals: (prev.goals || []).filter((g) => g.id !== data.old_record.id),
        });
      }
    } else if (table === "game_info") {
      const data = payload;
      const userId = (data.record?.profile_id ||
        data.old_record?.profile_id) as string;
      const prev = await getAlgoliaUser(userId);

      if (data.type === "INSERT") {
        await Algolia.users.partialUpdateObject(
          transformRecordWithinSize(
            {
              ...prev,
              objectID: userId,
              game_info: [
                ...(prev.game_info || []),
                {
                  id: data.record.id,
                  game_id: data.record.game_id,
                  levels_completed: data.record.levels_completed,
                  durations: data.record.durations,
                },
              ],
            },
            10000
          )
        );
      } else if (data.type === "UPDATE") {
        await Algolia.users.partialUpdateObject(
          transformRecordWithinSize(
            {
              ...prev,
              objectID: userId,
              game_info: [
                ...(prev.game_info || []).filter(
                  (g) =>
                    g.id !== data.record.id || g.game_id !== data.record.game_id
                ),
                {
                  id: data.record.id,
                  game_id: data.record.game_id,
                  levels_completed: data.record.levels_completed,
                  durations: data.record.durations,
                },
              ],
            },
            10000
          )
        );
      } else if (data.type === "DELETE") {
        await Algolia.users.partialUpdateObject({
          ...prev,
          objectID: userId,
          game_info: (prev.game_info || []).filter(
            (g) => g.id !== data.old_record.id
          ),
        });
      }
    }
    console.log("Successfully updated!");
    return new Response(
      JSON.stringify({
        status: "success",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error:", error);
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
