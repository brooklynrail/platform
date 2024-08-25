const fs = require("fs");
require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const { importArticles } = require("./articlesModule");
const { createIssuePreset } = require("./createPreset");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");
const { createFileFolder } = require("./createFilesFolder");

// Create all the articles for each issue
async function createArticles() {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    const mainIssuesFolder = await createFileFolder({ name: "Issues" });

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
      if (issue.year !== 2017 || (issue.year === 2024 && issue.month === 7)) {
        console.log(`Skipping Issue ${issue.year}-${issue.month} for now!`);
        continue; // Skip to the next issue
      }

      // if (issue.year !== 2023 || issue.month !== 6) {
      //   console.log(`Skipping Issue ${issue.year}-${issue.month} for now!`);
      //   continue; // Skip to the next issue
      // }

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
          console.log("\n\n====================================");
          console.log("Updating:", issue.title);

          await createIssuePreset(
            issueData.year,
            issueData.month,
            issueData.title,
            existingIssue.issue_number
          );

          // Create issueFolder for FILES
          let issueFolder;
          issueFolder = await createFileFolder({
            name: issueData.title,
            parent: mainIssuesFolder.id,
          });

          // Import articles sequentially
          // loop through all the articles
          for await (const articleData of issueData.articles) {
            // Create a folder to store all the article files
            let articles_folder;
            articles_folder = await createFileFolder({
              name: "Articles",
              parent: issueFolder.id,
            });

            await importArticles(
              articleData,
              existingIssue,
              articles_folder,
              client
            );
          }

          const thisIssue = await getThisIssue(issueData);
          const memoryUsage = process.memoryUsage();
          console.log(`====================================`);
          console.log(issueData.title, " completed!");
          console.log("Old Articles: ", issueData.articles.length);
          console.log("New Articles: ", thisIssue[0].articles.length);
          console.log(``);
          console.log(`Memory Usage: ${memoryUsage.heapUsed / 1024 / 1024} MB`);
          console.log(`====================================`);

          const articlesCount = `===========\n${issueData.title}\nNew: ${thisIssue[0].articles.length}\nOld: ${issueData.articles.length}\n`;
          const migrationfilePath = `sync/migration-check.txt`;

          // Write the error data to the text file
          fs.appendFileSync(migrationfilePath, articlesCount, "utf-8");
        }
      }
    }
  } catch (error) {
    console.error(
      "Error fetching creating article data for each issue:",
      error
    );
  }
}
createArticles();

async function getExistingIssues() {
  try {
    console.log("Fetching existing issues...");
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const existingIssues = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readItems("issues", {
          fields: ["id", "title", "slug", "old_id", "issue_number", "articles"],
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
async function getThisIssue(issueData) {
  try {
    // console.log("Fetching this issue...", issueData);
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const issue = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readItems("issues", {
          fields: ["title", "year", "month", "slug", "articles", "old_id"],
          filter: {
            year: { _eq: issueData.year },
            month: { _eq: issueData.month },
          },
          deep: {
            articles: {
              _limit: -1,
            },
          },
        })
      )
    );

    return issue;
  } catch (error) {
    console.error("Error fetching this issue:", error.message);
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
