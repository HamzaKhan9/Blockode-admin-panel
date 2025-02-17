//@ts-nocheck
import Container from "../../components/container";
import { Modal, Tooltip } from "antd";
import { DeleteTwoTone, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback, useRef } from "react";
import TagsInput from "../../components/TagsInput";
import ServerPaginatedTable from "../../components/LazyTable/ServerPaginatedTable";
import CreateActivityModal from "./CreateAcitivityModal";
import BooleanIndicator from "../../components/BooleanIndicator";
import PageHeading from "../../components/PageHeading";
import { createUseStyles } from "react-jss";
import Activities from "../../services/activities";
import { deleteActivity } from "../../models/activities";
import { useAppDispatch } from "../../store";
import AlertPopup from "../../components/AlertPopup";

const useStyles = createUseStyles({
  textContainer: {
    width: "200px",
    overflow: "hidden",
    display: "-webkit-box",
    "-webkit-box-orient": "vertical",
    "-webkit-line-clamp": "2",
  },
  ellipsis: {
    content: '"..."',
    display: "inline-block",
  },
});

const Activity = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({
    image: "",
    title: "",
  });
  const [isModalVisible, setModalVisibility] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(undefined);

  const setModalVisibilityFunc = useCallback((state: boolean) => {
    setModalVisibility(state);
  }, []);

  const tableHelpers = useRef(null);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 60,
      sorter: true,
    },
    {
      title: "Category",
      dataIndex: "categories",
      key: "categories",
      width: 60,
      render(value: string) {
        return <span>{value?.name}</span>;
      },
    },

    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 100,
      render(value: string) {
        return (
          <Tooltip
            overlayInnerStyle={{
              color: "black",
              backgroundColor: "white ",
            }}
            title={value}
          >
            <div className={classes.textContainer}>
              <p>{value}</p>
              <div className={classes.ellipsis} />
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      align: "center",
      width: 70,
      render(value: string, record) {
        return value !== null ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage({
                image: value,
                title: "Image",
              });
              setPreviewOpen(true);
            }}
          >
            <EyeOutlined /> View
          </span>
        ) : (
          <span>No Image </span>
        );
      },
    },
    {
      title: "Thumbnail",
      dataIndex: "thumbnail_url",
      key: "thumbnail_url",
      width: 70,
      align: "center",
      render(value: string, record) {
        return value !== null ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage({
                image: value,
                title: "Thumbnail",
              });
              setPreviewOpen(true);
            }}
          >
            <EyeOutlined /> View
          </span>
        ) : (
          <span>No Image </span>
        );
      },
    },
    {
      title: "Enabled",
      dataIndex: "enabled",
      key: "enabled",
      width: 70,
      render(value) {
        return <BooleanIndicator isTrue={value} />;
      },
      align: "center",
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      width: 70,
      render(value) {
        return <BooleanIndicator isTrue={value} />;
      },
      align: "center",
    },
    {
      title: "Meta Data",
      dataIndex: "meta_data",
      key: "meta_data",
      width: 70,
      render(value) {
        if (value && typeof value == "object") {
          return <span>{JSON.stringify(value)}</span>;
        }
      },
    },
  ];

  const ActionCol = [
    {
      title: "Edit",
      key: "action",
      render(_, record) {
        return (
          <EditOutlined
            style={{ fontSize: "20px" }}
            twoToneColor="#dc3545"
            onClick={(e) => {
              e.stopPropagation();
              setModalVisibility(true);
              setCurrentActivity(record);
            }}
          />
        );
      },
      fixed: "right",
      align: "center",
      width: 50,
    },
    {
      title: "Delete",
      key: "action",
      render(_, record) {
        return (
          <DeleteTwoTone
            style={{ fontSize: "20px" }}
            twoToneColor="#dc3545"
            onClick={(e) => {
              e.stopPropagation();
              AlertPopup({
                title: "Delete Activity",
                message: "Are you sure you want to delete this Activity?",
                onOk: async () => {
                  await dispatch(deleteActivity(record));
                  tableHelpers.current.fetchData();
                },
              });
            }}
          />
        );
      },
      fixed: "right",
      align: "center",
      width: 50,
    },
  ];

  return (
    <Container>
      <PageHeading
        actionButton={{
          children: "Create Acitvity",
          onClick: () => setModalVisibility(true),
        }}
      >
        Activities
      </PageHeading>

      <ServerPaginatedTable
        name="Activity"
        supabaseQuery={{
          table: "activities",
          query: ` *, categories( name ) `,
        }}
        getHelpers={(helpers) => {
          tableHelpers.current = helpers;
        }}
        columns={[...columns, ...ActionCol]}
      />
      <CreateActivityModal
        openModal={isModalVisible}
        setModalVisibility={setModalVisibilityFunc}
        tableHelpers={tableHelpers?.current}
        currentActivity={currentActivity}
        updateCurrentActivity={setCurrentActivity}
      />
      <Modal
        open={previewOpen}
        width={250}
        title={previewImage.title}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage.image} />
      </Modal>
    </Container>
  );
};

export default Activity;
