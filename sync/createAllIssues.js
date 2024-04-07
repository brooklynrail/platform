const fs = require("fs");
const { BASE_ACCESS_TOKEN, API_ENDPOINT } = require("./config");
const { importIssue } = require("./issueModule");
const { createIssuePreset } = require("./createPreset");
const { createFileFolder } = require("./createFilesFolder");

// ============

async function importIssues() {
  try {
    // Fetch the list of issues
    const allIssues = await fetchIssues();
    const selectIssues = [
      {
        year: "2024",
        month: "04",
        issue_number: "9",
        special_issue: false,
        published: true,
      },
      {
        year: "2024",
        month: "03",
        issue_number: "8",
        special_issue: false,
        published: true,
      },
      {
        year: "2019",
        month: "09",
        issue_number: "7",
        special_issue: true,
        published: true,
      },
      {
        year: "2017",
        month: "05",
        issue_number: "6",
        special_issue: false,
        published: true,
      },
      {
        year: "2017",
        month: "04",
        issue_number: "5",
        special_issue: false,
        published: true,
      },
      {
        year: "2009",
        month: "06",
        issue_number: "4",
        special_issue: false,
        published: true,
      },
      {
        year: "2005",
        month: "01",
        issue_number: "3",
        special_issue: false,
        published: true,
      },
      {
        year: "2002",
        month: "10",
        issue_number: "2",
        special_issue: false,
        published: true,
      },
      {
        year: "2000",
        month: "10",
        issue_number: "1",
        special_issue: false,
        published: true,
      },
    ];

    if (selectIssues) {
      // Iterate over each issue
      for (const issue of selectIssues) {
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
