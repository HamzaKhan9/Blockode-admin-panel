import supabase from "../../supabase.config";
import { AlgoliaUser } from "../../types/common";
import { Algolia } from "../../utils/algolia";

const getUsersAlongGoals = async (
  page: number = 0,
  pageSize: number = 20,
  filter: { workplaceId: string }
) => {
  const query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1); // 0 * 20  = 0, (0 + 1) * 20 - 1 = 19 =>> 1 * 20 =20 , 1+1 *  20 - 1 =2

  if (filter.workplaceId) {
    query.or(
      `workplace_ref.eq.${filter.workplaceId},institution_ref.eq.${filter.workplaceId}`
    );
  }

  const { data, count } = await query;
  const users: AlgoliaUser[] = (data || [])?.map((user: any) => ({
    ...user,
    goals: user.vision_boards.reduce((acc: any[], vision: { goals: any }) => {
      acc.push(...vision.goals);
      return acc;
    }, []),
    vision_boards: user.vision_boards.map((vision: any) => {
      delete (vision as any).goals;
      return vision;
    }),
  }));

  return {
    users,
    count: count || 0,
  };
};

const getUsersStatiscs = async (
  page: number = 0,
  pageSize: number = 10,
  filter: { workplaceId: string }
) => {
  const query = supabase
    .from("profiles")
    .select("*, game_info(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

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

const algoliaSearch = async (
  searchTerm: string,
  page: number = 0,
  pageSize = 20,
  filter: { workplaceId: string }
) => {
  const { hits, nbHits } = await Algolia.users.search(searchTerm, {
    page,
    hitsPerPage: pageSize,
    filters: filter.workplaceId
      ? `workplace_ref.id:${filter.workplaceId} OR institution_ref.id:${filter.workplaceId}`
      : undefined,
  });
  return {
    users: hits.map((hit: any) => ({
      ...hit,
      id: hit.objectID,
    })) as unknown as AlgoliaUser[],
    count: nbHits,
  };
};

const getGoalsWithRespectUsers = async (filter: {
  workplaceId?: string;
  workplaceType?: string;
}) => {
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

const Goals = {
  algoliaSearch,
  getUsersAlongGoals,
  getUsersStatiscs,
  getGoalsWithRespectUsers,
};

export default Goals;
