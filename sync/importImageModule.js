// importImage.js
const fs = require('fs');
const { importFile} = require('@directus/sdk');

async function importImageModule(data, client) {
  // takes the query string out of the URL
  function getPathFromUrl(url) {
    return url.split("?")[0];
  }
  
  try {
    if(data && data.path){
      
      // Local imports
      const path = getPathFromUrl(`https://storage.googleapis.com/rail-legacy-media/production${data.path}`);
      // Staging and Production imports
      // const path = getPathFromUrl(`${data.path}`);
      const description = data.description;

      console.log("importing image -----------");
      console.log(`Image: ${path}`);
      const result = await client.request(
        importFile(path, {
          description: description || null,
        })
      );
      if(result){
        console.log("uploaded image ------>");
        console.log(result);
        // return the ID of the file that was just uploaded
        return result.id;
      }
    }
  } catch (error){
    console.error('Error uploading image:', error.message);

    // Handle the error and write specific data to a text file
    const failedData = `${path}\n`;
    const filePath = `errors-images.txt`;

    // Write the error data to the text file
    fs.writeFileSync(filePath, failedData, 'utf-8');
  }
}


module.exports = {
  importImageModule,
};
