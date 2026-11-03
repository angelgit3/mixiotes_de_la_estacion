import type { ImageMetadata } from "astro";
import raw from "./sitio.json";
import { parseSite } from "./validate";
import { SECTION_KEYS, type SiteData } from "./schema";

const parsed = parseSite(raw);

/** Optional-section preview: only for drafts, used to screenshot every section. */
const previewAll = process.env.PREVIEW_ALL_SECTIONS === "1" && parsed.estado === "borrador";

export const site: SiteData = previewAll
  ? { ...parsed, secciones: Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as SiteData["secciones"] }
  : parsed;

const photos = import.meta.glob<{ default: ImageMetadata }>("/src/assets/fotos/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
});

const photoByFile = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(photos)) {
  photoByFile.set(path.split("/").pop() as string, mod.default);
}

for (const [key, img] of Object.entries(site.imagenes)) {
  if (!photoByFile.has(img.archivo)) {
    throw new Error(
      `sitio.json no es válido (estado: ${site.estado}):\n  • imagenes.${key}.archivo — no se encontró el archivo «${img.archivo}» en src/assets/fotos/`,
    );
  }
}

export interface SiteImage {
  src: ImageMetadata;
  alt: string;
  placeholder: boolean;
  toma: string | undefined;
}

/** Look up an image declared in `imagenes` by key. */
export function getImage(key: string): SiteImage {
  const entry = site.imagenes[key];
  if (!entry) throw new Error(`Imagen desconocida «${key}». Opciones: ${Object.keys(site.imagenes).join(", ")}`);
  return {
    src: photoByFile.get(entry.archivo) as ImageMetadata,
    alt: entry.alt,
    placeholder: entry.placeholder,
    toma: entry.toma,
  };
}
