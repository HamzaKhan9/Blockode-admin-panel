import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://kszrzybbmdzfsouztknz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzenJ6eWJibWR6ZnNvdXp0a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4Nzg2ODUsImV4cCI6MTk4OTQ1NDY4NX0.0MTWfumSyI3ob5zV38xzL1fcCWUnRWj2bjy0Lh6vU78"
);

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
        Authorization: `Bearer ${process.env.CLEARBIT_API_KEY}`,
      },
    }
  );
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function PromiseAll(promises, batchSize = 30, delayMs = 0) {
  if (!batchSize || !Number.isInteger(batchSize) || batchSize <= 0)
    return Promise.all(promises);

  let position = 0;
  let results = [];
  while (position < promises.length) {
    const batch = promises.slice(position, position + batchSize);
    results = [...results, ...(await Promise.all(batch))];
    position += batchSize;
    if (delayMs) {
      console.log(`Waiting for ${delayMs}ms after ${position} promises...`);
      await delay(delayMs);
    }
  }
  return results;
}

const keys = ["n/a", "none", "na", "_", "null", "nil", "no", ""];
const migrate = async () => {
  await supabase
    .from("profiles")
    .update({
      workplace_ref: "8dc633dc-0018-49dd-9364-ed85ef714f91", //dangling workplace
      institution_ref: null,
      workplace: null,
    })
    .or(keys.map((k) => `workplace.ilike.${k}`).join(","));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("workplace, id")
    .filter("workplace_ref", "is", null)
    .filter("institution_ref", "is", null);

  const domains = await PromiseAll(
    findUniqueObjectsByProperty(
      profiles.filter((p) => !keys.includes(p.workplace?.toLowerCase())),
      "workplace"
    ).map(async (profile) => {
      const autocomplete = await fetchCleatbitAutocomplete(profile.workplace);
      const foundWorkplace = autocomplete?.[0] || null;
      if (!foundWorkplace) return null;
      const { data, error } = await supabase
        .from("workplaces")
        .select("workplace_domain")
        .eq("workplace_domain", foundWorkplace?.domain);
      if (data.length > 0 || error) return null;
      const domain = foundWorkplace.domain;
      profile.domain = domain;
      return domain;
    })
  );
  const uniqueDomains = [...new Set(domains.filter(Boolean))];
  console.log("uniqueDomains: ", uniqueDomains);

  const workplaces = await PromiseAll(
    uniqueDomains.map(async (domain) => {
      const enrichment = await fetchClearbitEnrichment(domain);
      const workplace = getWorkplace(enrichment);
      return workplace;
    })
  );

  const { error, data: workplacesData } = await supabase
    .from("workplaces")
    .insert(workplaces.filter((item) => !!item.workplace_domain))
    .select();
  if (error) return;
  console.log("workplaces: ", workplacesData);

  await PromiseAll(
    data
      .filter((p) => p.domain)
      .map(async (profile) => {
        const workplace = workplacesData.find(
          (w) => w.workplace_domain === profile.domain
        );
        if (!workplace) return;
        console.log("domain:", profile.domain);
        const { error } = await supabase
          .from("profiles")
          .update({
            workplace_ref: workplace.id,
          })
          .eq("id", profile.id);
        if (error) return;
      })
  );
  console.log("done");
};

migrate();
