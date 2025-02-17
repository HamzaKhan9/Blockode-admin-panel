//@ts-nocheck
import React, { useCallback, useEffect, useMemo } from "react";
import PerfectScrollBar from "react-perfect-scrollbar";
import { Skeleton, Table } from "antd";
import debounce from "lodash.debounce";
import styles from "./index.module.scss";

interface LazyTableProps {
  style?: React.CSSProperties;
  dataSource: any[];
  columns: any[];
  containerStyle?: React.CSSProperties;
  onEndReached?: (percent: number) => void;
  debouncing?: number;
  loading: boolean;
  skeletonProps: any;
  sekeletonContainerStyle: React.CSSProperties;
  skeletonEntriesCount?: number;
  endReachedPercent: number;
  scrollWithPage: boolean;
}

const LazyTable: React.FC<LazyTableProps> = ({
  style,
  dataSource,
  columns,
  containerStyle,
  onEndReached,
  debouncing = 800,
  loading,
  skeletonProps,
  sekeletonContainerStyle,
  skeletonEntriesCount = 4,
  endReachedPercent = 80,
  scrollWithPage = false,
  ...props
}) => {
  const _onEndReached = useCallback(
    debounce(onEndReached || (() => {}), debouncing, {
      leading: true,
      trailing: false,
    }),
    [onEndReached, debouncing]
  );

  function _onScrollEndReached(event) {
    let maxScroll = event.target.scrollHeight - event.target.clientHeight;
    let currentScroll = event.target.scrollTop;
    if (currentScroll === maxScroll) {
      const currentPercent = (currentScroll / maxScroll) * 100;
      _onEndReached(currentPercent);
    }
  }

  const onScrollDown = useCallback(
    (e) => {
      const clientHeight = e.target.clientHeight;

      const currentScroll = e.target.scrollTop;
      const maxScroll = e.target.scrollHeight - clientHeight;
      const currentPercent = (currentScroll / maxScroll) * 100;

      if (currentPercent > endReachedPercent) _onEndReached(currentPercent);
    },
    [endReachedPercent, _onEndReached]
  );

  useEffect(() => {
    if (scrollWithPage) {
      const content = document.getElementById("dashboard-content");
      content.addEventListener("scroll", onScrollDown);
      return () => {
        content.removeEventListener("scroll", onScrollDown);
      };
    }
  }, [onScrollDown, scrollWithPage]);

  useMemo(
    () =>
      columns.forEach((col) => {
        const render = col.render;
        col.render = (...args) => (
          <div style={sekeletonContainerStyle}>
            <Skeleton
              className={styles.skeleton}
              title={false}
              paragraph={{ rows: 1 }}
              active
              {...skeletonProps}
              loading={args[1]?._loading}
            >
              {typeof render === "function" && !args[1]?._loading
                ? render(...args)
                : args[1]?.[col?.dataIndex || ""]}
            </Skeleton>
          </div>
        );
      }),
    [columns]
  );

  const children = (
    <div
      style={{
        marginRight: scrollWithPage ? 0 : "0.5rem",
        height: "100%",
        ...(scrollWithPage ? containerStyle || {} : {}),
      }}
    >
      <Table
        pagination={false}
        sticky={!scrollWithPage}
        {...props}
        style={{ width: "100%", overflowX: "auto", ...(style || {}) }}
        columns={columns}
        dataSource={
          loading
            ? dataSource.concat(
                ...Array(skeletonEntriesCount)
                  .fill(true)
                  .map((_, ix) => ({ _loading: true, key: ix + "" }))
              )
            : dataSource
        }
      />
    </div>
  );

  if (scrollWithPage) return children;

  return (
    <PerfectScrollBar style={containerStyle} onScroll={onScrollDown}>
      {children}
    </PerfectScrollBar>
  );
};

export default LazyTable;
