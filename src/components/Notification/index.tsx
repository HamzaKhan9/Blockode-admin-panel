import React from "react";
import { Badge, List, Popover } from "antd";
import { BellOutlined } from "@ant-design/icons";

interface NotificationProps {
  count: number | null;
}

const Notification: React.FC<NotificationProps> = ({ count }) => {
  const title: string = "Notification";
  return (
    <div style={{ marginRight: 20, display: "flex" }}>
      <Popover
        title={title}
        content={
          <List
            style={{ height: "60vh", width: 300, overflow: "auto" }}
            itemLayout="horizontal"
            dataSource={Array.from({ length: count! }, (_, index) => ({
              title: `New notification Title ${index + 1}`,
            }))}
            renderItem={(item) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={<a href="/">{item.title}</a>}
                    description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                  />
                </List.Item>
              );
            }}
          />
        }
        trigger={["click"]}
      >
        <Badge count={count}>
          <BellOutlined
            title="Notification"
            style={{ fontSize: 20, cursor: "pointer" }}
          />
        </Badge>
      </Popover>
    </div>
  );
};

export default Notification;
