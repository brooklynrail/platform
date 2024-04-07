// importImage.js
const fs = require("fs");
const { BASE_ACCESS_TOKEN } = require("./config");
const { withToken, importFile } = require("@directus/sdk");

async function importImageModule(data, issue_folder, client) {
  try {
    if (data && data.path) {
      // FULL path to Cloud Storage files
      const path = `https://storage.googleapis.com/rail-legacy-media/production${data.path}`;
      // Local, relative paths
      // const path = `http://localhost:8000${data.path}`;
      const description = data.description;
      const caption = data.caption;
      const shortcode_key = data.shortcode_key;
      const old_path = data.old_path;
      const tags = data.tags;
      const folder = issue_folder.id;

      const result = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          importFile(path, {
            description: description || null,
            caption: caption || null,
            shortcode_key: shortcode_key || null,
            old_path: old_path || null,
            tags: tags || null,
            folder: folder || null,
          })
        )
      );

      // return the ID of the file that was just uploaded
      if (result) {
        console.log("Image uploaded --->", data.path);
        // console.log(result);
        return result.id;
      }
    }
  } catch (error) {
    console.error("Error uploading single image:", error);

    // Handle the error and write specific data to a text file
    const failedData = `${data.path}\n`;
    const filePath = `sync/errors-images.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  importImageModule,
};
