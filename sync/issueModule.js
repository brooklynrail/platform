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
  const issue_folder = data.issue_folder;
  for (let i = 0; i < data.covers.length; i++) {
    const coverData = data.covers[i];
    const key = `cover_${i + 1}`;
    const coverId = await importImageModule(coverData, issue_folder, client);
    data[key] = coverId;
  }
}

// Import articles sequentially
async function importArticles(data, client) {
  const issue_folder = data.issue_folder;
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
        issue_folder,
        client
      );

      const images = await articleImagesModule(
        article.articles_slug.images,
        issue_folder,
        client
      );

      const promo_banner = await importImageModule(
        article.articles_slug.promo_banner,
        issue_folder,
        client
      );

      const promo_thumb = await importImageModule(
        article.articles_slug.promo_thumb,
        issue_folder,
        client
      );

      const slideshow_image = await importImageModule(
        article.articles_slug.slideshow_image,
        issue_folder,
        client
      );

      console.log("Article -----");
      console.log(article.articles_slug.title);
      console.log(images);
      console.log(slideshow_image);
      console.log(promo_banner);
      console.log(promo_thumb);
      console.log(article.excerpt);

      // check if there are wrapping <p> tags in the excerpt and remove them
      let excerpt = article.articles_slug.excerpt;
      if (excerpt) {
        excerpt = excerpt.replace(/<p>/g, "").replace(/<\/p>/g, "");
      }
      // add the excerpt to the article object
      article.articles_slug.excerpt = excerpt;

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
      console.log(">>>---------------- - - - -");
      console.log(`Importing issue for ${issue.year}-${issue.month}`);
      console.log(`Issue #${issue.issue_number}`);

      const issuePreset = await createIssuePreset(
        data.year,
        data.month,
        data.title
      );
      console.log(
        `The ${data.year}-${data.month} Issue Preset created!`,
        issuePreset
      );

      const parentFolder = await createFileFolder({ name: "Issues" });
      const issueFolder = await createFileFolder({
        name: data.title,
        parent: parentFolder.id,
      });

      // Add the issue_number to the data object
      data.issue_number = issue.issue_number;
      data.issue_folder = issueFolder;

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
