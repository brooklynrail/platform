require("dotenv").config();
const {
  BASE_ACCESS_TOKEN,
  API_ENDPOINT,
  BASE_DIRECTUS_URL,
} = require("./config");
const {
  createDirectus,
  rest,
  withToken,
  updateSettings,
} = require("@directus/sdk");

async function updateStudioSettings() {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());

    const newSettings = {
      project_name: "Studio",
      storage_asset_presets: [
        {
          key: "promo-section",
          fit: "contain",
          width: 400,
          height: 530,
          quality: 80,
          withoutEnlargement: true,
          format: "auto",
          transforms: [],
        },
        {
          key: "promo-banner",
          fit: "cover",
          width: 632,
          height: 192,
          quality: 80,
          withoutEnlargement: true,
          format: "auto",
          transforms: [],
        },
        {
          key: "promo-thumb",
          fit: "cover",
          width: 120,
          height: 120,
          quality: 80,
          withoutEnlargement: true,
          format: "auto",
          transforms: [],
        },
        {
          key: "slideshow-image",
          fit: "cover",
          width: 1328,
          height: 564,
          quality: 80,
          withoutEnlargement: true,
          format: "auto",
          transforms: [],
        },
        {
          key: "featured-image",
          fit: "contain",
          width: 800,
          height: 1058,
          quality: 80,
          withoutEnlargement: true,
          format: "auto",
          transforms: [],
        },
      ],
    };

    const settings = await client.request(
      withToken(BASE_ACCESS_TOKEN, updateSettings(newSettings))
    );

    console.log(settings);
  } catch (error) {
    console.error("Error reading settings", error.message);
  }
}

updateStudioSettings();
