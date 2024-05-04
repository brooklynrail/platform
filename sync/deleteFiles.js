require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  readFiles,
  deleteFiles,
} = require("@directus/sdk");

async function deleteAllFiles() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    // const list = await client.request(
    //   withToken(
    //     BASE_ACCESS_TOKEN,
    //     readFiles({
    //       query: {
    //         filter: {
    //           article_images: {
    //             _nnull: true,
    //           },
    //         },
    //         limit: -1,
    //       },
    //     })
    //   )
    // );
    // console.log("list of Files: ", list);

    const article_images = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        deleteFiles({
          query: {
            filter: {
              article_images: {
                _nnull: true,
              },
            },
            limit: -1,
          },
        })
      )
    );
    console.log("all article_images deleted: ", article_images);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

deleteAllFiles();
