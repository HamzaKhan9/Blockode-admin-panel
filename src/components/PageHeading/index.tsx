// import { Button } from "antd";
import React from "react";
import { createUseStyles } from "react-jss";
import Button from "../Button";

interface MyTheme {
  colorPrimary: string;
}
const useStyles = createUseStyles((theme: MyTheme) => ({
  heading: {
    // marginBottom: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    "@media (max-width: 767px)": {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  h1: {
    color: theme.colorPrimary,
    fontSize: "1.5rem",
  },
}));

interface ActionButtonProps {
  children: string;
  onClick?: () => void;
}

interface PageHeadingProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  actionButton?: ActionButtonProps;
  rightComponent?: boolean;
}

function PageHeading({
  children,
  style,
  className,
  actionButton,
  rightComponent,
}: PageHeadingProps) {
  const classes = useStyles();
  return (
    <div className={`${classes.heading} ${className}`} style={style}>
      <h1>{children}</h1>
      {rightComponent ? (
        rightComponent
      ) : actionButton ? (
        <Button type="primary" {...(actionButton || {})} />
      ) : null}
    </div>
  );
}

export default PageHeading;
