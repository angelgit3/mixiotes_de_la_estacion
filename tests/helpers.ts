import { readFileSync } from "node:fs";

function load(path: string): Record<string, any> {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf-8"));
}

/** Fresh deep copy of the real sitio.json (borrador). */
export const loadSitio = () => load("../src/data/sitio.json");
/** Fresh deep copy of the fully valid production fixture. */
export const loadFixture = () => load("./fixtures/sitio.produccion.json");
