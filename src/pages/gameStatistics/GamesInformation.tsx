import { createUseStyles } from "react-jss";
import {
  Typography,
  Progress,
  Avatar,
  Spin,
  Collapse,
  Table,
  CollapseProps,
  Empty,
  Tag,
  Card,
  GlobalToken,
  Button,
  message,
  Space,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import {
  capitalize,
  convertToCsv,
  getAvgDuration,
  getTotalScore,
  humanizedDuration,
} from "../../utils";
import { useAppDispatch, useAppSelector } from "../../store";
import { saveAs } from "file-saver";

import {
  getUserFromId,
  getAtvitiesAlongTask,
} from "../../models/gamesStatistics";
import { useParams } from "react-router-dom";
import { Status } from "../../utils/statusHandler";
import type { ColumnsType } from "antd/es/table";
import { fadeColor, getColorFromStr } from "../../utils/colors";
import { globalErrorHandler } from "../../utils/errorHandler";

const useStyles = createUseStyles((theme: GlobalToken) => {
  return {
    profileSection: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",

      "& >div": {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        "& h3": {
          margin: 0,
        },
      },
    },

    cardSection: {
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      gap: "2rem",
      maxHeight: "300px",

      "& .ant-card": {
        backgroundColor: fadeColor(theme.colorPrimary, 0.06),
        "& .ant-card-body": {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        },
      },
    },

    cardDurationHeading: {
      fontSize: "28px",
      flex: 1,
      display: "grid",
      placeItems: "center",
    },
    title: {
      lineHeight: "0.4",
    },

    header: {
      display: "flex",
      alignItems: "center",
      // padding: "10px",
      cursor: "pointer",
      justifyContent: "space-between",
    },
    content: {
      overflow: "hidden",
      transition: "all 0.9s ease-in-out",
      backgroundColor: "#f5f4f4",
    },
    expandedContent: {
      height: "500px",
      maxHeight: "500px",
    },
    collapsedContent: {
      height: "0px",
    },
    workplace: {
      fontSize: 20,
      color: theme.colorTextSecondary,
    },
    gameSection: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      marginTop: "3rem",
    },
    workPlaceLogo: {
      width: "40px",
      height: "40px",
    },
    typeIcon: {
      minWidth: 20,
      width: 24,
      height: 24,
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      border: "1px solid #cdcdcd",

      "& img": {
        width: "70%",
      },
    },
  };
});

const GamesInformation = () => {
  const classes = useStyles();
  const { uid } = useParams();
  const dispatch = useAppDispatch();
  const { usersSlugGameInfo, totalGameLevels, activitiesWithTasks } =
    useAppSelector((state: any) => state.gamesInfo);

  const usersloadingStatus = useAppSelector(
    (state: any) => state.gamesInfo.getUserFromIdStatus === Status.LOADING
  );

  const [avgDuration, setDuration] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [userPlayingGame, setUserPlayingGames] = useState<any>([]);
  const [gameNotFoundMessage, setGameNotFoundMessage] = useState("");
  const [csvLoading, setCsvLoading] = useState<boolean>(false);
  const company =
    usersSlugGameInfo?.workplace_ref || usersSlugGameInfo?.institution_ref;

  useEffect(() => {
    dispatch(getUserFromId(uid as string));
    dispatch(getAtvitiesAlongTask());
  }, [uid]);

  useEffect(() => {
    if (usersSlugGameInfo !== null) {
      if (usersSlugGameInfo.game_info?.length > 0) {
        if (usersSlugGameInfo?.id === uid) {
          const getTime = getAvgDuration(usersSlugGameInfo?.game_info);
          const getScore = getTotalScore(usersSlugGameInfo?.game_info);
          if (getTime) setDuration(getTime);
          if (getScore) setTotalScore(getScore);

          if (activitiesWithTasks?.length > 0) {
            const userGamePlay: any = [];

            usersSlugGameInfo?.game_info?.forEach((gameInfo: any) => {
              const gameInfoId = gameInfo?.game_id?.toLowerCase();
              const matchingGame = activitiesWithTasks?.find(
                (playingGames: any) =>
                  playingGames.name.toLowerCase() === gameInfoId
              );

              if (matchingGame) {
                let tasks = [];

                if (matchingGame.tasks) {
                  tasks = matchingGame.tasks.map((task: any) => {
                    const order = task.order - 1;
                    if (gameInfo?.durations[order]) {
                      return {
                        ...task,
                        userLevelDuration: gameInfo.durations[order],
                        userLevelScore: gameInfo.levels_completed[order],
                      };
                    }
                    return task;
                  });
                }

                userGamePlay.push({
                  ...matchingGame,
                  tasks: tasks.sort((a: any, b: any) => a.order - b.order),
                  game_info: { ...gameInfo },
                  game_id: gameInfo?.game_id?.toLowerCase(),
                });
              }
            });

            if (userGamePlay && userGamePlay?.length > 0) {
              setUserPlayingGames(userGamePlay);
            } else {
              setGameNotFoundMessage("No games played yet");
            }
          } else {
            setGameNotFoundMessage("No games played yet");
          }
        }
      } else {
        setGameNotFoundMessage("No games played yet");
      }
    }
  }, [usersSlugGameInfo, uid]);

  const items: CollapseProps["items"] = (userPlayingGame || [])?.map(
    (game: any) => {
      const key = game.game_info.game_id;
      return {
        key,
        label: <CollapsibleLabel game={game} key={key} />,
        children: <TableData game={game} key={key} />,
      };
    }
  );

  if (usersloadingStatus || !usersSlugGameInfo)
    return <Spin spinning={usersloadingStatus} />;

  const getIndividualUserGameStats = async () => {
    try {
      setCsvLoading(true);
      const csvData: Record<string, any>[] = [];
      for (let game of userPlayingGame) {
        game?.tasks?.length > 0 &&
          game?.tasks?.forEach((task: any) =>
            csvData.push({
              "User Name": usersSlugGameInfo?.name,
              "User Email": usersSlugGameInfo?.email,
              "Game Name": game.name,
              "Game Level": task.name,
              "Game Difficulty": capitalize(task.difficulty_level || ""),
              "Game Status":
                game.game_info?.levels_completed[task?.order - 1] === true
                  ? "Completed"
                  : "Not Completed",
              Duration: humanizedDuration(task?.userLevelDuration),
            })
          );
      }
      if (csvData?.length > 0) {
        const csv = convertToCsv(csvData, Object.keys(csvData[0]));
        const blob = new Blob([csv], { type: "text/csv" });
        saveAs(blob, `User-game-statistics(${usersSlugGameInfo?.name}).csv`);
      } else {
        message.error("Data not found");
      }
    } catch (error) {
      globalErrorHandler(error);
    } finally {
      setCsvLoading(false);
    }
  };
  return (
    <div>
      <div className={classes.profileSection}>
        <div>
          <Avatar
            size={60}
            style={{ backgroundColor: getColorFromStr(usersSlugGameInfo?.id) }}
            src={usersSlugGameInfo?.profile_photo}
          >
            <p style={{ fontSize: "26px" }}>
              {(usersSlugGameInfo?.name &&
                usersSlugGameInfo?.name[0].toUpperCase()) ||
                "--"}
            </p>
          </Avatar>

          <div>
            <Typography.Title level={3}>
              {usersSlugGameInfo?.name || "--"}
            </Typography.Title>
            <Typography.Text type="secondary">
              {usersSlugGameInfo?.email}
            </Typography.Text>
          </div>
        </div>
        <Space>
          <Space align="center">
            <img
              src={company?.workplace_logo || "/images/company.png"}
              alt={company?.workplace_name}
              className={classes.workPlaceLogo}
            />
            <Typography.Text className={classes.workplace}>
              {company?.workplace_name || "No Workplace"}
            </Typography.Text>
            <div className={classes.typeIcon}>
              <img
                src={
                  usersSlugGameInfo.institution_ref
                    ? "/images/institute.png"
                    : "/images/company.png"
                }
                alt={company?.workplace_name}
              />
            </div>
          </Space>
        </Space>
      </div>

      {userPlayingGame?.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "3rem",
          }}
        >
          <Typography.Title level={4}>Overall Statistics</Typography.Title>
          <div className={classes.cardSection}>
            <Card>
              <Typography.Title level={5}>Levels Completed</Typography.Title>
              <Progress
                style={{ marginTop: "10px" }}
                type="circle"
                percent={
                  totalScore && totalGameLevels
                    ? (totalScore * 100) / totalGameLevels
                    : 0
                }
                format={() =>
                  totalScore && totalGameLevels
                    ? `${totalScore}/${totalGameLevels}`
                    : ""
                }
                size={100}
              />
            </Card>
            <Card>
              <Typography.Title level={5}>
                Avg. Duration / Level
              </Typography.Title>
              <Typography.Text
                type="secondary"
                className={classes.cardDurationHeading}
              >
                {humanizedDuration(avgDuration)}
              </Typography.Text>
            </Card>
          </div>

          <div className={classes.gameSection}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography.Title level={4}>
                Individual Game Statistics
              </Typography.Title>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                loading={csvLoading}
                onClick={getIndividualUserGameStats}
              >
                Download CSV
              </Button>
            </div>

            <Collapse items={items} expandIconPosition="end" />
          </div>
        </div>
      ) : (
        <>
          {gameNotFoundMessage && (
            <Empty
              style={{ marginTop: "5rem" }}
              image="/images/no_data.jpg"
              imageStyle={{ height: 60 }}
              description={
                <Typography.Title level={5}>
                  {gameNotFoundMessage}
                </Typography.Title>
              }
            ></Empty>
          )}
        </>
      )}
    </div>
  );
};

export default GamesInformation;

function CollapsibleLabel({ game }: { game: any }) {
  const classes = useStyles();

  const average = useMemo(() => {
    return humanizedDuration(getAvgDuration([game.game_info]));
  }, [game.game_info]);

  const total = useMemo(() => {
    let totalCompletedLevels = 0;

    if (game.game_info?.levels_completed?.length > 0) {
      for (let i = 0; i < game.game_info.levels_completed.length; i++) {
        if (game.game_info?.levels_completed[i]) {
          totalCompletedLevels++;
        }
      }
    }

    return totalCompletedLevels;
  }, [game]);

  return (
    <div className={classes.header}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <img
          src={game?.thumbnail_url}
          style={{ objectFit: "contain", width: 60 }}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {game?.name}
        </Typography.Title>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "flex-end",
          marginTop: 5,
        }}
      >
        <Typography.Title
          level={5}
          style={{ textTransform: "capitalize", margin: 0 }}
        >
          {average}
        </Typography.Title>

        <Progress
          type="circle"
          percent={
            total && game.game_info?.levels_completed?.length
              ? (total * 100) / game.game_info?.levels_completed?.length
              : 0
          }
          format={() =>
            total && game.game_info?.levels_completed?.length
              ? `${total}/${game.game_info?.levels_completed?.length}`
              : ""
          }
          size={60}
        />
      </div>
    </div>
  );
}

function TableData({ game }: { game: any }) {
  const total = useMemo(() => {
    let totalCompletedLevels = 0;

    if (game.game_info?.levels_completed?.length > 0) {
      for (let i = 0; i < game.game_info.levels_completed.length; i++) {
        if (game.game_info?.levels_completed[i]) {
          totalCompletedLevels++;
        }
      }
    }

    return totalCompletedLevels;
  }, [game]);
  const columns: ColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty_level",
      key: "difficulty_level",
      align: "center",
      render: (value) => {
        return (
          <>
            <Tag
              bordered={false}
              color={
                value === "hard"
                  ? "error"
                  : value === "medium"
                  ? "warning"
                  : "success"
              }
              style={{ fontSize: "14px" }}
            >
              {value}
            </Tag>
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      render: (_, __, ix) => {
        const isCompleted = game.game_info?.levels_completed[ix];
        return (
          <Tag bordered={false} color={isCompleted ? "blue" : "default"}>
            {isCompleted ? "Completed" : "Not Completed"}
          </Tag>
        );
      },
    },
    {
      title: "Duration",
      dataIndex: "userLevelDuration",
      key: "userLevelDuration",
      align: "center",
      render: (value: any) => {
        return (
          <Typography.Text
            style={{ marginTop: "10px", textTransform: "capitalize" }}
          >
            {humanizedDuration(value)}
          </Typography.Text>
        );
      },
    },
  ];

  return (
    <div>
      <Typography.Title
        level={5}
        style={{ marginTop: "10px", textTransform: "capitalize" }}
      >
        Levels : {`${total}/ ${game.game_info?.levels_completed?.length}`}
      </Typography.Title>
      <Table
        columns={columns}
        dataSource={game?.tasks}
        pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}
        rowKey="id"
      />
    </div>
  );
}
