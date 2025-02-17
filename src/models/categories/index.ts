import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Categories from "../../services/categories";
import { Status } from "../../utils/statusHandler";
import { message } from "antd";

export const name = "category";

interface CategoryState {
  getCategoriesStatus: Status;
  insertCategoryStatus: Status;
  deleteCategoryStatus: Status;
}

const initialState: CategoryState = {
  getCategoriesStatus: Status.IDLE,
  insertCategoryStatus: Status.IDLE,
  deleteCategoryStatus: Status.IDLE,
};

export const insertCategory = createAsyncThunk(
  `${name}/insertCategory`,
  async (values: any) => {
    const category = await Categories.insertCategory(values);
    message.success("Category Added Successfully");
    return category;
  }
);

export const deleteCategory = createAsyncThunk(
  `${name}/deleteCategory`,
  async (id: number) => {
    await Categories.deleteCategory(id);
    message.success("Category Deleted Successfully");
  }
);
export const getCategories = createAsyncThunk(
  `${name}/getCategories`,
  async () => {
    const categories = await Categories.getCategories();
    return categories;
  }
);

const categorySlice = createSlice({
  name,
  initialState,
  reducers: {},
  //   extraReducers: (builder) => {
  //     builder.addCase(insertCategory.fulfilled, (state, action) => {});
  //   },
});
export default categorySlice;
