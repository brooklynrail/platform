require("dotenv").config();
const fs = require("fs");
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
  readItems,
} = require("@directus/sdk");

async function createContributors() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const response = await fetch(`${API_ENDPOINT}/api/contributors`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const allContributors = await response.json();

    if (allContributors) {
      for await (const contributorData of allContributors) {
        // Check if contributorData.old_id exists in existingContributors
        const existingContributors = await checkExistingContributors(
          contributorData,
          client
        );

        if (existingContributors.length > 0) {
          console.log(
            `Contributor ${contributorData.first_name} ${contributorData.last_name} already exists!`
          );
          continue;
        }

        // Create the contributor in Directus
        const contributor = await client.request(
          withToken(
            BASE_ACCESS_TOKEN,
            createItems("contributors", contributorData)
          )
        );
        if (!contributor) {
          throw new Error(`Error creating contributor: ${contributorData}`);
        }
        console.log(
          `Contributor ${contributor.first_name} ${contributor.last_name} created!`
        );
      }
    }
  } catch (error) {
    console.error("Error creating contributors", error.message);
    const failedData = `${error.message}\n`;
    const filePath = `sync/errors-contributors.txt`;
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

async function checkExistingContributors(contributorData, client) {
  const listContributors = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readItems("contributors", {
        fields: ["id", "old_id"],
        filter: {
          old_id: {
            _eq: contributorData.old_id,
          },
        },
        limit: -1,
      })
    )
  );

  return listContributors;
}

createContributors();
