import supabase from "../../supabase.config";
import { message } from "antd";
import { AlgoliaUser } from "../../types/common";
import { Algolia } from "../../utils/algolia";

const createUser = async (user: any) => {
  try {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: JSON.stringify(user),
    });
    if (error) {
      throw new Error(error?.message);
    }
    if (data) {
      return data;
    }
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};

const updateUser = async (user: any) => {
  try {
    const { data, error } = await supabase.functions.invoke("edit-user", {
      body: JSON.stringify(user),
    });

    if (error) {
      throw new Error(error?.message);
    }
    if (data) {
      return data;
    }
  } catch (error: any) {
    message.error(error?.message);
  }
};

const deleteUser = async (id: any) => {
  try {
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: JSON.stringify(id),
    });
    if (error) {
      throw new Error(error?.message);
    }

    if (data.message) {
      message.success(data.message);
    }
    if (data.error) {
      return message.error(data?.error?.message);
    }
  } catch (error: any) {
    if (error.message) {
      message.error(error.message);
    }
  }
};

const updateUserAccount = async (
  user_id: string,
  company_id: string,
  key: string
) => {
  const query = supabase
    .from("profiles")
    .update({ [key]: company_id })
    .eq("id", user_id)
    .select();

  const { data } = await query;
  return data;
};

const getAccountUser = async (profileId: string, account_id: string) => {
  const query = supabase
    .from("account_user")
    .select("*")
    .eq("user_id", profileId)
    .eq("account_id", account_id);
  const { data } = await query;

  return data;
};
const getUserProfiles = async (
  page: number = 0,
  pageSize: number = 20,
  filter: { workplaceId: string; workplaceType: string },
  profile_id: string
) => {
  const query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .neq("id", profile_id)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filter.workplaceId) {
    query.or(
      `workplace_ref.eq.${filter.workplaceId},institution_ref.eq.${filter.workplaceId}`
    );
  }

  const { data, count } = await query;
  const users: AlgoliaUser[] = (data || [])?.map((user: any) => ({
    ...user,
  }));

  return {
    users,
    count: count || 0,
  };
};

const algoliaSearch = async (
  searchTerm: string,
  page: number = 0,
  pageSize = 20,
  filter: { workplace: string }
) => {
  const { hits, nbHits } = await Algolia.users.search(searchTerm, {
    page,
    hitsPerPage: pageSize,
    filters: filter.workplace
      ? `workplace_ref.id:${filter.workplace}`
      : undefined,
  });
  return {
    users: hits.map((hit: any) => ({
      ...hit,
      id: hit.objectID,
    })) as unknown as AlgoliaUser[],
    count: nbHits,
  };
};

const updateAccountUserRole = async ({
  account_id,
  new_account_role,
  user_id,
}: any) => {
  let { data, error } = await supabase.rpc("update_account_user_role", {
    account_id,
    new_account_role,
    user_id,
  });
  if (error) throw error;
  return data;
};

const removeFromCompany = async ({
  user_id,
  key,
}: {
  user_id: string;
  key: string;
}) => {
  const { data: otherWorkplace } = await supabase
    .from("workplaces")
    .select("id")
    .eq("workplace_email", "other@yopmail.com")
    .single();

  await supabase
    .from("profiles")
    .update({ [key]: otherWorkplace?.id })
    .eq("id", user_id)
    .select("*");

  message.success("User removed from the company successfully!");
};

const getAllUsers = async (
  filter: {
    workplaceId: string;
    workplaceType: string;
  },
  profile_id: string
) => {
  const query = supabase
    .from("profiles")
    .select(
      "id, name, user_role, employment_status, workplace, workplace_ref(id, workplace_logo, workplace_name , type ), institution_ref(id, workplace_logo, workplace_name , type ), email,  created_at)"
    )
    .neq("id", profile_id)
    .order("created_at", { ascending: false });
  if (filter.workplaceId) {
    query.or(
      `workplace_ref.eq.${filter.workplaceId},institution_ref.eq.${filter.workplaceId}`
    );
  }
  const { data } = await query;

  return data;
};

const Users = {
  createUser,
  updateUser,
  deleteUser,
  algoliaSearch,
  getUserProfiles,
  getAccountUser,
  updateAccountUserRole,
  updateUserAccount,
  getAllUsers,
  removeFromCompany,
};

export default Users;
