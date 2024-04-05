require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createFolder,
  readFolders,
} = require("@directus/sdk");

async function checkFolder(folderName, client) {
  const listFolders = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readFolders({
        fields: ["*"],
      })
    )
  );

  const folder = listFolders.find((folder) => folder.name === folderName);
  if (folder) {
    return folder;
  } else {
    return null;
  }
}

async function createFileFolder(folderData) {
  console.log("Creating Folder", folderData);

  const folderName = folderData.name;
  console.log("+++++++++++++++++++++++++++++++");
  console.log(`Creating "${folderName}" folder`);

  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

  // Check if folder exists
  const existingFolder = await checkFolder(folderName, client);

  if (!existingFolder) {
    const newFolder = await client.request(
      withToken(BASE_ACCESS_TOKEN, createFolder(folderData))
    );
    console.log("Folder created: ", newFolder);
    return newFolder;
  } else {
    console.log("Folder already exists");
    return existingFolder;
  }
}

module.exports = {
  createFileFolder,
};
