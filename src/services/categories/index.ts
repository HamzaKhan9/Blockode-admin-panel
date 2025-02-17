import supabase from "../../supabase.config";

const insertCategory = async (value: any) => {
  const { data } = await supabase.from("categories").insert([value]).select();
  return data;
};

const deleteCategory = async (id: number) => {
  await supabase.from("categories").delete().eq("id", id);
};
const getCategories = async () => {
  let { data: categories } = await supabase.from("categories").select("*");
  return categories;
};

const Categories = {
  insertCategory,
  deleteCategory,
  getCategories,
};

export default Categories;
