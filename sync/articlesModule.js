const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN } = require("./config");
const { importImageModule } = require("./importImageModule");
const { sectionsModule } = require("./sectionsModule");
const { contributorsModule } = require("./contributorsModule");
const { articleImagesModule } = require("./articleImagesModule");
const { withToken, createItem, readItems } = require("@directus/sdk");

// Import articles sequentially
async function importArticles(
  articleData,
  existingIssue,
  articles_folder,
  client
) {
  try {
    // Check to see if the article already exists in Directus
    const old_id = articleData.articles_slug.old_id;

    const checkArticleExists = async (old_id, client) => {
      const articles = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          readItems("articles", {
            filter: {
              old_id: {
                _eq: old_id,
              },
            },
          })
        )
      );
      return articles.length > 0 ? true : false;
    };

    const articleExists = await checkArticleExists(old_id, client);
    if (articleExists) {
      console.log(
        `Article ${articleData.articles_slug.title} already exists! Skipping...`
      );
      return;
    }

    console.log("====================================");
    console.log("Importing article data: ", articleData.articles_slug.title);
    console.log("\n");

    const section = await sectionsModule(
      articleData.articles_slug.old_section_id,
      client
    );

    const contributors = await contributorsModule(
      articleData.articles_slug.contributors,
      client
    );

    const issue = { id: existingIssue.id };

    let images;
    if (articleData.articles_slug.images !== null) {
      images = await articleImagesModule(
        articleData.articles_slug.images,
        articles_folder,
        client
      );
    }

    const promo_banner = await importImageModule(
      articleData.articles_slug.promo_banner,
      articles_folder,
      client
    );

    const promo_thumb = await importImageModule(
      articleData.articles_slug.promo_thumb,
      articles_folder,
      client
    );

    const slideshow_image = await importImageModule(
      articleData.articles_slug.slideshow_image,
      articles_folder,
      client
    );

    let featured_image;
    if (articleData.articles_slug.featured_image !== null) {
      featured_image = await importImageModule(
        articleData.articles_slug.featured_image,
        articles_folder,
        client
      );
    }

    // check if there are wrapping <p> tags in the excerpt and remove them
    let excerpt = articleData.articles_slug.excerpt;
    if (excerpt) {
      excerpt = excerpt.replace(/<p>/g, "").replace(/<\/p>/g, "");
    }

    // add the excerpt to the article object
    articleData.articles_slug.excerpt = excerpt;

    const newData = {
      ...articleData.articles_slug,
      section,
      contributors,
      featured_image,
      images,
      promo_banner,
      promo_thumb,
      slideshow_image,
      issue,
    };

    console.log("newData ===========================", newData);

    // console.log("New article data: ", newData);

    // // Create the new article in Directus
    const newarticle = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItem("articles", newData))
    );

    console.log("Article import completed!", newarticle);
  } catch (error) {
    console.error(
      `Error importing article data for ${articleData.articles_slug.title}:`,
      error.message
    );

    // Handle the error and write specific data to a text file
    const failedData = `${existingIssue.title} | ${articleData.articles_slug.title}\n`;
    const filePath = `sync/errors-articles.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  importArticles,
};
