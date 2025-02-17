import { Select, Spin, Tooltip } from "antd";
import DashboardTabs from "../../components/DashboardTabs";
import Container from "../../components/container";
import UserStatistics from "./UserStatistics";
import GameStatistics from "./GameStatistics";
import { IoMdRefresh } from "react-icons/io";
import { createUseStyles } from "react-jss";
import {
  setDateRange,
  setTimeRange,
  setDefaultSelected,
  getCategoriesClusterClasses,
  getUsersRepectedTimePeriod,
  getPendingRequest,
  getTotalUsers,
  getDeletedUsersCount,
  fetchUsersCountRespectedDate,
  fetchAllGamesCount,
  fetchAllGamesData,
} from "../../models/dasboard";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useState } from "react";
import { getDateRange } from "../../utils";

import { getTimeDifference } from "../../utils";
import { TIME_RANGE } from "../../constants";
import { MyTheme } from "../../types/theme";

const useStyles = createUseStyles((theme: MyTheme) => ({
  buttonStyle: {
    fontSize: 20,
    color: theme.colorPrimary,
    cursor: "pointer",
    "&:hover": {
      opacity: 0.6,
    },
  },
  buttonWrapper: { display: "flex", gap: "10px", alignItems: "center" },
}));

const Dashboard = () => {
  const classes = useStyles();

  const selectedWorkplace = useAppSelector((state) => state.workplace);
  const [selectedTab, setSelectedTab] = useState("users");

  const dispatch = useAppDispatch();
  const { defaultSelectedPeriod } = useAppSelector(
    (state: any) => state.dashboard
  );

  const { dateRange, timeStamp } = useAppSelector(
    (state: any) => state.dashboard
  );

  const options = [
    {
      value: "week",
      label: "This Week",
    },
    {
      value: "month",
      label: "This Month",
    },
    {
      value: "year",
      label: "This Year",
    },
  ];
  const TabsItem = [
    {
      label: "Users",
      key: "users",
      children: <UserStatistics />,
    },
    {
      label: "Games",
      key: "games",
      children: <GameStatistics />,
    },
  ];

  function updateDate(value: any) {
    const { startDate, endDate, previousStartDate, previousEndDate } =
      getDateRange(value);
    dispatch(
      setDateRange({
        start: startDate,
        end: endDate,
        previousStart: previousStartDate,
        previousEnd: previousEndDate,
      })
    );
  }
  useEffect(() => {
    if (dateRange.start === "" && dateRange.end === "") {
      updateDate("month");
    }
  }, []);

  useEffect(() => {
    if (timeStamp === 0) {
      getCardsData();
    }
    const mintues = getTimeDifference(timeStamp);
    if (mintues > Number(TIME_RANGE)) {
      getCardsData();
    }
  }, [dateRange.start, dateRange.end, timeStamp]);

  function onSelectHandler(value: any) {
    updateDate(value);
    dispatch(setTimeRange(0));
    dispatch(setDefaultSelected(value));
  }

  const getCardsData = () => {
    if (dateRange.start !== "" && dateRange.end !== "") {
      dispatch(
        getUsersRepectedTimePeriod({
          dateRange,
          workplaceId: selectedWorkplace.workplaceId,
        })
      );
      dispatch(getPendingRequest(dateRange));
      dispatch(
        getDeletedUsersCount({
          dateRange: dateRange,
          workplaceId: selectedWorkplace.workplaceId,
        })
      );
      dispatch(
        fetchUsersCountRespectedDate({
          dateRange: dateRange,
          workplaceId: selectedWorkplace.workplaceId,
        })
      );
      dispatch(getTotalUsers(selectedWorkplace.workplaceId));
      dispatch(getCategoriesClusterClasses(selectedWorkplace.workplaceId));
      dispatch(fetchAllGamesCount());
      dispatch(fetchAllGamesData(selectedWorkplace.workplaceId));
      dispatch(setTimeRange(Number(new Date().getTime())));
    }
  };

  const refetch = () => {
    dispatch(setTimeRange(0));
  };

  function getSelectedKey(key: string) {
    setSelectedTab(key);
  }

  return (
    <Container>
      <Spin spinning={false}>
        <DashboardTabs items={TabsItem} getSelectedKey={getSelectedKey}>
          <div className={classes.buttonWrapper}>
            <Tooltip title="Refresh">
              <IoMdRefresh onClick={refetch} className={classes.buttonStyle} />
            </Tooltip>

            {selectedTab === "users" && (
              <Select
                value={defaultSelectedPeriod}
                size="middle"
                defaultValue={defaultSelectedPeriod}
                onChange={onSelectHandler}
                style={{ width: 120 }}
                options={options}
              />
            )}
          </div>
        </DashboardTabs>
      </Spin>
    </Container>
  );
};

export default Dashboard;
