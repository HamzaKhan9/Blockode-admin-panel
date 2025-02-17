import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RouteConfig } from "../../types/routes";
export const name = "router";

// initial state

interface RouteState {
  computedRoutes?: RouteConfig[];
  sidebarCollapsed: boolean;
}

const initialState: RouteState = {
  computedRoutes: undefined,
  sidebarCollapsed: false,
};

//slice
const routerSlice = createSlice({
  name,
  initialState,
  reducers: {
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setComputedRoutes(state, action: PayloadAction<any>) {
      state.computedRoutes = action.payload;
    },
  },
});

//action creators
export const { toggleSidebarCollapsed, setComputedRoutes } =
  routerSlice.actions;

//export reducer
export default routerSlice
