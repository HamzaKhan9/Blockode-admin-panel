import { List, Popover } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { themeColor } from "../../utils/theme";
import { applyTheme } from "../../models/theme";
import { useDispatch } from "react-redux";
import { MyTheme } from "../../types/theme";

const useStyles = createUseStyles((theme: MyTheme) => ({
  themeIcon: {
    fontSize: 20,
    cursor: "pointer",
    color: theme.colorPrimary,
  },
  themeColors: {
    cursor: "pointer",
    width: 26,
    height: 26,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,

    // border: color === true ? "2px solid #777" : "none",
  },
  circular: {
    width: 25,
    height: 25,
    borderRadius: "50%",
    "&:hover": {
      opacity: 0.7,
    },
  },
  customList: {
    width: "100%",
    marginRight: -4,
    marginBottom: -10,

    padding: 10,
    borderRadius: 4,
  },
  footerList: {
    width: "100%",
    margin: "0px",
  },
}));

const ThemeChanger = () => {
  const classes = useStyles();
  const title: string = "Chane Theme";
  const dispatch = useDispatch();

  const onColorChange = (theme: any) => {
    dispatch(applyTheme(theme));
  };

  return (
    <Popover
      placement="bottom"
      title={title}
      overlayStyle={{
        width: "150px",
        maxWidth: "150px",
      }}
      content={
        <List
          dataSource={themeColor}
          className={classes.customList}
          grid={{ column: 3 }}
          renderItem={(color) => {
            return (
              <div className={classes.themeColors}>
                <div
                  onClick={() => {
                    onColorChange(color.theme);
                  }}
                  className={classes.circular}
                  style={{
                    backgroundColor: color.themeId,
                  }}
                />
              </div>
            );
          }}
          style={{
            width: "100%",
            // marginRight: -4,
            marginBottom: -10,
          }}
        />
      }
      trigger="click"
    >
      <BgColorsOutlined title="Select Theme" className={classes.themeIcon} />
    </Popover>
  );
};

export default ThemeChanger;
