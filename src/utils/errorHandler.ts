import * as RTK from "@reduxjs/toolkit";
import { message } from "antd";

const { isRejectedWithValue, isRejected } = RTK;
interface RejectedError {
  message: string | undefined;
}

interface ResolveValue {
  message?: string | undefined;
}

type ReduxAction = { error: RejectedError } | { payload: ResolveValue };

export const errorHandlerMiddleware =
  () => (next: (action: ReduxAction) => any) => (action: ReduxAction) => {
    let error: RejectedError | ResolveValue | null = null;

    if ("error" in action && isRejected(action)) {
      error = { ...action.error, message: action.error.message };
    } else if ("payload" in action && isRejectedWithValue(action)) {
      error = { ...action.payload, message: action.payload?.message };
    }

    if (error) globalErrorHandler(error);

    return next(action);
  };

export const getErrorMessage = (
  error: any,
  fallback = "An unknown error occurred!"
) => {
  let message = fallback;
  try {
    error?.preventDefault && error.preventDefault();
    if (typeof error === "string") message = error;
    else if (error.message) message = error.message;
    else if (error && typeof error === "object")
      message = getErrorMessage(Object.values(error)[0]);
    else message = JSON.stringify(error);
  } catch {}

  return message;
};

export const globalErrorHandler = (error: any) => {
  const errorMsg = getErrorMessage(error);
  console.error(errorMsg, error);
  message.error(errorMsg);
};
