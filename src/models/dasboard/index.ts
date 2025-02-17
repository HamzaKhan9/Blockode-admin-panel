import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  GameResponseTypes,
  gameLevelSuccessStatsForGraph,
} from "../../types/common";
import {
  getCountsFromTable,
  getTopCategoriesClusterClasses,
  getAllGamesCount,
  getAllGamesData,
  getAllUsers,
  getDeletedUsers,
  getUsersDataWithRespectDate,
} from "../../services/dashboard";
import {
  countPercentage,
  getSuccesGamesLevels,
  getDurationRepectedLevel,
  unAttemptedGames,
  gameStatistcsTableDashboard,
  getAverageGameLevelsStats,
} from "../../utils";
import { Status } from "../../utils/statusHandler";
export const name = "dashboard";

interface StatisticData {
  value: number | string;
  entity: string;
  title: string;
  percent?: number;
}

interface UserStatsTypes {
  totalUsers: StatisticData;
  newUsers: StatisticData;
  pendingRequest: StatisticData;
  deletedUsers: StatisticData;
}
interface gamesStatsTypes {
  totalGames: StatisticData;
  avgDurationLevel: StatisticData;
  successGames: StatisticData;
  unattemptGames: StatisticData;
}

interface dashboardState {
  // -----------------User Stats loading
  getTotalUsersStatus: Status;
  getUsersRepectedTimePeriodStatus: Status;
  getPendingRequestStatus: Status;
  getDeletedUsersCountStatus: Status;
  getCategoriesClusterClassesStatus: Status;
  fetchUsersCountRespectedDateStatus: Status;

  //-----------------Games Stats loading
  fetchAllGamesCountStatus: Status;
  fetchAllGamesDataStatus: Status;
  //-------------------------------
  allGamesStatistics: any;
  gameStatswithRespectLevelsForGraph: gameLevelSuccessStatsForGraph[];
  TopCategoriesClusterClasses: any;
  usersCountRespectedDateForGraph: any;
  defaultSelectedPeriod: string;
  timeStamp: number;
  dateRange?: {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  };
  userStats: UserStatsTypes;
  gameStats: gamesStatsTypes;
}

const initialState: dashboardState = {
  // -----------------User Stats loading
  getTotalUsersStatus: Status.IDLE,
  getUsersRepectedTimePeriodStatus: Status.IDLE,
  getPendingRequestStatus: Status.IDLE,
  getDeletedUsersCountStatus: Status.IDLE,
  getCategoriesClusterClassesStatus: Status.IDLE,
  fetchUsersCountRespectedDateStatus: Status.IDLE,

  //-----------------Games Stats loading
  fetchAllGamesCountStatus: Status.IDLE,
  fetchAllGamesDataStatus: Status.IDLE,
  //-------------------------------
  defaultSelectedPeriod: "month",

  dateRange: {
    start: "",
    end: "",
    previousStart: "",
    previousEnd: "",
  },
  timeStamp: 0,
  userStats: {
    totalUsers: {
      value: 0,
      entity: "totalusers",
      title: "Users",
    },
    newUsers: {
      value: 0,
      entity: "new",
      title: "New Users",
      percent: 0,
    },
    pendingRequest: {
      value: 0,
      entity: "pending",
      title: "Pending Request",
    },
    deletedUsers: {
      value: 0,
      entity: "deleted",
      title: "Deleted Users",
    },
  },
  gameStats: {
    totalGames: {
      value: 0,
      entity: "totalGames",
      title: "Total Games",
    },
    avgDurationLevel: {
      value: 0,
      entity: "avgDuration",
      title: "Average Duration/Level",
    },
    successGames: {
      value: 0,
      entity: "successGame",
      title: "Game Success Percentage",
    },
    unattemptGames: {
      value: 0,
      entity: "unattempted",
      title: "Avg UnAttempted Levels",
    },
  },

  TopCategoriesClusterClasses: [],
  usersCountRespectedDateForGraph: [],
  allGamesStatistics: [],
  gameStatswithRespectLevelsForGraph: [],
};

export const getTotalUsers = createAsyncThunk(
  `${name}/getTotalUsers`,
  async (workplaceId: string) => {
    const totalUsers = await getAllUsers(workplaceId);

    return totalUsers;
  }
);
export const getUsersRepectedTimePeriod = createAsyncThunk(
  `${name}/getUsersRepectedTimePeriod`,
  async ({
    dateRange,
    workplaceId,
  }: {
    dateRange: any;
    workplaceId: string;
  }) => {
    const newUsers = await getCountsFromTable(
      "profiles",
      dateRange,
      workplaceId
    );
    return newUsers;
  }
);
export const getPendingRequest = createAsyncThunk(
  `${name}/getPendingRequest`,
  async (dateRange: any) => {
    return dateRange;
    // const totalInstitution = await getCountsFromTable("workplaces", dateRange, {
    //   colName: "type",
    //   value: "institution",
    // });
    // return totalInstitution;
  }
);

export const getDeletedUsersCount = createAsyncThunk(
  `${name}/getDeletedUsersCount`,
  async ({
    dateRange,
    workplaceId,
  }: {
    dateRange: any;
    workplaceId: string;
  }) => {
    const deletedUsers = await getDeletedUsers(dateRange, workplaceId);
    return deletedUsers;
  }
);

export const getCategoriesClusterClasses = createAsyncThunk(
  `${name}/getCategoriesClusterClasses`,
  async (workplaceId: string) => {
    const clusterClasses = await getTopCategoriesClusterClasses(workplaceId);

    return clusterClasses;
  }
);
export const fetchUsersCountRespectedDate = createAsyncThunk(
  `${name}/fetchUsersCountRespectedDate`,
  async ({
    dateRange,
    workplaceId,
  }: {
    dateRange: any;
    workplaceId: string;
  }) => {
    const usersCountRespectedDate = await getUsersDataWithRespectDate(
      dateRange,
      workplaceId
    );

    return usersCountRespectedDate;
  }
);

export const fetchAllGamesCount = createAsyncThunk(
  `${name}/fetchAllGamesCount`,
  async () => {
    const gamesCount = await getAllGamesCount();
    return gamesCount;
  }
);
export const fetchAllGamesData = createAsyncThunk(
  `${name}/fetchAllGamesData`,
  async () => {
    const gamesDate = await getAllGamesData();
    return gamesDate;
  }
);

const dashboardSlice = createSlice({
  name,
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setTimeRange: (state, action) => {
      state.timeStamp = action.payload;
    },
    setDefaultSelected: (state, action) => {
      state.defaultSelectedPeriod = action.payload;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTotalUsers.fulfilled, (state, action) => {
        if (state.userStats) {
          state.userStats.totalUsers.value = action.payload?.toFixed(0);
        }
      })
      .addCase(getUsersRepectedTimePeriod.fulfilled, (state, action) => {
        if (state.userStats) {
          state.userStats.newUsers.value = action.payload.current_count_result;
          state.userStats.newUsers.percent = countPercentage(action.payload);
        }
      })
      .addCase(getPendingRequest.fulfilled, (state) => {
        if (state.userStats) {
          state.userStats.pendingRequest.value = 5;
        }
      })
      .addCase(getDeletedUsersCount.fulfilled, (state, action) => {
        if (state.userStats) {
          state.userStats.deletedUsers.value =
            action.payload.current_count_result || 0;
          state.userStats.deletedUsers.percent = countPercentage(
            action.payload
          );
        }
      })
      .addCase(getCategoriesClusterClasses.fulfilled, (state, action) => {
        if (state.userStats) {
          state.TopCategoriesClusterClasses = action.payload;
        }
      })
      .addCase(fetchAllGamesCount.fulfilled, (state, action) => {
        if (state.gameStats) {
          state.gameStats.totalGames.value = action.payload;
        }
      })
      .addCase(fetchAllGamesData.fulfilled, (state, action) => {
        if (state.gameStats) {
          state.gameStats.avgDurationLevel.value = getDurationRepectedLevel(
            action.payload
          );
          state.gameStats.successGames.value = getSuccesGamesLevels(
            action.payload
          );
          state.gameStats.unattemptGames.value = unAttemptedGames(
            action.payload
          );
          state.allGamesStatistics = gameStatistcsTableDashboard(
            action.payload
          );
          state.gameStatswithRespectLevelsForGraph = getAverageGameLevelsStats(
            action.payload as unknown as GameResponseTypes[]
          );
        }
      })
      .addCase(fetchUsersCountRespectedDate.fulfilled, (state, action) => {
        if (state.gameStats) {
          state.usersCountRespectedDateForGraph = action.payload;
        }
      });
  },
});

export const { setDateRange, setTimeRange, setDefaultSelected, reset } =
  dashboardSlice.actions;

export default dashboardSlice;
