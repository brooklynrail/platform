require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const { createIssuePreset } = require("./createPreset");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");
const { createFileFolder } = require("./createFilesFolder");

// Create all the articles for each issue
async function createBookmarks() {
  try {
    // Fetch the list of RAIL issues
    const allIssues = await fetchIssues();
    // Fetch the list of existing issues
    const existingIssues = await getExistingIssues();

    if (!allIssues && !existingIssues) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // reverse the order of allIssues
    allIssues.reverse();

    // Iterate over each issue
    for (const issue of allIssues) {
      // if (
      //   (issue.year !== 2023 && issue.year !== 2024) ||
      //   (issue.year === 2024 && issue.month === 7)
      // ) {
      //   console.log(`Skipping Issue ${issue.year}-${issue.month} for now!`);
      //   continue; // Skip to the next issue
      // }

      if (issue.year !== 2024 && issue.month !== 6) {
        console.log(`Skipping Issue ${issue.year}-${issue.month} for now!`);
        continue; // Skip to the next issue
      }

      // check to see if the issue already exists in Directus
      const existingIssue = existingIssues.find((existingIssue) => {
        return existingIssue.old_id === issue.old_id;
      });

      if (!existingIssue) {
        console.log(
          `Skipping because Issue ${issue.year}-${issue.month} does not exist!`
        );
        continue; // Skip to the next issue
      }

      if (existingIssue) {
        // set the issue API URL
        const issueAPI =
          issue.special_issue === true
            ? `${API_ENDPOINT}/special/${issue.slug}/api`
            : `${API_ENDPOINT}/${issue.year}/${issue.month}/api`;

        // Fetch data for the current issue
        const response = await fetch(issueAPI, {
          headers: {
            Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Error fetching data for issue ${issue.year}/${issue.month}: HTTP error! Status: ${response.status}`
          );
          continue; // Skip to the next issue
        }

        const issueData = await response.json();

        if (issueData) {
          console.log("====================================");
          console.log("Issue to be updated:", issue);

          const issuePreset = await createIssuePreset(
            issueData.year,
            issueData.month,
            issueData.title,
            existingIssue.issue_number
          );

          console.log(
            `🚩 The ${issueData.year}-${issueData.month} Issue Preset created!`,
            issuePreset
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "Error fetching creating article data for each issue:",
      error.message
    );
  }
}
createBookmarks();

async function getExistingIssues() {
  try {
    console.log("Fetching existing issues...");
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const existingIssues = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readItems("issues", {
          fields: ["id", "slug", "old_id", "issue_number", "articles"],
          limit: -1,
        })
      )
    );

    return existingIssues;
  } catch (error) {
    console.error("Error fetching existing issues:", error.message);
    throw error; // Propagate the error
  }
}

async function fetchIssues() {
  try {
    // Fetch issues from your API
    const response = await fetch(`${API_ENDPOINT}/api/issue-list`);
    if (!response.ok) {
      throw new Error(`Failed to fetch issues. Status: ${response.status}`);
    }

    // Parse the JSON response
    const issues = await response.json();
    return issues;
  } catch (error) {
    console.error("Error fetching issues:", error.message);
    throw error; // Propagate the error
  }
}
