//@ts-nocheck
import React, { useCallback, useState, ReactNode, ReactElement } from "react";

interface HoverProps {
  element?: string | ReactElement;
  style?: React.CSSProperties;
  hoverStyle?: React.CSSProperties;
  children?: ReactNode;
  onHover?: (isHovered: boolean) => void;
}

export default function Hover({
  element,
  style,
  hoverStyle,
  children,
  onHover,
}: HoverProps): ReactElement {
  const [appliedStyle, setAppliedStyle] = useState<
    React.CSSProperties | undefined
  >(style);

  const onMouseOver = useCallback(() => {
    setAppliedStyle({ ...style, ...hoverStyle });
    typeof onHover === "function" && onHover(true);
  }, [style, hoverStyle, onHover]);

  const onMouseOut = useCallback(() => {
    setAppliedStyle(style);
    typeof onHover === "function" && onHover(false);
  }, [style, onHover]);

  const args: [
    string | ReactElement,
    {
      style?: React.CSSProperties;
      onMouseOver: () => void;
      onMouseOut: () => void;
    },
    ReactNode?
  ] = [
    element || children,
    {
      style: {
        ...(element && typeof element !== "string"
          ? element.props?.style
          : children && typeof children !== "string"
          ? children.props?.style
          : {}),
        ...appliedStyle,
      },
      onMouseOver,
      onMouseOut,
    },
    element
      ? children
      : children && typeof children !== "string"
      ? children.props?.children
      : undefined,
  ];

  return typeof element === "string"
    ? React.createElement(...args)
    : React.cloneElement(...args);
}
