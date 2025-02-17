//@ts-nocheck
import React, { useCallback } from "react";
import { Menu, message } from "antd";
import { routes } from "../../config";
import { Link, useLocation, matchPath, useNavigate } from "react-router-dom";
import { getRoutePath } from "../../utils";
import { useAppSelector } from "../../store";
import { dispatch } from "../../utils";
import { toggleSidebarCollapsed } from "../../models/router";
import { createUseStyles } from "react-jss";
import Logo from "../../assets/icons/lca-logo.webp";
const { SubMenu } = Menu;

const useStyles = createUseStyles({
  myLogo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    paddingBlock: "10px",
    marginRight: "20px",
    cursor: "pointer",
  },

  logo: {
    height: "40px",
    width: "40px",
    borderRadius: "30px",
  },
});

function getParentKeys(key, arr = []) {
  const lastDot = key?.lastIndexOf(".");
  if (lastDot === -1) return arr;

  key = key?.slice(0, lastDot);
  if (key) {
    arr.push(key);
    return getParentKeys(key, arr);
  } else {
    return;
  }
}

export default function MainMenu({ closeOnNavigate = false, ...props }) {
  const classes = useStyles();
  const cr = useAppSelector((state) => state.router.computedRoutes);
  const { workplaceId } = useAppSelector((state) => state.workplace);

  const menuRenderer = useCallback((routes, prefix = "", basePath = "") => {
    return routes.map((route, i) => {
      if (!route.menuItem) return null;

      const path = getRoutePath(basePath, route?.path || "");
      const title =
        typeof route.title === "function" ? route.title() : route.title;

      if (route.subRoutes) {
        return (
          <SubMenu
            key={prefix + i}
            icon={<route.icon />}
            title={
              path ? (
                <Link
                  onClick={() => {
                    if (closeOnNavigate) dispatch(toggleSidebarCollapsed());
                  }}
                  to={path}
                >
                  {title}
                </Link>
              ) : (
                title
              )
            }
          >
            {menuRenderer(route.subRoutes, prefix + i + ".", path)}
          </SubMenu>
        );
      }

      return (
        <Menu.Item icon={route.icon ? <route.icon /> : null} key={prefix + i}>
          <Link
            onClick={() => {
              if (closeOnNavigate) dispatch(toggleSidebarCollapsed());
            }}
            to={path}
          >
            {title}
          </Link>
        </Menu.Item>
      );
    });
  }, []);

  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const selectedKey = cr?.find((r) => {
    const route = matchPath(r.path, pathname);
    return route;
  }).key;

  return (
    <>
      <div
        className={classes.myLogo}
        onClick={() => {
          navigate("/");
        }}
      >
        <React.Fragment>
          <img src={Logo} className={`${classes.logo}`} />
        </React.Fragment>
      </div>
      <Menu
        onSelect={(data) => {
          if (data.key === "6" && !workplaceId) {
            message.info("Workplace not found! Select Workplace");
            navigate("/");
          }
          return;
        }}
        defaultOpenKeys={getParentKeys(selectedKey)}
        selectedKeys={[selectedKey]}
        mode="horizontal"
        theme="light"
        style={{ width: "100%" }}
        // onClick={onClickMenu}
        {...props}
      >
        {menuRenderer(routes)}
      </Menu>
    </>
  );
}
