require('dotenv').config();
const { createDirectus, rest, withToken, deleteItems} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKENLOCAL;
const API_ENDPOINT = 'http://localhost:8000/api/issues';

async function deleteIssues() {
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const issues = await client.request(
      withToken(BASE_ACCESS_TOKEN, deleteItems('issue', {
        "filter": {
          "issue_number": {
            "_neq": "300"
          }
        }
      })
      )
    );
    const articles = await client.request(
      withToken(BASE_ACCESS_TOKEN, deleteItems('article', {
        "filter": {
          "title": {
            "_ncontains": "Juniper"
          }
        }
      })
      )
    );
    
    console.log(issues);
    console.log(articles);

  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}
deleteIssues();
