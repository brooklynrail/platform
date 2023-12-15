// importImage.js
const fs = require('fs');
const { BASE_ACCESS_TOKEN} = require('./config');
const {withToken, importFile} = require('@directus/sdk');

async function importImageModule(data, client) {
  try {
    if(data && data.path){
      
      // FULL path to Cloud Storage files
      const path = `https://storage.googleapis.com/rail-legacy-media/production${data.path}`;
      // Local, relative paths
      // const path = `${data.path}`;
      const description = data.description;

      console.log("importing image -----------");
      console.log(`Image: ${path}`);
      const result = await client.request(
        withToken(BASE_ACCESS_TOKEN, importFile(path, {
          description: description || null,
        }))
      );
      
      // return the ID of the file that was just uploaded
      if(result){
        console.log("uploaded image ------>");
        // console.log(result);
        return result.id;
      }

    }
  } catch (error){
    console.error('Error uploading image:', error.message);

    // Handle the error and write specific data to a text file
    const failedData = `${data.path}\n`;
    const filePath = `sync/errors-images.txt`;

    // Write the error data to the text file
    fs.writeFileSync(filePath, failedData, 'utf-8');
  }
}


module.exports = {
  importImageModule,
};
