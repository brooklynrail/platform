require('dotenv').config();
const { createDirectus, rest, withToken, createItems, importFile, readItems, readActivity} = require('@directus/sdk');

const BASE_DIRECTUS_URL = 'http://127.0.0.1:8055';
const BASE_ACCESS_TOKEN = process.env.TOKENLOCAL;
const API_ENDPOINT = 'http://localhost:8000';

async function isSection(old_section_id, client) {
  try {
    const section = await client.request(
      withToken(BASE_ACCESS_TOKEN, readItems('Sections', {
        "filter": {
          "old_id": {
            "_eq": old_section_id
          }
        }
      }))
    );
    if(section.length == 0){
      console.log('Error fetching section:');
      return;
    }
    return section[0].id;
  } catch (error){
    console.error('Error fetching section:', error.message);
  }
}

// ============

async function isPeople(peopleIds, client) {
  try {
    const existingPeople = [];
    // Function to check if a person with a given ID exists in Directus
    const checkPersonExists = async (personId, client) => {
      const person = await client.request(
        withToken(BASE_ACCESS_TOKEN, readItems('People', {
          "filter": {
            "old_id": {
              "_eq": personId
            }
          }
        }))
      );

      return person.length > 0 ? person[0].id : null;
    };

    // Iterate over each personId and check if it exists in Directus
    for (const personId of peopleIds) {
      const existingPersonId = await checkPersonExists(personId, client);
      if (existingPersonId) {
        existingPeople.push({ People_id: existingPersonId });
      } 
    }

    if(existingPeople.length == 0){
      console.log('Error fetching existingPeople');
      return;
    }
    
    return existingPeople;
   
  } catch (error){
    console.error('Error fetching person:', error.message);
  }
}


// ============

async function importFeaturedImage(data, client) {
  try {
    if(data){
      const path = `https://storage.googleapis.com/rail-legacy-media/production${data.path}`;
      console.log(path);
      const description = data.description;

      const result = await client.request(
        importFile(path, {
          description: description || null,
        })
      );
      console.log("featured_image ------>");
      console.log(result);
      // return the ID of the file that was just uploaded
      return result.id;
    }
  } catch (error){
    console.error('Error fetching Featured Image:', error.message);
  }
}


// ============

async function importIssues(issues) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    
    // Iterate over each issue
    
    const issueUrl = `${API_ENDPOINT}/2023/11/api`;

    console.log("------------------- - - - -")
    console.log(`Importing issue`);

    // Fetch data for the current issue
    const response = await fetch(issueUrl, {
      headers: {
        Authorization: `Bearer ${BASE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`Error fetching data for issue ${issue.year}/${issue.month}: HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    const articles = await Promise.all(data.articles.map(async (article) => {
      const section = await isSection(article.Articles_id.old_section_id, client);
      const people = await isPeople(article.Articles_id.people, client);
      const featured_image = await importFeaturedImage(article.Articles_id.featured_image, client);
      return {
        ...article,
        Articles_id: {
          ...article.Articles_id,
          section,
          people,
          featured_image,
        },
      };
    }));
    
    const newData = await {
      ...data,
      articles: articles,
    };

    const createIssue = await client.request(
      withToken(BASE_ACCESS_TOKEN, createItems('Issues', newData))
    );
    
    console.log(createIssue);
    
    console.log('Full import completed successfully.');

  } catch (error) {
    console.error('Error creating issue data:', error);
    console.error(error.extensions);
  }
}


// Start the import process
importIssues();
