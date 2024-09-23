const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN } = require("./config");
const { withToken, readItems } = require("@directus/sdk");

async function peopleModule(peopleIds, client) {
  try {
    // Function to check if a person with a given ID exists in Directus
    const checkPersonExists = async (personId, client) => {
      const person = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          readItems("people", {
            filter: {
              slug: {
                _eq: personId.people_id.id,
              },
            },
          })
        )
      );

      return person.length > 0 ? person[0].id : null;
    };

    const existingContributors = [];
    // Iterate over each personId and check if it exists in Directus
    for (const contributorId of contributorsIds) {
      const existingContributorId = await checkPersonExists(
        contributorId,
        client
      );
      if (existingContributorId) {
        existingContributors.push({ contributors_id: existingContributorId });
      }
    }

    if (existingContributors) {
      return existingContributors;
    }
  } catch (error) {
    console.error("Error fetching person:", error.message);
    for (const contributorId of contributorsIds) {
      // Handle the error and write specific data to a text file
      const person = contributorId.contributors_id;
      const failedData = `name: ${person.first_name} ${person.last_name} | old_id: ${person.old_id}\n`;
      console.log("Error fetching person:\n", failedData);
      const filePath = `sync/errors-contributors.txt`;
      // Write the error data to the text file
      fs.appendFileSync(filePath, failedData, "utf-8");
    }
  }
}

module.exports = {
  contributorsModule,
};
