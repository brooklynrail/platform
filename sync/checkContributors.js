require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  BASE_DIRECTUS_URL,
  API_ENDPOINT,
} = require("./config");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");

async function checkContributors() {
  // We are going to go throgh each issue in Directus and count how many articles are in each issue
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  const contributors = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readItems("contributors", {
        fields: ["first_name", "last_name"],
        limit: -1,
      })
    )
  );

  // ========================
  // OLD ISSUE API
  const contributorsAPI = `${API_ENDPOINT}/api/contributors`;

  const response = await fetch(contributorsAPI, {
    headers: {
      Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error(
      `Error fetching data for contributorsAPI: HTTP error! Status: ${response.status}`
    );
  }
  const oldContribData = await response.json();
  console.log("===================");
  console.log("Contributors");
  console.log("Old: ", oldContribData.length);
  console.log("New: ", contributors.length);
}

checkContributors();
