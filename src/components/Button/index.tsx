import React from "react";
import { createUseStyles } from "react-jss";
import { Button as AntButton, ButtonProps } from "antd";
import { MyTheme } from "../../types/theme";

const useStyles = createUseStyles((theme: MyTheme) => ({
  button: {
    outline: `1px solid ${theme.colorPrimary}`,
    border: `1px solid ${theme.colorPrimary}`,
    color: theme.colorPrimary,
    "&:focus": {
      outline: "2px solid transparent",
      outlineOffset: "1px",
    },
  },
  disabled: {
    opacity: "0.5",
    cursor: "default",
  },
  fullWidth: {
    width: "100%",
  },

  bgDanger: {
    backgroundColor: "#f00",
  },
  bgPrimary: {
    backgroundColor: theme.colorPrimary,
    color: theme.colorTextLightSolid,
    "&:hover": {
      backgroundColor: theme.colorPrimary,
      color: theme.colorTextLightSolid,
      "&:focus": {
        outlineColor: theme.colorPrimary,
        color: theme.colorTextLightSolid,
      },
    },
  },
}));

interface ButtonPropComponent extends ButtonProps {
  htmlType?: "button" | "submit" | "reset" | undefined;
  type?: "default" | "primary" | "dashed" | "link" | "text";
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  shape?: "default" | "circle" | "round";
  size?: "small" | "middle" | "large" | undefined;
  loading?: boolean;
  className?: string | undefined;
}

const Button: React.FC<ButtonPropComponent> = ({
  htmlType = "button",
  fullWidth,
  children,
  onClick,
  // secondary,
  danger,
  disabled,
  loading,
  type = "primary",
  shape = "default",
  size = "middle",
  className,
  icon,
}) => {
  const classes = useStyles();

  return (
    <AntButton
      type={type}
      shape={shape}
      loading={loading}
      size={size}
      // icon={loading && <PoweroffOutlined />}
      onClick={onClick}
      htmlType={htmlType}
      disabled={disabled}
      className={`${classes.button}  ${fullWidth && classes.fullWidth} 
       ${
         danger
           ? classes.bgDanger
           : type === "primary"
           ? classes.bgPrimary
           : null
       } ${className}`}
      icon={icon}
    >
      {children}
    </AntButton>
  );
};

export default Button;
