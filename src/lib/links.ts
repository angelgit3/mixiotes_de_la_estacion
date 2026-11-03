import type { Pending, SiteData } from "../data/schema";
import { confirmed, resolve } from "./pending";

/** wa.me link with a prefilled message, or null when the number is not confirmed. */
export function whatsappHref(number: Pending<string> | undefined, message: string): string | null {
  const n = confirmed(number);
  if (n === undefined || !/^\d{10}$/.test(n)) return null;
  return `https://wa.me/52${n}?text=${encodeURIComponent(message)}`;
}

/** tel: link from a display string such as "775 755 3530". Null if too short. */
export function telHref(display: string | undefined): string | null {
  if (!display) return null;
  const digits = display.replace(/\D/g, "");
  if (digits.length < 10) return null;
  // Keep the national 10 digits (drop a leading country code if present).
  return `tel:+52${digits.slice(-10)}`;
}

/** Maps link: the confirmed share URL, else a search for the address. */
export function mapsHref(site: Pick<SiteData, "negocio" | "ubicacion">): string {
  const url = confirmed(site.ubicacion.mapsUrl);
  if (url) return url;
  const parts = [
    resolve(site.negocio.nombre).value,
    resolve(site.ubicacion.calle).value,
    resolve(site.ubicacion.colonia).value,
    site.negocio.ciudad,
    site.negocio.region,
  ].filter((p): p is string => typeof p === "string" && p.length > 0);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}
