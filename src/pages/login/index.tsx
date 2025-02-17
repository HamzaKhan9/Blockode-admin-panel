//@ts-nocheck
import React from "react";
import { useState } from "react";
import { Checkbox, Form, Input, message } from "antd";
import { createUseStyles } from "react-jss";
import Button from "../../components/Button";
import { useDispatch } from "react-redux";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Auth } from "@supabase/auth-ui-react";
import { useNavigate } from "react-router-dom";
import supabase, { ENV } from "../../supabase.config";
import { setAccountId, setRole, unsetAccountId } from "../../models/auth";
import { DashboardFilled, GoogleOutlined } from "@ant-design/icons";
import { useQueryParam } from "../../Hooks/useQuery";

type FieldType = {
  username?: string;
  password?: string;
};

const useStyles = createUseStyles({
  loginWrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",

    "& form": {
      border: "1px solid #ffffff",
      padding: "20px",
      background: "#ffffff",
    },
  },
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const navigate = useNavigate();
  const [gotoQuery] = useQueryParam("goto", undefined, "replace");

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // const { data, error } = await supabase.functions.invoke(
      //   "check-is-admin",
      //   {
      //     body: JSON.stringify({ email: values.username }),
      //   }
      // );

      // if (!data?.result)
      //   throw { message: "You must have admin access to login" };
      // dispatch(setRole(data?.result));
      // if (data?.result === "super-admin") {
      //   dispatch(unsetAccountId());
      // }

      const userData = await Auth.login(values.username, values.password);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (values: any) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          ENV === "dev"
            ? location.origin
            : "https://lca-admin-panel.vercel.app/",
        queryParams: {
          prompt: "consent",
        },
      },
    });
    if (error) return message.error(error?.message);
  };

  return (
    <div className={classes.loginWrapper}>
      <div>
        <h1>Login </h1>
      </div>
      {/* <Form
        name="basic"
        style={{ maxWidth: 400, width: 400 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          // label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input
            size="large"
            placeholder="username"
            style={{ width: "100%", maxWidth: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType>
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            size="large"
            placeholder="password"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" fullWidth loading={loading}>
            Submit
          </Button>
        </Form.Item>
        <div className="login_or">or</div>
        <Button
          icon={<GoogleOutlined size={20} />}
          fullWidth
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>
      </Form> */}
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "rgb(219, 169, 61)",
                brandAccent: "rgb(255, 198, 75)",
              },
            },
          },
        }}
        theme={"default"}
        providers={[]}
        queryParams={{
          signup_intent: "login",
          forgot_password_intent: "login",
          prompt: "consent",
        }}
        redirectTo={
          gotoQuery
            ? `${window.location.origin}${gotoQuery}`
            : `${window.location.origin}`
        }
      />
    </div>
  );
};

export default Login;
