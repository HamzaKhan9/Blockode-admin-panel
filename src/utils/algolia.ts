import algoliasearch from "algoliasearch";

const DEV_APP_ID = "JRPR6SPIKF";
// const DEV_API_KEY = "ef26b24f20cb20a20f70021a6090df46";
const DEV_API_KEY = "d66449135a7f34898e41199b9977c733";
const PROD_APP_ID = "7O0KFUUVY6";
// const PROD_API_KEY = "a7aa83218d8186a150231989ccb646bd";
const PROD_API_KEY = "ac8ab015595f6da686bfc8daa3a414f8";
const ENV = import.meta.env.VITE_APP_ENV;

const client = algoliasearch(
  ENV == "prod" ? PROD_APP_ID : DEV_APP_ID,
  ENV == "prod" ? PROD_API_KEY : DEV_API_KEY
);

const configureUserIndex = async ({
  currentType,
  savedType,
}: {
  currentType: string;
  savedType: string;
}) => {
  if (currentType === savedType) return;

  const usersIndex = client.initIndex("users");
  await client.clearCache();
  if (currentType === "users" || currentType === "stats") {
    await usersIndex.setSettings({
      searchableAttributes: [
        "name",
        "email",
        "workplace_ref.workplace_name",
        "workplace_ref.workplace_domain",
        "institution_ref.workplace_name",
        "institution_ref.workplace_domain",
      ],
    });
    return;
  }

  if (currentType === "goals") {
    await usersIndex.setSettings({
      searchableAttributes: [
        "name",
        "email",
        "workplace_ref.workplace_name",
        "workplace_ref.workplace_domain",
        "institution_ref.workplace_name",
        "institution_ref.workplace_domain",
        "goals.name",
        "goals.description",
        "vision_boards.name",
        "vision_boards.description",
      ],
    });
  }
};

export const Algolia = {
  users: client.initIndex("users"),
  configureUserIndex,
};
