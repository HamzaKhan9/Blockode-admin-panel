import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/helpers/index.ts";
const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { email } = await req.json();
    const supabaseClient = createClient(supabase_url, service_role_key);
    console.log("email: ", email);

    let { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single()
      .throwOnError();

    console.log("profile: ", profile);
    if (profile?.user_role === "admin") {
      return new Response(JSON.stringify({ result: "super-admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let { data: accountUsers } = await supabaseClient
      .from("account_user")
      .select("*")
      .eq("user_id", profile?.id)
      .throwOnError();

    console.log("accountUsers: ", accountUsers);
    if (accountUsers.some((a) => a.account_role === "owner")) {
      return new Response(JSON.stringify({ result: "company-admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-is-admin' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
