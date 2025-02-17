import React from "react";
import { Tabs } from "antd";

interface TabItem  {
    label: string;
    key: string;
    children: React.ReactNode; // Adjust the type based on the actual type of children
  };

interface DashboardTabsTypes {
    items: TabItem[];
    children? : React.ReactNode;
    getSelectedKey: (activeKey: string) => void
}

const DashboardTabs: React.FC<DashboardTabsTypes> = ({children , items , getSelectedKey}) => {
  return (
    <Tabs
      defaultActiveKey="Users"
      items={items}
      tabBarExtraContent={children}
      onChange={getSelectedKey}
    />
  );
};

export default DashboardTabs;
