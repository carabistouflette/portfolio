import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  site: "https://alexisr.work",
  output: "static",
  integrations: [vue({ appEntrypoint: "/src/vue-app.ts" })],
  trailingSlash: "always",
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
