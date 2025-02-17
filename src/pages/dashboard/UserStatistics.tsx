import {
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PullRequestOutlined,
  UsergroupDeleteOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import Graphs from "../../components/graphs";
import { Row, Col, Tag, Typography, theme } from "antd";
import { Status } from "../../utils/statusHandler";
import StatisticsCard from "../../components/StatisticsCard";
import React from "react";
import { useAppSelector } from "../../store";
import { DashboardTable, StatsCardTitle } from "./Component";
import { Area } from "recharts";

const columns = [
  {
    title: "Popular Goal Categories",
    children: [
      {
        title: "Keywords",
        dataIndex: "cluster_class",
        key: "cluster_class",
        width: 250,
        align: "left",
        render(value: string) {
          return (
            <Tag color="blue" bordered={false} style={{ fontSize: 15 }}>
              {value}
            </Tag>
          );
        },
      },
      {
        title: "Users",
        dataIndex: "user_count",
        key: "user_count",
        width: 100,
        align: "center",
        render(value: string) {
          return <Typography.Text>{value}</Typography.Text>;
        },
      },

      {
        title: "Goals",
        dataIndex: "goals_count",
        key: "goals_count",
        width: 100,
        align: "center",
        render(value: string) {
          return <Typography.Text>{value}</Typography.Text>;
        },
      },
    ],
  },
];

interface UserStateData {
  [key: string]: {
    logo: React.ReactNode;
    loading: Status;
  };
}
const UserStatistics = () => {
  const { token } = theme.useToken();
  const {
    getUsersRepectedTimePeriodStatus,
    getPendingRequestStatus,
    getTotalUsersStatus,
    getDeletedUsersCountStatus,
    getCategoriesClusterClassesStatus,
    fetchUsersCountRespectedDateStatus,
    usersCountRespectedDateForGraph,
    TopCategoriesClusterClasses,
    userStats,
  } = useAppSelector((state: any) => state.dashboard);

  const userStateData: UserStateData = {
    totalusers: { logo: <UserOutlined />, loading: getTotalUsersStatus },
    new: {
      logo: <UsergroupAddOutlined />,
      loading: getUsersRepectedTimePeriodStatus,
    },
    pending: {
      logo: <PullRequestOutlined />,
      loading: getPendingRequestStatus,
    },
    deleted: {
      logo: <UsergroupDeleteOutlined />,
      loading: getDeletedUsersCountStatus,
    },
  };

  return (
    <div style={{ maxWidth: "100vw" }}>
      <Row gutter={16}>
        {(Object.values(userStats || {}) || []).map(
          (value: any, index: number) => {
            return (
              <StatisticsCard
                key={index}
                title={
                  <StatsCardTitle
                    logo={userStateData[value.entity]?.logo}
                    title={value.title}
                  />
                }
                value={value.value}
                valueStyle={{
                  color:
                    !value.percent || value.percent > 0
                      ? token.colorSuccessActive
                      : token.colorError,
                }}
                precision={0}
                prefix={
                  !value.percent ? null : value.percent > 0 ? (
                    <ArrowUpOutlined
                      style={{ fontSize: 13, color: token.colorSuccessActive }}
                    />
                  ) : (
                    <ArrowDownOutlined
                      style={{ fontSize: 13, color: token.colorError }}
                    />
                  )
                }
                suffix={!value?.percent ? null : `(${value.percent}%)`}
                loading={
                  userStateData[value.entity]?.loading === Status.LOADING
                }
              />
            );
          }
        )}
      </Row>
      <Row gutter={16} style={{ marginTop: "rem" }}>
        <Col xs={24} sm={24} md={12} lg={12} style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ textAlign: "center" }}>
            New Users
          </Typography.Title>
          <Graphs
            type="line"
            data={usersCountRespectedDateForGraph}
            dataKeyForX="creation_date"
            loading={fetchUsersCountRespectedDateStatus === Status.LOADING}
          >
            <Area
              type="monotone"
              dataKey="record_count"
              stroke={token.colorPrimaryActive}
              activeDot={{ r: 4 }}
              fill={token.colorPrimaryBg}
            />
          </Graphs>
        </Col>
      </Row>
    </div>
  );
};

export default UserStatistics;
