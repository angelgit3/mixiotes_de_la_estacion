import { describe, expect, it } from "vitest";
import { parseSite } from "../src/data/validate";
import { buildRestaurantJsonLd } from "../src/lib/jsonld";
import { mapsHref, telHref, whatsappHref } from "../src/lib/links";
import { activeNotices } from "../src/lib/notices";
import { fillTemplate, resolve } from "../src/lib/pending";
import { formatPrice, formatTime } from "../src/lib/format";
import { loadFixture, loadSitio } from "./helpers";

describe("links", () => {
  const msg = "Hola, quiero apartar __ mixiotes de __ para recoger hoy a las __. ¿Todavía tienen?";

  it("builds an exact wa.me link", () => {
    expect(whatsappHref("5512345678", msg)).toBe(
      "https://wa.me/525512345678?text=Hola%2C%20quiero%20apartar%20__%20mixiotes%20de%20__%20para%20recoger%20hoy%20a%20las%20__.%20%C2%BFTodav%C3%ADa%20tienen%3F",
    );
  });

  it("returns null for a pending or missing number", () => {
    expect(whatsappHref({ pendiente: true, nota: "x" }, msg)).toBeNull();
    expect(whatsappHref(undefined, msg)).toBeNull();
  });

  it("builds tel links", () => {
    expect(telHref("775 755 3530")).toBe("tel:+527757553530");
    expect(telHref("(775) 755-3530")).toBe("tel:+527757553530");
    expect(telHref("123")).toBeNull();
  });

  it("builds the maps search link from candidates in borrador", () => {
    const site = parseSite(loadSitio());
    expect(mapsHref(site)).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          "Mixiotes De La Estación, Calle Rodolfo Guzmán Huerta (El Santo) #13, Col. Álamos, Zona de la Estación, Tulancingo de Bravo, Hidalgo",
        ),
    );
    expect(mapsHref(site)).toContain("Estaci%C3%B3n");
  });

  it("uses the confirmed mapsUrl", () => {
    expect(mapsHref(parseSite(loadFixture()))).toBe("https://maps.example.com/prueba");
  });

  it("skips missing parts", () => {
    const raw = loadSitio();
    raw.negocio.nombre = { pendiente: true, nota: "x" };
    raw.ubicacion.calle = { pendiente: true, nota: "x" };
    raw.ubicacion.colonia = { pendiente: true, nota: "x" };
    expect(mapsHref(parseSite(raw))).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tulancingo%20de%20Bravo%2C%20Hidalgo",
    );
  });
});

describe("jsonld", () => {
  it("builds a complete Restaurant from the fixture", () => {
    const ld = buildRestaurantJsonLd(parseSite(loadFixture()));
    expect(ld).toEqual({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "Negocio de Prueba",
      url: "https://example.com/",
      image: "https://example.com/og.png",
      telephone: "+525512345678",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Calle de Prueba #1",
        addressLocality: "Tulancingo de Bravo",
        addressRegion: "Hidalgo",
        postalCode: "43600",
        addressCountry: "MX",
      },
      geo: { "@type": "GeoCoordinates", latitude: 20.0833, longitude: -98.3667 },
      openingHoursSpecification: expect.any(Array),
      servesCuisine: "Mexican",
      hasMenu: "https://example.com/#menu",
      sameAs: ["https://example.com/facebook"],
    });
    const spec = (ld as any).openingHoursSpecification;
    expect(spec).toHaveLength(6);
    expect(spec[0]).toEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Tuesday",
      opens: "08:00",
      closes: "15:00",
    });
    expect(ld).not.toHaveProperty("priceRange");
  });

  it("returns null while the name is pending", () => {
    expect(buildRestaurantJsonLd(parseSite(loadSitio()))).toBeNull();
  });

  it("omits address when calle is pending", () => {
    const raw = loadFixture();
    raw.estado = "borrador";
    raw.ubicacion.calle = { pendiente: true, nota: "x", porConfirmar: "Candidata" };
    const ld = buildRestaurantJsonLd(parseSite(raw));
    expect(ld).not.toHaveProperty("address");
    expect(JSON.stringify(ld)).not.toContain("Candidata");
  });
});

describe("notices", () => {
  const n = (fecha: string, mostrarHasta?: string) => ({
    fecha,
    titulo: fecha,
    tipo: "general" as const,
    ...(mostrarHasta ? { mostrarHasta } : {}),
  });

  it("filters out expired notices and sorts by fecha", () => {
    const list = [n("2026-12-20"), n("2026-10-01"), n("2026-11-01", "2026-11-10"), n("2026-11-03"), n("2026-11-02", "2026-11-02")];
    expect(activeNotices(list, "2026-11-03").map((x) => x.fecha)).toEqual(["2026-11-01", "2026-11-03", "2026-12-20"]);
  });
});

describe("pending helpers", () => {
  it("resolve", () => {
    expect(resolve("x")).toEqual({ value: "x", pending: false });
    expect(resolve({ pendiente: true, nota: "n", porConfirmar: "c" })).toEqual({ value: "c", pending: true, note: "n" });
    expect(resolve({ pendiente: true, nota: "n" })).toEqual({ value: undefined, pending: true, note: "n" });
  });

  it("fillTemplate", () => {
    expect(fillTemplate("abrimos {apertura} · {cierre}", { apertura: "8:00", cierre: "hasta agotar" })).toBe(
      "abrimos 8:00 · hasta agotar",
    );
    expect(fillTemplate("{a} {b}", { a: "1" })).toBe("1 {b}");
  });
});

describe("format", () => {
  it("formats prices and times", () => {
    expect(formatPrice(85)).toBe("$85");
    expect(formatPrice(85.5)).toBe("$85.50");
    expect(formatTime("08:00")).toBe("8:00");
    expect(formatTime("15:30")).toBe("15:30");
  });
});
