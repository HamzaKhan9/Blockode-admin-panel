import React, { useEffect, useState } from "react";
import { UpdateUserRole } from ".";
import Users from "../../services/users/index";

type RoleColumnProps = {
  data: any;
};

const RoleColumn = React.memo(
  ({ data }: RoleColumnProps) => {
    const [userRole, setUserRole] = useState<any>(null);

    const account =
      data?.employment_status === "Employed Adult 18+"
        ? data?.workplace_ref
        : data?.institution_ref;

    const callGetAccountUsers = async () => {
      const _data = await Users.getAccountUser(data?.id, account?.id);

      const role =
        _data?.length && _data?.every((doc) => doc?.account_role === "owner")
          ? "owner"
          : "member";

      setUserRole(role);
    };

    useEffect(() => {
      callGetAccountUsers();
    }, [data]);

    return (
      <>
        {data?.user_role === "admin" ? (
          <p>ADMIN</p>
        ) : (
          <UpdateUserRole
            id={data.id}
            defaultValue={userRole}
            accountId={account?.id}
            isDeleted={data?.is_deleted}
          />
        )}
      </>
    );
  },
  () => true
);

export default RoleColumn;
