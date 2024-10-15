require("dotenv").config();
const fs = require("fs");
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
  readItems,
} = require("@directus/sdk");
const { importImageModule } = require("./importImageModule");
const { createFileFolder } = require("./createFilesFolder");

async function createPeople() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const response = await fetch(`https://brooklynrail.org/people/index.json`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const mainPeopleFolder = await createFileFolder({ name: "People" });

    const allPeople = await response.json();

    if (allPeople) {
      for await (const personData of allPeople) {
        const old_slug = personData.slug;

        const checkPersonExists = async (old_slug, client) => {
          const articles = await client.request(
            withToken(
              BASE_ACCESS_TOKEN,
              readItems("people", {
                filter: { slug: { _eq: old_slug } },
              })
            )
          );

          return articles.length > 0 ? true : false;
        };

        const personExists = await checkPersonExists(old_slug, client);
        if (personExists) {
          console.log(
            `Person ${personData.display_name} ${personData.slug} already exists! Skipping...`
          );
          // skip to the next person

          continue;
        }

        let portrait;
        if (personData.portrait !== null) {
          portrait = await importImageModule(
            personData.portrait,
            mainPeopleFolder,
            client
          );
        }

        personData.status = "published";

        if (personData.first_name === null) {
          continue;
        }

        const newData = {
          ...personData,
          portrait,
        };

        // // Create the person in Directus
        const person = await client.request(
          withToken(BASE_ACCESS_TOKEN, createItems("people", newData))
        );
        if (!person) {
          throw new Error(`Error creating person: ${personData}`);
        }
        console.log(`Person ${person.first_name} ${person.last_name} created!`);
      }
    }
  } catch (error) {
    console.error("Error creating person", error);
    const failedData = `${error.message}\n`;
    const filePath = `sync/errors-contributors.txt`;
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

createPeople();
