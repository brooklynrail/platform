import { createDirectus, rest, withToken, readItems } from "@directus/sdk";
import { algoliasearch } from "algoliasearch";

const BASE_ACCESS_TOKEN = process.env.TOKEN;
const BASE_DIRECTUS_URL = "https://studio.brooklynrail.org";

const directusClient = createDirectus(BASE_DIRECTUS_URL).with(rest());

async function updateSearch(records) {
  if (!records || typeof records !== "object") {
    console.error("Data is not defined or is not an object:", records);
    return;
  }
  try {
    const appID = "0CHGEIFI8H";
    const apiKey = "11faa68caa470343e6c136306c8214df";
    const client = algoliasearch(appID, apiKey);
    const indexName = "issues";

    // Add records to the index
    // await client.saveObjects(records, {
    //   autoGenerateObjectIDIfNotExist: true,
    // });

    const record = { objectID: "object-1", name: "test record" };
    console.log("records", records);

    records.map(async (record) => {
      const object = {
        objectID: record.id,
        title: record.title,
        year: record.year,
        month: record.month,
        slug: record.slug,
        articles: record.articles,
      };
      await client.saveObject({
        indexName,
        body: object,
      });
    });

    console.log("Data successfully imported to Algolia");
  } catch (error) {
    console.error("Error:", error);
  }
}

const records = await directusClient.request(
  withToken(
    BASE_ACCESS_TOKEN,
    readItems("issues", {
      fields: ["id", "title", "year", "month", "slug"],
      deep: {
        articles: {
          _limit: -1,
        },
      },
    })
  )
);

updateSearch(records);
