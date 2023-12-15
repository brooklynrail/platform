const fs = require('fs');
require('dotenv').config();
const { importImageModule } = require('./importImageModule');
const { sectionsModule } = require('./sectionsModule');
const { contributorsModule } = require('./contributorsModule');
const { createDirectus, rest, withToken, createItems} = require('@directus/sdk');

// const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
// const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;

const BASE_DIRECTUS_URL = 'https://brooklynrail-studio-staging-jy3zptd2sa-wl.a.run.app/';
const BASE_ACCESS_TOKEN = process.env.TOKEN_STAGING;

// ============

async function importIssue(data) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    if(data){

      console.log("+++++++++++++++++++++++++++++++")
      console.log(`Importing issue`);
      
      // Add the Cover Images directly to `data`
      // for each cover in the issue
      for (let i = 0; i < data.covers.length; i++) {
        const coverData = data.covers[i];
        const key = `cover_${i + 1}`;
        const coverId = await importImageModule(coverData, client);
        // Add the cover image ID directly to the issue data object
        data[key] = coverId;
      }

      // Add the Articles for this issue
      const articles = await Promise.all(data.articles.map(async (article) => {
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
      }));
      console.log(articles);

      const newData = await {
        ...data,
        articles: articles,
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