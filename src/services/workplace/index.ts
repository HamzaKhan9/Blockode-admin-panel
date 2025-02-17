import supabase from "../../supabase.config";
import { SendInvite } from "../../types/common";
// import { message } from "antd";

const getWorkplaces = async () => {
  let { data: workplaces } = await supabase.from("workplaces").select("*");

  return workplaces;
};

const getSingleWorkplace = async (id: any) => {
  if (!id) return null;
  let { data: workplaces, error } = await supabase
    .from("workplaces")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return workplaces;
};

const getInvitations = async (userId: string) => {
  const query = supabase
    .from("invitations")
    .select("*", { count: "exact" })
    .eq("invited_by_user_id", userId)
    .order("created_at", { ascending: false });

  const { data: invitations, count } = await query;
  return {
    invitations,
    count: count || 0,
  };
};

const deleteInvitation = async ({ id }: { id: string }) => {
  const query = supabase.from("invitations").delete().eq("id", id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const sendInvite = async ({
  userId,
  workplaceId,
  role,
  email,
  message,
}: SendInvite) => {
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      invitation_type: "one-time",
      invited_by_user_id: userId,
      account_id: workplaceId,
      account_role: role,
      invitee_email: email,
      message,
    })
    .select();
  await supabase.functions.invoke("send-email", {
    body: JSON.stringify({
      message,
      email,
      account_role: role,
      account_team_name: data?.[0].account_team_name,
      token: data?.[0].token,
    }),
  });
  if (error) throw error;
  return data;
};

const workplaces = {
  getWorkplaces,
  getInvitations,
  sendInvite,
  deleteInvitation,
  getSingleWorkplace,
};

export default workplaces;
