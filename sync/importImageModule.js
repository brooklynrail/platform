// importImage.js
const { createDirectus, rest, withToken, createItems, importFile} = require('@directus/sdk');
// const { importImage } = require('./path/to/your/importImageModule'); // Replace with the actual path

async function importImageModule(data, client) {
  // takes the query string out of the URL
  function getPathFromUrl(url) {
    return url.split("?")[0];
  }
  
  try {
    if(data && data.path){
      console.log("importing image -----------");
      // Local imports
      const path = getPathFromUrl(`https://storage.googleapis.com/rail-legacy-media/production${data.path}`);
      // Staging and Production imports
      // const path = getPathFromUrl(`${data.path}`);
      console.log(`Image: ${path}`);
      const description = data.description;

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
  }
}


module.exports = {
  importImageModule,
};
