require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  readPresets,
} = require("@directus/sdk");

// Create all the articles for each issue
async function readAllPresets() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const presets = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readPresets({
          fields: ["*.*"],
        })
      )
    );
    console.log("presets", presets[7].filter);
  } catch (error) {
    console.error(
      "Error fetching creating article data for each issue:",
      error.message
    );
  }
}
readAllPresets();
