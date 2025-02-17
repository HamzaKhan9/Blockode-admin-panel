import { useState, useEffect } from "react";
import { Form, Input, Select, Switch } from "antd";
import { useForm } from "antd/lib/form/Form";
import moment from "moment";
import Button from "../Button";
import { FilterOutlined } from "@ant-design/icons";
import CustomModal from "../CustomModal";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  customSwitch: {
    // "&.ant-switch-checked": {
    //   backgroundColor: "#1890ff",
    // },
    antSwitchDisabled: {
      backgroundColor: "red",
      "&.ant-switch-disabled": {
        backgroundColor: "red !important",
      },
    },
  },
});

interface FilterConfig {
  label: string;
  key: string;
  type:
    | "select"
    | "server-select"
    | "date-range"
    | "boolean"
    | "search"
    | "switch";
  filterProps: object;
  fieldTypes?: "number" | "string" | "date";
  options?: { label: string; value: string }[];
}

interface RenderFilterProps {
  filter: FilterConfig;
  value: any;
  onChange: (value: any) => void;
}

function RenderFilter({ filter, value, onChange }: RenderFilterProps) {
  const classes = useStyles();
  switch (filter.type) {
    case "select":
      return (
        <Select
          {...filter.filterProps}
          allowClear
          value={value}
          options={filter.options}
          onChange={(value) => {
            onChange({ field: filter.key, operator: "eq", value });
          }}
        />
      );

    case "boolean":
      return (
        <Select
          {...filter.filterProps}
          options={[
            { label: "TRUE", value: true },
            { label: "FALSE", value: false },
          ]}
          allowClear
          onChange={(value) => {
            onChange({ type: "boolean", value });
          }}
          value={value}
        />
      );

    case "switch":
      return (
        <Switch
          className={classes.customSwitch}
          unCheckedChildren={true}
          checkedChildren={false}
          defaultChecked={false}
          onChange={(value) => {
            onChange({ type: "switch", value });
          }}
        />
      );

    default:
      return <Input {...filter.filterProps} allowClear value={value} />;
  }
}

interface FiltersButtonProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
  isSearch: boolean;
  active?: boolean;
}

function FiltersButton({
  filters,
  onFiltersChange,
  isSearch,
}: FiltersButtonProps) {
  const [open, setOpen] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    if (isSearch) {
      form.resetFields();
    }
  }, [isSearch]);

  const onFinish = (values: any) => {
    const allFilters = filters.map((filter) => {
      if (values[filter.key] !== undefined) {
        let val = values[filter.key];

        if (moment.isMoment(val)) {
          val = val.toISOString();
        }

        return val;
      }
    });

    onFiltersChange(allFilters);
    setOpen(false);
  };

  return (
    <div>
      <Button type="default" onClick={() => setOpen(true)}>
        <FilterOutlined />
      </Button>

      <CustomModal
        open={open}
        destroyOnClose
        onCancel={() => setOpen(false)}
        title="Filters"
        okText="Apply"
        onOk={() => {
          form.submit();
        }}
        cancelText="Reset"
        cancelButtonProps={{
          onClick: () => {
            form.resetFields();
            form.submit();
          },
        }}
      >
        <Form onFinish={onFinish} form={form} layout="vertical">
          {filters.map((filter) => (
            <Form.Item key={filter.key} name={filter.key} label={filter.label}>
              <RenderFilter
                filter={filter}
                value={form.getFieldValue(filter.key)}
                onChange={(value) => {
                  form.setFieldsValue({ [filter.key]: value });
                }}
              />
            </Form.Item>
          ))}
        </Form>
      </CustomModal>
    </div>
  );
}

export default FiltersButton;
