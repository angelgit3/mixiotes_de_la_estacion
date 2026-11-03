// @ts-check
import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const sitio = JSON.parse(readFileSync(new URL("./src/data/sitio.json", import.meta.url), "utf-8"));
const confirmedUrl = typeof sitio?.seo?.url === "string" ? sitio.seo.url : undefined;

export default defineConfig({
  site: confirmedUrl ?? process.env.SITE_URL ?? "http://localhost:4321",
  output: "static",
  integrations: [sitemap()],
  build: { inlineStylesheets: "always" },
  vite: { plugins: [tailwindcss()] },
});
