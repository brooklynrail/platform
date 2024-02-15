require("dotenv").config();
const { importImageModule } = require("./importImageModule");
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
} = require("@directus/sdk");

async function createAds() {
  try {
    console.log("+++++++++++++++++++++++++++++++");
    console.log(`Importing Ads`);
    const response = await fetch(`${API_ENDPOINT}/api/ads`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const data = await response.json();

    const newData = [];

    // for each Ad
    for (let index = 0; index < data.length; index++) {
      const adData = data[index];
      const key = `ad_${index + 1}`;
      const imageId = await importImageModule(adData, client);
      adData[key] = imageId;
      // Push the updated Ad data to the newData Array
      newData.push(adData);
    }

    const ads = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItems("ads", newData))
    );
    console.log(ads);
    console.log(`The Ads import has completed!`);
  } catch (error) {
    console.error("Error creating ads", error);
  }
}

createAds();
