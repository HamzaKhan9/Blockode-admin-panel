//@ts-nocheck
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  DeleteTwoTone,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
// import { Modal } from "antd";
import AlertPopup from "../../components/AlertPopup";
import { createUseStyles } from "react-jss";
import User from "../../services/users";
import CreateUserModal from "./CreateUserModal";
import {
  getUserProfiles,
  getUserProfilesForCsv,
  removeUserFromList,
  updateUserCompany,
  updateUserInList,
} from "../../models/users";
import debounce from "lodash.debounce";
import { useAppSelector } from "../../store";
import moment from "moment";

import {
  Typography,
  Table,
  Empty,
  Select,
  message,
  Button,
  Tag,
  GlobalToken,
} from "antd";
import { Status } from "../../utils/statusHandler";
import AutoCompleteSelector from "../../components/AutocompleteSelector";
import RoleColumn from "./RoleColumn";
import { EMPLOYED_STATUS } from "../../constants";
import analytics from "../../analytics";

const useStyles = createUseStyles((theme: GlobalToken) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },

  workPlaceLogo: {
    width: "20px",
    height: "20px",
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
    right: "160px",
    top: "150px",
  },
  inviteBtn: {
    position: "absolute",
    right: "32px",
    top: "150px",
  },
}));

export default function Users() {
  const PAGE_SIZE = 10;
  const classes = useStyles();
  const dispatch = useDispatch();

  const fetchUsersLoading = useAppSelector(
    (state) => state.users.getUserProfilesStatus === Status.LOADING
  );
  const users = useAppSelector((state) => state.users.userProfiles);
  const count = useAppSelector((state: any) => state.users.count);
  const { workplaceId, workplaceType } = useAppSelector(
    (state) => state.workplace
  );

  //image modal visibility

  const initial = useRef(true);

  const [page, setPage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalVisible, setModalVisibility] = useState(false);
  const [currUser, setCurrUser] = useState(undefined);

  useEffect(() => {
    dispatch(
      getUserProfiles({
        page: initial.current ? 0 : page,
        pageSize: PAGE_SIZE,
      })
    );
    initial.current = false;
  }, [page, workplaceId]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,

      render(value) {
        if (value) {
          return (
            <span>{moment(value)?.format("DD-MMM-YYYY").toLowerCase()}</span>
          );
        }
      },
    },
  ];

  return (
    <div className={classes.root}>
      {count > 0 && (
        <Table
          scroll={{ x: "max-content", y: window.innerHeight - 360 }}
          dataSource={users}
          loading={fetchUsersLoading}
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
          columns={columns}
        />
      )}
      {isModalVisible && (
        <CreateUserModal
          openModal={isModalVisible}
          setModalVisibility={(value) => setModalVisibility(value)}
        />
      )}
    </div>
  );
}

export function UpdateUserRole({
  defaultValue,
  id,
  accountId,
  isDeleted,
}: {
  defaultValue: string;
  id: string;
  accountId: string;
  isDeleted: string;
}) {
  const [userRoleLoading, setUserRoleLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);
  return (
    <Select
      onChange={async (value) => {
        try {
          setUserRoleLoading(true);

          const newData = await User.updateAccountUserRole({
            account_id: accountId,
            new_account_role: value,
            user_id: id,
          });

          setSelectedValue(newData);
          message.success("Role updated successfully!");
        } catch (error) {
          setSelectedValue(defaultValue);
          message.error(error?.message);
        } finally {
          setUserRoleLoading(false);
        }
      }}
      value={selectedValue}
      disabled={isDeleted}
      loading={userRoleLoading}
      style={{ width: 150 }}
      defaultValue={selectedValue}
      placeholder="User Role"
      options={[
        {
          value: "member",
          label: "MEMBER",
        },
        {
          value: "owner",
          label: "OWNER",
        },
      ]}
      filterOption
      optionFilterProp="label"
      showSearch
    />
  );
}
