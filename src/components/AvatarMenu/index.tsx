import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import avatar from "../../assets/images/user.svg";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";

interface AvatarMenuProps {
  displayName: string | undefined;
}

function AvatarMenu({ displayName }: AvatarMenuProps) {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.profile.user);
  const items: MenuProps["items"] = [
    {
      label: displayName,
      key: "email",
    },
    {
      label: "Profile",
      key: "profile",
      onClick: () => {
        navigate("/profile");
      },
    },
  ];
  return (
    <Dropdown menu={{ items }}>
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <Avatar
          size="small"
          shape="circle"
          src={user?.profile_photo || avatar}
        />
        <CaretDownOutlined style={{ marginLeft: 2 }} />
      </div>
    </Dropdown>
  );
}

export default AvatarMenu;
