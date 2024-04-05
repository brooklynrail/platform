require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");

async function createContributors() {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/contributors`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const allContributors = await response.json();
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    // Iterate over each contributor and check if it exists in Directus
    for (const contributorData of allContributors) {
      const existingContributor = await contributorExists(
        contributorData.old_id,
        client
      );

      if (existingContributor) {
        continue;
      } else {
        console.log(contributorData);
        const contributors = await client.request(
          withToken(
            BASE_ACCESS_TOKEN,
            createItem("contributors", contributorData)
          )
        );
        console.log("========");
        console.log(contributors);
      }
    }
  } catch (error) {
    console.error("Error creating contributors", error.message);
  }
}

const contributorExists = async (old_id, client) => {
  const contributor = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readItems("contributors", {
        filter: {
          old_id: {
            _eq: old_id,
          },
        },
      })
    )
  );
  return contributor;
};

createContributors();
