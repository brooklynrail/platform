// importImage.js
const fs = require("fs");
const { BASE_ACCESS_TOKEN } = require("./config");
const { withToken, importFile, readFiles, readFile } = require("@directus/sdk");

async function importImageModule(data, issue_folder, client) {
  try {
    if (data && data.path) {
      let existingImageId;
      existingImageId = await checkForImage(data, client);
      if (existingImageId) {
        console.log(`Image ${data.path} already exists!`);
        return existingImageId;
      } else {
        console.log(`Uploading image: ${data.path}`);
        // Import the image
        // FULL path to Cloud Storage files
        // const path = `https://storage.googleapis.com/rail-legacy-media/production${data.path}`;
        const path = `https://brooklynrail.org${data.path}`;
        console.log("path=====", path);
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

// check to see if image already exists in Directus
// if it does, return the ID of the existing image
async function checkForImage(data, client) {
  const old_path = data.path;
  // get the filename from old_path
  const old_filename = old_path.split("/").pop();

  const image = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readFiles({
        fields: ["id", "old_path", "filename_download"],
        filter: {
          old_path: { _eq: old_path },
        },
        // filter: {
        //   _or: [
        //     { old_path: { _eq: old_path } },
        //     { filename_download: { _eq: old_filename } },
        //   ],
        // },
      })
    )
  );

  return image.length > 0 ? image[0].id : null;
}

module.exports = {
  importImageModule,
  checkForImage,
};
