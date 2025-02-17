// @ts-nocheck
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserProfile from "../../services/profile";
import { TableRow } from "../../types/common";
import { Status } from "../../utils/statusHandler";
import { message } from "antd";
import { setWorkplace } from "../workplaces";
import Users from "../../services/users";

export const name = "profile";

interface ProfileState {
  user: TableRow<"profiles"> | null;
  getProfileStatus: Status;
  role: string;
  accountId: string | null | undefined;
  updateProfileStatus: Status;
}

const initialState: ProfileState = {
  user: null,
  role: "",
  accountId: "",
  getProfileStatus: Status.IDLE,
  updateProfileStatus: Status.IDLE,
};

//slice

export const updateProfile = createAsyncThunk(
  `${name}/updateProfile`,
  async ({ values, file }: { values: any; file: any }) => {
    const data = await UserProfile.updateUserProfile(values, file);
    message.success("Profile Updated Successfully...");
    return data;
  }
);
export const getProfile: any = createAsyncThunk(
  `${name}/getProfile`,
  async (
    { id, isGoogle }: { id: string; isGoogle: any },
    { dispatch, getState }
  ) => {
    const data = await UserProfile.getUserProfile(id);
    const profile = getState()?.profile;
    let role = null;
    if (isGoogle) {
      const account =
        data?.employment_status === "Employed Adult 18+"
          ? data?.workplace_ref
          : data?.institution_ref;
      const _data = await Users.getAccountUser(data?.id, account?.id);
      role =
        _data?.length && _data?.every((doc) => doc?.account_role === "owner")
          ? "owner"
          : "member";

      if (data?.user_role === "admin") dispatch(setRole("super-admin"));
      else if (role === "owner") dispatch(setRole("company-admin"));
      else return "not-allowed";
    }
    if (
      profile?.role === "company-admin" ||
      Boolean(data?.user_role !== "admin" && role === "owner")
    ) {
      const isEmployed = data?.employment_status === "Employed Adult 18+";
      dispatch(
        setWorkplace({
          workplaceId: isEmployed
            ? data?.workplace_ref?.id
            : data?.institution_ref?.id,
          workplaceType: isEmployed
            ? data?.workplace_ref?.type
            : data?.institution_ref?.type,
        })
      );
      dispatch(
        setAccountId(
          isEmployed ? data?.workplace_ref?.id : data?.institution_ref?.id
        )
      );
    }

    return data;
  }
);

const profileSlice = createSlice({
  name,
  initialState,
  reducers: {
    unsetUid(state) {
      state.user = null;
    },
    unsetAccountId(state) {
      state.accountId = "";
    },
    setRole(state, action) {
      state.role = action.payload;
    },
    setAccountId(state, action) {
      state.accountId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { unsetUid, setRole, setAccountId, unsetAccountId } =
  profileSlice.actions;

//export reducer
export default profileSlice;
