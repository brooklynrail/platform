require("dotenv").config();
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
const { importImageModule } = require("./importImageModule");

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

    if (data) {
      const newData = [];

      // for each Ad in data
      // import the Image, wait for the response, then add the image ID to the Ad data object as `image`
      // then push the updated Ad data to the newData array
      for (let index = 0; index < data.length; index++) {
        const adData = data[index];
        const ad_image = await importImageModule(adData.tile_image, client);
        newData.push({
          ...adData,
          tile_image: ad_image,
        });
      }

      const request = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems("ads", newData))
      );
      console.log(request);
      console.log(`The Ads import has completed!`);
    }
  } catch (error) {
    console.error("Error creating ads", error);
  }
}

createAds();
