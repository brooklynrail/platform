const fs = require('fs');
require('dotenv').config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require('./config');
const { importImageModule } = require('./importImageModule');
const { sectionsModule } = require('./sectionsModule');
const { contributorsModule } = require('./contributorsModule');
const { createDirectus, rest, withToken, createItems} = require('@directus/sdk');

// ============

// Import cover images sequentially
async function importCoverImages(data, client) {
  for (let i = 0; i < data.covers.length; i++) {
    const coverData = data.covers[i];
    const key = `cover_${i + 1}`;
    const coverId = await importImageModule(coverData, client);
    data[key] = coverId;
  }
}

// Import articles sequentially
async function importArticles(data, client) {
  return Promise.all(
    data.articles.map(async (article) => {
      const sections = await sectionsModule(article.articles_id.old_section_id, client);
      const contributors = await contributorsModule(article.articles_id.contributors, client);
      const featured_image = await importImageModule(article.articles_id.featured_image, client);
      return {
        ...article,
        articles_id: {
          ...article.articles_id,
          sections,
          contributors,
          featured_image,
        },
      };
    })
  );
}

async function importIssue(data) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    if (data) {
      console.log('+++++++++++++++++++++++++++++++');
      console.log(`Importing issue`);

      // Import cover images sequentially
      await importCoverImages(data, client);

      // Import articles sequentially
      const articles = await importArticles(data, client);
      console.log(articles);

      const newData = {
        ...data,
        articles,
      };

      const createIssue = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems('issues', newData))
      );
      return createIssue;
    }
  } catch (error) {
    console.error('Error creating issue data:', error);
    console.error(error.extensions);

    // Handle the error and write specific data to a text file
    const failedData = `${data.title}\n`;
    const filePath = `sync/errors-issue.txt`;

    // Write the error data to the text file
    fs.writeFileSync(filePath, failedData, 'utf-8');
  }
}

// Start the import process
importIssue();

module.exports = {
  importIssue,
};