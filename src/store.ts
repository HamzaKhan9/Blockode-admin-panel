import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PURGE } from "redux-persist";
import storage from "redux-persist/lib/storage";
import profileSlice from "./models/auth";
import routerSlice from "./models/router";
import themeSlice from "./models/theme";
import categorySlice from "./models/categories";
import activitySlice from "./models/activities";
import workplaceSlice from "./models/workplaces";
import goalsSlice from "./models/goals";
import usersSlice from "./models/users";
import gameStatisticSlice from "./models/gamesStatistics";
import dashboardSlice from "./models/dasboard";
import assessmentsSlice from "./models/assessments";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { statusHandlerEnahncer } from "./utils/statusHandler";
import { errorHandlerMiddleware } from "./utils/errorHandler";

const persistConfig = {
  key: "root", // key is required and represents the key in local storage
  storage, // storage implementation
  whitelist: ["dashboard", "profile"], // an array of reducers to persist, if not specified all reducers will be persisted
  blacklist: [
    "goals",
    "category",
    "theme",
    "activity",
    "workplace",
    "router",
    "users",
    "category",
    "activity",
    "gamesInfo",
    "assessments",
  ], // an array of reducers to ignore
  // blacklist: ["wishlist"],
};

const slices = {
  profile: profileSlice,
  router: routerSlice,
  theme: themeSlice,
  category: categorySlice,
  activity: activitySlice,
  goals: goalsSlice,
  users: usersSlice,
  gamesInfo: gameStatisticSlice,
  workplace: workplaceSlice,
  dashboard: dashboardSlice,
  assessments: assessmentsSlice,
};

const appReducer = combineReducers(
  Object.entries(slices).reduce((acc, [key, slice]) => {
    //@ts-ignore
    acc[key] = slice.reducer;
    return acc;
  }, {})
);

const rootReducer = (state: any, action: any) => {
  if (action.type === PURGE) {
    const obj: any = {};
    Object.entries(slices).forEach(([key, slice]) => {
      try {
        obj[key] = (slice as any).getInitialState();
      } catch (error) {
        console.log("error: ", error);
      }
    });
    return obj;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for Redux Persist
    }).concat(errorHandlerMiddleware as any),
  enhancers: [statusHandlerEnahncer],
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
