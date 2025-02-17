import { PlusOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Input, Tag } from "antd";
import { useState, useRef, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { MyTheme } from "../../types/theme";

import Spiner from "../Spin";
interface Tags {
  id: string;
  name: string;
}
const useStyles = createUseStyles((theme: MyTheme) => ({
  tagPlusStyle: {
    cursor: "pointer",
    border: `1px solid ${theme.colorPrimary} `,
    padding: "10px",
    color: theme.colorPrimary,
    fontSize: "16px",
    fontWeight: "600",
    position: "relative",
  },
  tagsParent: {
    padding: "10px",
    border: `1px solid ${theme.colorPrimary} `,
    fontSize: "16px",
    fontWeight: "600",
    color: theme.colorPrimary,
    "& svg": {
      color: theme.colorPrimary,
    },
  },
  tags: {
    display: "flex",
    marginBlock: "8px",
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "grid",
    placeItems: "center",
  },
}));

type TagsInputProps = {
  tagsData: any;
  name: string;
  setTagsData: (tag: any) => any;
  handleInsert: (category: string) => void;
  handleDelete: (id: number) => void;
  loading: boolean;
};
const TagsInput: React.FC<TagsInputProps> = ({
  tagsData,
  name,
  setTagsData,
  handleInsert,
  handleDelete,
  loading,
}) => {
  const classes = useStyles();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"Inserting" | "Deleting">("Inserting");
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = async (removedTag: Tags) => {
    setStatus("Deleting");
    handleDelete(Number(removedTag.id));
    const newTags = tagsData?.filter((tag: any) => tag.id !== removedTag.id);
    if (newTags) {
      setTagsData(newTags);
    }
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    //
  };

  const handleInputConfirm = () => {
    setStatus("Inserting");
    if (inputValue) {
      handleInsert(inputValue);
      setInputVisible(false);
      setInputValue("");
    }
  };

  const forMap = (tag: Tags) => {
    const tagElem = (
      <Tag
        className={classes.tagsParent}
        closable
        onClose={(e) => {
          e.preventDefault();
          handleClose(tag);
        }}
      >
        <span>{tag.name}</span>
      </Tag>
    );
    return (
      <span key={tag.id} className={classes.tags}>
        {tagElem}
      </span>
    );
  };

  const tagChild = tagsData?.map(forMap);

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          overflow: "auto",
          maxHeight: "400px",
        }}
      >
        {tagChild}
      </div>
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="large"
          style={{ width: 78 }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : loading ? (
        <Spiner status={status} />
      ) : (
        <Tag onClick={showInput} className={classes.tagPlusStyle}>
          <PlusOutlined /> New {name ? name : null}
        </Tag>
      )}
    </>
  );
};

export default TagsInput;
