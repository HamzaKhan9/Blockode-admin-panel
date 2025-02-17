//@ts-nocheck
import { Form, Input, Space, Switch, Select, message } from "antd";
import React, { useState, useEffect } from "react";
import Validations from "../../utils/validation";
import CustomModal, { CustomModalProps } from "../../components/CustomModal";
import { createUseStyles } from "react-jss";
import { MyTheme } from "../../types/theme";
import Button from "../../components/Button";
import ImageUploader from "../../components/ImageUploader";
import { useAppDispatch, useAppSelector } from "../../store";
import { insertActivity, editActivity } from "../../models/activities";
import { Status } from "../../utils/statusHandler";
import Categories from "../../services/categories";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";

const useStyles = createUseStyles((theme: MyTheme) => ({
  label: {
    color: theme.colorPrimary, // Accessing theme variable
    fontSize: "0.8rem",
    textTransform: "uppercase",
  },
}));

interface CreateActivityModalProps extends CustomModalProps {
  openModal: boolean;
  setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  currentActivity: any;
  updateCurrentActivity: any;
  tableHelpers?: any;
}

type fieldTypes = {
  name: string;
  category_id: number;
  subcategory?: string;
  description: string;
  enabled: boolean;
  meta_data: any;
  featured: boolean;
};
interface OptionProps {
  value: string;
  label: string;
}
export default function CreateActivityModal({
  openModal,
  setModalVisibility,
  currentActivity,
  updateCurrentActivity,
  tableHelpers,
}: CreateActivityModalProps) {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const [image_url, setImage_url] = useState<any>(null);
  const [options, setOptions] = useState<any>([]);

  const isInsertLoading = useAppSelector(
    (state) => state.activity.insertActivityStatus === Status.LOADING
  );

  const isEditLoading = useAppSelector(
    (state) => state.activity.editActivityStatus === Status.LOADING
  );

  const handleFinish = async (values: any) => {
    if (currentActivity) {
      await dispatch(
        editActivity({
          values: { ...currentActivity, ...values },
          file: image_url,
        })
      );
      tableHelpers.fetchData();
    } else {
      await dispatch(
        insertActivity({
          values: { ...currentActivity, ...values },
          file: image_url,
        })
      );
      tableHelpers.fetchData();
    }
    setImage_url(null);
    setModalVisibility(false);
  };

  const fetchSelectOption = async () => {
    try {
      const data = await Categories.getCategories();

      const categories =
        data &&
        data.length > 0 &&
        data?.map((d) => {
          return {
            value: d?.id,
            label: d?.name,
          };
        });

      setOptions(categories);
    } catch (error: any) {
      message.error(error);
    }
  };

  useEffect(() => {
    fetchSelectOption();
  }, []);

  return (
    <CustomModal
      open={openModal}
      className="create_activity"
      closable
      destroyOnClose={true}
      footer={null}
      title={currentActivity ? "Update Activity" : "Create Activity"}
      maskClosable
      onCancel={() => {
        if (currentActivity) updateCurrentActivity(undefined);
        setModalVisibility(false);
      }}
    >
      <Form
        style={{ paddingRight: "10px" }}
        requiredMark={false}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={currentActivity ? currentActivity : undefined}
      >
        <Form.Item<fieldTypes>
          label={<p className={classes.label}>Name</p>}
          name="name"
          validateFirst
          rules={[{ required: true, message: Validations.reqd_msg("Name") }]}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item<fieldTypes>
          label={<p className={classes.label}>Description</p>}
          name="description"
        >
          <Input.TextArea showCount maxLength={100} />
        </Form.Item>

        <Form.Item
          label={<p className={classes.label}>Category</p>}
          name="category_id"
        >
          <Select
            // labelInValue
            notFoundContent={true ? <p>Fetching Categories...</p> : null}
            allowClear={true}
            filterOption={true}
            optionFilterProp="label"
            showSearch={true}
            placeholder="Select Category"
            options={options}
          />
        </Form.Item>

        <Space>
          <Form.Item<fieldTypes>
            name="enabled"
            label={<p className={classes.label}>Enable</p>}
            valuePropName="checked"
            validateFirst
            rules={[
              { required: true, message: Validations.reqd_msg("Enable") },
            ]}
          >
            <Switch />
          </Form.Item>

          <Form.Item<fieldTypes>
            name="featured"
            label={<p className={classes.label}>Featured</p>}
            valuePropName="checked"
            rules={[
              { required: true, message: Validations.reqd_msg("Featured") },
            ]}
          >
            <Switch />
          </Form.Item>
        </Space>

        <Form.Item
          label={<p className={classes.label}>Meta Data</p>}
          name="meta_data"
          initialValue={currentActivity ? currentActivity?.meta_data : {}}
        >
          <Editor mode="code" />
        </Form.Item>

        <div className={classes.imageWrapper}>
          <div>
            <p className={classes.label}>Image</p>
            <ImageUploader
              src={currentActivity?.image_url || null}
              listType="picture-circle"
              setFileList={setImage_url}
              fileList={image_url}
              onFileUpload={(file: any) => {
                setImage_url(file);
              }}
              onFileDeleted={() => {
                setImage_url(null);
              }}
            />
          </div>
        </div>

        <div style={{ marginBlock: "1rem", textAlign: "end" }}>
          <Button
            shape="default"
            size="middle"
            type="primary"
            htmlType="submit"
            loading={currentActivity ? isEditLoading : isInsertLoading}
          >
            {currentActivity ? "Save" : "Create"}
          </Button>
        </div>
      </Form>
    </CustomModal>
  );
}
