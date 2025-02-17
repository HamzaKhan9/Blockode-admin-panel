import { useDispatch } from "react-redux";
import Button from "../../components/Button";

import { unsetAccountId, unsetUid } from "../../models/auth";
import { removeWorkplace } from "../../models/workplaces";
import Auth from "../../services/auth";
import { useNavigate } from "react-router-dom";

function NoAccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    dispatch(unsetUid());
    dispatch(unsetAccountId());
    dispatch(removeWorkplace());
    await Auth.logout();
    navigate("/login");
  };
  return (
    <div className="lock-wrapper">
      <div className="lock-parent">
        <div className="lock-container">
          <div className="lock"></div>
        </div>
        <div className="lock-message">
          <h1>Access to the admin panel is restricted</h1>
          <p>
            Please make sure you have <b>super admin</b> or <b>company admin</b>{" "}
            access to continue
          </p>
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

export default NoAccess;
