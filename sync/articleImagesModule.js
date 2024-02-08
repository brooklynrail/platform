const fs = require("fs");
require("dotenv").config();
const { importImageModule } = require("./importImageModule");

async function articleImagesModule(articleImagesIds, client) {
  try {
    const images = [];

    // Iterate over each personId and check if it exists in Directus
    for (const articleImageData of articleImagesIds) {
      const imageId = await importImageModule(articleImageData, client);
      if (imageId) {
        images.push({ directus_files_id: imageId });
      }
    }

    if (images.length != 0) {
      return images;
    }
  } catch (error) {
    console.error("Error uploading image:", error.message);

    // Handle the error and write specific data to a text file
    const failedData = `${articleImagesIds}\n`;
    const filePath = `sync/errors-images.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  articleImagesModule,
};
