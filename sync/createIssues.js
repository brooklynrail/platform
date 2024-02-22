require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const { importImageModule } = require("./importImageModule");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
} = require("@directus/sdk");

// Create all the issues at once
async function createIssues() {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/issues`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
        // Add any additional headers if needed
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const data = await response.json();

    if (data) {
      const newData = [];

      // for each issue
      for (let index = 0; index < data.length; index++) {
        const issueData = data[index];
        const issueCovers = issueData.covers;
        // for each cover in the issue
        for (let i = 0; i < issueCovers.length; i++) {
          const coverData = issueCovers[i];
          const key = `cover_${i + 1}`;
          const coverId = await importImageModule(coverData, client);
          // Add the cover image ID directly to the issue data object
          issueData[key] = coverId;
        }
        // Push the updated issue data to the newDataArray
        newData.push(issueData);
      }
      console.log("newData =============");
      console.log(newData);

      // import the issue
      const request = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems("Issues", newData))
      );
      console.log(request);
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}
createIssues();
