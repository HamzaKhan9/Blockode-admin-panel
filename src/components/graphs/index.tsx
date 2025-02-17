import React from "react";
import { Spin } from "antd";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  AreaChart,
} from "recharts";

interface ChartProps {
  type: string;
  data: any;
  dataKeyForX: string;
  children: React.ReactNode;
  loading: boolean;
}

const Graphs: React.FC<ChartProps> = ({
  type,
  data,
  dataKeyForX,
  children,
  loading,
}) => {
  if (type === "line") {
    return (
      <Spin spinning={loading}>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{
              top: 5,

              bottom: 5,
            }}
          >
            <XAxis dataKey={dataKeyForX} />
            <YAxis />
            <Tooltip />
            <Legend />

            {children}
          </AreaChart>
        </ResponsiveContainer>
      </Spin>
    );
  }

  if (type === "bar") {
    return (
      <Spin spinning={data.length === 0}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyForX} />
            <YAxis />
            <Tooltip />
            <Legend />
            {children}
          </BarChart>
        </ResponsiveContainer>
      </Spin>
    );
  }
};

export default Graphs;
