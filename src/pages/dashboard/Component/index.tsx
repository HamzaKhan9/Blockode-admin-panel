import { Typography, Table, Space } from "antd";
import React from "react";
import { createUseStyles } from "react-jss";
const useStyles = createUseStyles({
  tableRow: {
    height: 5,
  },
  tableHeader: {
    backgroundColor: "#f0f7ff",
  },
  logo: { color: "black", fontSize: 17 },
});

export function CustomLogo({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt="No Logo found"
      style={{
        width: 17,
        height: 17,
      }}
    />
  );
}

export function StatsCardTitle({
  title,
  logo,
}: {
  title: string;
  logo?: React.ReactNode;
}) {
  const classes = useStyles();
  return (
    <Space size={4} align="center">
      {logo && <span className={classes.logo}> {logo} </span>}
      <Typography.Text
        strong
        style={{ marginLeft: 5 }}
      >{`${title}`}</Typography.Text>
    </Space>
  );
}

export const DashboardTable = ({
  data,
  column,
  rowKey,
  loading,
}: {
  data: any;
  column: any;
  rowKey: string;
  loading: boolean;
}) => {
  const classes = useStyles();
  return (
    <Table
      bordered={true}
      pagination={false}
      rowClassName={classes.tableRow}
      className="design_table"
      dataSource={data}
      rowKey={rowKey}
      columns={column}
      loading={loading}
    />
  );
};
