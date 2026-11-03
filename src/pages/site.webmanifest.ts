import type { APIRoute } from "astro";
import { site } from "../data/site";
import { resolve } from "../lib/pending";

export const GET: APIRoute = () => {
  const name = resolve(site.negocio.nombre).value ?? "Mixiotes";
  const manifest = {
    name,
    short_name: name,
    start_url: "/",
    display: "standalone",
    background_color: "#F3E9D8",
    theme_color: site.seo.colorTema,
    lang: "es-MX",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
};
