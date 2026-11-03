import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Pending values                                                      */
/* ------------------------------------------------------------------ */

/** A value that is not confirmed yet. `porConfirmar` is an unconfirmed candidate. */
export interface PendingValue<T> {
  pendiente: true;
  nota: string;
  porConfirmar?: T | undefined;
}

/** Either a confirmed value or a pending marker. */
export type Pending<T> = T | PendingValue<T>;

/** Type guard: is this value a pending marker object? */
export function isPending(value: unknown): value is PendingValue<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).pendiente === true
  );
}

const text = z.string().min(1, "El texto no puede estar vacío");

function pendingOf<T extends z.ZodType>(inner: T) {
  return z.union([
    inner,
    z.strictObject({
      pendiente: z.literal(true),
      nota: text,
      porConfirmar: inner.optional(),
    }),
  ]);
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const httpsUrl = z
  .string()
  .regex(/^https:\/\/[^\s/]+\S*$/, "Debe ser una dirección web completa que empiece con https://");
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Debe tener el formato AAAA-MM-DD")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "No es una fecha válida");
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Debe tener el formato HH:MM (24 horas)");
const price = z.number().positive("El precio debe ser mayor que cero");
const whatsappNumber = z
  .string()
  .regex(/^\d{10}$/, "Debe tener exactamente 10 dígitos, sin espacios ni guiones ni +52");
const phoneDisplay = z
  .string()
  .refine((s) => s.replace(/\D/g, "").length >= 10, "El teléfono debe tener al menos 10 dígitos");

export const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;
export const PRESENTATION_TYPES = ["pieza", "orden", "docena", "kilo"] as const;
export const SAZON_ILLUSTRATIONS = ["adobo", "envuelto", "vapor", "despacho"] as const;
export const SECTION_KEYS = ["comoApartar", "menu", "sazon", "reuniones", "avisos", "resenas", "visitanos"] as const;
/** Anchor id used in the page for each section key. */
export const SECTION_ANCHORS: Record<(typeof SECTION_KEYS)[number], string> = {
  comoApartar: "como-apartar",
  menu: "menu",
  sazon: "sazon",
  reuniones: "reuniones",
  avisos: "avisos",
  resenas: "resenas",
  visitanos: "visitanos",
};

const dayEntry = z
  .strictObject({
    dia: z.enum(DAYS),
    cerrado: z.boolean().optional(),
    abre: hhmm.optional(),
    cierra: hhmm.optional(),
    nota: text.optional(),
  })
  .superRefine((d, ctx) => {
    if (!d.cerrado) {
      if (!d.abre) ctx.addIssue({ code: "custom", path: ["abre"], message: "Un día abierto necesita hora de apertura" });
      if (!d.cierra) ctx.addIssue({ code: "custom", path: ["cierra"], message: "Un día abierto necesita hora de cierre" });
      if (d.abre && d.cierra && d.cierra <= d.abre) {
        ctx.addIssue({
          code: "custom",
          path: ["cierra"],
          message: `La hora de cierre (${d.cierra}) debe ser posterior a la de apertura (${d.abre})`,
        });
      }
    } else {
      if (d.abre !== undefined) {
        ctx.addIssue({ code: "custom", path: ["abre"], message: "Un día cerrado no debe tener hora de apertura" });
      }
      if (d.cierra !== undefined) {
        ctx.addIssue({ code: "custom", path: ["cierra"], message: "Un día cerrado no debe tener hora de cierre" });
      }
    }
  });

const week = z.array(dayEntry).length(7, "El horario debe tener exactamente 7 días").superRefine((arr, ctx) => {
  const seen = new Set<string>();
  arr.forEach((d, i) => {
    if (seen.has(d.dia)) ctx.addIssue({ code: "custom", path: [i, "dia"], message: `El día «${d.dia}» está repetido` });
    seen.add(d.dia);
  });
});

const image = z.strictObject({
  archivo: text,
  alt: text,
  placeholder: z.boolean(),
  toma: text.optional(),
});

const notice = z.strictObject({
  fecha: isoDate,
  titulo: text,
  detalle: text.optional(),
  tipo: z.enum(["cerrado", "horario", "general"]),
  mostrarHasta: isoDate.optional(),
});

const review = z.strictObject({
  autor: text,
  texto: text,
  estrellas: z.number().int().min(1).max(5),
  fecha: isoDate,
  fuente: z.literal("Google"),
  url: httpsUrl.optional(),
  autorizada: z.literal(true, { error: "La reseña necesita autorización del autor (autorizada: true)" }),
});

const presentationType = z.enum(PRESENTATION_TYPES);

/* ------------------------------------------------------------------ */
/* Site schema                                                         */
/* ------------------------------------------------------------------ */

const baseSchema = z.strictObject({
  estado: z.enum(["borrador", "produccion"]),
  negocio: z.strictObject({
    nombre: pendingOf(text),
    modalidad: text,
    ciudad: text,
    region: text,
    regionCorta: text,
    pais: z.string().length(2),
    cocina: text,
  }),
  seo: z.strictObject({
    url: pendingOf(z.url()),
    titulo: text,
    tituloProvisional: text,
    nombreCortoProvisional: text,
    descripcion: text,
    imagenSocial: z.strictObject({
      archivo: text,
      ancho: z.number().int().positive(),
      alto: z.number().int().positive(),
      alt: text,
      placeholder: z.boolean(),
    }),
    colorTema: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Debe ser un color hexadecimal como #9E2B1D"),
  }),
  contacto: z.strictObject({
    whatsapp: pendingOf(whatsappNumber),
    telefono: pendingOf(phoneDisplay),
    redes: z.array(z.strictObject({ red: text, url: pendingOf(httpsUrl) })),
  }),
  whatsapp: z.strictObject({ apartar: text, eventos: text }),
  ubicacion: z.strictObject({
    calle: pendingOf(text),
    colonia: pendingOf(text),
    codigoPostal: pendingOf(z.string().regex(/^\d{5}$/, "Debe tener 5 dígitos")),
    mapsUrl: pendingOf(httpsUrl),
    geo: pendingOf(
      z.strictObject({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      }),
    ),
  }),
  horario: z.strictObject({ semana: pendingOf(week) }),
  aviso: z.strictObject({
    activo: z.boolean(),
    etiqueta: text,
    plantilla: text,
    apertura: pendingOf(text),
    cierre: pendingOf(text),
    cta: text,
  }),
  navegacion: z.array(z.strictObject({ texto: text, ancla: z.string().regex(/^#[a-z0-9-]+$/) })),
  secciones: z.strictObject({
    comoApartar: z.boolean(),
    menu: z.boolean(),
    sazon: z.boolean(),
    reuniones: z.boolean(),
    avisos: z.boolean(),
    resenas: z.boolean(),
    visitanos: z.boolean(),
  }),
  heroe: z.strictObject({
    antetitulo: text,
    titulo: text,
    descripcion: text,
    acento: text,
    ctaPrincipal: text,
    ctaSecundario: text,
    nota: text,
    imagen: text,
  }),
  comoApartar: z.strictObject({
    titulo: text,
    intro: text,
    pasos: z.array(z.strictObject({ titulo: text, texto: text })).min(1),
    cta: text,
    imagen: text,
  }),
  menu: z.strictObject({
    titulo: text,
    intro: text,
    etiquetaIncluye: text,
    productos: z
      .array(
        z.strictObject({
          id: z.string().regex(/^[a-z0-9-]+$/),
          nombre: pendingOf(text),
          presentaciones: z.array(z.strictObject({ tipo: presentationType, precio: pendingOf(price) })).min(1),
          incluye: pendingOf(z.array(text).min(1)),
        }),
      )
      .min(1),
    imagen: text,
  }),
  sazon: z.strictObject({
    titulo: text,
    intro: text,
    pasos: z
      .array(
        z.strictObject({
          ilustracion: z.enum(SAZON_ILLUSTRATIONS),
          titulo: pendingOf(text),
          texto: pendingOf(text),
        }),
      )
      .min(1),
  }),
  reuniones: z.strictObject({
    titulo: text,
    texto: text,
    opciones: z.array(z.strictObject({ tipo: presentationType, precio: pendingOf(price) })).min(1),
    anticipacion: pendingOf(text),
    etiquetaAnticipacion: text,
    cta: text,
    imagen: text,
  }),
  avisos: z.strictObject({ titulo: text, intro: text, vacio: text, lista: z.array(notice) }),
  resenas: z.strictObject({ titulo: text, intro: text, lista: z.array(review) }),
  visitanos: z.strictObject({
    titulo: text,
    soloLlevar: text,
    etiquetaDireccion: text,
    etiquetaHorario: text,
    etiquetaTelefono: text,
    cta: text,
    imagen: text,
  }),
  pie: z.strictObject({
    etiquetaContacto: text,
    etiquetaRedes: text,
    privacidadTitulo: text,
    privacidad: text,
  }),
  imagenes: z.record(z.string(), image),
  ui: z.strictObject({
    saltarContenido: text,
    navegacionPrincipal: text,
    datoPendiente: text,
    numeroPendiente: text,
    direccionPendiente: text,
    precioPendiente: text,
    textoPendiente: text,
    fotoPendiente: text,
    presentaciones: z.strictObject({ pieza: text, orden: text, docena: text, kilo: text }),
    dias: z.strictObject({
      lunes: text,
      martes: text,
      miercoles: text,
      jueves: text,
      viernes: text,
      sabado: text,
      domingo: text,
    }),
    cerrado: text,
    abreWhatsapp: text,
    abreMaps: text,
    inicio: text,
    barraRapida: text,
    codigoPostal: text,
    estrellas: text,
    tiposAviso: z.strictObject({ cerrado: text, horario: text, general: text }),
  }),
});

/* ------------------------------------------------------------------ */
/* Cross-field rules                                                   */
/* ------------------------------------------------------------------ */

type Base = z.infer<typeof baseSchema>;

/** Tokens each template may reference. */
export const TEMPLATE_TOKENS = {
  "seo.titulo": ["nombre"],
  "aviso.plantilla": ["apertura", "cierre"],
} as const;

function checkTemplate(template: string, allowed: readonly string[], path: string[], ctx: z.RefinementCtx) {
  for (const match of template.matchAll(/\{([^{}]*)\}/g)) {
    const token = match[1] ?? "";
    if (!allowed.includes(token)) {
      ctx.addIssue({
        code: "custom",
        path,
        message: `La plantilla usa {${token}}, que no existe. Opciones: ${allowed.map((t) => `{${t}}`).join(", ")}`,
      });
    }
  }
}

function findPending(node: unknown, path: (string | number)[], out: { path: (string | number)[]; nota: string }[]) {
  if (isPending(node)) {
    out.push({ path, nota: node.nota });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => findPending(v, [...path, i], out));
  } else if (typeof node === "object" && node !== null) {
    for (const [k, v] of Object.entries(node)) findPending(v, [...path, k], out);
  }
}

/** True when the top-level key is part of the published page. */
function isPublishable(key: string, data: Base): boolean {
  if (key === "aviso") return data.aviso?.activo === true;
  if ((SECTION_KEYS as readonly string[]).includes(key)) {
    return data.secciones?.[key as (typeof SECTION_KEYS)[number]] === true;
  }
  return true;
}

/** Hosts accepted for a confirmed Google Maps link. */
function isGoogleMapsUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  const host = u.hostname.toLowerCase();
  const path = u.pathname;
  if (host === "google.com" || host === "www.google.com") return path.startsWith("/maps");
  if (host === "maps.google.com") return true;
  if (host === "maps.app.goo.gl") return true;
  if (host === "goo.gl") return path.startsWith("/maps");
  return false;
}

function findDuplicates(values: string[]): number[] {
  const seen = new Set<string>();
  const dup: number[] = [];
  values.forEach((v, i) => {
    if (seen.has(v)) dup.push(i);
    seen.add(v);
  });
  return dup;
}

export const siteSchema = baseSchema.superRefine((data, ctx) => {
  checkTemplate(data.seo?.titulo ?? "", TEMPLATE_TOKENS["seo.titulo"], ["seo", "titulo"], ctx);
  checkTemplate(data.aviso?.plantilla ?? "", TEMPLATE_TOKENS["aviso.plantilla"], ["aviso", "plantilla"], ctx);

  // Image references must exist in `imagenes` (all states).
  const imageRefs: { path: string[]; key: unknown; enabled: boolean }[] = [
    { path: ["heroe", "imagen"], key: data.heroe?.imagen, enabled: true },
  ];
  for (const section of SECTION_KEYS) {
    const block = (data as Record<string, unknown>)[section] as { imagen?: unknown } | undefined;
    if (block && "imagen" in block) {
      imageRefs.push({ path: [section, "imagen"], key: block.imagen, enabled: data.secciones?.[section] === true });
    }
  }
  for (const ref of imageRefs) {
    if (typeof ref.key === "string" && !(data.imagenes && ref.key in data.imagenes)) {
      ctx.addIssue({ code: "custom", path: ref.path, message: `La imagen «${ref.key}» no existe en imagenes` });
    }
  }

  // Navigation anchors must point at a known section (all states); in produccion that section must be enabled.
  const anchorToKey = new Map(Object.entries(SECTION_ANCHORS).map(([k, id]) => [`#${id}`, k as SectionKey]));
  (data.navegacion ?? []).forEach((item, i) => {
    const key = anchorToKey.get(item.ancla);
    if (!key) {
      ctx.addIssue({
        code: "custom",
        path: ["navegacion", i, "ancla"],
        message: `El ancla «${item.ancla}» no corresponde a ninguna sección. Opciones: ${[...anchorToKey.keys()].join(", ")}`,
      });
    } else if (data.estado === "produccion" && data.secciones?.[key] !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["navegacion", i, "ancla"],
        message: `El enlace «${item.ancla}» apunta a una sección desactivada (secciones.${key} es false)`,
      });
    }
  });

  // Unique ids and presentation types (all states).
  const products = data.menu?.productos ?? [];
  for (const i of findDuplicates(products.map((p) => p.id))) {
    ctx.addIssue({
      code: "custom",
      path: ["menu", "productos", i, "id"],
      message: `El id de producto «${products[i]?.id}» está repetido`,
    });
  }
  products.forEach((p, i) => {
    for (const j of findDuplicates(p.presentaciones.map((x) => x.tipo))) {
      ctx.addIssue({
        code: "custom",
        path: ["menu", "productos", i, "presentaciones", j, "tipo"],
        message: `La presentación «${p.presentaciones[j]?.tipo}» está repetida en este producto`,
      });
    }
  });
  const options = data.reuniones?.opciones ?? [];
  for (const j of findDuplicates(options.map((o) => o.tipo))) {
    ctx.addIssue({
      code: "custom",
      path: ["reuniones", "opciones", j, "tipo"],
      message: `La opción «${options[j]?.tipo}» está repetida en reuniones`,
    });
  }

  // A confirmed Maps link must be a Google Maps URL (all states).
  const mapsUrl = data.ubicacion?.mapsUrl;
  if (typeof mapsUrl === "string" && !isGoogleMapsUrl(mapsUrl)) {
    ctx.addIssue({
      code: "custom",
      path: ["ubicacion", "mapsUrl"],
      message:
        "Debe ser un enlace de Google Maps (google.com/maps, maps.google.com, maps.app.goo.gl o goo.gl/maps)",
    });
  }

  if (data.estado !== "produccion") return;

  // 1. No pending values in publishable content.
  const found: { path: (string | number)[]; nota: string }[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "estado" || key === "imagenes" || key === "ui") continue;
    if (!isPublishable(key, data)) continue;
    findPending(value, [key], found);
  }
  for (const f of found) {
    ctx.addIssue({ code: "custom", path: f.path, message: `Dato pendiente: ${f.nota}` });
  }

  // 2. No placeholder images in use.
  if (data.seo?.imagenSocial?.placeholder === true) {
    ctx.addIssue({
      code: "custom",
      path: ["seo", "imagenSocial", "placeholder"],
      message: "La imagen para redes es provisional (placeholder)",
    });
  }
  for (const ref of imageRefs) {
    if (!ref.enabled || typeof ref.key !== "string") continue;
    if (data.imagenes?.[ref.key]?.placeholder === true) {
      const toma = data.imagenes[ref.key]?.toma;
      ctx.addIssue({
        code: "custom",
        path: ["imagenes", ref.key, "placeholder"],
        message: `Foto provisional en uso (${ref.path.join(".")})${toma ? `: falta la foto real — ${toma}` : ""}`,
      });
    }
  }

  // 3. Extra production rules.
  const url = data.seo?.url;
  if (typeof url === "string" && !/^https:\/\//.test(url)) {
    ctx.addIssue({ code: "custom", path: ["seo", "url"], message: "En producción la dirección debe ser https://" });
  }
  if (data.secciones?.resenas) {
    if (data.resenas.lista.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["resenas", "lista"],
        message: "La sección de reseñas está activa pero no hay ninguna reseña",
      });
    }
  }
  if (data.secciones?.sazon) {
    const n = data.sazon.pasos.length;
    if (n < 3 || n > 5) {
      ctx.addIssue({
        code: "custom",
        path: ["sazon", "pasos"],
        message: `La sección «sazón» necesita entre 3 y 5 pasos (hay ${n})`,
      });
    }
  }
});

export type SiteData = z.infer<typeof siteSchema>;
export type SectionKey = (typeof SECTION_KEYS)[number];
export type Day = (typeof DAYS)[number];
export type PresentationType = (typeof PRESENTATION_TYPES)[number];
export type DayEntry = z.infer<typeof dayEntry>;
export type Notice = z.infer<typeof notice>;
export type Review = z.infer<typeof review>;
export type ImageEntry = z.infer<typeof image>;
export type SazonIllustration = (typeof SAZON_ILLUSTRATIONS)[number];
