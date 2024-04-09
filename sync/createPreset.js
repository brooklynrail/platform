require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createPreset,
  readPresets,
} = require("@directus/sdk");

async function createIssuePreset(year, month, title) {
  console.log(year, month, title);

  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

  const existingPreset = await checkPreset(title);
  if (existingPreset) {
    console.log("Preset already exists");
    return;
  }

  const newPreset = {
    bookmark: `${title}`,
    collection: "articles",
    filter: {
      _and: [
        { issues: { issues_id: { year: { _eq: `${year}` } } } },
        { issues: { issues_id: { month: { _eq: `${month}` } } } },
      ],
    },
    layout: "tabular",
    layout_query: {
      tabular: {
        page: 1,
        limit: 1000,
        fields: [
          "featured_image.$thumbnail",
          "title",
          "in_print",
          "status",
          "contributors.contributors_id.slug",
          "user_updated.avatar.$thumbnail",
        ],
      },
    },
    layout_options: {
      tabular: {
        widths: {
          "featured_image.$thumbnail": 45,
          title: 325,
          in_print: 50,
          status: 50,
          "contributors.contributors_id.slug": 250,
          "user_updated.avatar.$thumbnail": 50,
        },
      },
    },
    user: null,
    role: null,
  };

  const presets = await client.request(
    withToken(BASE_ACCESS_TOKEN, createPreset(newPreset))
  );

  return presets;
}

// check to see if a preset exists
async function checkPreset(title) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

  const presets = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readPresets({
        fields: ["*.*"],
        filter: {
          bookmark: { _eq: title },
          collection: { _eq: "articles" },
        },
      })
    )
  );

  return presets.length > 0 ? presets[0].id : null;
}

module.exports = {
  createIssuePreset,
};
