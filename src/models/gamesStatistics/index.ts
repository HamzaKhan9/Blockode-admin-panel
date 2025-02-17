import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import GameStatistics from "../../services/gameStatistics";
import { ActivitiesWithTasks, UserWithGameInfo } from "../../types/common";
import { Status } from "../../utils/statusHandler";

export const name = "gamesInfo";

interface CategoryState {
  getActivitiesAlongtaskStatus: Status;
  getUserFromIdStatus: Status;
  activitiesWithTasks: ActivitiesWithTasks[];
  usersSlugGameInfo: UserWithGameInfo | null;
  totalGameLevels: number;
}

const initialState: CategoryState = {
  getActivitiesAlongtaskStatus: Status.IDLE,
  getUserFromIdStatus: Status.IDLE,
  activitiesWithTasks: [],
  usersSlugGameInfo: null,
  totalGameLevels: 0,
};

export const getAtvitiesAlongTask = createAsyncThunk(
  `${name}/getAtvitiesAlongTask`,
  async () => {
    const activityGameData = await GameStatistics.getActivitiesAlongTask();
    return activityGameData;
  }
);
export const getUserFromId = createAsyncThunk(
  `${name}/getUserFromId`,
  async (id: string) => {
    const userAlongGameInfo = await GameStatistics.getUserSlug(id);
    return userAlongGameInfo;
  }
);

const gameStatisticsSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAtvitiesAlongTask.fulfilled, (state, action) => {
        state.activitiesWithTasks = action.payload as ActivitiesWithTasks[];

        const totalActivity = action?.payload?.reduce((total, activity) => {
          if (
            activity.meta_data !== null &&
            typeof activity.meta_data === "object" &&
            "totalLevels" in activity.meta_data
          ) {
            return total + Number(activity.meta_data.totalLevels);
          } else {
            return total;
          }
        }, 0);

        state.totalGameLevels = totalActivity as number;
        state.getActivitiesAlongtaskStatus = Status.IDLE;
      })
      .addCase(getUserFromId.fulfilled, (state, action) => {
        state.getUserFromIdStatus = Status.IDLE;

        state.usersSlugGameInfo = action.payload as UserWithGameInfo;
      });
  },
});
export default gameStatisticsSlice
