import React, { useCallback } from "react";
import { Tooltip } from "antd";
import { createUseStyles } from "react-jss";

import ServerPaginatedSelect from "../LazySelect/ServerPaginatedSelect";
import supabase from "../../supabase.config";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  typeIcon: {
    marginLeft: 4,
    minWidth: 20,
    width: 20,
    height: 20,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    border: "1px solid #cdcdcd",

    "& img": {
      width: "70%",
    },
  },
});

interface AutocompleteProps {
  onChangeHandler: any;
  style?: React.CSSProperties;
  defaultValue: string;
  allowClear?: false;
}

const AutoCompleteSelector: React.FC<AutocompleteProps> = ({
  onChangeHandler,
  style,
  defaultValue,
  allowClear = true,
}) => {
  const classes = useStyles();

  const fetchDefaultValue = useCallback((id: string) => {
    return new Promise((res, rej) => {
      supabase
        .from("workplaces")
        .select("*")
        .eq("id", id)
        .single()
        .throwOnError()
        .then(({ data }) => res(data))
        //@ts-ignore
        .catch(rej);
    });
  }, []);

  return (
    <ServerPaginatedSelect
      onChange={onChangeHandler}
      fetchDefaultValue={fetchDefaultValue}
      defaultValue={defaultValue || undefined}
      style={style || { width: 260 }}
      placeholder="Select Workplace"
      allowClear={allowClear}
      supabaseQuery={{
        table: "workplaces",
        query: "*",
        search: {
          field: "workplace_name",
        },
      }}
      valueResolver={(item) => item}
      renderItem={(item) => {
        return {
          node: (
            <div className={classes.container}>
              <img
                src={
                  item.workplace_logo ||
                  (item.type === "institution"
                    ? "/images/institute.png"
                    : "/images/company.png")
                }
                alt={item.workplace_name}
                className={classes.logo}
              />
              <Tooltip title={item.workplace_name}>
                <p className={classes.name}>{item.workplace_name}</p>
              </Tooltip>
              <div className={classes.typeIcon}>
                <img
                  src={
                    item.type === "institution"
                      ? "/images/institute.png"
                      : "/images/company.png"
                  }
                  alt={item.workplace_name}
                />
              </div>
            </div>
          ),
        };
      }}
    />
  );
};

export default AutoCompleteSelector;
