import React, { useState } from "react";
import { Drawer } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Profile: {
    backgroundColor: "#D3D3D3",
    // padding: "10px",
    height: "50px",
    width: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    cursor: "pointer",

    "& svg": {
      fontSize: "30px",
      color: "#08c",
    },
  },
});
const UserProfile = () => {
  const classes = useStyles();

  const [isProfileShow, setIsProfileShow] = useState(false);

  return (
    <React.Fragment>
      <div
        className={classes.Profile}
        onClick={() => {
          setIsProfileShow(true);
        }}
      >
        <UserOutlined />
      </div>
      <Drawer
        title="Profile"
        placement="right"
        onClose={() => {
          setIsProfileShow(false);
        }}
        open={isProfileShow}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </React.Fragment>
  );
};

export default UserProfile;
