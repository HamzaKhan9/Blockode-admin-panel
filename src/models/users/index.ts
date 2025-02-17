//@ts-nocheck
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllUsersProfile, TableRow } from "../../types/common";
import { Status } from "../../utils/statusHandler";
import User from "../../services/users";
import Goals from "../../services/goals";
import { convertToCsv, uniqueArrayByKey } from "../../utils";
import { message } from "antd";
import moment from "moment";
import { EMPLOYED_STATUS } from "../../constants";

export const name = "users";

interface userState {
  getUserProfilesStatus: Status;
  userProfiles: AllUsersProfile[];
  count: number;
  searchType: string;
}

const initialState: userState = {
  getUserProfilesStatus: Status.IDLE,
  getUserProfilesForCsvStatus: Status.IDLE,
  userProfiles: [],
  searchType: "",
  count: 0,
};

export const getUserProfiles = createAsyncThunk(
  `${name}/getUserProfiles`,
  async (
    {
      page,
      pageSize,
      searchTerm,
      isInfinite = false,
    }: {
      page: number;
      pageSize: number;
      searchTerm: string;
      isInfinite: boolean;
    },
    { getState, dispatch }
  ) => {
    let filter = getState().workplace || {};
    let savedType = getState().users?.searchType;
    const profile_id = getState().profile?.user?.id;
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
    dispatch(setSearchType("users"));
    const data = await User.getUserProfiles(page, pageSize, filter, profile_id);
    return { data, page, pageSize, isInfinite };
  }
);

export const getUserProfilesForCsv = createAsyncThunk(
  `${name}/getUserProfilesForCsv`,
  async ({ searchTerm }, { getState }) => {
    let filter = getState().workplace || {};
    const profile_id = getState().profile?.user?.id;

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

    const users = await User.getAllUsers(filter, profile_id);
    const formattedData = users?.map((u) => ({
      Name: u?.name,
      Email: u?.email,
      Role: u?.user_role,
      Company:
        u?.employment_status === "Employed Adult 18+"
          ? u?.workplace_ref?.workplace_name
          : u?.institution_ref?.workplace_name,
    }));
    const csv = convertToCsv(formattedData, Object.keys(formattedData[0]));
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `LCA_users_${moment().format("MM_DD_YYYY")}.csv`);
  }
);

export const updateUserCompany = createAsyncThunk(
  `${name}/updateUserCompany`,
  async (
    {
      userId,
      companyId,
      key,
    }: {
      userId: string;
      companyId: string;
      key: string;
    },
    { getState }
  ) => {
    const data = await User.updateUserAccount(userId, companyId, key);
    message.success("Company updated successfully!");
  }
);

const usersSlice = createSlice({
  name,
  initialState,
  reducers: {
    updateUserInList(state, action) {
      const ix = state.userProfiles.findIndex(
        (item) => item.id === action.payload.id
      );
      state.userProfiles[ix] = {
        ...state.userProfiles[ix],
        ...action.payload.data,
      };
    },
    removeUserFromList(state, action) {
      state.userProfiles = state.userProfiles.filter(
        (u) => u.id !== action.payload.id
      );
    },
    setSearchType(state, action) {
      state.searchType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserProfiles.fulfilled, (state, action) => {
      state.count = action.payload.data.count;
      if (action.payload.isInfinite)
        state.userProfiles = uniqueArrayByKey(
          [
            ...(action.payload.page === 0 ? [] : state.userProfiles),
            ...action.payload.data.users,
          ],
          "id"
        ) as AlgoliaUser[];
      state.userProfiles = action.payload.data.users || [];
    });
  },
});

export const { updateUserInList, removeUserFromList, setSearchType } =
  usersSlice.actions;

export default usersSlice;
