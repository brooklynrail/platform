require("dotenv").config();
const { BASE_ACCESS_TOKEN, API_ENDPOINT } = require("./config");
const { importIssue, checkForIssue } = require("./issueModule");

// Create a single issue
async function importSingleIssue(slug) {
  try {
    if (slug) {
      const [year, month] = slug.split("/");
      // get the issue data from the API
      const response = await fetch(`${API_ENDPOINT}/${year}/${month}/api`, {
        headers: {
          Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
          // Add any additional headers if needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        const existingIssue = await checkForIssue(data);
        if (existingIssue) {
          console.log(`Issue ${data.year}-${data.month} already exists!`);
        } else {
          const issueData = await importIssue(data);
          console.log(`The ${data.year}-${data.month} Issue import completed!`);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

// Access command line arguments
const args = process.argv.slice(2);

// Use the first argument as the slug
const slug = args[0];

importSingleIssue(slug);
