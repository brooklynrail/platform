const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const { importImageModule } = require("./importImageModule");
const { sectionsModule } = require("./sectionsModule");
const { contributorsModule } = require("./contributorsModule");
const { articleImagesModule } = require("./articleImagesModule");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
} = require("@directus/sdk");

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
      const sections = await sectionsModule(
        article.articles_slug.old_section_id,
        client
      );
      const contributors = await contributorsModule(
        article.articles_slug.contributors,
        client
      );

      const featured_image = await importImageModule(
        article.articles_slug.featured_image,
        client
      );

      const images = await articleImagesModule(
        article.articles_slug.images,
        client
      );

      const promo_banner = await importImageModule(
        article.articles_slug.promo_banner,
        client
      );

      const promo_thumb = await importImageModule(
        article.articles_slug.promo_thumb,
        client
      );

      const slideshow_image = await importImageModule(
        article.articles_slug.slideshow_image,
        client
      );

      console.log("Article -----");
      console.log(article.articles_slug.title);
      console.log(images);
      console.log(slideshow_image);
      console.log(promo_banner);
      console.log(promo_thumb);

      return {
        ...article,
        articles_slug: {
          ...article.articles_slug,
          sections,
          contributors,
          featured_image,
          images,
          promo_banner,
          promo_thumb,
          slideshow_image,
        },
      };
    })
  );
}

async function importIssue(data) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    if (data) {
      console.log("+++++++++++++++++++++++++++++++");
      console.log(`Importing issue`);

      // Import cover images sequentially
      await importCoverImages(data, client);

      // Import articles sequentially
      const articles = await importArticles(data, client);
      // console.log(articles);

      const newData = {
        ...data,
        articles,
      };

      const createIssue = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems("issues", newData))
      );
      return createIssue;
    }
  } catch (error) {
    console.error("Error creating issue data:", error);
    console.error(error.extensions);

    // Handle the error and write specific data to a text file
    const failedData = `${data.title}\n`;
    const filePath = `sync/errors-issue.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

// Start the import process
importIssue();

module.exports = {
  importIssue,
};
