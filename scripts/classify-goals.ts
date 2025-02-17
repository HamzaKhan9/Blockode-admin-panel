import Axios from "axios";
import supabase from "../src/supabase.config";
import { delay, promiseWithRetry } from "../src/utils";
import { getErrorMessage } from "../src/utils/errorHandler";

const axios = Axios.create({
  baseURL: "https://app.autoworkz.org/api/classify",
  headers: {
    "Content-Type": "application/json",
  },
});

const batchSize = 50;
const startOffset = 0;
const strategy: number = 2;
const onlyUnclassified = false;

async function run1() {
  let count = startOffset;
  let offset = startOffset;

  while (true) {
    // Fetch a batch of goals
    console.log(`Fetching goals ${offset + 1} to ${offset + batchSize}`);
    let query = supabase
      .from("goals")
      .select("id, description")
      .neq("description", "");

    if (onlyUnclassified) {
      query = query.is("cluster_class", null);
    }

    const {
      data: goals,
      error,
      count: totalCount,
    } = await query
      .order("createdAt", { ascending: false })
      .range(offset, offset + batchSize - 1);
    if (error) throw error;
    if (!onlyUnclassified) offset += batchSize;

    if (goals.length < batchSize) break;

    // filter out goals with no description
    const goalsWithDesc = goals.filter((goal) => goal.description?.length > 0);

    for (const goal of goalsWithDesc) {
      await promiseWithRetry(
        (async () => {
          // get cluster class of the goal
          const {
            data: { class: classStr },
          } = await axios.post("/text", {
            text: goal.description,
          });

          // Update the goal with the class
          await supabase
            .from("goals")
            .update({ cluster_class: classStr })
            .eq("id", goal.id);

          console.log(++count, {
            id: goal.id,
            class: classStr,
            description: goal.description,
          });
        })(),
        { minTimeout: 10000 }
      );
    }

    console.log({
      Done: count,
      Total: totalCount,
      Completed: Math.round((count / (totalCount || 1)) * 100) + "%",
    });

    console.log("--------------------\n");
    await delay(3000);
  }
}

async function run2() {
  let offset = startOffset;
  while (true) {
    let shouldBreak = false;
    await promiseWithRetry(
      (async () => {
        console.log({ offset });
        const {
          data: { total, noMore },
        } = await axios.get(onlyUnclassified ? "/unclassified" : "/all", {
          params: { offset, limit: batchSize, chunk_size: 5 },
        });

        if (noMore) {
          shouldBreak = true;
          return;
        }

        if (!onlyUnclassified) offset += batchSize;
        console.log({ total });
        await delay(1000);
      })(),
      { minTimeout: 10000, retries: 10 }
    );

    if (shouldBreak) break;
  }
}

(strategy === 1 ? run1 : run2)().catch((e) =>
  console.error(getErrorMessage(e))
);
