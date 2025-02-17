//@ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import { List } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import ServerImage from "../ServerImage";
import Hover from "../Hover";
// import { openFile } from "../RootWrapper";
import { arrayExtend, placeholderImg } from "../../utils";

interface ImagePickerProps {
  count: number;
  width?: number;
  height?: number;
  gutter?: number;
  listProps?: any; // You can replace 'any' with specific types if available
  imgProps?: any; // You can replace 'any' with specific types if available
  onChange?: (images: File[]) => void;
  value: File[] | null;
  editable?: boolean;
}

function isValid(img: File | {}): boolean {
  return (img as File)?.type?.startsWith("image/") || false;
}

export default function ImagePicker({
  count,
  width = 120,
  height = 100,
  gutter = 16,
  listProps = {},
  imgProps = {},
  onChange,
  value,
  editable = true,
}: ImagePickerProps) {
  const [images, setImages] = useState<File[]>(
    value ? arrayExtend(value, count) : Array(count).fill({})
  );

  function openFile({
    accept,
    multiple = true,
    onChange,
  }: {
    accept?: string;
    multiple?: boolean;
    onChange?: (files: File[]) => void;
  }): void {
    const ip = document.getElementById("global_file_input") as HTMLInputElement;

    if (accept) ip.setAttribute("accept", accept);
    if (multiple) ip.setAttribute("multiple", "multiple");

    if (onChange) {
      ip.onchange = (e) => {
        const files: File[] = [];
        for (const file of e.target?.files || []) {
          files.push(file);
        }
        if (typeof onChange === "function" && files.length) {
          onChange(files);
        }
      };
    }

    ip.click();
  }
  useEffect(() => {
    onChange && onChange(images.filter(isValid));
  }, [images]);

  useEffect(() => {
    if (
      Array.isArray(value) &&
      JSON.stringify(arrayExtend(value, count)) !== JSON.stringify(images)
    )
      setImages(arrayExtend(value, count));
  }, [value]);

  const fillImagesArr = useCallback(
    (files: File[], start: number) => {
      const newImages = [...images];
      let count = 0,
        i = 0;
      while (count < newImages.length && i < files.length) {
        const ix = (start + count) % newImages.length;
        if (!isValid(newImages[ix])) {
          newImages[ix] = files[i];
          newImages[ix].src = URL.createObjectURL(files[i]);
          i++;
        }
        count++;
      }
      setImages(newImages);
    },
    [images]
  );

  const onClose = useCallback(
    (i: number) => {
      const newImages = images.map((img, ix) => (ix === i ? {} : img));
      setImages(newImages);
    },
    [images]
  );

  return (
    <List
      grid={{ count, gutter }}
      style={{
        width: count * width + (count - 1) * gutter,
      }}
      dataSource={images}
      renderItem={(img, i) => {
        const isImageValid = isValid(img);
        return (
          <List.Item
            style={{
              cursor: "pointer",
            }}
            onClick={() =>
              !isImageValid &&
              editable &&
              openFile({ onChange: (files: File[]) => fillImagesArr(files, i) })
            }
          >
            <ServerImage
              style={{
                border: isImageValid ? "none" : "1px solid #99999933",
                objectFit: "cover",
                width,
                height,
              }}
              loader={{ type: "spin", shape: "square" }}
              src={isImageValid ? (img as File).src : placeholderImg}
              {...imgProps}
              preview={isImageValid ? true : false}
            />
            {isImageValid && editable && (
              <Hover hoverStyle={{ transform: `scale(1.15, 1.15)` }}>
                <CloseCircleFilled
                  title={"remove"}
                  onClick={() => onClose(i)}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: 0,
                    fontSize: 16,
                    color: "#EC4949",
                    transition: "transform 0.4s",
                  }}
                />
              </Hover>
            )}
          </List.Item>
        );
      }}
      {...listProps}
    />
  );
}
