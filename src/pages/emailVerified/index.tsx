import React from "react";
import { createUseStyles } from "react-jss";
import Logo from "../../assets/images/success.webp";

const useStyles = createUseStyles({
  emailVerifiedWrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  logo: {
    height: "150px",
    width: "150px",
    borderRadius: "30px",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
});

const EmailVerified: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.emailVerifiedWrapper}>
      <div className={classes.container}>
        <img src={Logo} className={`${classes.logo}`} />
        <h1 style={{ textAlign: "center", padding: "20px" }}>
          Your email has been verified. Please sign in to the Blockode App now
        </h1>
      </div>
    </div>
  );
};

export default EmailVerified;
