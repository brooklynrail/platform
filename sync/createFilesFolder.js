require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createFolder,
  readFolders,
} = require("@directus/sdk");

async function checkFolder(folderData, client) {
  const listFolders = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readFolders({
        fields: ["*"],
      })
    )
  );

  if (folderData.name === "Issues") {
    // Check in listFolders if folder exists by comparing folderData.name
    const folder = listFolders.find((item) => item.name === folderData.name);
    return folder;
  }

  // Check in listFolders if folder exists by comparing folderData.name and folderData.parent
  const folder = listFolders.find(
    (item) => item.name === folderData.name && item.parent === folderData.parent
  );

  if (folder) {
    return folder;
  } else {
    return null;
  }
}

async function createFileFolder(folderData) {
  const folderName = folderData.name;

  // console.log(`📁 Creating "${folderName}" folder`, folderData);

  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

  // Check if folder exists
  const existingFolder = await checkFolder(folderData, client);

  if (!existingFolder) {
    const newFolder = await client.request(
      withToken(BASE_ACCESS_TOKEN, createFolder(folderData))
    );
    // console.log("Folder created: ", newFolder);
    return newFolder;
  } else {
    // console.log("Folder already exists");
    return existingFolder;
  }
}

module.exports = {
  createFileFolder,
};
