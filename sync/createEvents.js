require("dotenv").config();
const fs = require("fs");
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createItems,
  createItem,
  readItems,
  updateItem,
} = require("@directus/sdk");
const { importImageModule } = require("./importImageModule");
const { createFileFolder } = require("./createFilesFolder");

async function createEvents() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    // const API_ENDPOINT = "https://brooklynrail.org/events/index.json";
    const API_ENDPOINT = "http://127.0.0.1:1313/events/index.json";
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let events_folder;
    issue_folder = await createFileFolder({
      name: "Events",
    });
    const allEvents = await response.json();

    if (allEvents) {
      for await (const eventData of allEvents.items) {
        const old_slug = eventData.slug;

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
                fields: ["id", "slug"],
                filter: { slug: { _eq: slug } },
              })
            )
          );

          return person;
        };

        const getOrganization = async (slug, client) => {
          const org = await client.request(
            withToken(
              BASE_ACCESS_TOKEN,
              readItems("organizations", {
                filter: { slug: { _eq: slug } },
              })
            )
          );

          return org;
        };

        // loop through event.people
        const people = [];

        if (eventData.people || eventData.people != null) {
          for await (const eventPerson of eventData.people) {
            // format the data to match the people table
            const personData = await getPerson(eventPerson.person, client);
            if (personData.length > 0) {
              people.push({ people_id: personData[0].id });
            }
            // Related links for each person
            // If eventPerson.related_links is not null or is not an empty array
            // then add them to the People record in Directus
            if (
              eventPerson.related_links &&
              eventPerson.related_links.length > 0
            ) {
              const relatedLinks = eventPerson.related_links;

              // Add the related links to the people record
              await client.request(
                withToken(
                  BASE_ACCESS_TOKEN,
                  updateItem("people", personData[0].id, {
                    related_links: relatedLinks,
                  })
                )
              );
            }
          }
        }

        // loop through event.poets
        const poets = [];
        if (eventData.poets || eventData.poets != null) {
          for await (const studioPoet of eventData.poets) {
            const poetData = await getPerson(studioPoet.slug, client);
            if (poetData.length > 0) {
              poets.push({ people_id: poetData[0].id });
            }
          }
        }

        // eventData.event_organizers = eventData.event_organizer;
        // eventData.event_producers = eventData.event_producer;

        // // loop through event.event_producers
        // const producers = [];
        // if (eventData.event_producers || eventData.event_producers != null) {
        //   for await (const producer of eventData.event_producers) {
        //     const producerData = await getOrganization(producer.slug, client);
        //     if (producerData.length > 0) {
        //       producers.push({ organizations_id: producerData[0].id });
        //     }
        //   }
        // }

        // // loop through event.event_organizers
        // const organizers = [];
        // if (eventData.event_organizers || eventData.event_organizers != null) {
        //   for await (const organizer of eventData.event_organizers) {
        //     const organizerData = await getOrganization(organizer.slug, client);
        //     if (organizerData.length > 0) {
        //       organizers.push({ organizations_id: organizerData[0].id });
        //     }
        //   }
        // }

        eventData.type =
          eventData.collections && eventData.collections.length > 0
            ? eventData.collections[0]
            : "IRL";

        eventData.status = "published";

        // This returns an array of image IDs
        const images = await extractImages(
          eventData.body_text,
          events_folder,
          client
        );

        const body = await processMarkdownImages(
          eventData.body,
          images,
          client
        );

        // remove the eventData.body from the eventData object
        delete eventData.body;

        // slugify the slug to make it readable in a URL string
        eventData.slug = eventData.slug
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");

        const redirects = eventData.redirects;
        delete eventData.redirects;

        // eventData.user_created = "c1f66ed6-ebd2-40bb-9c8b-401f3d8d21c6";
        // eventData.user_updated = "c1f66ed6-ebd2-40bb-9c8b-401f3d8d21c6";
        eventData.user_created = "d5b6b79b-5e58-4399-953f-5a707a3bf2fe";
        eventData.user_updated = "d5b6b79b-5e58-4399-953f-5a707a3bf2fe";

        const newData = {
          ...eventData,
          body,
          images,
          people,
          poets,
        };

        // Create the event in Directus
        const event = await client.request(
          withToken(BASE_ACCESS_TOKEN, createItems("events", newData))
        );

        // REDIRECTS
        if (redirects && redirects.length > 0) {
          // Create the redirect in Directus
          for (const path of redirects) {
            const record = await client.request(
              withToken(
                BASE_ACCESS_TOKEN,
                createItem("redirects", {
                  status: "published",
                  path: path,
                  events: event.id,
                  type: "event",
                })
              )
            );
          }
        }
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

const extractImages = async (bodyText, events_folder, client) => {
  const regex = /\[JSON\](.*?)\[\/JSON\]/gs; // Match all [JSON]...[/JSON] blocks
  const fieldImages = [];
  let match;

  // Find all matches and push the parsed JSON into the array
  while ((match = regex.exec(bodyText)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]); // Parse the JSON content

      // Upload the image and get the new asset URL
      const imageId = await importImageModule(
        {
          path: jsonData.path,
          old_path: jsonData.path,
          caption: jsonData.caption,
        },
        { issue_folder: events_folder },
        client
      );

      fieldImages.push({ directus_files_id: imageId });
    } catch (error) {
      console.error("Invalid JSON found:", error);
    }
  }

  return fieldImages;
};

const processMarkdownImages = (markdown, images) => {
  console.log("Processing images...", images);

  // Regex to match the first occurrence of the image shortcode
  const regex = /{{<\s*image\s*media="[^"]+"\s*size="[^"]+"\s*>}}/;

  let updatedMarkdown = markdown;

  // Replace each shortcode with the corresponding image from the images array
  images.forEach((image, index) => {
    if (regex.test(updatedMarkdown)) {
      // Replace the first match with the markdown image syntax
      const imageUrl = `http://localhost:8055/assets/${image.directus_files_id}`;
      updatedMarkdown = updatedMarkdown.replace(regex, `![](${imageUrl})`);
    }
  });

  return updatedMarkdown;
};

createEvents();
