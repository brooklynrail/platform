require("dotenv").config();
const fs = require("fs");
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
  readItems,
} = require("@directus/sdk");
const { sectionsModule } = require("./sectionsModule");

async function createEvents() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const response = await fetch(`https://brooklynrail.org/events/index.json`, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const allEvents = await response.json();

    if (allEvents) {
      for await (const eventData of allEvents.items) {
        const old_slug = eventData.slug;
        console.log("eventData ========", eventData);

        const checkEventExists = async (old_slug, client) => {
          const events = await client.request(
            withToken(
              BASE_ACCESS_TOKEN,
              readItems("events", {
                filter: { slug: { _eq: old_slug } },
              })
            )
          );

          return events.length > 0 ? true : false;
        };

        const eventExists = await checkEventExists(old_slug, client);
        if (eventExists) {
          console.log(
            `Event ${eventData.title} ${eventData.slug} already exists! Skipping...`
          );
          continue;
        }

        const getPerson = async (slug, client) => {
          const person = await client.request(
            withToken(
              BASE_ACCESS_TOKEN,
              readItems("people", {
                filter: { slug: { _eq: slug } },
              })
            )
          );

          return person;
        };

        // loop through event.people
        const people = [];
        if (eventData.people != null) {
          for await (const studioPerson of eventData.people) {
            const personData = await getPerson(studioPerson.person, client);
            if (personData.length > 0) {
              people.push({ people_id: personData[0].id });
            }
          }
        }

        // loop through event.poets
        const poets = [];
        if (eventData.poets || eventData.poets != null) {
          for await (const studioPerson of eventData.poets) {
            const personData = await getPerson(studioPerson.slug, client);
            if (personData.length > 0) {
              poets.push({ people_id: personData[0].id });
            }
          }
        }

        console.log("eventData.collections[0]", eventData.collections[0]);
        const section = await sectionsModule(eventData.collections[0], client);

        // rename the content field to body
        eventData.body = eventData.content;

        eventData.status = "published";

        const newData = {
          ...eventData,
          section,
          people,
          poets,
        };

        console.log("newData", newData);

        // Create the event in Directus
        const event = await client.request(
          withToken(BASE_ACCESS_TOKEN, createItems("events", newData))
        );
        if (!event) {
          throw new Error(`Error creating Event: ${eventData.title}`);
        }
        console.log(`Event: ${event.title} ${event.slug} created!`);
      }
    }
  } catch (error) {
    console.error("Error creating event", error);
    const failedData = `${error.message}\n`;
    const filePath = `sync/errors-events.txt`;
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

createEvents();
