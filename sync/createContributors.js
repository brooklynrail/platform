require('dotenv').config();
const { BASE_ACCESS_TOKEN, API_ENDPOINT, BASE_DIRECTUS_URL } = require('./config');
const { createDirectus, rest, withToken, createItems} = require('@directus/sdk');

async function createContributors() {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/contributors`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const contributors = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItems('contributors', data))
    );
    console.log(contributors);

  } catch (error){
    console.error("Error creating contributors", error.message);
  }
}

createContributors();