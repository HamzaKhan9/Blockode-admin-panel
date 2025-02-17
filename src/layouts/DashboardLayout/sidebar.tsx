//@ts-nocheck
import React, { useCallback, useMemo } from "react";
import { Layout, Drawer, Menu, Button, theme } from "antd";
import MainMenu from "./MainMenu";
import { useDispatch } from "react-redux";
import { unsetAccountId, unsetUid } from "../../models/auth";
import logoutImg from "../../assets/images/logout.svg";
import Auth from "../../services/auth";
import logo from "../../assets/images/logo1.webp";
import { USERNAME_KEY } from "../../apiConfig";
import { UserOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";
import { persistor } from "../../store";
import Logo from "../../assets/icons/lca-logo.webp";
import AlertPopup from "../../components/AlertPopup";

const useStyles = createUseStyles({
  myLogo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    paddingBlock: "10px",
    cursor: "pointer",
    "& h3": {
      textAlign: "center",
      color: "white",
    },

    "& h5": {
      color: "white",
      textAlign: "center",
    },
  },
  bottomMenuWrapper: {
    padding: "1rem 0",
    position: "absolute",
    left: 0,
    bottom: "30px",
    width: "100%",
  },
  logo: {
    height: "40px",
    width: "40px",
    borderRadius: "30px",
  },
  collapseLogo: {
    height: "40px",
    width: "40px",
    borderRadius: "20px",
    alignSelf: "center",
  },
});
const { Sider } = Layout;

function BottomMenu() {
  const classes = useStyles();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onLogout = useCallback(async () => {
    AlertPopup({
      title: "Logout",
      message: "Do you want to logout?",
      onOk: async () => {
        dispatch(unsetUid(null));
        await Auth.logout();
        navigate("/login");
      },
    });
  }, []);

  // const username = useMemo(() => {
  //   return localStorage.getItem(USERNAME_KEY);
  // }, []);

  return (
    <div className={classes.bottomMenuWrapper}>
      <Menu
        style={{ background: "none" }}
        theme="light"
        mode="inline"
        selectable={false}
      >
        <Menu.Item
          style={{ textTransform: "capitalize" }}
          onClick={onLogout}
          key={"logout"}
          icon={<img src={logoutImg} />}
        >
          <a style={{ color: "white" }}>Logout</a>
        </Menu.Item>
      </Menu>
    </div>
  );
}

export default function Sidebar({ collapsed, toggleCollapsed }) {
  // const className = collapsed ? "crehab-sidebar-closed" : "crehab-sidebar-open";
  const classes = useStyles();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        width={250}
        onCollapse={toggleCollapsed}
      >
        <div
          className={classes.myLogo}
          onClick={() => {
            navigate("/");
          }}
        >
          <React.Fragment>
            <img
              src={Logo}
              className={`${collapsed ? classes.collapseLogo : classes.logo}`}
            />

            {!collapsed && <h3>ADMIN Inc</h3>}
          </React.Fragment>
        </div>

        <MainMenu />
        <BottomMenu collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      </Sider>
      {/* <Sider
        collapsible
        collapsed={collapsed}
        width={250}
        onCollapse={toggleCollapsed}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={logo}
            style={{ width: "100px", margin: "1rem 0rem 2rem 0rem" }}
          />
        </div>
        <MainMenu />
        <BottomMenu collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      </Sider>
      <Drawer
        placement={"left"}
        closable={false}
        onClose={toggleCollapsed}
        open={!collapsed}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: "none " }}
        className={`show-on-xs ${className}`}
      >
      <MainMenu />
      </Drawer> */}
    </>
  );
}
