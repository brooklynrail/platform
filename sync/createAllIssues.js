const fs = require("fs");
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const { importIssue } = require("./issueModule");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");
// ============

async function importIssues() {
  try {
    // Fetch the list of issues
    const allIssues = await fetchIssues();
    const selectIssues = [
      {
        title: "APRIL 2024",
        slug: "2024/04",
        year: 2024,
        month: 4,
        issue_number: 231,
        special_issue: false,
        published: "1",
        old_id: 244,
      },
      {
        title: "MARCH 2024",
        slug: "2024/03",
        year: 2024,
        month: 3,
        issue_number: 230,
        special_issue: false,
        published: "1",
        old_id: 243,
      },
      // {
      //   title: "SEPT 2019",
      //   slug: "2019/09",
      //   year: "2019",
      //   month: "9",
      //   issue_number: 183,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "191",
      // },
      {
        title: "River Rail Colby",
        slug: "River_Rail_Colby",
        year: 2019,
        month: 10,
        issue_number: 181,
        special_issue: true,
        published: "1",
        old_id: 194,
      },
      // {
      //   title: "OCT 2019",
      //   slug: "2019/10",
      //   year: "2019",
      //   month: "10",
      //   issue_number: 185,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "193",
      // },
      // {
      //   title: "NOV 2019",
      //   slug: "2019/11",
      //   year: "2019",
      //   month: "11",
      //   issue_number: 186,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "195",
      // },
      // {
      //   title: "APR 2017",
      //   slug: "2017/04",
      //   year: "2017",
      //   month: "4",
      //   issue_number: 156,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "164",
      // },
      // {
      //   title: "MAY 2017",
      //   slug: "2017/05",
      //   year: "2017",
      //   month: "5",
      //   issue_number: 157,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "165",
      // },
      // {
      //   title: "APR 2012",
      //   slug: "2012/04",
      //   year: "2012",
      //   month: "4",
      //   issue_number: 103,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "110",
      // },
      // {
      //   title: "JUNE 2009",
      //   slug: "2009/06",
      //   year: "2009",
      //   month: "6",
      //   issue_number: 74,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "81",
      // },
      // {
      //   title: "DEC 04-JAN 05",
      //   slug: "2005/01",
      //   year: "2005",
      //   month: "1",
      //   issue_number: 29,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "29",
      // },
      // {
      //   title: "DEC 05-JAN 06",
      //   slug: "2005/12",
      //   year: "2005",
      //   month: "12",
      //   issue_number: 39,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "3",
      // },
      // {
      //   title: "I LOVE JOHN GIORNO",
      //   slug: "I_LOVE_JOHN_GIORNO",
      //   year: "2017",
      //   month: "7",
      //   issue_number: 159,
      //   special_issue: true,
      //   published: "1",
      //   old_id: "168",
      // },
      // {
      //   title: "AUTUMN 2002",
      //   slug: "2002/10",
      //   year: "2002",
      //   month: "10",
      //   issue_number: 11,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "49",
      // },
      // {
      //   title: "OCT-NOV 2000",
      //   slug: "2000/10",
      //   year: "2000",
      //   month: "10",
      //   issue_number: 1,
      //   special_issue: false,
      //   published: "1",
      //   old_id: "70",
      // },
    ];
    const existingIssues = await getExistingIssues();

    if (selectIssues && existingIssues) {
      // Iterate over each issue
      for (const issue of selectIssues) {
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

          if (data) {
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

async function getExistingIssues() {
  try {
    console.log("Fetching existing issues...");
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const existingIssues = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readItems("issues", {
          fields: ["id", "slug", "old_id", "issue_number"],
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

// Start the import process
importIssues();
