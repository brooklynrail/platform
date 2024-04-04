require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  deleteItems,
} = require("@directus/sdk");

async function deleteContributors() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const contributors = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        deleteItems("contributors", {
          filter: {
            status: {
              _eq: "published",
            },
          },
          limit: -1,
        })
      )
    );
    console.log("all contributors deleted: ", contributors);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
deleteContributors();
