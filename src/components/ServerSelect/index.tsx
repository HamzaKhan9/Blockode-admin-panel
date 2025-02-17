import type { SelectProps } from "antd";
import { Select, Space, Form } from "antd";
// import { useState } from "react";

interface SelectLocalProps {
  options: any;
  single?: boolean;
  value?: any;
  onChange?: any;
  name: string;
  form: any;
  selectLabel: string;
}

const ServerSelect: React.FC<SelectLocalProps> = ({
  options,
  single = true,
  value,
  //   onChange,
  name,
  form,
  selectLabel,
}) => {
  const selectProps: SelectProps = {
    style: { width: "100%" },
    value,
    options,
    onChange: (newValue: string[]) => {
      form.setFieldsValue({
        [name]: newValue,
      });
    },
    placeholder: `Select ${selectLabel}...`,
    maxTagCount: "responsive",
    mode: single ? undefined : "multiple", // Set mode to "multiple" if single is false
    allowClear: true,
    filterOption: true,
    optionFilterProp: "label",
    showSearch: true,
  };

  return (
    <Form.Item name={name}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select {...selectProps} />
      </Space>
    </Form.Item>
  );
};

export default ServerSelect;
