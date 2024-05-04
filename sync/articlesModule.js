const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN } = require("./config");
const { importImageModule } = require("./importImageModule");
const { sectionsModule } = require("./sectionsModule");
const { contributorsModule } = require("./contributorsModule");
const { articleImagesModule } = require("./articleImagesModule");
const { withToken, createItem, createFileFolder } = require("@directus/sdk");

// Import articles sequentially
async function importArticles(
  articleData,
  existingIssue,
  issue_folder,
  client
) {
  try {
    console.log("====================================");
    console.log("Importing article data: ", articleData.articles_slug.title);
    console.log("\n");

    const sections = await sectionsModule(
      articleData.articles_slug.old_section_id,
      client
    );

    const contributors = await contributorsModule(
      articleData.articles_slug.contributors,
      client
    );

    const issues = [{ issues_id: existingIssue.id }];

    const featured_image = await importImageModule(
      articleData.articles_slug.featured_image,
      issue_folder,
      client
    );

    const images = await articleImagesModule(
      articleData.articles_slug.images,
      issue_folder,
      client
    );

    const promo_banner = await importImageModule(
      articleData.articles_slug.promo_banner,
      issue_folder,
      client
    );

    const promo_thumb = await importImageModule(
      articleData.articles_slug.promo_thumb,
      issue_folder,
      client
    );

    const slideshow_image = await importImageModule(
      articleData.articles_slug.slideshow_image,
      issue_folder,
      client
    );

    // check if there are wrapping <p> tags in the excerpt and remove them
    let excerpt = articleData.articles_slug.excerpt;
    if (excerpt) {
      excerpt = excerpt.replace(/<p>/g, "").replace(/<\/p>/g, "");
    }

    // add the excerpt to the article object
    articleData.articles_slug.excerpt = excerpt;

    const newData = {
      ...articleData.articles_slug,
      sections,
      contributors,
      featured_image,
      images,
      promo_banner,
      promo_thumb,
      slideshow_image,
      issues,
    };

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
    const failedData = `${articleData.articles_slug.title}\n`;
    const filePath = `sync/errors-issue.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  importArticles,
};
