import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import Graphs from "../../components/graphs";
import { Row, Col, Tag, Typography, theme } from "antd";
import { IoTrophyOutline } from "react-icons/io5";
import { GrGamepad } from "react-icons/gr";
import { SiLevelsdotfyi } from "react-icons/si";
import StatisticsCard from "../../components/StatisticsCard";
import React from "react";
import { useAppSelector } from "../../store";
import { Status } from "../../utils/statusHandler";
import { DashboardTable, StatsCardTitle } from "./Component";
import { Bar } from "recharts";

const columns = [
  {
    title: "Game Stats",
    children: [
      {
        title: "Games",
        dataIndex: "game",
        key: "game",
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
        title: "Duration",
        dataIndex: "duration",
        key: "duration",
        width: 100,
        align: "center",
        render(value: string) {
          return <Typography.Text>{value}</Typography.Text>;
        },
      },

      {
        title: "Success",
        dataIndex: "success",
        key: "success",
        width: 100,
        align: "center",
        render(value: string) {
          return <Typography.Text>{`${value} %`}</Typography.Text>;
        },
      },
    ],
  },
];

interface GameStateData {
  [key: string]: {
    logo: React.ReactNode;
    loading: Status;
  };
}
const GameStatistics = () => {
  const { token } = theme.useToken();
  const {
    fetchAllGamesCountStatus,
    fetchAllGamesDataStatus,
    gameStatswithRespectLevelsForGraph,
    gameStats,
    allGamesStatistics,
  } = useAppSelector((state: any) => state.dashboard);

  const gameStatsData: GameStateData = {
    totalGames: { logo: <GrGamepad />, loading: fetchAllGamesCountStatus },
    avgDuration: {
      logo: <HistoryOutlined />,
      loading: fetchAllGamesDataStatus,
    },
    successGame: {
      logo: <IoTrophyOutline />,
      loading: fetchAllGamesDataStatus,
    },
    unattempted: {
      logo: <SiLevelsdotfyi />,
      loading: fetchAllGamesDataStatus,
    },
  };

  return (
    <div style={{ maxWidth: "100vw" }}>
      <Row gutter={16}>
        {(Object.values(gameStats) || []).map((value: any, index: number) => {
          return (
            <StatisticsCard
              key={index}
              title={
                <StatsCardTitle
                  logo={gameStatsData[value.entity]?.logo}
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
              loading={gameStatsData[value.entity]?.loading === Status.LOADING}
            />
          );
        })}
      </Row>
      <Row gutter={16} style={{ marginTop: "rem" }}>
        <Col xs={24} sm={24} md={12} lg={12} style={{ marginBottom: 16 }}>
          <DashboardTable
            column={columns}
            data={allGamesStatistics}
            rowKey="cluster_class"
            loading={fetchAllGamesDataStatus === Status.LOADING}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ textAlign: "center" }}>
            Avg Game Completed Levels
          </Typography.Title>
          <Graphs
            loading={false}
            type="bar"
            data={gameStatswithRespectLevelsForGraph}
            dataKeyForX="name"
          >
            <Bar dataKey="Maze" fill={token.colorSuccess} />
            <Bar dataKey="Turtle" fill={token.colorError} />
            <Bar dataKey="Plane" fill={token.colorPrimaryBgHover} />
          </Graphs>
        </Col>
      </Row>
    </div>
  );
};

export default GameStatistics;
