import type { SiteData } from "../data/schema";
import { confirmed } from "./pending";

const DAY_NAMES: Record<string, string> = {
  lunes: "Monday",
  martes: "Tuesday",
  miercoles: "Wednesday",
  jueves: "Thursday",
  viernes: "Friday",
  sabado: "Saturday",
  domingo: "Sunday",
};

/** schema.org Restaurant built only from confirmed values; null without a name. */
export function buildRestaurantJsonLd(site: SiteData): Record<string, unknown> | null {
  const name = confirmed(site.negocio.nombre);
  if (!name) return null;

  const url = confirmed(site.seo.url);
  const base = url?.replace(/\/+$/, "");
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
  };
  if (base) {
    ld.url = `${base}/`;
    const og = site.seo.imagenSocial;
    if (!og.placeholder) ld.image = new URL(og.archivo, `${base}/`).href;
  }

  const phone = confirmed(site.contacto.telefono);
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 10) ld.telephone = `+52${digits.slice(-10)}`;
  }

  const street = confirmed(site.ubicacion.calle);
  if (street) {
    const address: Record<string, unknown> = {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: site.negocio.ciudad,
      addressRegion: site.negocio.region,
      addressCountry: site.negocio.pais,
    };
    const cp = confirmed(site.ubicacion.codigoPostal);
    if (cp) address.postalCode = cp;
    ld.address = address;
  }

  const geo = confirmed(site.ubicacion.geo);
  if (geo) ld.geo = { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng };

  const week = confirmed(site.horario.semana);
  if (week) {
    const spec = week
      .filter((d) => !d.cerrado && d.abre && d.cierra)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[d.dia],
        opens: d.abre,
        closes: d.cierra,
      }));
    if (spec.length > 0) ld.openingHoursSpecification = spec;
  }

  if (site.negocio.cocina) ld.servesCuisine = site.negocio.cocina;
  if (base) ld.hasMenu = `${base}/#menu`;

  const sameAs = site.contacto.redes.map((r) => confirmed(r.url)).filter((u): u is string => Boolean(u));
  if (sameAs.length > 0) ld.sameAs = sameAs;

  return ld;
}
