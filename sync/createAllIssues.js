const fs = require("fs");
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const { importIssue } = require("./issueModule");
const { createFileFolder } = require("./createFilesFolder");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");
// ============

async function importIssues() {
  try {
    const mainIssuesFolder = await createFileFolder({ name: "Issues" });
    // Fetch the list of issues
    const allIssues = await fetchIssues();

    const existingIssues = await getExistingIssues();

    if (allIssues && existingIssues) {
      // Iterate over each issue
      for (const issue of allIssues) {
        if (
          (issue.year !== 2005 &&
            issue.year !== 2004 &&
            issue.year !== 2003 &&
            issue.year !== 2002 &&
            issue.year !== 2001 &&
            issue.year !== 2000) ||
          (issue.year === 2024 && issue.month === 7)
        ) {
          console.log(`Skipping Issue ${issue.year}-${issue.month} for now!`);
          continue; // Skip to the next issue
        }

        // Look in the existingIssues array for an issue with the same old_id as issue.old_id
        const existingIssue = existingIssues.find((existingIssue) => {
          return existingIssue.old_id === issue.old_id;
        });

        if (existingIssue) {
          console.log(`Issue ${issue.year}-${issue.month} already exists!`);
          continue; // Skip to the next issue
        } else {
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

          const data = await response.json();
          console.log(`Issue ${issue.year}-${issue.month} data fetched!`);

          if (data) {
            // Add the issue_number to the data object
            data.issue_number = issue.issue_number;
            const issueData = await importIssue(data, mainIssuesFolder);
            console.log(
              `Issue ${data.year}-${data.month} migration completed!`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error creating ALL issue data:", error);
    console.error(error.extensions);

    // Handle the error and write specific data to a text file
    const failedData = `${data.title}\n`;
    const filePath = `sync/errors-allissues.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

async function getExistingIssues() {
  try {
    console.log("Fetching existing issues...");
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const existingIssues = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readItems("issues", {
          fields: ["id", "slug", "old_id", "issue_number", "articles"],
          // limit: -1,
        })
      )
    );
    return existingIssues;
  } catch (error) {
    console.error("Error fetching existing issues:", error);
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

// Start the import process
importIssues();

module.exports = {
  getExistingIssues,
  fetchIssues,
};
