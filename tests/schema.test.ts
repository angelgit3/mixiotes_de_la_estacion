import { describe, expect, it } from "vitest";
import { parseSite } from "../src/data/validate";
import { isPending } from "../src/data/schema";
import { loadFixture, loadSitio } from "./helpers";

function messageOf(raw: unknown): string {
  try {
    parseSite(raw);
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error("expected parseSite to throw");
}

describe("parseSite", () => {
  it("accepts the real sitio.json as borrador", () => {
    expect(parseSite(loadSitio()).estado).toBe("borrador");
  });

  it("rejects the real sitio.json as produccion and names contacto.whatsapp", () => {
    const raw = loadSitio();
    raw.estado = "produccion";
    const msg = messageOf(raw);
    expect(msg).toContain("sitio.json no es válido (estado: produccion):");
    expect(msg).toContain("  • contacto.whatsapp — Dato pendiente:");
    expect(msg).toContain("ubicacion.geo");
    expect(msg).toContain("menu.productos[0].presentaciones[0].precio");
    expect(msg).toContain("imagenes.vaporera.placeholder");
    expect(msg).toContain("seo.imagenSocial.placeholder");
    // sazon is disabled: its pending steps must not be reported
    expect(msg).not.toContain("sazon.pasos");
  });

  it("accepts the production fixture", () => {
    expect(parseSite(loadFixture()).estado).toBe("produccion");
  });

  it("rejects a 9-digit whatsapp", () => {
    const raw = loadFixture();
    raw.contacto.whatsapp = "551234567";
    expect(messageOf(raw)).toMatch(/contacto\.whatsapp — .*10 dígitos/);
  });

  it("rejects unknown keys (strict)", () => {
    const raw = loadFixture();
    raw.contacto.whatsap = "5512345678";
    expect(messageOf(raw)).toContain("contacto.whatsap — clave desconocida");
  });

  it("rejects a bad estado value", () => {
    const raw = loadFixture();
    raw.estado = "publicado";
    const msg = messageOf(raw);
    expect(msg).toContain("estado: publicado");
    expect(msg).toContain("  • estado — valor no permitido");
  });

  it("rejects a missing required copy field", () => {
    const raw = loadFixture();
    delete raw.heroe.titulo;
    expect(messageOf(raw)).toContain("  • heroe.titulo — falta este campo");
  });

  it("rejects a negative price with a readable message", () => {
    const raw = loadFixture();
    raw.menu.productos[1].presentaciones[0].precio = -5;
    expect(messageOf(raw)).toContain("menu.productos[1].presentaciones[0].precio");
  });

  it("reports a non-numeric price as such", () => {
    const raw = loadFixture();
    raw.menu.productos[0].presentaciones[0].precio = "85";
    expect(messageOf(raw)).toContain(
      "menu.productos[0].presentaciones[0].precio — se esperaba un número, pero hay un texto",
    );
  });

  it("rejects a horario with 6 days", () => {
    const raw = loadFixture();
    raw.horario.semana.pop();
    expect(messageOf(raw)).toContain("horario.semana");
  });

  it("rejects repeated days and open days without hours", () => {
    const raw = loadFixture();
    raw.horario.semana[1].dia = "martes";
    raw.horario.semana[2] = { dia: "martes" };
    const msg = messageOf(raw);
    expect(msg).toContain("repetido");
    expect(msg).toContain("horario.semana[2].abre");
  });

  it("rejects unknown template tokens", () => {
    const raw = loadFixture();
    raw.seo.titulo = "{nombre} {ciudad}";
    expect(messageOf(raw)).toContain("seo.titulo — La plantilla usa {ciudad}");
    const raw2 = loadFixture();
    raw2.aviso.plantilla = "abrimos {apertura} {hora}";
    expect(messageOf(raw2)).toContain("aviso.plantilla — La plantilla usa {hora}");
  });

  it("rejects resenas enabled with an empty list in produccion", () => {
    const raw = loadFixture();
    raw.secciones.resenas = true;
    expect(messageOf(raw)).toContain("resenas.lista");
  });

  it("accepts resenas enabled with an authorized review", () => {
    const raw = loadFixture();
    raw.secciones.resenas = true;
    raw.resenas.lista = [
      { autor: "Ana", texto: "Muy rico", estrellas: 5, fecha: "2026-10-01", fuente: "Google", autorizada: true },
    ];
    expect(parseSite(raw).resenas.lista).toHaveLength(1);
  });

  it("rejects a review without autorizada", () => {
    const raw = loadFixture();
    raw.secciones.resenas = true;
    raw.resenas.lista = [{ autor: "Ana", texto: "Muy rico", estrellas: 5, fecha: "2026-10-01", fuente: "Google" }];
    expect(messageOf(raw)).toContain("resenas.lista[0].autorizada");
  });

  it("rejects a placeholder image in use in produccion, but not an unused one", () => {
    const raw = loadFixture();
    raw.imagenes.vaporera.placeholder = true;
    expect(messageOf(raw)).toContain("imagenes.vaporera.placeholder");

    const raw2 = loadFixture();
    raw2.imagenes.plato.placeholder = true;
    raw2.secciones.menu = false;
    raw2.navegacion = raw2.navegacion.filter((n: { ancla: string }) => n.ancla !== "#menu");
    expect(parseSite(raw2).estado).toBe("produccion");
  });

  it("rejects a placeholder social image in produccion", () => {
    const raw = loadFixture();
    raw.seo.imagenSocial.placeholder = true;
    expect(messageOf(raw)).toContain("seo.imagenSocial.placeholder");
  });

  it("accepts pending content of a disabled section in produccion", () => {
    const raw = loadFixture();
    raw.secciones.sazon = false;
    raw.sazon.pasos[0].texto = { pendiente: true, nota: "Falta" };
    expect(parseSite(raw).estado).toBe("produccion");
  });

  it("rejects pending content of an enabled section in produccion", () => {
    const raw = loadFixture();
    raw.secciones.sazon = true;
    raw.sazon.pasos[0].texto = { pendiente: true, nota: "Falta" };
    expect(messageOf(raw)).toContain("sazon.pasos[0].texto — Dato pendiente: Falta");
  });

  it("requires 3 to 5 sazon steps when enabled", () => {
    const raw = loadFixture();
    raw.secciones.sazon = true;
    raw.sazon.pasos = raw.sazon.pasos.slice(0, 2);
    expect(messageOf(raw)).toContain("sazon.pasos");
  });

  it("skips the aviso when it is inactive", () => {
    const raw = loadFixture();
    raw.aviso.activo = false;
    raw.aviso.apertura = { pendiente: true, nota: "x" };
    expect(parseSite(raw).estado).toBe("produccion");
  });

  it("requires an https seo.url in produccion", () => {
    const raw = loadFixture();
    raw.seo.url = "http://example.com";
    expect(messageOf(raw)).toContain("seo.url");
  });

  it("rejects an image reference that is not in imagenes", () => {
    const raw = loadSitio();
    raw.heroe.imagen = "nope";
    expect(messageOf(raw)).toContain("heroe.imagen — La imagen «nope» no existe");
  });

  describe("navegacion anchors", () => {
    it("accepts the anchors of enabled sections", () => {
      expect(parseSite(loadFixture()).navegacion.length).toBeGreaterThan(0);
    });

    it("rejects an anchor that is not a known section, even in borrador", () => {
      const raw = loadSitio();
      raw.navegacion[0].ancla = "#no-existe";
      expect(messageOf(raw)).toContain("navegacion[0].ancla — El ancla «#no-existe» no corresponde a ninguna sección");
    });

    it("rejects an anchor to a disabled section in produccion, but allows it in borrador", () => {
      const raw = loadFixture();
      raw.navegacion.push({ texto: "Reseñas", ancla: "#resenas" });
      expect(messageOf(raw)).toContain("apunta a una sección desactivada");
      raw.estado = "borrador";
      expect(() => parseSite(raw)).not.toThrow();
    });
  });

  describe("unique ids and types", () => {
    it("rejects duplicate product ids", () => {
      const raw = loadFixture();
      raw.menu.productos[1].id = raw.menu.productos[0].id;
      expect(messageOf(raw)).toContain("menu.productos[1].id — El id de producto");
    });

    it("rejects a repeated presentation within a product", () => {
      const raw = loadFixture();
      const first = raw.menu.productos[0].presentaciones[0];
      raw.menu.productos[0].presentaciones.push({ ...first });
      expect(messageOf(raw)).toContain("está repetida en este producto");
    });

    it("rejects a repeated reuniones option", () => {
      const raw = loadFixture();
      raw.reuniones.opciones.push({ ...raw.reuniones.opciones[0] });
      expect(messageOf(raw)).toContain("está repetida en reuniones");
    });

    it("allows the same presentation type in different products", () => {
      expect(() => parseSite(loadFixture())).not.toThrow();
    });
  });

  describe("horario consistency", () => {
    it("rejects closing at or before opening", () => {
      const raw = loadFixture();
      raw.horario.semana[1] = { dia: "martes", abre: "15:00", cierra: "08:00" };
      expect(messageOf(raw)).toContain("horario.semana[1].cierra — La hora de cierre (08:00) debe ser posterior");
      raw.horario.semana[1] = { dia: "martes", abre: "08:00", cierra: "08:00" };
      expect(messageOf(raw)).toContain("debe ser posterior");
    });

    it("rejects a closed day that still has hours", () => {
      const raw = loadFixture();
      raw.horario.semana[0] = { dia: "lunes", cerrado: true, abre: "08:00", cierra: "15:00" };
      const msg = messageOf(raw);
      expect(msg).toContain("horario.semana[0].abre — Un día cerrado no debe tener hora de apertura");
      expect(msg).toContain("horario.semana[0].cierra — Un día cerrado no debe tener hora de cierre");
    });

    it("accepts a closed day without hours and a valid open day", () => {
      const raw = loadFixture();
      raw.horario.semana[0] = { dia: "lunes", cerrado: true };
      raw.horario.semana[1] = { dia: "martes", abre: "08:00", cierra: "15:30" };
      expect(() => parseSite(raw)).not.toThrow();
    });
  });

  describe("ubicacion.mapsUrl host", () => {
    const ok = [
      "https://www.google.com/maps/place/Tulancingo",
      "https://google.com/maps?q=x",
      "https://maps.google.com/?q=x",
      "https://maps.app.goo.gl/abc123",
      "https://goo.gl/maps/abc123",
    ];
    for (const url of ok) {
      it(`accepts ${url}`, () => {
        const raw = loadFixture();
        raw.ubicacion.mapsUrl = url;
        expect(() => parseSite(raw)).not.toThrow();
      });
    }

    const bad = ["https://example.com/maps/x", "https://www.google.com/search?q=x", "https://goo.gl/abc", "https://evil.test/https://maps.google.com"];
    for (const url of bad) {
      it(`rejects ${url}`, () => {
        const raw = loadFixture();
        raw.ubicacion.mapsUrl = url;
        expect(messageOf(raw)).toContain("ubicacion.mapsUrl — Debe ser un enlace de Google Maps");
      });
    }

    it("does not check a pending mapsUrl", () => {
      const raw = loadFixture();
      raw.estado = "borrador";
      raw.ubicacion.mapsUrl = { pendiente: true, nota: "falta" };
      expect(() => parseSite(raw)).not.toThrow();
    });
  });

  it("isPending distinguishes markers from values", () => {
    expect(isPending({ pendiente: true, nota: "x" })).toBe(true);
    expect(isPending("x")).toBe(false);
    expect(isPending(null)).toBe(false);
    expect(isPending([])).toBe(false);
  });
});
