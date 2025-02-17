import React from "react";
import { createUseStyles } from "react-jss";
import { Card } from "antd";
import AssesmentCardContent from "./AssesmentCardContent";
import { useNavigate } from "react-router-dom";
import { Assessment } from "../../types/assessments";

interface AssessmentCardProps {
  assessment: Assessment;
}

const useStyles = createUseStyles({
  card: {
    width: "100%",
    border: "2px solid #e7e3e3",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    height: 220,
    maxHeight: 220,
    objectFit: "cover",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottom: "1px solid #f0f0f0",
  },
  text: {
    fontSize: 12,
  },
});

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => {
  const classes = useStyles();

  const navigate = useNavigate();

  return (
    <Card
      key={assessment?.id}
      hoverable
      cover={
        <img
          alt="example"
          src={assessment.cover_url || "/images/no-image.svg"}
          className={classes.cardImage}
        />
      }
      className={classes.card}
      onClick={() => {
        navigate(`/assessments/${assessment.id}`);
      }}
    >
      <AssesmentCardContent
        id={assessment?.id}
        name={assessment?.title}
        count={assessment?.questions?.length}
        duration={assessment?.estimated_time}
        type={assessment?.type}
        isChecked={assessment?.active}
      />
    </Card>
  );
};

export default AssessmentCard;
