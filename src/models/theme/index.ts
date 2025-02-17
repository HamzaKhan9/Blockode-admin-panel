import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MyTheme } from "../../types/theme";

export const name = "theme";

export const initialState: MyTheme = {
  colorPrimary: "#00b96b",
  colorTextLightSolid: "#fff",
};

const themeSlice = createSlice({
  name,
  initialState,
  reducers: {
    applyTheme(state, action: PayloadAction<MyTheme>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { applyTheme } = themeSlice.actions;
export default themeSlice
