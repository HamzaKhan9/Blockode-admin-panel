import { TOKEN_STORAGE_KEY, TOKEN_EXPIRY, USERNAME_KEY } from "../../apiConfig";

import supabase from "../../supabase.config";

import { message } from "antd";

const login = async (
  username: string,
  password: string
): Promise<any | undefined> => {
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });
    console.log("data: ", data);
    console.log("error: ", error);

    if (data.user && data.session) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.session.access_token);
      if (data.session.expires_at !== undefined) {
        localStorage.setItem(TOKEN_EXPIRY, data.session.expires_at?.toString());
      }

      const userString = JSON.stringify(data.user);
      localStorage.setItem(USERNAME_KEY, userString);
      message.success("Logged in successfully!");
      if (data?.user?.identities) return data?.user?.identities[0];
    } else {
      throw new Error(error?.message);
    }
  } catch (error: any) {
    if (error) {
      message.error(error?.message);
    }
  }
};

const logout = async () => {
  try {
    let { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error?.message);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USERNAME_KEY);
      localStorage.removeItem(TOKEN_EXPIRY);
    }
  } catch (error: any) {
    message.error(error?.message);
  }
};

const deactivateUser = async () => {
  try {
    await supabase.functions.invoke("deactivate-user");
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};

const Auth = {
  login,
  logout,
  deactivateUser,
};

export default Auth;
