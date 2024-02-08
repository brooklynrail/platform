require('dotenv').config();
const { BASE_ACCESS_TOKEN, API_ENDPOINT, BASE_DIRECTUS_URL } = require('./config');
const { createDirectus, rest, withToken, createItems} = require('@directus/sdk');

async function createSections() {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/sections`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const sections = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItems('sections', data))
    );
    console.log(sections);

  } catch (error){
    console.error("Error creating section", error.message);
  }
}

createSections();