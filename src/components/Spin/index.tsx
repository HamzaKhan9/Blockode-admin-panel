import React from "react";
import { Space, Spin } from "antd";
import { createUseStyles } from "react-jss";
import { MyTheme } from "../../types/theme";
// import { LoadingOutlined } from "@ant-design/icons";

const useStyles = createUseStyles((theme: MyTheme) => ({
  spin: {
    color: theme.colorPrimary,
    display: "flex",
    justifyContent: "center",
    gap: "5px",
  },
}));

interface SpinnerProps {
  status: "Loading" | "Uploading" | "Deleting" | "Inserting";
}
const Spiner: React.FC<SpinnerProps> = ({ status }) => {
  // const antIcon = <LoadingOutlined style={{ fontSize: 18 }} spin />;
  const classes = useStyles();

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <span className={classes.spin}>
        <Spin size="large" /> <span>{status}</span>
      </span>
    </Space>
  );
};

export default Spiner;
