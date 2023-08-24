# The Brooklyn Rail


## Getting set up
1. 3. Set up a new local database called `rail` and note the user/pass for accessing the database locally
2. Check out the repo
3. Create a `.env` file using the `.env-example` as a template
   1. add a unique `KEY` and `SECRET`
   2. add the details for connecting to the database ```DB_CLIENT="mysql"
DB_HOST="localhost"
DB_PORT="8889"
DB_DATABASE="DATABASE_NAME"
DB_USER="DATABASE_USER"
DB_PASSWORD="DATABASE_PASS"```

   

## Launch the studio app
- run: `yarn dev`


### Take a snapshot of your schema
When making changes to the content model or schema, make sure to take a snapshot of your schema. It provides an easy way to see what has changed, and you can roll back to previous versions.
- run: `yarn schema`

More: https://docs.directus.io/self-hosted/cli.html#migrate-schema-to-a-different-environment


## Docker

Helpful docker commands:
- Starting docker: `docker compose up`
- Delete the database within Docker: `docker-compose rm -v database`


## Migrating data from the OLD Rail Site

1. Download a fresh copy of the database from GoDaddy
2. Create a new `utf8` database in Sequel Ace
3. Import the `brooklynrail_production` database _(as latin1)_
4. Run the migration script to convert all of the tables and collation to utf8
5. Run `npx directus init` to add the Directus tables to the database
   1. Choose `MySQL`
   1. Database host: `localhost`
   1. Port: `8889`
   1. Database name: `rail`
   1. Database user: `root`
   1. Database pass: `root`
   1. First Admin user: `admin@example.com`
   1. First Admin pass: `rail123`
6. Run `npx directus start`
7. Open http://localhost:8055


```
# Remove unused DATE fields in articles
# These existing values `0000-00-00` are throwing an error
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

ALTER TABLE articles DROP COLUMN `banner_start`, DROP COLUMN `banner_end`, DROP COLUMN `artseen_start`, DROP COLUMN `artseen_end`, DROP COLUMN `pub_override`;
ALTER TABLE auction_items DROP COLUMN `updated on`

# Change the table and column collation
ALTER TABLE ads CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE article_images CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE article_types CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE articles CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE articles_contributors CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE auction_items CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE banner_displays CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE banners CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE comments CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE `contributors` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE events CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE issues CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE mailinglist CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE pages CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE relatedarticles CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE sections CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE settings CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE sponsorships CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

# Dropping unused tables
DROP TABLE sessions;
DROP TABLE schema_info;
DROP TABLE blacklist_patterns;
DROP TABLE ci_sessions;
DROP TABLE migrations;
DROP TABLE newusers;
DROP TABLE page_caches;
DROP TABLE stats;
DROP TABLE test;
DROP TABLE test_migration;
DROP TABLE users;


```