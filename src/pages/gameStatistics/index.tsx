import { useRef, useState, useEffect } from "react";
import moment from "moment";
import { GlobalToken, Table, Typography } from "antd";
import { createUseStyles } from "react-jss";
import { useAppDispatch, useAppSelector } from "../../store";
import { useNavigate } from "react-router-dom";
import { getAvgDuration, getTotalScore, humanizedDuration } from "../../utils";
import { getUsersStatiscs } from "../../models/goals";
import { Status } from "../../utils/statusHandler";
import { AlgoliaUser } from "../../types/common";

const useStyles = createUseStyles((theme: GlobalToken) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  searchInput: {
    width: "50%",
    paddingInline: "20px",
  },
  searchIcon: {
    fontSize: "18px",
    opacity: "0.5",
    color: theme.colorPrimary,
    marginRight: 8,
  },
  countText: {
    margin: "auto",
    marginBottom: "1rem",
  },
  downloadCSV: {
    position: "absolute",
    right: "24px",
    top: "150px",
  },
  workPlaceLogo: {
    width: "20px",
    height: "20px",
  },
}));

const PAGE_SIZE = 10;

const GameStatistics = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(
    (state) => state.goals.getUsersStatiscsStatus === Status.LOADING
  );

  const { workplaceId } = useAppSelector((state) => state.workplace);
  const users = useAppSelector((state) => state.goals.users);
  const count = useAppSelector((state: any) => state.goals.count);

  const [page, setPage] = useState(0);
  const initial = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      getUsersStatiscs({
        page: initial.current ? 0 : page,
        pageSize: PAGE_SIZE,
        searchTerm: "",
      })
    );
    initial.current = false;
  }, [page, workplaceId]);

  return (
    <div className={classes.root}>
      {count > 0 && (
        <Table<AlgoliaUser>
          scroll={{ x: "max-content", y: window.innerHeight - 360 }}
          onRow={(record) => {
            return {
              style: { cursor: "pointer" },
              onClick: () => {
                navigate(`/game-statistics/${record.id}`);
              },
            };
          }}
          dataSource={users}
          loading={loading}
          onChange={(pagination) => {
            setPage((pagination.current || 1) - 1);
          }}
          pagination={{
            current: page + 1,
            responsive: true,
            pageSize: PAGE_SIZE,
            total: count,
            showSizeChanger: true,
            showQuickJumper: true,

            position: ["bottomRight"],
            showTotal: (total, range) =>
              `${range[0]} - ${range[1]} of ${total} items`,
          }}
          rowKey="id"
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              sorter: true,
              width: 100,
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
              width: 200,
            },

            {
              title: "Total Score",
              dataIndex: "total",
              key: "total",
              render(_, record) {
                return <span>{getTotalScore(record?.game_info || [])}</span>;
              },
              width: 150,
            },
            {
              title: "Avg. Duration / Level",
              dataIndex: "duration",
              key: "duration",
              render(_, record) {
                const avg = getAvgDuration(record?.game_info || []);
                if (avg) {
                  return <span>{humanizedDuration(avg)}</span>;
                } else {
                  return (
                    <div>
                      <Typography.Text>--</Typography.Text>
                    </div>
                  );
                }
              },
              width: 150,
            },
            {
              title: "Created At",
              dataIndex: "created_at",
              key: "created_at",
              sorter: true,
              render(value) {
                if (value) {
                  return (
                    <span>
                      {moment(value)?.format("DD-MMM-YYYY").toLowerCase()}
                    </span>
                  );
                }
              },
              width: 100,
            },
          ]}
        />
      )}
    </div>
  );
};

export default GameStatistics;
