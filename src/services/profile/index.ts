import { message } from "antd";
import supabase from "../../supabase.config";

const updateUserProfile = async (values: any, file: any) => {
  const user = JSON.parse(localStorage.getItem("curr_username") || "");

  //upload profile Image in supabase
  if (file !== null) {
    const { data: key } = await supabase.storage
      .from("default")
      .upload(`${user?.id}/${file?.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (key) {
      const { data } = supabase.storage.from("default").getPublicUrl(key.path);
      if (data) {
        values.profile_photo = data?.publicUrl;
      }
    }
  } else if (
    file === null &&
    values?.profile_photo !== undefined &&
    values?.profile_photo !== null
  ) {
    // delete profile Image in supabase

    const path = values?.profile_photo?.split("default/");
    const { data } = await supabase.storage
      .from("default")
      .remove([`${path[1]}`]);

    if (data) {
      values.profile_photo = null;
    }
  }

  const { data } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", user?.id)
    .select()
    .single();
  return data;
};

const getUserProfile = async (id: string) => {
  const { data } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("id", id)
    .single();
  return data;
};

const searchUser = async (keyword: string) => {
  try {
    //@ts-ignore
    const { data, error } = await supabase.rpc("search_user", {
      keyword: keyword.trim(),
    });
    if (error) {
      throw new Error(error?.message);
    }

    if (!(data as any)?.length) {
      throw new Error(`"${keyword}" not Found...`);
    }
    if ((data as any).length > 0) {
      return data;
    }
  } catch (error: any) {
    message.error(error?.message);
  }
};

const UserProfile = {
  updateUserProfile,
  getUserProfile,
  searchUser,
};

export default UserProfile;
