import { Form, Input, Select, Typography, Row, Col, message } from "antd";
import React, { useState } from "react";
import Validations from "../../utils/validation";
import { createUseStyles } from "react-jss";
import { MyTheme } from "../../types/theme";
import Button from "../../components/Button";
import CustomModal from "../../components/CustomModal";
import { DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { sendWorkplaceInvitation } from "../../models/workplaces";
import { useAppSelector } from "../../store";
import { Status } from "../../utils/statusHandler";
import AutoCompleteSelector from "../../components/AutocompleteSelector";
import analytics from "../../analytics";

const useStyles = createUseStyles((theme: MyTheme) => ({
  label: {
    color: theme.colorPrimary, // Accessing theme variable
    fontSize: "0.8rem",
    textTransform: "uppercase",
  },
  deleteIcon: {
    fontSize: 20,
    cursor: "pointer",
    marginTop: 5,
    color: "red",
  },
}));

interface CreateUserModalProps {
  openModal: boolean;
  setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

type FieldType = {
  name: string;
  user_role: string;
  emails: string[];
  message: string;
};

export default function CreateUserModal({
  openModal,
  setModalVisibility,
}: CreateUserModalProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userId = useAppSelector((state) => state?.profile?.user?.id);
  const workplaceId = useAppSelector((state) => state?.workplace?.workplaceId);
  const isSuperAdmin = useAppSelector(
    (state) => state.profile?.role === "super-admin"
  );
  const [selectedWorkplace, setSelectedWorkplace] = useState(null);
  const sendWorkplaceInvitationLoading = useAppSelector(
    (state) =>
      state?.workplace?.sendWorkplaceInvitationStatus === Status.LOADING
  );
  const handleFinish = async (value: any) => {
    dispatch(
      sendWorkplaceInvitation({
        emails: (value?.emails || []).map((email: any) =>
          email?.email?.trim?.()
        ),
        role: value?.user_role,
        userId,
        workplaceId: isSuperAdmin ? selectedWorkplace : workplaceId,
        message: value?.message || "",
      })
    ).then(() => {
      analytics.trackEvent("sent_an_invitation");
      message.success("Invitations sent successfully!");
      setModalVisibility(false);
    });
  };

  return (
    <CustomModal
      width={500}
      open={openModal}
      closable
      destroyOnClose={true}
      footer={null}
      title="Invite Users"
      maskClosable
      onCancel={() => {
        setModalVisibility(false);
      }}
    >
      <div style={{ paddingRight: "10px" }}>
        <Typography.Text type="secondary">
          You can invite users by providing their email addresses and selecting
          their user roles.
        </Typography.Text>
        {isSuperAdmin && (
          <div style={{ margin: "20px 0" }}>
            <AutoCompleteSelector
              defaultValue={""}
              onChangeHandler={(_: any, data: any) =>
                setSelectedWorkplace(data?.id)
              }
              style={{ width: "95%" }}
              allowClear={false}
            />
          </div>
        )}
        <Form
          disabled={isSuperAdmin && !selectedWorkplace}
          requiredMark={false}
          onFinish={handleFinish}
          layout="vertical"
          style={{ marginTop: 10 }}
        >
          <React.Fragment>
            <Form.List name="emails" initialValue={[""]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} style={{ marginBottom: 1 }}>
                      <Col flex="auto" style={{ marginRight: 20 }}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          rules={[{ required: true, message: "Missing Email" }]}
                        >
                          <Input
                            placeholder="Email"
                            prefix={
                              <UserOutlined
                                style={{
                                  color: "gray",
                                }}
                              />
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col>
                        {fields.length === 1 ? null : (
                          <DeleteOutlined
                            className={classes.deleteIcon}
                            onClick={() => remove(name)}
                          />
                        )}
                      </Col>
                    </Row>
                  ))}

                  <Form.Item style={{ textAlign: "right" }}>
                    <Button onClick={() => add()} icon={<PlusOutlined />}>
                      Add Email
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item<FieldType>
              style={{ marginTop: -10 }}
              name="user_role"
              label={<div className={classes.label}>User Role</div>}
              validateFirst
              rules={[
                { required: true, message: Validations.reqd_msg("User Role") },
              ]}
            >
              <Select
                placeholder="Select Role"
                options={[
                  {
                    value: "owner",
                    label: "OWNER",
                  },
                  {
                    value: "member",
                    label: "MEMBER",
                  },
                ]}
                filterOption
                optionFilterProp="label"
                showSearch
              />
            </Form.Item>

            <Form.Item<FieldType>
              name="message"
              label={<div className={classes.label}>Message</div>}
            >
              <Input.TextArea rows={4} placeholder="Write message (If any)" />
            </Form.Item>
          </React.Fragment>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              shape="default"
              size="middle"
              type="primary"
              htmlType="submit"
              loading={sendWorkplaceInvitationLoading}
            >
              Send
            </Button>
            <div style={{ width: 10 }} />
            <Button
              shape="default"
              size="middle"
              type="default"
              onClick={() => setModalVisibility(false)}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </CustomModal>
  );
}
