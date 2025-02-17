import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

interface BooleanIndicatorProps {
  isTrue: string | boolean;
}

function BooleanIndicator({ isTrue }: BooleanIndicatorProps) {
  const color = "Red";

  return !!isTrue ? (
    <CheckCircleTwoTone style={{ fontSize: "1.3rem" }} twoToneColor={color} />
  ) : (
    <CloseCircleTwoTone style={{ fontSize: "1.3rem" }} twoToneColor={color} />
  );
}

export default BooleanIndicator;
