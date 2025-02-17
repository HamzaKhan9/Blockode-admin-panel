// @ts-nocheck
import supabase from "../../supabase.config";

export const getCountsFromTable = (
  tableName: string,
  dateRange: {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  },
  workplaceId: string
): Promise<{ current_count_result: number; previous_count_result: number }> => {
  const { start, end, previousStart, previousEnd } = dateRange;
  let responseData = {
    current_count_result: 0,
    previous_count_result: 0,
  };

  let queryForCurrentData = supabase
    .from(tableName)
    .select("id", { count: "exact" })
    .gte("created_at", start)
    .lte("created_at", end);

  let queryForPreviousData = supabase
    .from(tableName)
    .select("id", { count: "exact" })
    .gte("created_at", previousStart)
    .lte("created_at", previousEnd);

  if (workplaceId) {
    queryForCurrentData = queryForCurrentData.or(
      `workplace_ref.eq.${workplaceId},institution_ref.eq.${workplaceId}`
    );
    queryForPreviousData = queryForPreviousData.or(
      `workplace_ref.eq.${workplaceId},institution_ref.eq.${workplaceId}`
    );
  }

  return new Promise<{
    current_count_result: number;
    previous_count_result: number;
  }>((resolve, reject) => {
    Promise.all([queryForCurrentData, queryForPreviousData])
      .then((results) => {
        const [currentData, previousData] = results;

        responseData = {
          current_count_result: currentData?.count || 0,
          previous_count_result: previousData?.count || 0,
        };
        resolve(responseData); // Resolve the promise with responseData
      })
      .catch((error) => {
        reject(error); // Reject the promise with the error
      });
  });
};

export const getTopCategoriesClusterClasses = async (workplaceId: string) => {
  if (workplaceId) {
    let { data } = await supabase.rpc("get_top_cluster_class_counts", {
      workplaceid: workplaceId,
    });
    return data;
  } else {
    let { data } = await supabase.rpc("get_top_cluster_class_counts");
    return data;
  }
};

export const getAllGamesCount = async () => {
  const data = await supabase
    .from("activities")
    .select("*", { count: "exact" })
    .eq("category_id", 1)
    .eq("enabled", true);

  return data.count || 0;
};

export const getAllGamesData = async () => {
  // change above rpc to get_game_info
  const { data: game_info } = await supabase
    .from("game_info")
    .select("*, profile_id(*)");

  return game_info || [];
};

export const getAllUsers = async (workplaceId: string) => {
  let query = supabase.from("profiles").select("id", { count: "exact" });
  if (workplaceId) {
    query.or(
      `workplace_ref.eq.${workplaceId},institution_ref.eq.${workplaceId}`
    );
  }
  const data = await query;

  return data.count || 0;
};

export const getDeletedUsers = async (
  dateRange: {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  },
  workplaceId: string
): Promise<{
  current_count_result: number;
  previous_count_result: number;
}> => {
  const { start, end, previousStart, previousEnd } = dateRange;

  let queryForCurrentData = supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .gte("created_at", start)
    .lte("created_at", end);

  let queryForPreviousData = supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .gte("created_at", previousStart)
    .lte("created_at", previousEnd);

  if (workplaceId) {
    queryForCurrentData = queryForCurrentData.or(
      `workplace_ref.eq.${workplaceId},institution_ref.eq.${workplaceId}`
    );
    queryForPreviousData = queryForPreviousData.or(
      `workplace_ref.eq.${workplaceId},institution_ref.eq.${workplaceId}`
    );
  }

  return new Promise<{
    current_count_result: number;
    previous_count_result: number;
  }>((resolve, reject) => {
    let responseData = {
      current_count_result: 0,
      previous_count_result: 0,
    };

    Promise.all([queryForCurrentData, queryForPreviousData])
      .then((results) => {
        const [currentData, previousData] = results;

        responseData = {
          current_count_result: currentData?.count || 0,
          previous_count_result: previousData?.count || 0,
        };
        resolve(responseData);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getUsersDataWithRespectDate = async (
  dateRange: {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  },
  workplaceId: string
) => {
  const { start, end } = dateRange;

  const { data } = await supabase.rpc("get_user_with_respect_date", {
    end_date: end,
    start_date: start,
  });

  return data || [];
};
