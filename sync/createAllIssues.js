const fs = require("fs");
const { BASE_ACCESS_TOKEN, API_ENDPOINT } = require("./config");
const { importIssue } = require("./issueModule");
const { createIssuePreset } = require("./createPreset");
const { createFileFolder } = require("./createFilesFolder");

// ============

async function importIssues() {
  try {
    // Fetch the list of issues
    // const allIssues = await fetchIssues();
    const allIssues = [
      {
        year: "2024",
        month: "04",
        issue_number: "6",
      },
      {
        year: "2024",
        month: "03",
        issue_number: "5",
      },
      // {
      //   year: "2024",
      //   month: "02",
      //   issue_number: "4",
      // },
      // {
      //   year: "2023",
      //   month: "12",
      //   issue_number: "3",
      // },
      // {
      //   year: "2023",
      //   month: "11",
      //   issue_number: "2",
      // },
      // {
      //   year: "2023",
      //   month: "10",
      //   issue_number: "1",
      // },
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
          console.log(`Issue #${issue.issue_number}`);

          const issuePreset = await createIssuePreset(
            data.year,
            data.month,
            data.title
          );
          console.log(
            `The ${data.year}-${data.month} Issue Preset created!`,
            issuePreset
          );

          const parentFolder = await createFileFolder({ name: "Issues" });
          const issueFolder = await createFileFolder({
            name: data.title,
            parent: parentFolder.id,
          });

          // Add the issue_number to the data object
          data.issue_number = issue.issue_number;
          data.issue_folder = issueFolder;

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
