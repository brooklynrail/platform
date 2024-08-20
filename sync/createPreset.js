require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  createPreset,
  readPresets,
} = require("@directus/sdk");

async function createIssuePreset(year, month, title, issue_number) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

  const existingPreset = await checkPreset(`#${issue_number} • ${title}`);
  if (existingPreset) {
    return;
  }

  const newPreset = {
    bookmark: `#${issue_number} • ${title}`,
    collection: "articles",
    filter: {
      _and: [
        {
          _and: [
            { issue: { year: { _eq: `${year}` } } },
            { issue: { month: { _eq: `${month}` } } },
          ],
        },
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
          "section.name",
          "contributors.contributors_id.slug",
          "user_updated.avatar.$thumbnail",
          "sort",
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
          "section.name": 120,
          "contributors.contributors_id.slug": 200,
          "user_updated.avatar.$thumbnail": 50,
          sort: 75,
        },
      },
    },
    user: null,
    role: null,
  };

  const presets = await client.request(
    withToken(BASE_ACCESS_TOKEN, createPreset(newPreset))
  );

  console.log(`🚩 The ${year}-${month} Bookmark was created!`);

  return presets;
}

// check to see if a preset exists
async function checkPreset(title) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  const presets = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readPresets({
        fields: ["bookmark", "id"],
        filter: {
          bookmark: { _eq: title },
        },
      })
    )
  );

  return presets.length > 0 ? presets[0].id : null;
}

module.exports = {
  createIssuePreset,
};
