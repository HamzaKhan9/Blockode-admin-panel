import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;

const fetchCleatbitAutocomplete = async (query) => {
  const request = new Request(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`,
    {
      method: "GET",
    }
  );
  const res = await fetch(request);
  return res.json();
};

const formatQueryResult = (data) =>
  data.map((d) => ({
    name: d?.workplace_name,
    domain: d?.workplace_domain,
    logo: d?.workplace_logo,
  }));

const mergeAndRemoveDuplicates = (query, clearbit) => {
  const merged = [...query, ...clearbit];

  // Filter out duplicates based on the 'domain' field
  const unique = merged.reduce((acc, current) => {
    const x = acc.find((item) => item.domain === current.domain);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return unique;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const supabaseClient = createClient(supabase_url, service_role_key);

    const supabaseCall = supabaseClient
      .from("workplaces")
      .select()
      .or(`workplace_name.ilike.%${query}%`)
      .range(0, 10);

    const clearbitCall = fetchCleatbitAutocomplete(query);

    const [{ data: queryResult, error }, clearbitResult] = await Promise.all([
      supabaseCall,
      clearbitCall,
    ]);
    if (error) throw error;

    console.log({ clearbitResult });

    const uniqueData = mergeAndRemoveDuplicates(
      formatQueryResult(queryResult),
      clearbitResult
    );

    return new Response(JSON.stringify(uniqueData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/search-companies' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
