import Container from "../../components/container";
import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import TagsInput from "../../components/TagsInput";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  deleteCategory,
  insertCategory,
  getCategories,
} from "../../models/categories";
import { Status } from "../../utils/statusHandler";
import { TableRow } from "../../types/common";
import { Spin } from "antd";

// interface CatergoryTags {
//   id: string;
//   name: string;
// }

const Category = () => {
  const dispatch = useAppDispatch();
  const [tagsData, setTagsData] = useState<TableRow<"categories">[] | null>([]);
  // const [tagsData, setTagsData] = useState<CatergoryTags[] | null>([]);

  const categoryInsert = useAppSelector(
    (state) => state.category.insertCategoryStatus === Status.LOADING
  );

  const categoryGet = useAppSelector(
    (state) => state.category.getCategoriesStatus === Status.LOADING
  );

  const getCategory = async () => {
    const data = await dispatch(getCategories()).unwrap();
    setTagsData(data);
  };

  useEffect(() => {
    getCategory();
  }, []);
  const handleInsert = async (category: string) => {
    const data = await dispatch(insertCategory({ name: category })).unwrap();
    if (data) {
      setTagsData((prevState: any) => [...prevState, { ...data[0] }]);
    }
  };

  const handleDelete = async (id: number) => {
    dispatch(deleteCategory(id));
  };

  return (
    <Container>
      <PageHeading>Categories</PageHeading>

      <Spin spinning={categoryGet}>
        <TagsInput
          tagsData={tagsData}
          name="Category"
          setTagsData={setTagsData}
          handleInsert={handleInsert}
          handleDelete={handleDelete}
          loading={categoryInsert}
        />
      </Spin>
    </Container>
  );
};

export default Category;
