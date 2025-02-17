import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  multiParser,
  FormFile,
} from "https://deno.land/x/multiparser@0.114.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const service_role_key = Deno.env.get("REACT_APP_SERVICE_ROLE") as string;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabase_url, service_role_key);
    console.log({ supabase_url, service_role_key });
    const form = await multiParser(req);
    if (!form) {
      return new Response(
        JSON.stringify({ success: false, error: "no file found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const image: FormFile = form?.files?.workplace_logo as FormFile;
    const {
      workplace_name,
      workplace_address,
      workplace_description,
      workplace_domain,
      workplace_email,
      type,
    } = form.fields;

    const { data: workplaceExists, error } = await supabaseClient
      .from("workplaces")
      .select()
      .eq("workplace_domain", workplace_domain);

    if (error) throw error;
    if (workplaceExists.length > 0) {
      return new Response(
        JSON.stringify({ message: "workplace already exists" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409,
        }
      );
    }

    let publicUrl = null;
    console.log({ image });
    if (image) {
      const { data: alreadyUploaded, error: e22 } = await supabaseClient.storage
        .from("default")
        .getPublicUrl(`workplaces/${image.filename}`);

      if (e22) throw e22;
      const { error: e23 } = await supabaseClient.storage
        .from("default")
        .remove([`workplaces/${image.filename}`]);
      // if (alreadyUploaded?.publicUrl) {
      //   publicUrl = alreadyUploaded?.publicUrl;
      // } else {
      if (e23) throw e23;
      const { data: uploaded, error: e1 } = await supabaseClient.storage
        .from("default")
        .upload(`workplaces/${image.filename}`, image.content.buffer, {
          contentType: image.contentType,
          cacheControl: "3600",
          upsert: false,
        });
      console.log({ uploaded });
      if (e1) throw e1;
      const { data: file, error: e2 } = await supabaseClient.storage
        .from("default")
        .getPublicUrl(uploaded.path);
      if (e2) throw e2;
      console.log({ file });
      publicUrl = file.publicUrl;
    }

    const { data, error: e3 } = await supabaseClient
      .from("workplaces")
      .insert({
        workplace_name: workplace_name || null,
        workplace_address: workplace_address || null,
        workplace_description: workplace_description || null,
        workplace_domain: workplace_domain || null,
        workplace_email: workplace_email || null,
        workplace_logo: publicUrl,
        type,
      })
      .select();

    if (e3) throw e3;

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
