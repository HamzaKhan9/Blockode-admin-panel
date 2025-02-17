import {
  isRejectedWithValue,
  isRejected,
  isPending,
  createStore,
  AnyAction,
  StoreEnhancer,
  isFulfilled,
} from "@reduxjs/toolkit";
import { Reducer } from "react";

export enum Status {
  IDLE = "idle",
  LOADING = "loading",
  FAILED = "failed",
}

//@ts-ignore
export const statusHandlerEnahncer: StoreEnhancer<{}, {}> =
  (cs: typeof createStore) =>
  (
    reducer: Reducer<any, AnyAction>,
    initialState: any,
    enhancer: StoreEnhancer
  ) => {
    const statusHandlerReducer = (state: any, action: AnyAction) => {
      const newState = reducer(state, action);

      //get slicename and type value from action.type
      const split = action.type.split("/");
      const sliceName = split[0];
      const type = split[1];
      let status: Status | undefined;

      //change newsState based on the sliceName, type and the status conveyed by the action
      if (isPending(action)) status = Status.LOADING;
      else if (isFulfilled(action)) status = Status.IDLE;
      else if (isRejected(action) || isRejectedWithValue(action))
        status = Status.FAILED;

      if (status)
        return {
          ...newState,
          [sliceName]: { ...newState[sliceName], [type + "Status"]: status },
        };

      return newState;
    };

    return cs(statusHandlerReducer, initialState, enhancer);
  };
