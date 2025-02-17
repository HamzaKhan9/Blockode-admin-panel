import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    // only classify if goal is inserted or updated (name or description changed)
    if (
      payload.table === "goals" &&
      (payload.type === "INSERT" ||
        ((payload.record.name !== payload.old_record.name ||
          payload.record.description !== payload.old_record.description) &&
          payload.type === "UPDATE"))
    ) {
      console.log(
        "Classifying goal:",
        payload.record.id,
        payload.record.cluster_class,
        payload.old_record.cluster_class
      );
      await fetch(
        `https://app.autoworkz.org/api/classify/?id=${payload.record.id}`
      );
    }
    return new Response(
      JSON.stringify({ status: "success", data: { id: payload.record.id } }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error?.message || "Something went wrong",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
