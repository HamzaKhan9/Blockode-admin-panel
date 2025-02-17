import React from "react";
import { Card, Statistic, GlobalToken, Col } from "antd";
import { createUseStyles } from "react-jss";
import { fadeColor } from "../../utils/colors";
const useStyles = createUseStyles((theme: GlobalToken) => {
  return {
    statsCard: {
      backgroundColor: fadeColor(theme.colorPrimary, 0.06),
    },
  };
});
interface StatisticsCardProps {
  title: React.ReactNode;
  value: number | undefined;
  precision?: number;
  valueStyle?: React.CSSProperties;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  precision = 2,
  valueStyle,
  prefix,
  suffix,
  loading,
}) => {
  const classes = useStyles();

  return (
    <CardColumn>
      <Card bordered={false} className={classes.statsCard}>
        <Statistic
          title={title}
          value={value}
          precision={precision}
          valueStyle={valueStyle}
          prefix={prefix}
          suffix={suffix}
          loading={loading}
        />
      </Card>
    </CardColumn>
  );
};

export default StatisticsCard;

function CardColumn({ children }: { children: React.ReactNode }) {
  return (
    <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
      {children}
    </Col>
  );
}

// function CardSkeleton() {

//   return (
//     <Skeleton.Avatar
//       active
//       shape="square"
//       size="large"
//       style={{ height : 110 , width : 300}}

//     />
//   );
// }
