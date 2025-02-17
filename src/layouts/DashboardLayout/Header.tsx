import { Layout, theme, Tooltip } from "antd";
import { useCallback } from "react";
import AvatarMenu from "../../components/AvatarMenu";
import { useAppSelector } from "../../store";
import MainMenu from "./MainMenu";
import { useDispatch } from "react-redux";
import Auth from "../../services/auth";
const { Header } = Layout;
import { createUseStyles } from "react-jss";
import Notification from "../../components/Notification";
import AutoCompleteSelector from "../../components/AutocompleteSelector";
import logoutImg from "../../assets/images/logout.svg";
import AlertPopup from "../../components/AlertPopup";
import { unsetAccountId, unsetUid } from "../../models/auth";
import { TableRow } from "../../types/common";
import { setWorkplace, removeWorkplace } from "../../models/workplaces";

const useStyles = createUseStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    padding: "0 20px",
    borderBottom: "1px solid #fafafa",
    // backgroundColor: "red",
  },
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
  headerItems: {
    display: "flex",
    gap: "20px",
    justifyContent: "flex-end",
    alignItems: "center",

    "& svg": {
      fontSize: "20px",
      cursor: "pointer",
    },
  },

  item: {
    marginTop: "10px",
    position: "relative",
  },

  notificationCounter: {
    position: "absolute",
    height: "20px",
    backgroundColor: "red",
    width: "20px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    top: "0px",
    right: "-5px",
  },

  logout: { cursor: "pointer", marginTop: "10px" },
});
const LayoutHeader = () => {
  const dispatch = useDispatch();
  const selectedWorkplace = useAppSelector((state) => state.workplace);

  const userData = useAppSelector((state) => state.profile.user);
  const classes = useStyles();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onLogout = useCallback(async () => {
    AlertPopup({
      title: "Logout",
      message: "Do you want to logout?",
      onOk: async () => {
        dispatch(unsetUid());
        dispatch(unsetAccountId());
        dispatch(removeWorkplace());
        await Auth.logout();
      },
    });
  }, []);

  //@ts-ignore
  const onWorkPlaceChange = (_, workplace: TableRow<"workplaces">) => {
    if (workplace) {
      dispatch(
        setWorkplace({
          workplaceId: workplace.id,
          workplaceType: workplace.type,
        })
      );
    } else {
      dispatch(removeWorkplace());
    }
  };

  return (
    <Header style={{ padding: 0, background: colorBgContainer }}>
      <div className={classes.header}>
        <MainMenu />
        <div className={classes.headerItems}>
          {/* <AutoCompleteSelector
            defaultValue={selectedWorkplace.workplaceId}
            onChangeHandler={onWorkPlaceChange}
          /> */}

          {/* <Notification count={0} /> */}

          <AvatarMenu
            displayName={userData?.name ? userData?.name : userData?.email}
          />
          <div onClick={onLogout} className={classes.logout}>
            <Tooltip
              placement="left"
              overlayInnerStyle={{
                color: "black",
                backgroundColor: "white ",
              }}
              title="Log Out"
            >
              <img src={logoutImg} />
            </Tooltip>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default LayoutHeader;
