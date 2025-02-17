import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SendInviteMultiple } from "../../types/common";
import workplaces from "../../services/workplace";
import { Status } from "../../utils/statusHandler";

export const name = "workplace";

interface WorkplacesState {
  sendWorkplaceInvitationStatus: Status;
  getInvitationsStatus: Status;
  workplaceId: string;
  workplaceType?: string;
  invitations: any[];
  invitationsCount: number;
}

const initialState: WorkplacesState = {
  sendWorkplaceInvitationStatus: Status.IDLE,
  getInvitationsStatus: Status.IDLE,
  workplaceId: "",
  workplaceType: "",
  invitations: [],
  invitationsCount: 0,
};

export const getInvitations: any = createAsyncThunk(
  `${name}/getInvitations`,
  async ({}, { getState }) => {
    // @ts-ignore
    const userId = getState()?.profile?.user?.id;
    const data = await workplaces.getInvitations(userId);
    return { data };
  }
);

export const sendWorkplaceInvitation: any = createAsyncThunk(
  `${name}/sendWorkplaceInvitation`,
  async ({
    userId,
    workplaceId,
    role,
    emails,
    message,
  }: SendInviteMultiple) => {
    const results = await Promise.all(
      emails.map((email) =>
        workplaces.sendInvite({ email, role, userId, workplaceId, message })
      )
    );
    return results;
  }
);

const workplaceSlice = createSlice({
  name,
  initialState,
  reducers: {
    removeInvitationFromList(state, action) {
      state.invitations = state.invitations.filter(
        (u) => u.id !== action.payload.id
      );
    },
    setWorkplace(state, action) {
      state.workplaceId = action.payload.workplaceId;
      state.workplaceType = action.payload.workplaceType;
    },
    removeWorkplace(state) {
      state.workplaceId = initialState.workplaceId;
      state.workplaceType = initialState.workplaceType;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getInvitations.fulfilled, (state, action) => {
      state.invitationsCount = action.payload.data.count;
      state.invitations = action.payload.data.invitations || [];
    });
  },
});
export const { setWorkplace, removeWorkplace, removeInvitationFromList } =
  workplaceSlice.actions;

export default workplaceSlice;
