const https = require("https");
const fs = require("fs");
require("dotenv").config();

const token = process.env.TOKEN;
const token_local = process.env.TOKEN_LOCAL;

const url =
  "https://studio.brooklynrail.org/schema/snapshot?export=yaml&access_token=" +
  token;
// const url =
//   "https://localhost:8055/schema/snapshot?export=yaml&access_token=" +
//   token_local;

https.get(url, (res) => {
  const path = "snapshots/init.yaml";
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);

  writeStream.on("finish", () => {
    writeStream.close();
    console.log("💥 Snapshot has been downloaded!");
  });
});
