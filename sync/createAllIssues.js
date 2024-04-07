const fs = require("fs");
const { BASE_ACCESS_TOKEN, API_ENDPOINT } = require("./config");
const { importIssue, checkForIssue } = require("./issueModule");

// ============

async function importIssues() {
  try {
    // Fetch the list of issues
    const allIssues = await fetchIssues();
    const selectIssues = [
      {
        year: "2024",
        month: "4",
        issue_number: 231,
        special_issue: "0",
        published: "1",
        old_id: "244",
      },
      {
        year: "2024",
        month: "3",
        issue_number: 230,
        special_issue: "0",
        published: "1",
        old_id: "243",
      },
      {
        year: "2019",
        month: "9",
        issue_number: 182,
        special_issue: "1",
        published: "0",
        old_id: "192",
      },
      {
        year: "2017",
        month: "5",
        issue_number: 157,
        special_issue: "0",
        published: "1",
        old_id: "165",
      },
      {
        year: "2017",
        month: "4",
        issue_number: 156,
        special_issue: "0",
        published: "1",
        old_id: "164",
      },
      {
        year: "2009",
        month: "6",
        issue_number: 74,
        special_issue: "0",
        published: "1",
        old_id: "81",
      },
      {
        year: "2005",
        month: "1",
        issue_number: 29,
        special_issue: "0",
        published: "1",
        old_id: "29",
      },
      {
        year: "2002",
        month: "10",
        issue_number: 11,
        special_issue: "0",
        published: "1",
        old_id: "49",
      },
      {
        year: "2000",
        month: "10",
        issue_number: 1,
        special_issue: "0",
        published: "1",
        old_id: "70",
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
          const existingIssue = await checkForIssue(data);
          if (existingIssue) {
            console.log(`Issue ${issue.year}-${issue.month} already exists!`);
            continue;
          } else {
            // Add the issue_number to the data object
            data.issue_number = issue.issue_number;
            const issueData = await importIssue(data);
            console.log(
              `The ${data.year}-${data.month} Issue import completed!`
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
