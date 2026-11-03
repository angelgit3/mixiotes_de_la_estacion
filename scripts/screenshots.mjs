// Takes full-page and above-the-fold screenshots of the built site and checks for horizontal scroll.
//
// Usage (the site must be built and served first):
//   npm run build && npm run preview -- --port 4321        # terminal 1
//   npm run screenshots                                    # terminal 2 -> docs/capturas/<ancho>.png
//
// Every optional section (build made with PREVIEW_ALL_SECTIONS=1):
//   PREVIEW_ALL_SECTIONS=1 npm run build && npm run preview -- --port 4321
//   npm run screenshots -- --completo                      # -> docs/capturas/completo/
//
// Options: --url=http://localhost:4321/   --completo
// Playwright is installed globally (not a dependency); it is resolved from the global node_modules.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright")));
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const full = args.includes("--completo");
const url = (args.find((a) => a.startsWith("--url=")) ?? "--url=http://localhost:4321/").slice(6);
const outDir = path.join(root, "docs", "capturas", full ? "completo" : "");
fs.mkdirSync(outDir, { recursive: true });

const widths = [360, 390, 768, 1024, 1440, 1920];
const foldWidths = new Set([390, 1440]);
const heights = { 360: 780, 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };

const browser = await chromium.launch();
const rows = [];
let failed = false;
for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: heights[width] },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Load every lazy image before the full-page shot.
  await page.evaluate(async () => {
    for (const img of document.images) img.loading = "eager";
    await Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => (i.onload = i.onerror = r)))));
  });
  const m = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    h1: document.querySelectorAll("h1").length,
    height: document.documentElement.scrollHeight,
  }));
  const ok = m.scrollWidth <= m.innerWidth && m.h1 === 1 && errors.length === 0;
  if (!ok) failed = true;
  rows.push({ ancho: width, scrollWidth: m.scrollWidth, innerWidth: m.innerWidth, h1: m.h1, alto: m.height, errores: errors.length, ok: ok ? "OK" : "FALLA" });
  await page.screenshot({ path: path.join(outDir, `${width}.png`), fullPage: true });
  if (foldWidths.has(width)) await page.screenshot({ path: path.join(outDir, `${width}-pliegue.png`) });
  await context.close();
}
await browser.close();
console.table(rows);
if (failed) {
  console.error("Hay problemas: revisa la tabla.");
  process.exit(1);
}
