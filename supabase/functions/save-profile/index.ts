import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;
const clearbit_api_key = Deno.env.get("REACT_APP_CLEARBIT_API_KEY") as string;

const fetchClearbitEnrichment = async (domain) => {
  const request = new Request(
    `https://company.clearbit.com/v2/companies/find?domain=${domain}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${clearbit_api_key}`,
      },
    }
  );
  const res = await fetch(request);
  const json = await res.json();
  if (json?.error) throw json.error;
  return json;
};

const getAddress = (address) => {
  const streetAddress = address?.geo?.streetAddress || "";
  const postalCode = address?.geo?.postalCode || "";
  const city = address?.geo?.city || "";
  const state = address?.geo?.state || "";
  const country = address?.geo?.country || "";

  const formattedAddress = [streetAddress, postalCode, city, state, country]
    .filter(Boolean)
    .join(", ");

  return {
    formatted_address: formattedAddress,
    location: {
      lat: address?.geo?.lat,
      lng: address?.geo?.lng,
    },
  };
};

const getWorkplace = (workplace) => ({
  workplace_name: workplace?.name || null,
  workplace_address: workplace?.geo ? getAddress(workplace) : null,
  workplace_description: workplace?.description || null,
  workplace_domain: workplace?.domain || null,
  workplace_email: workplace?.site?.emailAddresses?.[0] || null,
  workplace_logo: workplace?.logo || null,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { employment_status, workplace_domain, institution_domain, user_id } =
    await req.json();

  try {
    const supabaseClient = createClient(supabase_url, service_role_key);
    console.log({ supabase_url, service_role_key });
    let workplace_ref = null;
    let institution_ref = null;
    if (workplace_domain) {
      const { data: existingWorkplace, error: e1 } = await supabaseClient
        .from("workplaces")
        .select("id")
        .eq("workplace_domain", workplace_domain);
      if (e1) throw e1;
      if (existingWorkplace.length > 0) {
        workplace_ref = existingWorkplace[0].id;
      } else {
        const newWorkplace = await fetchClearbitEnrichment(workplace_domain);
        const { data: workplace, error: e11 } = await supabaseClient
          .from("workplaces")
          .insert({ ...getWorkplace(newWorkplace), type: "workplace" })
          .select();
        if (e11) throw e11;
        workplace_ref = workplace[0].id;
      }
    }

    if (institution_domain) {
      const { data: existingInstituion, error: e2 } = await supabaseClient
        .from("workplaces")
        .select("id")
        .eq("workplace_domain", institution_domain);
      if (e2) throw e2;

      if (existingInstituion.length > 0) {
        institution_ref = existingInstituion[0].id;
      } else {
        const newInstitution = await fetchClearbitEnrichment(
          institution_domain
        );
        const { data: institution, error: e21 } = await supabaseClient
          .from("workplaces")
          .insert({ ...getWorkplace(newInstitution), type: "institution" })
          .select();
        if (e21) throw e21;
        institution_ref = institution[0].id;
      }
    }

    if (employment_status === "Employed Adult 18+") {
      if (!workplace_ref) {
        throw new Error(
          "workplace_ref must be a non-empty string when employment_status is 'Employed Adult 18+'."
        );
      }
    } else {
      if (!institution_ref) {
        throw new Error(
          "institution_ref must be a non-empty string when employment_status is not 'Employed Adult 18+'."
        );
      }
    }

    const { data, error: e3 } = await supabaseClient
      .from("profiles")
      .update({
        employment_status,
        workplace_ref,
        institution_ref,
      })
      .eq("id", user_id)
      .select();
    if (e3) throw e3;
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: error?.message || error } }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        statusText: JSON.stringify(error),
        status: 400,
      }
    );
  }
});
