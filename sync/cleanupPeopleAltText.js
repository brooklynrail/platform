require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const { createDirectus, rest, withToken, readItems } = require("@directus/sdk");

async function cleanupPeopleAltText() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    // Get the People data from the old site
    const API_ENDPOINT = "http://127.0.0.1:1313/people/index.json";
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const archivePeople = await response.json();

    for (const person of archivePeople) {
      console.log("========================================");
      // For each person, check if they have a portrait and alt text
      if (person.portrait && person.portrait.alt) {
        const imagePath = person.portrait.path;
        // Get the filename from the path
        // example -- "path" : "/media/files/000512650035-square.jpg",
        const filename = imagePath.split("/").pop();
        console.log("filename: ", filename);

        // Find the image in the DirectusFiles API using the filename as the filter
        const files = await client.request(
          withToken(
            BASE_ACCESS_TOKEN,
            readItems("directus_files", {
              filter: { filename_download: { _eq: filename } },
            })
          )
        );

        if (files.data.length > 0) {
          const file = files.data[0];
          console.log("updating file: ", file);
          // const updatedFile = await client.request(
          //   withToken(
          //     BASE_ACCESS_TOKEN,
          //     updateItem("directus_files", file.id, {
          //       alt: person.portrait.alt,
          //     })
          //   )
          // );

          // console.log("updatedFile: ", updatedFile);
        }
      }
    }
  } catch (error) {
    console.error("Error", error);
  }
}

cleanupPeopleAltText();
