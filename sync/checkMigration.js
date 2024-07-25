require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  BASE_DIRECTUS_URL,
  API_ENDPOINT,
} = require("./config");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");

async function checkMigration() {
  // We are going to go throgh each issue in Directus and count how many articles are in each issue
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  const issues = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readItems("issues", {
        fields: ["title", "year", "month", "slug", "articles"],
        deep: {
          articles: {
            _limit: -1,
          },
        },
      })
    )
  );
  // console.log("issues", issues);
  // for each issue, we are going to count the number of articles
  for (const issue of issues) {
    if (issue.articles.length === 0) {
      continue; // Skip to the next issue
    }
    // ========================
    // OLD ISSUE API
    const issueAPI =
      issue.special_issue === true
        ? `${API_ENDPOINT}/special/${issue.slug}/api`
        : `${API_ENDPOINT}/${issue.year}/${issue.month}/api`;

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
    const oldIssueData = await response.json();

    // ========================

    console.log("===================");
    console.log(issue.title);
    console.log("Old Articles: ", oldIssueData.articles.length);
    console.log("New Articles: ", issue.articles.length);
  }
}

checkMigration();
