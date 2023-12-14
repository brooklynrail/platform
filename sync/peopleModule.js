const fs = require('fs');
require('dotenv').config();
const { withToken, readItems} = require('@directus/sdk');

// const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;
const BASE_ACCESS_TOKEN = process.env.TOKEN_STAGING;

async function peopleModule(peopleIds, client) {
  try {
    const existingPeople = [];
    // Function to check if a person with a given ID exists in Directus
    const checkPersonExists = async (personId, client) => {
      const person = await client.request(
        withToken(BASE_ACCESS_TOKEN, readItems('contributors', {
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
        existingPeople.push({ contributors_id: existingPersonId });
      } 
    }

    if(existingPeople.length == 0){
      console.log('Error fetching existingPeople');
      return;
    }
    
    return existingPeople;
   
  } catch (error){
    console.error('Error fetching person:', error.message);
    
    // Handle the error and write specific data to a text file
    const failedData = `${peopleIds}\n`;
    const filePath = `errors-people.txt`;

    // Write the error data to the text file
    fs.writeFileSync(filePath, failedData, 'utf-8');
  }
}

module.exports = {
  peopleModule,
};
