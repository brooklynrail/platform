const fs = require("fs");
const { BASE_ACCESS_TOKEN, API_ENDPOINT } = require("./config");
const { checkForIssue } = require("./issueModule");
const { updateSingleIssue } = require("./updateIssueModule");

// ============

async function updateIssue(year, month) {
  try {
    // Fetch the list of issues
    // https://brooklynrail.org/api/issue-list

    const issueUrl = `${API_ENDPOINT}/${year}/${month}/api`;

    // Fetch data for this issue
    const response = await fetch(issueUrl, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching data for issue ${issue.year}/${issue.month}: HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();

    if (data) {
      const existingIssue = await checkForIssue(data);
      if (existingIssue) {
        console.log(`UpdatingIssue ${data.year}-${data.month}`);
        await updateSingleIssue(data, existingIssue);
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

// get the params that are passed in via the node command in the terminal
// node sync/updateIssue.js 2023/12
const args = process.argv.slice(2);
const [year, month] = args[0].split("/");
// Start the update process
updateIssue(year, month);
