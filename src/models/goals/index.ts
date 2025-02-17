//@ts-nocheck
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AlgoliaUser, TableRow } from "../../types/common";
import { Status } from "../../utils/statusHandler";
import Goals from "../../services/goals";
import { uniqueArrayByKey } from "../../utils";
import { EMPLOYED_STATUS } from "../../constants";
import { setSearchType } from "../users";

export const name = "goals";

interface goalsState {
  getUsersAlongGoalsStatus: Status;
  getUsersStatiscsStatus: Status;
  users: AlgoliaUser[];
  count: number;
}

const initialState: goalsState = {
  getUsersAlongGoalsStatus: Status.IDLE,
  getUsersStatiscsStatus: Status.IDLE,
  users: [],
  count: 0,
};

export const getUsersAlongGoals = createAsyncThunk(
  `${name}/getUsersAlongGoals`,
  async (
    {
      page,
      pageSize,
      searchTerm,
    }: {
      page: number;
      pageSize: number;
      searchTerm: string;
    },
    { getState, dispatch }
  ) => {
    let filter = getState().workplace || {};
    let savedType = getState().users?.searchType;

    if (getState()?.profile?.role === "company-admin") {
      const workplaceType =
        getState()?.profile?.user?.employment_status === EMPLOYED_STATUS
          ? "workplace"
          : "institution";
      filter = {
        ...filter,
        workplaceId: getState()?.profile?.accountId,
        workplaceType,
      };
    }
    dispatch(setSearchType("goals"));
    const data = searchTerm
      ? await Goals.algoliaSearch(searchTerm, page, pageSize, filter)
      : await Goals.getUsersAlongGoals(page, pageSize, filter);
    return { data, page, pageSize };
  }
);

export const getUsersStatiscs = createAsyncThunk(
  `${name}/getUsersStatiscs`,
  async (
    {
      page,
      pageSize,
      searchTerm,
    }: {
      page: number;
      pageSize: number;
      searchTerm: string;
    },
    { getState, dispatch }
  ) => {
    let filter = getState().workplace || {};
    let savedType = getState().users?.searchType;

    if (getState()?.profile?.role === "company-admin") {
      const workplaceType =
        getState()?.profile?.user?.employment_status === EMPLOYED_STATUS
          ? "workplace"
          : "institution";
      filter = {
        ...filter,
        workplaceId: getState()?.profile?.accountId,
        workplaceType,
      };
    }
    dispatch(setSearchType("stats"));
    const data = searchTerm
      ? await Goals.algoliaSearch(searchTerm, page, pageSize, filter)
      : await Goals.getUsersStatiscs(page, pageSize, filter);
    return { data, page, pageSize };
  }
);

const goalsSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsersAlongGoals.fulfilled, (state, action) => {
        state.count = action.payload.data.count;
        state.users = uniqueArrayByKey(
          [
            ...(action.payload.page === 0 ? [] : state.users),
            ...action.payload.data.users,
          ],
          "id"
        ) as AlgoliaUser[];
      })
      .addCase(getUsersStatiscs.fulfilled, (state, action) => {
        state.count = action.payload.data.count;
        state.users = uniqueArrayByKey(
          [
            ...action.payload.data.users,
            // ...action.payload.data.users,
          ],

          // [
          //   ...(action.payload.page === 0 ? [] : state.users),
          //   ...action.payload.data.users,
          // ],
          "id"
        ) as AlgoliaUser[];
      });
  },
});

export default goalsSlice;
