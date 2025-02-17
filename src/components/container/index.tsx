import React from "react";
import { createUseStyles } from "react-jss";
const useStyles = createUseStyles({
  Container: {
    marginInline: "20px",
    display: "flex",
    flexDirection: "column",
    
  

  },
});

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}
const Container = ({ children, className, style }: ContainerProps) => {
  const classes = useStyles();
  const containerClassName = `${classes.Container} ${className || ""}`;
  return (
    <div className={containerClassName} style={style}>
      {children}
    </div>
  );
};

export default Container;
