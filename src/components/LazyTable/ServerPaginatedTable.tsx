// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { useUpdateEffect } from "../../Hooks/useUpdateEffect";
import supabase from "../../supabase.config";
import { Table, message, Space, Select } from "antd";
// import Button from "../../components/Button";
import { capitalize } from "../../utils";
import { createUseStyles } from "react-jss";
import FiltersButton from "../FilterButton";
// import { SearchOutlined } from "@ant-design/icons";
import { MyTheme } from "../../types/theme";

const useStyles = createUseStyles((theme: MyTheme) => ({
  searchWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBlock: "10px",
    gap: "20px",
  },
  searchInput: {
    // borderRadius: "30px",
    width: "250px",
    paddingInline: "20px",
  },
  searchIcon: {
    fontSize: "14px",
    opacity: "0.5",
    color: theme.colorPrimary,
  },
}));

function generateColsFromData<T>(data: T[] = []): any {
  const colKeys = new Set<keyof T>();

  for (const item of data) {
    Object.keys(item || {}).forEach((key) => colKeys.add(key as keyof T));
  }

  const cols: any = [];

  for (const key of colKeys) {
    cols.push({
      title: capitalize(key.toString()),
      dataIndex: key,
      key: key as string,
      render: (item: any) =>
        typeof item === "string" ? item : JSON.stringify(item),
    });
  }

  return cols;
}

interface supabaseQueryProps {
  table: string;
  query: string;
  searchFunction?: any;
  filters?: {
    field: string;
    operator: string;
    value: any;
  }[];
}

interface TableParams {
  pagination: {
    current: number;
    pageSize: number;
  };
  filters: any[];
  sorter: any;
}

interface ServerPaginatedTableProps {
  name: string;
  supabaseQuery: supabaseQueryProps;
  url: string;
  pageSize?: number;
  dataSource: any;
  onDocsChange?: any;
  columns?: any;
  emptyContent?: React.ReactNode;
  style?: React.CSSProperties;
  filters?: any[]; // You might want to replace 'any' with a specific type
  getHelpers?: (helpers: any) => any;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  height?: string | number;
}

export default function ServerPaginatedTable({
  name,
  supabaseQuery,
  url,
  pageSize = 10,
  dataSource,
  onDocsChange,
  columns,
  emptyContent,
  style,
  filters,
  getHelpers,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = (total, range) => `${range[0]} - ${range[1]} of ${total} items`,
  height,
  ...props
}: ServerPaginatedTableProps) {
  const classes = useStyles();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  // const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize,
    },
    filters: [],
    sorter: null,
  });
  const [total, setTotal] = useState<number>(0);

  const handleTableChange = (pagination: any, _: any, sorter: any): any => {
    setTableParams({
      ...tableParams,
      pagination: pagination || {},
      sorter: sorter || {},
    });
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const onFiltersChange = useCallback((filters: any) => {
    if (filters?.length > 0) {
      setSearch("");
    }

    setTableParams({
      ...tableParams,
      filters: filters?.filter((f: any) => f !== undefined),
    });
  }, []);

  useEffect(() => {
    if (!search) {
      fetchData();
    }
  }, [JSON.stringify(tableParams), search, total]);

  useEffect(() => {
    if (filters && filters?.length === 1) {
      fetchData();
    }
  }, [tableParams?.filters]);

  // const onSearchHandler = async () => {
  //   setSearchLoading(true);
  //   const data = await supabaseQuery.searchFunction(search);
  //   if (data?.length > 0) {
  //     setData(data);
  //     setTotal(data?.length);
  //   }
  //   setSearchLoading(false);
  // };

  // const debounce = (func: (...args: any[]) => void, delay: number) => {
  //   let timer: NodeJS.Timeout | null = null;
  //   return (...args: any[]) => {
  //     if (timer) clearTimeout(timer);

  //     timer = setTimeout(() => {
  //       func(...args);
  //     }, delay);
  //   };
  // };

  // const debouncedOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   debounce(searchHandler, 1000)(e);
  // };

  // const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearch(e.target.value);
  // };

  useUpdateEffect(() => {
    if (typeof onDocsChange === "function" && Array.isArray(data))
      onDocsChange(data);
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { pagination, sorter, filters } = tableParams;

      const { current, pageSize } = pagination;

      let query = supabase
        .from(supabaseQuery.table)
        .select(supabaseQuery.query, { count: "exact" });

      supabaseQuery.filters?.forEach(
        (filter) =>
          (query = query.filter(filter?.field, filter?.operator, filter?.value))
      );

      if (sorter?.field && sorter?.order !== undefined) {
        query.order(sorter?.field, {
          ascending: sorter?.order === "ascend" ? true : false,
        });
      } else {
        query.order("created_at", { ascending: false });
      }

      if (filters && filters?.length > 0) {
        for (const filter of filters) {
          query = query.filter(filter?.field, filter?.operator, filter?.value);
        }
      } else {
        query.range(
          current * pageSize - 1 - (pageSize - 1),
          current * pageSize - 1
        );
      }

      const { data, count, error } = await query;

      if (data && count) {
        setData(data);
        setTotal(count);
      }

      setSearch("");
      if (error) {
        message.error(error.message);
      }
    } catch (error: any) {
      message.error(error?.message);
    } finally {
      setLoading(false);
    }
  };
  // const fetchData = async () => {

  //   // const { filters, pagination } = tableParams;
  //   // const { current, pageSize } = pagination;

  //   // const query = {
  //   //   limit: pageSize,
  //   //   offset: (current - 1) * pageSize,
  //   //   ...qs.parse(url.split("?")[1]),
  //   // };
  //   // if (Array.isArray(filters))
  //   //   filters.forEach((filter) => {
  //   //     if (![null, undefined, ""].includes(filter.value))
  //   //       query[filter.key] = filter.value;
  //   //   });

  //   // api
  //   //   .get(`${url.split("?")[0]}?${qs.stringify(query)}`)
  //   //   .then(({ data }) => {
  //   //     const list = Array.isArray(data)
  //   //       ? data
  //   //       : Array.isArray(data.data)
  //   //       ? data.data
  //   //       : [];

  //   //     setData(
  //   //       list.map((item, ix) => {
  //   //         item.key = item.id ?? ix.toString();
  //   //         return item;
  //   //       })
  //   //     );

  //   //     setTotal(data.total || total);
  //   //   })
  //   //   .catch(globalErrorHandler)
  //   //   .finally(() => setLoading(false));
  // };

  useEffect(() => {
    if (typeof getHelpers === "function")
      getHelpers({
        fetchData,
        setData,
        setLoading,
        setTableParams,
        setTotal,
      });
  }, [fetchData, setData, setLoading, setTableParams, setTotal]);

  const onSelectAdmin = (filter: {
    field: string;
    operator: string;
    value: string;
  }) => {
    setTableParams((prevState) => ({ ...prevState, filters: [{ ...filter }] }));
  };

  const visibleFilters = filters?.filter((f) => !f?.hidden);

  return (
    <div>
      <div className={classes.searchWrapper}>
        <Space direction="horizontal">
          {visibleFilters?.length &&
            (visibleFilters?.length > 1 ? (
              <FiltersButton
                filters={visibleFilters}
                onFiltersChange={onFiltersChange}
                isSearch={!!search}
              />
            ) : (
              <Select
                onFocus={() => {
                  setSearch("");
                }}
                allowClear
                placeholder="USER / ADMIN"
                style={{
                  width: "150px",
                }}
                bordered={false}
                onChange={(value) => {
                  if (value !== undefined) {
                    const adminValue = {
                      field: visibleFilters[0].key,
                      operator: "eq",
                      value,
                    };
                    onSelectAdmin(adminValue);
                  } else if (value === undefined) {
                    setTableParams((prevState) => ({
                      ...prevState,
                      filters: [],
                    }));
                  }

                  setSelectedFilterValue(value);
                }}
                value={selectedFilterValue}
                options={visibleFilters[0]?.options}
              />
            ))}
        </Space>
        {/* <Space direction="horizontal">
          <Input
            placeholder={`Search ${name}`}
            size="middle"
            // onFocus={() => {
            //   setSelectedFilterValue(undefined);
            //   setTableParams((prevState) => ({
            //     ...prevState,
            //     filters: [],
            //   }));
            // }}
            className={classes.searchInput}
            onChange={searchHandler}
            value={search}
            onPressEnter={onSearchHandler}
            allowClear
            prefix={<SearchOutlined className={classes.searchIcon} />}
          />
          <Button
            type="default"
            size="middle"
            shape="default"
            loading={searchLoading}
            onClick={onSearchHandler}
          >
            Search
          </Button>
        </Space> */}
      </div>
      <Table
        size="middle"
        scroll={{ x: "max-content", y: height }}
        onChange={handleTableChange}
        dataSource={typeof dataSource === "function" ? dataSource(data) : data}
        loading={loading}
        columns={Array.isArray(columns) ? columns : generateColsFromData(data)}
        style={style}
        pagination={{
          total,
          ...tableParams.pagination,
          showSizeChanger,
          showQuickJumper,
          showTotal,
          responsive: true,
          position: ["bottomRight"],
        }}
        rowKey="id"
        {...props}
      />
    </div>
  );
}
