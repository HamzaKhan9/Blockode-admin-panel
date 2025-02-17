import supabase from "../../src/supabase.config";
import { TableRow } from "../../src/types/common";
import { faker } from "@faker-js/faker";
import { randomDate } from "./utils";
import _ from "lodash";

type Vision = TableRow<"vision_boards">;

export const generator = ({ users }: { users: string[] }): Vision => {
  return {
    id: faker.string.uuid(),
    name: faker.word.verb(),
    description: `${faker.word.adjective()} ${faker.word.noun()}`,
    created_at: randomDate(),
    updated_at: randomDate(),
    user_id: _.sample(users) || "",
    img_url: faker.image.url(),
  };
};

(async () => {
  const count = 25;

  const users =
    (await supabase.from("profiles").select("id")).data?.map(
      (item) => item.id
    ) || [];

  //   console.log("users", users.length);
  //   console.log(JSON.stringify(generator({ users }), null, 2));

  await supabase.from("vision_boards").insert(
    Array(count)
      .fill(0)
      .map(() => generator({ users }))
  );
})();
