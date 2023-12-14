require('dotenv').config();
const { importImageModule } = require('./importImageModule');
const { sectionsModule } = require('./sectionsModule');
const { peopleModule } = require('./peopleModule');
const { createDirectus, rest, withToken, createItems, importFile, readItems, readActivity} = require('@directus/sdk');

// const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
// const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;
// const API_ENDPOINT = 'http://localhost:8000';

const BASE_DIRECTUS_URL = 'https://brooklynrail-studio-staging-jy3zptd2sa-wl.a.run.app/';
const BASE_ACCESS_TOKEN = process.env.TOKEN_STAGING;
const API_ENDPOINT = 'https://brooklynrail.org';

// ============

async function importIssue(data) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    
    console.log("+++++++++++++++++++++++++++++++")
    console.log(`Importing issue`);
    if(data){
      
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
        const people = await peopleModule(article.articles_id.people, client);
        const featured_image = await importImageModule(article.articles_id.featured_image, client);
        return {
          ...article,
          Articles_id: {
            ...article.Articles_id,
            sections,
            people,
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
  }
}

// Start the import process
importIssue();

module.exports = {
  importIssue,
};