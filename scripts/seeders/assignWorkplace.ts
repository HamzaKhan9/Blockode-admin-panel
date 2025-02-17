import _ from "lodash";
import supabase from "../../src/supabase.config";

(async () => {
  const workplaces = (
    await supabase.from("workplaces").select("id, type, workplace_name")
  ).data;

  const profiles =
    (
      await supabase
        .from("profiles")
        .select("id")
        .is("workplace_ref", null)
        .is("institution_ref", null)
    )?.data?.map((item) => item.id) || [];

  const updates: any[] = [];
  for (const id of profiles) {
    const workplace = _.sample(workplaces);
    updates.push({
      id,
      [workplace?.type === "institution" ? "institution_ref" : "workplace_ref"]:
        workplace?.id,
      workplace: workplace?.workplace_name,
    });
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
