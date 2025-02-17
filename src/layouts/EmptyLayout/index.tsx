import { Layout } from "antd";
import { createUseStyles } from "react-jss";
import React from "react";

const useStyles = createUseStyles({
  main_container: {
    height: "100vh",
    position: "relative",
    overflow: "auto",

    "& .content_container": {
      position: "relative",
      paddingLeft: "2rem",
      paddingRight: "2rem",
      overflow: "auto",
    },

    "& .lang_changer": {
      width: "140px",
      position: "absolute",
      left: "22px",
      bottom: "1rem",
      zIndex: 1,
    },
  },

  max_width: {
    maxWidth: "100vw",
    margin: "auto",
    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
  },
});

interface EmptyLayoutProps {
  children: React.ReactNode;
  hasMaxWidth?: boolean;
}

function EmptyLayout({ children, hasMaxWidth = true }: EmptyLayoutProps) {
  const classes = useStyles();
  return (
    <Layout
      className={`${classes.main_container} ${
        hasMaxWidth ? classes.max_width : ""
      }`}
    >
      {children}
    </Layout>
  );
}

export default EmptyLayout;
