import _ from "lodash";
import supabase from "../src/supabase.config";

(async () => {
  const profiles = (await supabase.from("profiles").select())?.data || [];

  const updates: any[] = [];
  for (const profile of profiles) {
    if (!profile.employment_status) {
      updates.push({
        id: profile.id,
        employment_status: profile.workplace_ref
          ? "Employed Adult 18+"
          : "Student K-12",
      });
    } else if (
      profile.employment_status === "Employed Adult 18+" &&
      !profile.workplace_ref
    ) {
      updates.push({
        id: profile.id,
        workplace_ref: profile.institution_ref,
        institution_ref: null,
      });
    } else if (
      profile.employment_status !== "Employed Adult 18+" &&
      !profile.institution_ref
    ) {
      updates.push({
        id: profile.id,
        institution_ref: profile.workplace_ref,
        workplace_ref: null,
      });
    }
  }

  await Promise.all(
    updates.map((item) =>
      supabase
        .from("profiles")
        .update(_.omit(item, ["id"]))
        .eq("id", item.id)
        .throwOnError()
    )
  );
})();
