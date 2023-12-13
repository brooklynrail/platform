require('dotenv').config();
const { importImageModule } = require('./importImageModule');
const { createDirectus, rest, withToken, createItems} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;
const API_ENDPOINT = 'http://localhost:8000/api/issues';

async function importImages(data, client) {
  const allCovers = [];
  const coverImages = await Promise.all(data.map(async (cover, index) => {
    // upload the cover image
    if (cover) {
      const imageId = await importImageModule(cover, client);
      // push to the array
      const key = `cover_${index}`;
      allCovers.push({ [key]: imageId });
    }
  }));

  return coverImages;
}


async function createIssues() {
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
        // Add any additional headers if needed
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const data = await response.json();
    
    
    if(data){
      const newData = [];

      // for each issue
      for (let index = 0; index < data.length; index++) {
        const issueData = data[index];
        const issueCovers = issueData.covers;
        // for each cover in the issue
        for (let i = 0; i < issueCovers.length; i++) {
          const coverData = issueCovers[i];
          const key = `cover_${i + 1}`;
          const coverId = await importImageModule(coverData, client);
          // Add the cover image ID directly to the issue data object
          issueData[key] = coverId;
        }
        // Push the updated issue data to the newDataArray
        newData.push(issueData);
      };
      console.log("newData =============");
      console.log(newData);

      // import the issue
      const request = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems('Issues', newData))
      );
      console.log(request);
    }


  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}
createIssues();
