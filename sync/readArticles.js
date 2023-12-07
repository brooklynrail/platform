require('dotenv').config();
// import { createDirectus, rest, readItems } from '@directus/sdk';
const { createDirectus, rest, withToken, readItems} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKENLOCAL;

async function readArticles() {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  
  const request = await client.request(
    withToken(BASE_ACCESS_TOKEN, readItems('article'))
  );

  console.log(request);
}

readArticles();
