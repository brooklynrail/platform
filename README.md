<img src="https://venice.brooklynrail.org/assets/img/brooklyn-rail-logo-2019-outline-red.svg" alt="The Brooklyn Rail logo as a red outline"/>

**The Brooklyn Rail Studio** https://studio.brooklynrail.org <br/>
**Powered by Directus** https://directus.io/

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

:warning:**NOTE:** Do not commit these changes into the repo

## Directus Schema

When Directus is built via Docker or via `yarn build`, it uses this `init.yaml` file to setup the content schema, specific fields, and field settings within Directus. https://github.com/brooklynrail/studio/blob/main/snapshots/init.yaml

### Updating the Schema

When we make changes to the schema, it is essential that we update the `init.yaml` file to reflect the most recent changes.

**To update the schema:**

- Go to the API viewer on the left side within the Directus App
- Click on **Retrieve Schema Snapshot** in the left sidebar
- In the **QUERY-STRING PARAMETERS** export box, click on `yaml`
- click on the **TRY** button — this will generate the schema in `yaml` format
- Copy the contents and paste them into the file `/snapshots/init.yaml`
