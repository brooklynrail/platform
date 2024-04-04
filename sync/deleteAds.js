require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  deleteItems,
} = require("@directus/sdk");

async function deleteAds() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const ads = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        deleteItems("ads", {
          filter: {
            status: {
              _eq: "published",
            },
          },
          limit: -1,
        })
      )
    );
    console.log("all Ads deleted: ", ads);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
deleteAds();
