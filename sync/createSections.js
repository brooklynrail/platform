require('dotenv').config();
const { createDirectus, rest, withToken, createItems, readItems, readActivity} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKENLOCAL;
const API_ENDPOINT = 'http://localhost:8000/api/sections';

async function createSections() {
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const sections = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItems('Sections', data))
    );
    console.log(sections);

  } catch (error){
    console.error("Error creating section", error.message);
  }
}

createSections();