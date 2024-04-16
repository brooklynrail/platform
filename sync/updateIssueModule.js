const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const { importImageModule } = require("./importImageModule");
const { sectionsModule } = require("./sectionsModule");
const { contributorsModule } = require("./contributorsModule");
const {
  createDirectus,
  rest,
  withToken,
  readItems,
  updateItems,
} = require("@directus/sdk");

// ============

// Import articles sequentially
async function updateArticles(data, client) {
  return Promise.all(
    data.articles.map(async (article) => {
      console.log("====================================");
      console.log("Updating article data: ", article.articles_slug.title);
      console.log("\n");

      const sections = await sectionsModule(
        article.articles_slug.old_section_id,
        client
      );

      const contributors = await contributorsModule(
        article.articles_slug.contributors,
        client
      );

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
        },
      };
    })
  );
}

async function updateSingleIssue(data, existingIssue) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    if (data) {
      console.log(">>>---------------- - - - -");
      console.log(`Updating issue for ${data.year}-${data.month}`);
      console.log(`Issue #${data.issue_number}`);

      // Import articles sequentially
      const articles = await updateArticles(data, client);
      // console.log(articles);

      const newData = {
        ...data,
        articles,
      };

      const updatedData = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          updateItems("issues", [existingIssue], {
            year: newData.year,
            month: newData.month,
          })
        )
      );
      return updatedData;
    }
  } catch (error) {
    console.error("Error updating issue data:", error);
    console.error(error.extensions);

    // Handle the error and write specific data to a text file
    const failedData = `${data.title}\n`;
    const filePath = `sync/errors-issue.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  updateSingleIssue,
};
