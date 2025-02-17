// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import LazySelect from ".";
import debounce from "lodash.debounce";
import { useStateCallback } from "../../Hooks/useStateCallback";
import { globalErrorHandler } from "../../utils/errorHandler";
import supabase from "../../supabase.config";
import { Select } from "antd";
import { uniq, uniqBy } from "lodash";
import { useDeepCompareEffect } from "../../Hooks/useDeepCompareEffect";
import { useAppDispatch } from "../../store";
import { setTimeRange } from "../../models/dasboard";

interface SupabaseQuery {
  table: string;
  query: string;
  search?: {
    field: string;
    value?: string;
  };
  filters?: {
    field: string;
    operator: string;
    value: any;
  }[];
  sorter?: {
    field: string;
    order: "ascend" | "descend";
  };
  pagination?: {
    current: number;
    pageSize: number;
  };
}

function supabaseQueryBuilder({
  table,
  query,
  search,
  filters,
  sorter,
  pagination,
}: SupabaseQuery) {
  let q = supabase.from(table).select(query);

  filters?.forEach(
    (filter) => (q = q.filter(filter.field, filter.operator, filter.value))
  );

  if (search?.value) {
    const terms = uniq([search.value, ...search.value.split(" ")]);
    const orQuery = terms.map((t) => `${search.field}.ilike.%${t}%`).join(",");
    q = q.or(orQuery);
  }

  if (sorter?.order) {
    q.order(sorter.field, {
      ascending: sorter.order === "ascend" ? true : false,
    });
  }

  if (pagination?.pageSize && !search?.value) {
    q.range(
      pagination.current * pagination.pageSize - 1 - (pagination.pageSize - 1),
      pagination.current * pagination.pageSize - 1
    );
  }
  return q;
}

type ServerPaginatedSelectProps = React.ComponentProps<typeof Select> & {
  url?: string;
  pageSize?: number;
  renderItem: (item: any) => { node: React.ReactNode; disabled?: boolean };
  valueResolver: (item: any) => string;
  style?: React.CSSProperties;
  onChange?: (value: any, option: any) => void;
  value?: any;
  dataSource?: (data: any[]) => any[];
  searchDebouncing?: number;
  supabaseQuery: SupabaseQuery;
  fetchDefaultValue?: (val: any) => Promise<any>;
};

export default function ServerPaginatedSelect({
  url,
  pageSize = 20,
  renderItem,
  valueResolver,
  style,
  onChange,
  value,
  dataSource,
  searchDebouncing = 500,
  supabaseQuery,
  fetchDefaultValue,

  ...props
}: ServerPaginatedSelectProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [noMore, setNoMore] = useStateCallback(false);
  const [currPage, setCurrPage] = useState(1);
  const [opened, setOpened] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const _fetchData = useRef<Function>(() => {});

  const fetchData = () => {
    if (noMore) return;

    setLoading(true);
    supabaseQueryBuilder({
      ...supabaseQuery,
      search: { value: searchTerm, field: supabaseQuery.search?.field || "" },
      pagination: { current: currPage, pageSize },
    })
      .throwOnError()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];

        if (list.length < pageSize) setNoMore(true);
        setCurrPage((prev) => prev + 1);

        setData((prev) => uniqBy(prev.concat(list), "id") as any[]);
      })
      //@ts-ignore
      .catch(globalErrorHandler)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    _fetchData.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    if (!opened) return;
    setData([]);
    setCurrPage(1);
    setNoMore(false, () => setTimeout(() => _fetchData.current(), 100));
  }, [opened]);

  const search = useCallback(
    debounce(() => {
      if (!opened) return;
      setData([]);
      setCurrPage(1);
      setNoMore(false, () => setTimeout(() => _fetchData.current(), 100));
    }, searchDebouncing),
    [searchDebouncing, opened]
  );

  const refetch = () => {
    dispatch(setTimeRange(0));
  };

  const onSearch = useCallback(
    (value: string) => {
      if (value.length > 0 && value.length < 3) return;
      setSearchTerm(value);
      search();
    },
    [search]
  );

  useDeepCompareEffect(() => {
    const val = props?.defaultValue;

    if (
      val &&
      !data.find((item) => valueResolver(item) === val) &&
      fetchDefaultValue
    ) {
      fetchDefaultValue(val)
        .then((item) =>
          setData((prev) => uniqBy(prev.concat(item), "id") as any[])
        )
        .catch(globalErrorHandler);
    }
  }, [props?.defaultValue]);

  const _data = dataSource ? dataSource(data) : data;

  return (
    //@ts-ignore
    <LazySelect
      onChange={(value: any) => {
        onChange?.(
          value,
          _data.find((item) => valueResolver(item) === value)
        );

        refetch();
      }}
      onEndReached={() => {
        _fetchData.current();
      }}
      loading={loading}
      dataSource={_data}
      renderItem={renderItem}
      valueResolver={valueResolver}
      style={style}
      skeletonEntriesCount={3}
      onDropdownVisibleChange={(open: boolean) => setOpened(open)}
      showSearch
      allowClear
      filterOption={false}
      onSearch={onSearch}
      value={value}
      {...props}
    />
  );
}
