import { createUseStyles } from "react-jss";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  Empty,
  Input,
  Spin,
  Tag,
  Typography,
  Button,
  Dropdown,
  message,
} from "antd";
import { MyTheme } from "../../types/theme";
import { Tooltip } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { getUsersAlongGoals } from "../../models/goals";
import debounce from "lodash.debounce";
import CustomSlider from "../../components/Slider";
import { Status } from "../../utils/statusHandler";
import CustomModal from "../../components/CustomModal";
import Goals from "../../services/goals";
import type { InputRef } from "antd";
import { saveAs } from "file-saver";
import { RenderFunction } from "antd/es/_util/getRenderPropValue";
import { convertToCsv } from "../../utils";
import { globalErrorHandler } from "../../utils/errorHandler";
import { categoriesConstant } from "../../constants";
import moment from "moment";
import supabase from "../../supabase.config";

const useStyles = createUseStyles((theme: MyTheme) => ({
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },

  cardWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "1rem",
  },
  card: {
    width: "80%",
    borderRadius: "0.5rem",
    boxShadow:
      "0.25rem 0.25rem 0.6rem rgba(0,0,0,0.05), 0 0.5rem 1.125rem rgba(75,0,0,0.05)",
  },

  container: {
    width: "100%",
    marginTop: 60,
    marginBottom: 24,
  },

  image: {
    height: "250px",
    width: "100%",
    cursor: "pointer",
    objectFit: "cover",
  },

  overlay: {
    position: "absolute",
    background: "rgba(60, 57, 57, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    bottom: 0,
    right: 0,
    color: "white",
    padding: "0.5rem",
  },

  userInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    paddingBottom: "12px",
    borderBottom: `0.5px solid #d9d9d9`,
  },

  userName: {
    fontSize: "16px",
    fontWeight: "500",
    lineHeight: "20px",
  },

  userEmail: {
    fontSize: "12px",
    color: "gray",
  },

  userWorkplace: {
    fontSize: "18px",
    border: `1px solid ${theme.colorPrimary}`,
    color: theme.colorPrimary,
    padding: "5px",
    borderRadius: "5px",
  },

  goalsHeading: {
    fontSize: "18px",
    marginBottom: 8,
    color: "gray",
    marginLeft: 30,
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
  loadMoreBtn: {
    border: `1px solid ${theme.colorPrimary}`,
    fontSize: "18px",
    color: theme.colorPrimary,
    paddingInline: "9px",
    paddingBlock: "5px",
    borderRadius: "5px",
    cursor: "pointer",
    "&:hover": {
      opacity: 0.6,
    },
  },
  countText: {
    margin: "auto",
    marginBottom: "1rem",
  },
  tagsParent: {
    padding: "10px",
    margin: "2px",
    border: `1px solid black `,
    fontSize: "16px",
    fontWeight: "600",
    color: "black",
    "& svg": {
      color: "black",
    },
  },
  tags: {
    margin: "4px",
  },
  downloadCSV: {
    position: "absolute",
    right: -8,
    top: "40px",
  },
  workPlaceLogo: {
    width: "20px",
    height: "20px",
  },
}));

const PAGE_SIZE = 20;

const Users = () => {
  const classes = useStyles();
  const dispatch: any = useAppDispatch();
  const cardRef = useRef<any>(null);

  const loading = useAppSelector(
    (state: any) => state.goals.getUsersAlongGoalsStatus === Status.LOADING
  );

  const { workplaceId } = useAppSelector((state) => state.workplace);

  const users = useAppSelector((state: any) => state.goals.users);
  const count = useAppSelector((state: any) => state.goals.count);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalVisible, setModalVisibility] = useState<boolean>(false);
  const [csvLoading, setCsvLoading] = useState<boolean>(false);
  const initial = useRef(true);

  useEffect(() => {
    dispatch(
      getUsersAlongGoals({
        page: initial.current ? 0 : page,
        pageSize: PAGE_SIZE,
        searchTerm,
      })
    );
    initial.current = false;
  }, [page, searchTerm, workplaceId]);

  const setDebouncedSearchTerm = useCallback(debounce(setSearchTerm, 500), []);

  const onSearchChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    if (value.length === 0) {
      initial.current = true;
      setSearchTerm("");
    } else if (value.length >= 3) {
      initial.current = true;
      setDebouncedSearchTerm(value);
    }
  };

  const getSearchingGoals = async () => {
    try {
      setCsvLoading(true);
      const response: any = await Goals.getGoalsWithRespectUsers({
        workplaceId,
      });
      const categoriesMap = new Map();
      let totalGoals = 0;
      let totalUsers = 0;

      for (const user of response) {
        const userCats = new Set();
        let countedUser = false;

        for (const visionBoard of user.vision_boards) {
          for (const goal of visionBoard.goals) {
            const category = (goal.cluster_class || "").toLowerCase();
            if (category) {
              totalGoals++;
              if (!countedUser) {
                totalUsers++;
                countedUser = true;
              }

              if (categoriesMap.has(category)) {
                const { goalsCount, usersCount } = categoriesMap.get(category);
                categoriesMap.set(category, {
                  goalsCount: goalsCount + 1,
                  usersCount: userCats.has(category)
                    ? usersCount
                    : usersCount + 1,
                });
              } else {
                categoriesMap.set(category, {
                  usersCount: 1,
                  goalsCount: 1,
                });
              }
              userCats.add(category);
            }
          }
        }
      }

      for (let category of categoriesConstant) {
        const cat = category.toLowerCase();
        if (!categoriesMap.has(cat)) {
          categoriesMap.set(cat, {
            goalsCount: 0,
            usersCount: 0,
          });
        }
      }

      const csvData: Record<string, any>[] = [];
      categoriesConstant.forEach((category) => {
        const cat = category.toLowerCase();
        const { usersCount, goalsCount } = categoriesMap.get(cat);
        csvData.push({
          Category: category,
          "Users Count": usersCount,
          "Total Users": totalUsers,
          "Users Percentage": `${((usersCount / totalUsers) * 100)?.toFixed(
            2
          )}%`,
          "Goals Count": goalsCount,
          "Total Goals": totalGoals,
          "Goals Percentage": `${((goalsCount / totalGoals) * 100)?.toFixed(
            2
          )}%`,
        });
      });

      const csv = convertToCsv(
        csvData.sort((a, b) => b["Users Count"] - a["Users Count"]),
        Object.keys(csvData[0])
      );
      const blob = new Blob([csv], { type: "text/csv" });
      saveAs(blob, "categories-aggregation.csv");
    } catch (error) {
      globalErrorHandler(error);
    } finally {
      setCsvLoading(false);
      setModalVisibility(false);
    }
  };

  const downloadProfilesCSV = async () => {
    try {
      setCsvLoading(true);
      let query = supabase
        .from("profiles")
        .select(
          "name, email, created_at, workplace_ref(workplace_name, workplace_domain), institution_ref(workplace_name, workplace_domain), vision_boards(goals(name, description, cluster_class)))"
        );
      if (workplaceId)
        query = query.or(
          `workplace_ref.eq.${workplaceId},institution_ref.eq.${workplaceId}`
        );

      const { data: profiles } = await query.order("created_at", {
        ascending: false,
      });
      const csvData: Record<string, any>[] = [];
      if (profiles && profiles?.length > 0) {
        for (const profile of profiles as any) {
          for (const vision of profile.vision_boards) {
            for (const goal of vision.goals) {
              csvData.push({
                "User Name": profile.name,
                "User Email": profile.email,
                "Goal Name": goal.name,
                "Goal Description": goal.description,
                "User Create At": profile.created_at
                  ? moment(profile.created_at)?.format("DD-MMM-YYYY | hh:mm a")
                  : "",
                "Goal Category": goal.cluster_class,
                "Workplace Name":
                  (profile.workplace_ref as any)?.workplace_name || "",
                "Workplace Domain":
                  (profile.workplace_ref as any)?.workplace_domain || "",
                "Institution Name":
                  (profile.institution_ref as any)?.workplace_name || "",
                "Institution Domain":
                  (profile.institution_ref as any)?.workplace_domain || "",
              });
            }
          }
        }

        const csv = convertToCsv(csvData, Object?.keys(csvData[0]));
        const blob = new Blob([csv], { type: "text/csv" });
        saveAs(blob, "users-profiles.csv");
      } else {
        message.error("No Data found");
      }
    } catch (error) {
      globalErrorHandler(error);
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: "1.5rem",
          position: "relative",
        }}
      >
        <Input
          placeholder={`Search by name, email, workspace, vision or goal`}
          size="large"
          className={classes.searchInput}
          onChange={onSearchChange}
          allowClear
          prefix={<SearchOutlined className={classes.searchIcon} />}
        />
        <Dropdown
          className={classes.downloadCSV}
          menu={{
            items: [
              {
                key: "1",
                label: "Users and Goals Data",
                onClick: downloadProfilesCSV,
              },
              {
                key: "2",
                label: "Cagegories Data",
                onClick: getSearchingGoals,
              },
            ],
          }}
          placement="bottomRight"
        >
          <Button loading={csvLoading} icon={<DownloadOutlined />} type="link">
            Download CSV
          </Button>
        </Dropdown>
      </div>

      {!loading && !users?.length ? (
        <Empty description="No users found" />
      ) : (
        <Typography.Text type="secondary" className={classes.countText}>
          <b>{count}</b> users found{" "}
          {searchTerm && (
            <>
              with keyword: <b>"{searchTerm}"</b>
            </>
          )}
        </Typography.Text>
      )}

      <div
        style={{
          overflow: "auto",
          height: "calc(100vh - 220px)",
        }}
      >
        <Spin spinning={loading}>
          <div className={classes.cardWrapper}>
            {(users || []).map((user: any, index: number) => {
              return (
                <Card ref={cardRef} className={classes.card} key={index}>
                  <div className={classes.userInfo}>
                    <div>
                      <div className={classes.userName}>{user.name}</div>
                      <span className={classes.userEmail}>{user.email}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <img
                        src={
                          (user.workplace_ref || user.institution_ref)
                            ?.workplace_logo || "/images/company.png"
                        }
                        alt={
                          user?.workplace_ref
                            ? user?.workplace_ref?.workplace_name
                            : user?.institution_ref?.workplace_name
                        }
                        className={classes.workPlaceLogo}
                      />

                      <Typography.Text strong={true}>
                        {(user.workplace_ref || user.institution_ref)
                          ?.workplace_name || "No Company"}
                      </Typography.Text>
                      <span>|</span>

                      <span>
                        {new Date(user.created_at || "").toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className={classes.container}>
                    {user?.goals?.length > 0 ? (
                      <CustomSlider>
                        {user.goals.map(
                          (
                            goal: {
                              description:
                                | string
                                | number
                                | boolean
                                | React.ReactElement<
                                    any,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | React.ReactPortal
                                | RenderFunction
                                | null
                                | undefined;
                              id: React.Key | null | undefined;
                              url: string | undefined;
                              name:
                                | string
                                | number
                                | boolean
                                | React.ReactElement<
                                    any,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | null
                                | undefined;
                            },
                            ix: number
                          ) => (
                            <Tooltip
                              key={ix}
                              placement="bottom"
                              overlayInnerStyle={{
                                color: "black",
                                backgroundColor: "white ",
                              }}
                              title={goal.description}
                            >
                              <div style={{ position: "relative" }}>
                                <img
                                  className={classes.image}
                                  src={goal?.url || "/images/no-image.svg"}
                                  alt={String(goal?.name) || ""}
                                />
                                {goal?.name && (
                                  <span className={classes.overlay}>
                                    <h3>{goal.name}</h3>
                                  </span>
                                )}
                              </div>
                            </Tooltip>
                          )
                        )}
                      </CustomSlider>
                    ) : (
                      <p>No goals available</p>
                    )}
                  </div>
                </Card>
              );
            })}

            {users.length >= PAGE_SIZE && (
              <div
                style={{ marginTop: "20px" }}
                onClick={() => setPage((prev) => prev + 1)}
                className={classes.loadMoreBtn}
              >
                Load More
              </div>
            )}
          </div>
        </Spin>
      </div>

      <GetUsersKeyword
        openModal={isModalVisible}
        setModalVisibility={(state: boolean) => setModalVisibility(state)}
      />
    </div>
  );
};

export default Users;

function GetUsersKeyword({
  openModal,
  setModalVisibility,
}: {
  openModal: boolean;
  setModalVisibility: (state: boolean) => void;
}) {
  const classes = useStyles();
  const [searchTerms, setsearchTerms] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleInputConfirm = () => {
    if (inputValue) {
      setsearchTerms((prev) => [...prev, inputValue]);
      setInputVisible(false);
      setInputValue("");
    }
  };

  const handleClose = async (removedTag: string) => {
    setsearchTerms((prev) =>
      prev.filter((prevData) => prevData !== removedTag)
    );
  };

  const tagChild = searchTerms?.map((tag, ix) => (
    <Tag
      key={ix}
      className={classes.tagsParent}
      closable
      onClose={(e: any) => {
        e.preventDefault();
        handleClose(tag);
      }}
    >
      <span className={classes.tags}>{tag}</span>
    </Tag>
  ));
  return (
    <CustomModal
      open={openModal}
      closable
      destroyOnClose={true}
      // footer={null}
      title="Search Terms"
      maskClosable
      onCancel={() => {
        setsearchTerms([]);
        setModalVisibility(false);
      }}
      okText="Search"
    >
      <Spin spinning={loading}>
        <div
          style={{
            marginBottom: 16,
            overflow: "auto",
            maxHeight: "400px",
          }}
        >
          {tagChild}
        </div>
        <Input
          ref={inputRef}
          type="text"
          size="large"
          style={{ width: "50%" }}
          placeholder="Enter Search Term"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      </Spin>
    </CustomModal>
  );
}
