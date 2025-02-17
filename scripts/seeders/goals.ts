import supabase from "../../src/supabase.config";
import { TableRow } from "../../src/types/common";
import { categoriesConstant } from "../../src/constants";
import { faker } from "@faker-js/faker";
import { randomDate } from "./utils";
import _ from "lodash";

type Goal = TableRow<"goals">;

export const generator = ({
  visions,
  sizes,
}: {
  visions: string[];
  sizes: string[];
}): Goal => {
  return {
    id: faker.string.uuid(),
    name: faker.word.verb(),
    description: `${faker.word.adjective()} ${faker.word.noun()}`,
    url: faker.image.url(),
    top_pos: faker.number.float(),
    bottom_pos: faker.number.float(),
    left_pos: faker.number.float(),
    right_pos: faker.number.float(),
    size_id: _.sample(sizes) || "",
    vision_id: _.sample(visions) || "",
    createdAt: randomDate(),
    updatedAt: randomDate(),
    cluster_class: _.sample(categoriesConstant) || categoriesConstant[0],
  };
};

(async () => {
  const count = 300;

  const visions =
    (await supabase.from("vision_boards").select("id")).data?.map(
      (item) => item.id
    ) || [];
  const sizes =
    (await supabase.from("sizes").select("id")).data?.map((item) => item.id) ||
    [];

  //   console.log("sizes", sizes.length);
  //   console.log("visions", visions.length);
  //   console.log(JSON.stringify(generator({ visions, sizes }), null, 2));

  await supabase.from("goals").insert(
    Array(count)
      .fill(0)
      .map(() => generator({ visions, sizes }))
  );
})();
