require('dotenv').config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require('./config');
const { createDirectus, rest, withToken, readItems} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;

async function readIssues() {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

  const request = await client.request(
    withToken(BASE_ACCESS_TOKEN, readItems('Issues')
    )
  );

  console.log(request);
}

readIssues();
