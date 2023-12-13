const fetch = require('isomorphic-fetch');
const { createDirectus, rest, withToken, createItems, readItems, readActivity} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;
const API_ENDPOINT = 'http://localhost:8000';

async function isSection(old_section_id, client) {
  try {
    const section = await client.request(
      withToken(BASE_ACCESS_TOKEN, readItems('section', {
        "filter": {
          "old_id": {
            "_eq": old_section_id
          }
        }
      }))
    );
    if(section.length == 0){
      console.log('Error fetching section:');
      return;
    }
    return section[0].id;
  } catch (error){
    console.error('Error fetching section:', error.message);
  }
}

// ============

async function isPeople(peopleIds, client) {
  try {
    const existingPeople = [];
    // Function to check if a person with a given ID exists in Directus
    const checkPersonExists = async (personId, client) => {
      const person = await client.request(
        withToken(BASE_ACCESS_TOKEN, readItems('people', {
          "filter": {
            "old_id": {
              "_eq": personId
            }
          }
        }))
      );

      return person.length > 0 ? person[0].id : null;
    };

    // Iterate over each personId and check if it exists in Directus
    for (const personId of peopleIds) {
      const existingPersonId = await checkPersonExists(personId, client);
      if (existingPersonId) {
        existingPeople.push({ people_id: existingPersonId });
      }
    }

    if(existingPeople.length == 0){
      console.log('Error fetching existingPeople');
      return;
    }
    return existingPeople;
   
  } catch (error){
    console.error('Error fetching person:', error.message);
  }
}

// ============

async function importIssues(issues) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    // Fetch the list of issues
    const issues = await fetchIssues();
    // Iterate over each issue
    for (const issue of issues) {
      const issueUrl = `${API_ENDPOINT}/${issue.year}/${issue.month}/api`;

      console.log("------------------- - - - -")
      console.log(`Importing issue for ${issue.year}-${issue.month}`);

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
      
      const articles = await Promise.all(data.article.map(async (article) => {
        const section = await isSection(article.article_id.old_section_id, client);
        const people = await isPeople(article.article_id.people, client);
        return {
          ...article,
          article_id: {
            ...article.article_id,
            section,
            people,
          },
        };
      }));
      
      const newData = await {
        ...data,
        article: articles,
      };

      const createIssue = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems('issue', newData))
      );
      
      console.log(`Import for ${issue.year}-${issue.month} completed successfully`);
      console.log(createIssue);
    }
    console.log('Full import completed successfully.');

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
