import type { APIRoute } from "astro";
import { site } from "../data/site";
import { confirmed } from "../lib/pending";

export const GET: APIRoute = () => {
  // Pending business name: use the provisional title/short name instead of the unconfirmed candidate.
  const confirmedName = confirmed(site.negocio.nombre);
  const manifest = {
    name: confirmedName ?? site.seo.tituloProvisional,
    short_name: confirmedName ?? site.seo.nombreCortoProvisional,
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
