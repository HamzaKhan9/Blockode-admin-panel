import supabase from "../../supabase.config";
// import { AlgoliaUser } from "../../types/common";
// import { Algolia } from "../../utils/algolia";

const getUserSlug = async (id: string) => {
  const { data: user } = await supabase
    .from("profiles")
    .select("*, game_info(*)")
    .eq("id", id)
    .single();

  return user;
};

const getUsersRespectedWorkspaces = async (filter: {
  workplaceId?: string;
}) => {
  const query = supabase
    .from("profiles")
    .select("game_info(*)")
    .order("created_at", { ascending: false });

  if (filter.workplaceId) {
    query.or(
      `workplace_ref.eq.${filter.workplaceId},institution_ref.eq.${filter.workplaceId}`
    );
  }

  const { data } = await query;
  return data;
};

const getActivitiesAlongTask = async () => {
  const { data: activity } = await supabase
    .from("activities")
    .select("* , tasks(*)")
    .eq("category_id", 1)
    .eq("enabled", true);

  return activity;
};

const getUsersGameStatiscs = async (filter: { workplaceId?: string }) => {
  const query = supabase
    .from("profiles")
    .select("*, game_info(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filter.workplaceId) {
    query.or(
      `workplace_ref.eq.${filter.workplaceId},institution_ref.eq.${filter.workplaceId}`
    );
  }

  const { data, count } = await query;

  const users = data || [];
  return {
    users,
    count: count || 0,
  };
};

const GameStatistics = {
  getActivitiesAlongTask,
  getUserSlug,
  getUsersRespectedWorkspaces,
  getUsersGameStatiscs,
};

export default GameStatistics;
