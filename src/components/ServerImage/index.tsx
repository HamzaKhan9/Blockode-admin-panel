import { EyeOutlined } from "@ant-design/icons";
import { Image, Spin, Skeleton } from "antd";
import React, { useCallback, useState } from "react";
import { placeholderImg } from "../../utils";
import Hover from "../Hover";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  img: {
    height: "100% !important",
    objectFit: "cover !important",
    borderRadius: "inherit !important",
  },
});

interface LoaderProps {
  type: "skeleton" | "spin";
  shape: "circle" | "square";
}

interface ServerImgProps {
  loader?: LoaderProps;
  defaultWidth?: number;
  defaultHeight?: number;
  fallback?: string;
  id?: string;
  preview?: boolean;
  src?: string;
  style?: React.CSSProperties;
}

export default function ServerImg({
  loader = { type: "skeleton", shape: "square" },
  defaultWidth = 400,
  defaultHeight = 250,
  fallback = placeholderImg,
  ...props
}: ServerImgProps) {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);
  const [id] = useState(props.id);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const onHover = useCallback((val: boolean) => setHover(val), []);

  const onClick = useCallback(() => {
    const elem = document.getElementById(id || "");
    elem && elem.click();
  }, [id]);

  return (
    <>
      {loading ? (
        loader.type === "skeleton" ? (
          <Skeleton.Avatar active size="small" shape={loader.shape} />
        ) : (
          <div
            className={"grid-center"}
            style={{
              width: props.style?.width || defaultWidth,
              height: props.style?.height || defaultHeight,
              borderRadius: loader.shape === "circle" ? "50%" : 0,
              backgroundColor: "rgba(0,0,0,0.03)",
            }}
          >
            <Spin size="small" />
          </div>
        )
      ) : null}
      <div
        style={{
          position: "relative",
          display: loading ? "none" : undefined,
          cursor: "pointer",
        }}
      >
        <Image
          {...props}
          src={props?.src || fallback}
          id={id}
          style={props?.style || {}}
          fallback={fallback}
          width={props.style?.width}
          height={props.style?.height}
          onError={onLoad}
          onLoad={onLoad}
          className={classes.img}
        />
        {props.preview ? (
          <Hover onHover={onHover}>
            <div
              onClick={onClick}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                opacity: hover ? 1 : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                transition: "opacity 0.4s",
              }}
            >
              <EyeOutlined />
              <span style={{ marginLeft: 3 }}>Preview</span>
            </div>
          </Hover>
        ) : null}
      </div>
    </>
  );
}
