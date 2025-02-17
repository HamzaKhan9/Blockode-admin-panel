import _ from "lodash";
import supabase from "../../src/supabase.config";
import { generator } from "./visions";
import { generator as goalGenerator } from "./goals";

(async () => {
  const profiles =
    (await supabase.from("profiles").select("id"))?.data?.map(
      (item) => item.id
    ) || [];

  await Promise.all(
    profiles.map(async (profile) => {
      let vision = (
        await supabase
          .from("vision_boards")
          .select("id")
          .eq("user_id", profile)
          .single()
      ).data;

      if (!vision?.id) {
        const data = generator({ users: [profile] });
        console.log("profile: ", profile);
        console.log("vision: ", data);
        await supabase.from("vision_boards").insert(data);
        const goals = Array(_.random(2, 10))
          .fill(0)
          .map(() => goalGenerator({ visions: [data.id], sizes: [] }));
        console.log("goals: ", goals);
        await supabase.from("goals").insert(goals);
      }
    })
  );
})();
