require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  deleteItems,
} = require("@directus/sdk");

async function deleteSections() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const sections = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        deleteItems("sections", {
          filter: {
            status: {
              _eq: "published",
            },
          },
        })
      )
    );
    console.log("all sections deleted: ", sections);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
deleteSections();
