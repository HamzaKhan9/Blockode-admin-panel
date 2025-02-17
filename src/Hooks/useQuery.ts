import { ParsedUrlQuery, parse, stringify } from "querystring";
import { NavigateFunction, useNavigate } from "react-router-dom";

type Method = "push" | "replace";

function getUpdateQuery(navigate: NavigateFunction, method: Method) {
  return (queryObj: ParsedUrlQuery) => {
    const query = parse(window.location.search.replace("?", ""));
    const newQuery = {
      ...query,
      ...queryObj,
    };
    //delete keys with undefined values
    Object.keys(newQuery).forEach((key) => {
      if (newQuery[key] === undefined) {
        delete newQuery[key];
      }
    });

    navigate(`${window.location.pathname}?${stringify(newQuery)}`, {
      replace: method === "replace",
    });
  };
}

export function useQuery(
  method: Method = "push"
): [ParsedUrlQuery, (query: ParsedUrlQuery) => void] {
  const query = parse(window.location.search.replace("?", ""));
  const navigate = useNavigate();

  return [query, getUpdateQuery(navigate, method)];
}

export function useQueryParam(
  paramName: string,
  defaultValue?: string,
  method?: Method
): [string, (val: string | undefined) => void] {
  const [query, updateQuery] = useQuery(method);
  const value = (query as Record<string, any>)[paramName] || defaultValue;

  const setValue = (val: string | undefined) => {
    updateQuery({ [paramName]: val });
  };

  return [value, setValue];
}
