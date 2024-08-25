const fetch = require("cross-fetch");
require("dotenv").config();
const { askConfirmation } = require("./confirm");
const {
  createDirectus,
  rest,
  withToken,
  schemaDiff,
  schemaApply,
} = require("@directus/sdk");

const BASE_DIRECTUS_URL = "https://studio.brooklynrail.org";
const BASE_ACCESS_TOKEN = process.env.TOKEN;

const TARGET_DIRECTUS_URL = "http://127.0.0.1:8055";
const TARGET_ACCESS_TOKEN = process.env.TOKEN_LOCAL;

async function main() {
  try {
    const confirm = await askConfirmation(
      "Do you want import the schema from production to localhost? (y/n): "
    );
    if (!confirm) {
      console.log("Script cancelled.");
      process.exit(0);
    }

    const snapshot = await getSnapshot();
    const diff = await getDiff(snapshot);
    await applyDiff(diff);
    console.log("Production and localhost schemas are now in sync!");
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1); // Exit with an error code
  }
}

main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});

async function getSnapshot() {
  const URL = `${BASE_DIRECTUS_URL}/schema/snapshot?access_token=${BASE_ACCESS_TOKEN}`;
  const { data } = await fetch(URL).then((r) => r.json());
  return data;
}

async function getDiff(snapshot) {
  try {
    const client = createDirectus(TARGET_DIRECTUS_URL).with(rest());
    const data = await client.request(
      withToken(TARGET_ACCESS_TOKEN, schemaDiff(snapshot))
    );

    return data;
  } catch (error) {
    console.error("Error getting schema diff:", error.message);
    throw error; // Propagate the error
  }
}

async function applyDiff(diff) {
  try {
    const client = createDirectus(TARGET_DIRECTUS_URL).with(rest());
    const data = await client.request(
      withToken(TARGET_ACCESS_TOKEN, schemaApply(diff))
    );
    return data;
  } catch (error) {
    console.error("Error applying schema diff:", error.message);
    throw error; // Propagate the error
  }
}
