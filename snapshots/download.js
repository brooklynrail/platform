const https = require("https");
const fs = require("fs");
require("dotenv").config();

const token = process.env.TOKEN;
const url =
  "https://studio.brooklynrail.org/schema/snapshot?export=yaml&access_token=" +
  token;
// console.log("token: ", token);

https.get(url, (res) => {
  const path = "snapshots/schema.yaml";
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);

  writeStream.on("finish", () => {
    writeStream.close();
    console.log("💥 Snapshot has been downloaded!");
  });
});
