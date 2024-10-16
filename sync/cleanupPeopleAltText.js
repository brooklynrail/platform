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

    const peopleToUpdate = [];
    for (const person of archivePeople) {
      // Find the person in Directus using the slug
      const thisPerson = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          readItems("people", {
            filter: { slug: { _eq: person.slug } },
          })
        )
      );

      if (
        person.portrait &&
        person.portrait.alt &&
        thisPerson[0] &&
        thisPerson[0].portrait
      ) {
        const record = { id: thisPerson[0].portrait, alt: person.portrait.alt };
        // push to peopleToUpdate array
        peopleToUpdate.push(record);
      }
    }

    console.log("========================================");
    console.log(peopleToUpdate);
  } catch (error) {
    console.error("Error", error);
  }
}

cleanupPeopleAltText();
