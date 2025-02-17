import PageHeading from "../../components/PageHeading";
import { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import Container from "../../components/container";
import { Form, Input, message } from "antd";
import Button from "../../components/Button";
import { createUseStyles } from "react-jss";
import ImageUploader from "../../components/ImageUploader";
import {
  updateProfile,
  // updateProfileImage,
  // deleteProfileImage,
} from "../../models/auth";
import { useAppDispatch, useAppSelector } from "../../store";
import { Status } from "../../utils/statusHandler";

type FieldType = {
  name?: string;
  workplace?: string;
};

const useStyles = createUseStyles({
  inputContainer: {
    display: "flex",
    gap: "50px",
    alignItems: "flex-end",

    paddingBlock: "30px",

    "@media (max-width: 768px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
    },
  },
  formContainer: {
    width: "100%",
    maxWidth: "500px", // Adjust the maximum width as needed
    border: "1px solid #ffffff",
    display: "flex",
    flexDirection: "column",
  },
  saveButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  inputText: {
    fontWeight: "bold",
    color: "#007bff",
  },
});

const Profile = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.profile.user);

  const loading = useAppSelector(
    (state) => state.profile.updateProfileStatus === Status.LOADING
  );

  const [fileList, setFileList] = useState<any>(null);

  const onFinish = async (values: any) => {
    dispatch(
      updateProfile({
        values: { ...values, profile_photo: userData?.profile_photo },
        file: fileList,
      })
    );
  };
  const onFileUpload = async (file: any) => {
    setFileList(file);
  };

  const onFileDelete = async () => {
    setFileList(null);
  };

  const onFinishFailed = (errorInfo: any) => {
    message.error(errorInfo);
  };
  return (
    <Container>
      <PageHeading>Profile</PageHeading>

      <div className={classes.inputContainer}>
        <div>
          <ImageUploader
            src={userData?.profile_photo || null}
            listType="picture-circle"
            setFileList={setFileList}
            fileList={fileList}
            onFileUpload={onFileUpload}
            isProfile={true}
            // loading={Imageloading}
            onFileDeleted={onFileDelete}
          />

          <div>
            <p
              style={{
                fontSize: "25px",
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              {userData?.name}
            </p>
            <p
              style={{
                fontSize: "25px",
                fontWeight: "400",
                textAlign: "center",
              }}
            >
              {userData?.email}
            </p>
          </div>
        </div>
        <Form
          name="basic"
          className={classes.formContainer}
          initialValues={{
            name: userData?.name,
            workplace:
              userData?.workplace_ref?.workplace_name ||
              userData?.institution_ref?.workplace_name ||
              "",
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Your Name"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            name="name"
            rules={[{ message: "Please input your Name!" }]}
            className={classes.inputText}
          >
            <Input
              size="large"
              placeholder="Name"
              suffix={<UserOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
            />
          </Form.Item>

          <Form.Item>
            <div className={classes.saveButton}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Profile
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Container>
  );
};

export default Profile;
