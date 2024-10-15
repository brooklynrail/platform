require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  clearCache,
  withToken,
} = require("@directus/sdk");

async function clear() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const result = await client.request(
      withToken(BASE_ACCESS_TOKEN, clearCache())
    );
    console.log("Cache cleared! ", result);
  } catch (error) {
    console.error("Error clearing cache: ", error.message);
  }
}
clear();
