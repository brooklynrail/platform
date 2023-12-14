const { createDirectus, rest, withToken, createItems, readItems, readActivity} = require('@directus/sdk');
const { importIssue } = require('./issueModule');
const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;
const API_ENDPOINT = 'http://localhost:8000';

// ============

async function importIssues() {
  try {
    // Fetch the list of issues
    const allIssues = await fetchIssues();
    
    if(allIssues){
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
          console.error(`Error fetching data for issue ${issue.year}/${issue.month}: HTTP error! Status: ${response.status}`);
          continue; // Skip to the next issue
        }

        const data = await response.json();
        
        if(data){
          console.log(">>>---------------- - - - -");
          console.log(`Importing issue for ${issue.year}-${issue.month}`);
          const issueData = await importIssue(data);
          console.log(`The ${issue.year}-${issue.month} Issue import completed!`);
          console.log(issueData);
        }
      }
    }
  } catch (error) {
    console.error('Error creating issue data:', error);
    console.error(error.extensions);
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
    console.error('Error fetching issues:', error.message);
    throw error; // Propagate the error
  }
}

// Start the import process
importIssues();
