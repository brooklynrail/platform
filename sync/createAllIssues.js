const fs = require("fs");
const { BASE_ACCESS_TOKEN, API_ENDPOINT } = require("./config");
const { importIssue } = require("./issueModule");

// ============

async function importIssues() {
  try {
    // Fetch the list of issues
    // const allIssues = await fetchIssues();
    const allIssues = [
      {
        year: "2023",
        month: "12",
      },
      {
        year: "2023",
        month: "11",
      },
    ];

    if (allIssues) {
      // Iterate over each issue
      for (const issue of allIssues) {
        const issueUrl = `${API_ENDPOINT}/${issue.year}/${issue.month}/api`;

        // Fetch data for the current issue
        const response = await fetch(issueUrl, {
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

        if (data) {
          console.log(">>>---------------- - - - -");
          console.log(`Importing issue for ${issue.year}-${issue.month}`);
          const issueData = await importIssue(data);
          console.log(
            `The ${issue.year}-${issue.month} Issue import completed!`
          );
          // console.log(issueData);
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
