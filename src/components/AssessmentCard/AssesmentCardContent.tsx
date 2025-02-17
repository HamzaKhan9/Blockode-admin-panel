import React from "react";
import { Space, Switch, Typography } from "antd";
import {
  OrderedListOutlined,
  FieldTimeOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useDispatch } from "react-redux";
import { toggleAssessment } from "../../models/assessments";
import { assessmentType } from "../../constants";

interface AssessmentMetaProps {
  name: string;
  count: number;
  duration: string;
  type: string;
  isChecked: boolean;
  id: string;
}

const useStyles = createUseStyles({
  heading: {
    marginBottom: 5,
    display: "block",
    fontSize: 30,
  },
  text: {
    fontSize: 10,
    color: "#bababa",
  },
});

const AssesmentCardContent: React.FC<AssessmentMetaProps> = ({
  name,
  count,
  duration,
  type,
  isChecked,
  id,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleCheck = (e: boolean) => {
    // @ts-ignore
    dispatch(toggleAssessment({ assessmentId: id, status: e }));
  };

  const getAssessmentTitleColor = (title: string) => {
    const type = assessmentType.filter((assType) => assType.text === title);
    return type;
  };
  return (
    <Space direction="vertical">
      <Space align="center">
        <Typography.Text
          className={classes.heading}
          style={{ color: getAssessmentTitleColor(name)?.[0]?.color }}
        >
          {name}
        </Typography.Text>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked={isChecked}
          onChange={handleCheck}
        />
      </Space>

      <Space className={classes.text}>
        <Typography.Text style={{ textWrap: "nowrap" }}>
          <OrderedListOutlined /> {count}
        </Typography.Text>
        <Typography.Text>|</Typography.Text>
        <Typography.Text style={{ textWrap: "nowrap" }}>
          <FieldTimeOutlined />{" "}
          <span>{`${duration ? duration + " min" : "--"}`}</span>
        </Typography.Text>
        <Typography.Text>|</Typography.Text>
        <Typography.Text
          style={{ textTransform: "capitalize", textWrap: "nowrap" }}
        >
          {type === "rating" ? (
            <CheckSquareOutlined />
          ) : (
            <CheckCircleOutlined />
          )}
          &nbsp;{type === "rating" ? type : "True/False"}
        </Typography.Text>
      </Space>
    </Space>
  );
};

export default AssesmentCardContent;
