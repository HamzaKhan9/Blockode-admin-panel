import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;
const google_api_key = Deno.env.get("REACT_APP_GOOGLE_API_KEY") as string;

const fetchGooglePlaces = async (query) => {
  const request = new Request(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${google_api_key}`,
    {
      method: "GET",
    }
  );
  const res = await fetch(request);
  return res.json();
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { query } = await req.json();
  try {
    const data = await fetchGooglePlaces(query);
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
