import supabase from "../../supabase.config";

const getGoalsWithRespectUsers = async (filter: { workplaceId?: string }) => {
  const query = supabase
    .from("profiles")
    .select("id, vision_boards(id, goals (cluster_class))");

  if (filter.workplaceId) {
    query.or(
      `workplace_ref.eq.${filter.workplaceId},institution_ref.eq.${filter.workplaceId}`
    );
  }
  const { data: goals, error } = await query;

  if (error) {
    throw error;
  }

  return goals || [];
};

export { getGoalsWithRespectUsers };
