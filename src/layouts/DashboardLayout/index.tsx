//@ts-nocheck
import React, { useCallback } from "react";
// import Sidebar from "./sidebar";
import { Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebarCollapsed } from "../../models/router";
import EmptyLayout from "../EmptyLayout";
import styles from "./index.module.scss";
import PerfectScrollBar from "react-perfect-scrollbar";
import Header from "./Header";
const { Content, Footer, Sider } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state?.router?.sidebarCollapsed);
  const toggleCollapsed = useCallback(() => {
    dispatch(toggleSidebarCollapsed());
  }, []);

  return (
    <EmptyLayout>
      <Layout style={{ height: "100vh", width: "100vw" }}>
        {/* <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} /> */}
        <Layout style={{ height: "100%" }}>
          <Header />

          <Content
            style={{
              height: "calc(100% - 64px)",
              padding: "24px 32px",
              backgroundColor: "#fff",
              overflow: "auto",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </EmptyLayout>
  );
}
