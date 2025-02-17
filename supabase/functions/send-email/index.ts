const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
import {
  corsHeaders,
  invitationEmailTemplate,
} from "../_shared/helpers/index.ts";

const handler = async (_request: Request): Promise<Response> => {
  if (_request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { email, token, account_role, account_team_name, message } =
      await _request.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "contact@autoworkz.org",
        to: email,
        subject: "You have been invited to a team",
        html: invitationEmailTemplate({
          token,
          account_role,
          account_team_name,
          message,
        }),
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
};

Deno.serve(handler);
