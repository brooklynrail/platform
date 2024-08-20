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
    const old_id = articleData.old_id;

    const checkArticleExists = async (old_id, client) => {
      const articles = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          readItems("articles", {
            filter: { old_id: { _eq: old_id } },
          })
        )
      );

      return articles.length > 0 ? true : false;
    };

    const articleExists = await checkArticleExists(old_id, client);
    if (articleExists) {
      // console.log(`Article ${articleData.title} already exists! Skipping...`);
      return;
    }

    console.log("=====");
    console.log(existingIssue.title);
    console.log(`#${articleData.sort} | ${articleData.title}`);

    const section = await sectionsModule(articleData.old_section_id, client);

    const contributors = await contributorsModule(
      articleData.contributors,
      client
    );

    const issue = { id: existingIssue.id };

    let images;
    if (articleData.images !== null) {
      images = await articleImagesModule(
        articleData.images,
        articles_folder,
        client
      );
    }

    const promo_banner = await importImageModule(
      articleData.promo_banner,
      articles_folder,
      client
    );

    const promo_thumb = await importImageModule(
      articleData.promo_thumb,
      articles_folder,
      client
    );

    const slideshow_image = await importImageModule(
      articleData.slideshow_image,
      articles_folder,
      client
    );

    let featured_image;
    if (articleData.featured_image !== null) {
      featured_image = await importImageModule(
        articleData.featured_image,
        articles_folder,
        client
      );
    }

    // check if there are wrapping <p> tags in the excerpt and remove them
    let excerpt = articleData.excerpt;
    if (excerpt) {
      excerpt = excerpt.replace(/<p>/g, "").replace(/<\/p>/g, "");
    }

    // add the excerpt to the article object
    articleData.excerpt = excerpt;

    // remove the body_code from the articleData.articles_slug object
    delete articleData.body_code;

    const newData = {
      ...articleData,
      section,
      contributors,
      featured_image,
      images,
      promo_banner,
      promo_thumb,
      slideshow_image,
      issue,
    };

    // // Create the new article in Directus
    const newarticle = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItem("articles", newData))
    );

    // console.log("Article import completed!", newarticle);
  } catch (error) {
    console.error(
      `Error importing article data for ${articleData.title}:`,
      error
    );

    // Handle the error and write specific data to a text file
    const failedData = `${existingIssue.title} | ${articleData.title}\n`;
    const filePath = `sync/errors-articles.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  importArticles,
};
