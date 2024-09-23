const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN } = require("./config");
const { withToken, readItems } = require("@directus/sdk");

async function sectionsModule(old_section_slug, client) {
  const old_id = old_section_slug;
  try {
    // Function to check if a section with a given ID exists in Directus
    const checkSectionExists = async (old_id, client) => {
      const sections = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          readItems("sections", {
            filter: {
              slug: {
                _eq: old_id,
              },
            },
          })
        )
      );
      return sections.length > 0 ? sections[0].id : null;
    };

    const existingSectionId = await checkSectionExists(old_id, client);
    if (existingSectionId) {
      return { id: existingSectionId };
    }
  } catch (error) {
    console.error("Error fetching section:", error.message);
    // Handle the error and write specific data to a text file
    const failedData = `${old_section_id}\n`;
    const filePath = `sync/errors-sections.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  sectionsModule,
};
