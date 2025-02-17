import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Activities from "../../services/activities";
import { Status } from "../../utils/statusHandler";
import { message } from "antd";

export const name = "activity";

interface ActivityState {
  insertActivityStatus: Status;
  deleteActivityStatus: Status;
  editActivityStatus: Status;
}

const initialState: ActivityState = {
  insertActivityStatus: Status.IDLE,
  deleteActivityStatus: Status.IDLE,
  editActivityStatus: Status.IDLE,
};

export const insertActivity = createAsyncThunk(
  `${name}/insertActivity`,
  async ({ values, file }: { values: any; file: any }) => {
    const activity = await Activities.insertActivity(values, file);
    message.success("Activity Added Successfully");
    return activity;
  }
);

export const editActivity = createAsyncThunk(
  `${name}/editActivity`,
  async ({ values, file }: { values: any; file: any }) => {
    await Activities.editActivity(values, file);
    message.success("Activity Updated Successfully");
  }
);

export const deleteActivity = createAsyncThunk(
  `${name}/deleteActivity`,
  async (values: any) => {
    await Activities.deleteActivity(values);
    message.success("Activity Deleted Successfully");
  }
);

const activitySlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(insertActivity.fulfilled, (state) => {
        state.insertActivityStatus = Status.IDLE;
      })

      .addCase(deleteActivity.fulfilled, (state) => {
        state.deleteActivityStatus = Status.IDLE;
      })

      .addCase(editActivity.fulfilled, (state) => {
        state.editActivityStatus = Status.IDLE;
      });
  },
});
export default activitySlice
