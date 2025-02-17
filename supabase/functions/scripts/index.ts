import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
console.log("Hello from Functions!");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;
const clearbit_api_key = Deno.env.get("REACT_APP_CLEARBIT_API_KEY") as string;
const google_api_key = Deno.env.get("REACT_APP_GOOGLE_API_KEY") as string;

export const delay = (millis) => new Promise((res) => setTimeout(res, millis));

function findUniqueObjectsByProperty(arr, property) {
  const uniqueValues = [];
  const uniqueIds = new Set();

  for (const obj of arr) {
    const value = obj[property];

    if (value != null && !uniqueIds.has(value)) {
      uniqueIds.add(value);
      // @ts-ignore
      uniqueValues.push(obj);
    }
  }

  return uniqueValues;
}

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
  console.log(request.headers.get("Authorization"));
  const res = await fetch(request);
  return res.json();
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

const populateDomiansInWorkplace = async () => {
  const supabaseClient = createClient(supabase_url, service_role_key);
  let { data: profiles, error } = await supabaseClient
    .from("profiles")
    .select("workplace, id");
  const uniqueProfiles = findUniqueObjectsByProperty(profiles, "workplace");

  const promises = uniqueProfiles.map(async (profile) => {
    // @ts-ignore
    const autocomplete = await fetchCleatbitAutocomplete(profile?.workplace);
    const foundWorkplace = autocomplete?.[0] || null;
    if (!foundWorkplace) return null;
    const { data, error } = await supabaseClient
      .from("workplaces")
      .select("workplace_domain")
      .eq("workplace_domain", foundWorkplace?.domain);
    if (data.length > 0) return null;
    if (error) throw error;
    return getWorkplace(foundWorkplace);
  });
  if (error) throw error;
  const result = await Promise.all(promises);
  const filtered = result.filter((i) => Boolean(i?.workplace_name));
  const uniqueResults = findUniqueObjectsByProperty(
    filtered,
    "workplace_domain"
  );

  const { data, error: e } = await supabaseClient
    .from("workplaces")
    .insert(uniqueResults)
    .select();
  console.log({ data });
  if (e) throw e;
  return "success";
};

const populateDomiansInProfiles = async () => {
  const supabaseClient = createClient(supabase_url, service_role_key);
  let { data: profiles, error } = await supabaseClient
    .from("profiles")
    .select("workplace, id");
  const promises = profiles
    .filter((p) => Boolean(p?.workplace))
    .map(async (profile) => {
      // @ts-ignore
      const autocomplete = await fetchCleatbitAutocomplete(profile?.workplace);
      const foundWorkplace = autocomplete?.[0] || null;

      if (!foundWorkplace) return null;
      const { data, error } = await supabaseClient
        .from("profiles")
        .update([{ workplace_domain: foundWorkplace?.domain || null }])
        .eq("id", profile?.id)
        .select();
      if (error) throw error;
    });
  if (error) throw error;
  await Promise.all(promises);
  return "success";
};

const populateWorkplaceDetails = async () => {
  const supabaseClient = createClient(supabase_url, service_role_key);
  let { data: workplaces, error } = await supabaseClient
    .from("workplaces")
    .select("workplace_domain")
    .is("workplace_description", null);
  console.log(workplaces.length);
  const executor = async (startAfter, limit) => {
    let end = startAfter + limit;
    const promises = workplaces.slice(startAfter, end).map(async (w) => {
      const workplaceDetails = await fetchClearbitEnrichment(
        w?.workplace_domain
      );
      if (workplaceDetails?.error) throw workplaces?.error;
      const { data, error } = await supabaseClient
        .from("workplaces")
        .update(getWorkplace(workplaceDetails))
        .eq("workplace_domain", w?.workplace_domain)
        .select();
      if (error) throw error;
    });
    await Promise.all(promises);
    return end > workplaces.length ? false : end;
  };

  let startAfter = 0;
  let count = 0;
  do {
    count++;
    console.log(`Running ${count} time`);
    startAfter = await executor(startAfter, 1);
    await delay(15000);
  } while (startAfter);
  // const workplaces = await fetchClearbitEnrichment("autoworkz.org");
  if (error) throw error;
  return "success";
};

const populateAccountUsers = async () => {
  const supabaseClient = createClient(supabase_url, service_role_key);
  let { data: profiles, error } = await supabaseClient
    .from("profiles")
    .select("*");
  if (error) throw error;

  const promises = profiles.map(async (p) => {
    if (p?.workplace_ref) {
      const { data, error } = await supabaseClient
        .from("account_user")
        .insert([
          {
            user_id: p?.id,
            account_id: p?.workplace_ref,
            account_role: "member",
          },
        ])
        .select();

      if (error) throw error;

      console.log(data);
    }
    if (p?.institution_ref) {
      const { data, error } = await supabaseClient
        .from("account_user")
        .insert([
          {
            user_id: p?.id,
            account_id: p?.institution_ref,
            account_role: "member",
          },
        ])
        .select();

      if (error) throw error;

      console.log(data);
    }
  });

  await Promise.all(promises);
  return "success";
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  // const { name } = await req.json();

  try {
    const supabaseClient = createClient(supabase_url, service_role_key);
    console.log({ supabase_url, service_role_key });

    // const result = await populateWorkplaceDetails();
    // const result = await populateDomiansInProfiles();
    const result = await populateAccountUsers();
    console.log(result);
    return new Response(JSON.stringify({ data: "result" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
