import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseAdmin = createClient(supabase_url, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const supabaseClient = createClient(supabase_url, service_role_key, {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    const { email } = await req.json();

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    let { data: profile, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile.user_role === "admin") {
      const { data: user, error } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email);

      if (user) {
        return new Response(
          JSON.stringify({ user, message: "User Created successfully..." }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      if (error) throw error;
    } else if (profile.user_role === "user") {
      throw new Error("Only Admin can create Users...");
    }

    if (error) throw error;
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
