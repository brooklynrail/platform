<img src="https://venice.brooklynrail.org/assets/img/brooklynrail-logo-red.png" alt="The Brooklyn Rail logo as a red outline"/>

**The Brooklyn Rail Studio** https://studio.brooklynrail.org <br/>
**Powered by Directus** https://directus.io/

---

## Getting started (localhost)

To run the Brooklyn Rail Studio project locally on your computer, follow these steps:

1. Clone the repository https://github.com/brooklynrail/studio.git
2. Install the Docker Desktop App https://www.docker.com/products/docker-desktop/
3. Open Docker
4. In the terminal, run `docker compose up --build` -- this will take 3-4 mins while it builds the docker images from scratch, and installs the current schema. If the images are already built, you can start the container by running `docker compose up`.
5. Visit http://localhost:8055

## API Token

You will need to generate an API Token upon building Directus for the first time.

1. Within the Directus App, go to **User Directory**
2. Click on your profile
3. Scroll down to **Admin Options** and generate a new token
4. Copy the token
5. Save the settings
6. Paste the token at the top of your `.env` file

```
TOKEN_LOCAL="the-token-goes-here"
```

:warning:**NOTE:** Do not commit the token into the repo

## Directus Content Schema

When Directus is built via Docker or via `yarn build`, it uses this `init.yaml` file to setup the content schema, specific fields, and field settings within Directus. https://github.com/brooklynrail/studio/blob/main/snapshots/init.yaml

### Updating the Schema

When we make changes to the schema, it is essential that we update the `init.yaml` file to reflect the most recent changes.

**To update the schema:**

- Go to the API viewer on the left side within the Directus App
- Click on **Retrieve Schema Snapshot** in the left sidebar
- In the **QUERY-STRING PARAMETERS** export box, click on `yaml`
- click on the **TRY** button — this will generate the schema in `yaml` format
- Copy the contents and paste them into the file `/snapshots/init.yaml`

## Migrating Content

We have a number of custom scripts for importing all of the Rail content into Directus, via custom APIs that we built into the current Codeigniter site.

A few things to know:

- the current database running on `mysql:5.7.42`, hosted in Google Cloud.
- the content in the database is currently encoded in `Latin-1(ISO-8859-1)`
- we are converting each node in our APIs to `UTF-8` from `Latin-1(ISO-8859-1)`
- we are migrating everything to a `postgres` database managed by Directus

### Migration scripts

**Note:** to use these scripts, you'll need to be running `node 18`. Use `nvm use 18` to set the node version.

1. Import the current Contributors (+8,100) — `node sync/createContributors.js`
2. Import the current Sections (+35) — `node sync/createSections.js`
3. Import the All Issues (+245 issues, +40,000 articles, and all images) — `node sync/createSections.js`

### API Enpoints

- Issue + Articles https://brooklynrail.org/2023/12/api
- All Issues https://brooklynrail.org/api/issues/
- All Issues as list https://brooklynrail.org/api/issue-list
- All Contributors https://brooklynrail.org/api/contributors
- All Sections https://brooklynrail.org/api/sections
