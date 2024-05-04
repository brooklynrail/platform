const fetch = require("cross-fetch");
require("dotenv").config();
const { askConfirmation } = require("./confirm");

const BASE_DIRECTUS_URL = "http://127.0.0.1:8055";
const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;

const TARGET_DIRECTUS_URL = "https://studio.brooklynrail.org";
const TARGET_ACCESS_TOKEN = process.env.TOKEN;

async function main() {
  const confirm = await askConfirmation(
    "Do you want import the schema from localhost to production? (y/n): "
  );
  if (!confirm) {
    console.log("Script cancelled.");
    process.exit(0);
  }

  const snapshot = await getSnapshot();
  const diff = await getDiff(snapshot);
  await applyDiff(diff);
}

main();

async function getSnapshot() {
  const URL = `${BASE_DIRECTUS_URL}/schema/snapshot?access_token=${BASE_ACCESS_TOKEN}`;
  const { data } = await fetch(URL).then((r) => r.json());
  return data;
}

async function getDiff(snapshot) {
  const URL = `${TARGET_DIRECTUS_URL}/schema/diff?access_token=${TARGET_ACCESS_TOKEN}`;

  const { data } = await fetch(URL, {
    method: "POST",
    body: JSON.stringify(snapshot),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());

  return data;
}

async function applyDiff(diff) {
  const URL = `${TARGET_DIRECTUS_URL}/schema/apply?access_token=${TARGET_ACCESS_TOKEN}`;

  await fetch(URL, {
    method: "POST",
    body: JSON.stringify(diff),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
