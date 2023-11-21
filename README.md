# The Brooklyn Rail Studio

---

## Common commands

**Upload a `.sql` file to Cloud Storage**
```
gcloud storage cp ../brooklynrail/data/br-2023-11-20.sql gs://brooklynrail-data
```

**Create a new database in the current instance**
```
gcloud sql databases create br-2023-11-20 --instance=rail-archive-staging --charset=latin1 --collation=latin1_swedish_ci
```

**Import data into the new database**
```
gcloud sql import sql rail-archive-staging gs://brooklynrail-data/br-2023-11-21.sql \
--database=br-2023-11-21
```



## Local setup

1. Start up the local Brooklyn Rail site with a fresh database
2. Remove unused tables from the database
```
DROP TABLE `stats`;
DROP TABLE `test`;
DROP TABLE `test_migration`;
DROP TABLE `sessions`;
DROP TABLE `page_caches`;
DROP TABLE `blacklist_patterns`;
DROP TABLE `schema_info`;
```
3. In this repo, run `yarn bootstrap` to initialize Directus and set up the tables in the database
4. Run `yarn refresh` to instal the latest configuration






## Initial set up
1. Set up a new local database called `rail` and note the user/pass for accessing the database locally
2. Check out the repo
3. Run `yarn install`
4. Create a database on your local computer. I used MAMP to do this.
5. Create a `.env` file using the `.env-example` as a template
   1. add a unique `KEY` and `SECRET`
   2. add the details for connecting to the database 
   ```
   DB_CLIENT="mysql"
   DB_HOST="localhost"
   DB_PORT="8889"
   DB_DATABASE="DATABASE_NAME"
   DB_USER="DATABASE_USER"
   DB_PASSWORD="DATABASE_PASS"
   ```
6. Run `npx directus bootstrap` -- Keep trying this till your connection to the database works
7. Run `yarn dev` -- this should spin up a local version of the Studio at `http://localhost:8055`

## Commands

- Copy files to Google Cloud Storage — `gsutil cp -n -r -m content-to-be-uploaded/ gs://bucketname`

## Migrating data from the OLD Rail Site

1. Download a fresh copy of the database from GoDaddy
2. Start up the Brooklyn Site locally with this fresh database
3. Verify that it works http://localhost:8055
4. Connect to the Database via Sequel Ace
5. Run the clean up scripts (below)
6. Export the database as SQL Dump
7. Upload the `.sql` file to Google Cloud Storage https://console.cloud.google.com/storage/browser/brooklynrail-data;tab=objects
8. Create a new database https://console.cloud.google.com/sql
9. Import the `.sql` file into the new database
10. Set the Secret for DB_DATABASE to the name of the new database
11. Trigger a build https://console.cloud.google.com/cloud-build/triggers;region=us-west2?hl=en&project=studio-399415





## Old migration data
```
# Remove unused DATE fields in articles
# These existing values `0000-00-00` are throwing an error
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

ALTER TABLE `articles` DROP COLUMN `banner_start`, DROP COLUMN `banner_end`, DROP COLUMN `artseen_start`, DROP COLUMN `artseen_end`, DROP COLUMN `pub_override`;
ALTER TABLE `auction_items` DROP COLUMN `updated_on`;

# Dropping unused tables
# DROP TABLE `blacklist_patterns`;
DROP TABLE `ci_sessions`;
# DROP TABLE `migrations`;
# DROP TABLE `newusers`;
# DROP TABLE `page_caches`;
# DROP TABLE `schema_info`;
# DROP TABLE `sessions`;
# DROP TABLE `settings`;
DROP TABLE `stats`;
DROP TABLE `test`;
DROP TABLE `test_migration`;
# DROP TABLE `users`;

# Change the table and column collation
ALTER TABLE `ads` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `article_images` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `article_types` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `articles` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `articles_contributors` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `auction_items` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `banner_displays` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `banners` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `comments` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `contributors` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `events` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `issues` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `mailinglist` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `pages` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `relatedarticles` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `sections` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `sponsorships` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

# Edit Ads columns/fields
DROP INDEX `start_date` ON `ads`;
ALTER TABLE `ads` CHANGE COLUMN payload ad_type VARCHAR(225);
ALTER TABLE `ads` CHANGE COLUMN start_date start_date DATETIME;
ALTER TABLE `ads` CHANGE COLUMN end_date end_date DATETIME;
UPDATE `ads` SET `start_date` = replace(start_date, '0000-00-00 00:00:00', NULL);
UPDATE `ads` SET `end_date` = replace(end_date, '0000-00-00 00:00:00', NULL);

# Edit Articles columns/fields
ALTER TABLE `articles` CHANGE COLUMN permalink slug VARCHAR(255);
ALTER TABLE `articles` CHANGE COLUMN webex in_print TINYINT(1);
```


---

## Docker
**Not able to get Docker working yet**
Helpful docker commands:
- Starting docker: `docker compose up`
- Delete the database within Docker: `docker-compose rm -v database`


### Take a snapshot of your schema
When making changes to the content model or schema, make sure to take a snapshot of your schema. It provides an easy way to see what has changed, and you can roll back to previous versions.

- To create a new snapshot, run: `yarn snapshot`
- To create a new baseline snapshot (used in the initial import), run: `yarn baseline`

More: https://docs.directus.io/self-hosted/cli.html#migrate-schema-to-a-different-environment



## Cleaning the Latin1 database
```
ALTER TABLE `banners` CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
ALTER TABLE `migrations` CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
ALTER TABLE `newusers` CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
ALTER TABLE `sponsorships` CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
```