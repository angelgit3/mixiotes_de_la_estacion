# Mixiotes de la Estación · sitio web

Sitio de una sola página para **Mixiotes de la Estación** (Tulancingo de Bravo, Hgo.), un negocio de mixiotes 100% para llevar. Los clientes apartan por WhatsApp y recogen sin hacer fila.

- **Estático**: Astro 7 + Tailwind CSS 4. Casi 0 KB de JavaScript (todo es HTML y CSS).
- **Todo el contenido vive en un solo archivo**: `src/data/sitio.json`. No hace falta tocar código para cambiar textos, precios, horarios o fotos.
- **Estado actual: `borrador`**. Faltan datos por confirmar con el dueño; están listados en [`PENDIENTES.md`](PENDIENTES.md).

## Secciones y orden

De arriba hacia abajo:

1. Barra de aviso del día («Hoy: abrimos … · Aparta por WhatsApp»)
2. Encabezado y navegación
3. Héroe (portada)
4. **Cómo apartar** (3 pasos)
5. **Menú** (mixiote de carnero y de pollo, por pieza o por orden)
6. **El sazón** (cómo se prepara; *desactivada por ahora*)
7. **Pedidos para reuniones** (por docena o por kilo)
8. **Avisos y horarios especiales**
9. **Reseñas** (de Google; *desactivada por ahora*)
10. **Visítanos** (dirección, horario, teléfono, mapa)
11. Pie de página (contacto, redes, aviso de privacidad) y barra rápida en celular

Cada sección se enciende o apaga en `secciones` (ver más abajo).

## Requisitos y comandos

Necesitas **Node.js 22** y npm.

```bash
npm install          # instala dependencias (una sola vez)
npm run dev          # servidor de desarrollo con recarga (http://localhost:4321)
npm run build        # genera el sitio final en dist/
npm run preview      # sirve dist/ para revisarlo (usa --port 4321 si hace falta)
npm run check        # revisa tipos y archivos Astro (astro check)
npm test             # pruebas (vitest)
npm run verify       # check + test + build; es la prueba final antes de publicar
```

### Capturas de pantalla

Necesitan el sitio construido y servido (Playwright viene instalado de forma global, no es dependencia del proyecto):

```bash
# Terminal 1
npm run build && npm run preview -- --port 4321
# Terminal 2
npm run screenshots                  # -> docs/capturas/<ancho>.png (360, 390, 768, 1024, 1440, 1920)
```

También revisa que no haya scroll horizontal. Para fotografiar **todas** las secciones opcionales (incluso las apagadas), solo en borrador:

```bash
PREVIEW_ALL_SECTIONS=1 npm run build && npm run preview -- --port 4321
npm run screenshots -- --completo    # -> docs/capturas/completo/
```

Opción extra: `--url=http://localhost:4321/` para apuntar a otra dirección.

### Lighthouse (móvil)

Con el sitio servido en el puerto 4321 (igual que arriba):

```bash
npm run lighthouse                   # o: bash scripts/lighthouse.sh [url]
```

Escribe `docs/lighthouse/movil.report.html` y `.json` e imprime las calificaciones. Usa Chromium de Playwright (`CHROME_PATH` se puede cambiar). El último reporte guardado dio 100 en rendimiento, accesibilidad, buenas prácticas y SEO.

## Cómo editar el contenido

Todo está en **`src/data/sitio.json`**. Es JSON: respeta comillas dobles, comas entre elementos y sin coma después del último.

Mientras corres `npm run dev`, el sitio se recarga al guardar. Si el JSON tiene un error, el sitio **no compila** y te dice exactamente dónde está. Ejemplo:

```text
sitio.json no es válido (estado: borrador):
  • contacto.whatsapp — Debe tener exactamente 10 dígitos, sin espacios ni guiones ni +52
  • menu.productos[0].presentaciones[0].precio — se esperaba un número, pero hay un texto
  • ubicacion.cp — clave desconocida (¿error de escritura?)
```

### Mapa de claves principales

| Clave | Qué controla |
|---|---|
| `estado` | `"borrador"` o `"produccion"` (ver más abajo) |
| `negocio` | nombre, ciudad, región, tipo de cocina |
| `seo` | dominio (`url`), título, descripción, imagen para redes, color |
| `contacto` | `whatsapp`, `telefono`, `redes` |
| `whatsapp` | plantillas de los mensajes prellenados |
| `ubicacion` | calle, colonia, código postal, enlace de Maps, coordenadas |
| `horario.semana` | horario de los 7 días |
| `aviso` | barra de aviso del día |
| `secciones` | enciende/apaga cada sección |
| `heroe`, `comoApartar`, `menu`, `sazon`, `reuniones`, `avisos`, `resenas`, `visitanos`, `pie` | textos de cada sección |
| `imagenes` | las 5 fotos (archivo, texto alternativo, si es provisional) |
| `ui` | etiquetas pequeñas («Dato pendiente», días de la semana, etc.) |

### Un dato pendiente y cómo confirmarlo

Un dato sin confirmar se ve así:

```json
"whatsapp": {
  "pendiente": true,
  "nota": "Número de WhatsApp (10 dígitos) que recibirá los apartados.",
  "porConfirmar": "7750000000"
}
```

- `pendiente: true` marca que falta confirmarlo.
- `nota` explica qué falta (el validador la muestra en la lista de pendientes).
- `porConfirmar` (opcional) es un candidato **no confirmado**. En borrador se muestra con la insignia «Dato pendiente»; nunca se usa en los datos estructurados (JSON-LD) ni en enlaces de teléfono o WhatsApp. La única excepción es el botón «Cómo llegar»: en borrador busca en Google Maps la dirección por confirmar, para poder probarlo.

Para confirmarlo, **reemplaza todo el objeto** por el valor final:

**WhatsApp** (10 dígitos, sin espacios, guiones ni +52):

```json
"whatsapp": "7750000000"
```

**Un precio** (número en pesos, sin `$`):

```json
"precio": { "pendiente": true, "nota": "Precio por pieza de mixiote de carnero." }
```
```json
"precio": 45
```

**Horario semanal** (`horario.semana`, siempre los 7 días, sin repetir; cada día abierto necesita `abre` y `cierra` en formato 24 h `HH:MM`; `nota` es opcional). Los horarios de este ejemplo son inventados, solo para mostrar el formato:

```json
"horario": {
  "semana": [
    { "dia": "lunes",     "cerrado": true },
    { "dia": "martes",    "abre": "08:00", "cierra": "15:00", "nota": "o hasta agotar" },
    { "dia": "miercoles", "abre": "08:00", "cierra": "15:00", "nota": "o hasta agotar" },
    { "dia": "jueves",    "abre": "08:00", "cierra": "15:00", "nota": "o hasta agotar" },
    { "dia": "viernes",   "abre": "08:00", "cierra": "15:00", "nota": "o hasta agotar" },
    { "dia": "sabado",    "abre": "08:00", "cierra": "15:00", "nota": "o hasta agotar" },
    { "dia": "domingo",   "abre": "08:00", "cierra": "14:00", "nota": "o hasta agotar" }
  ]
}
```

Los días son: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo` (sin acentos).

**Coordenadas** (`ubicacion.geo`, de la ficha de Google Maps; los números van sin comillas):

```json
"geo": { "lat": 20.0000, "lng": -98.0000 }
```

(Valores de ejemplo, no son los del negocio.) Lo mismo aplica a `codigoPostal` (texto de 5 dígitos, por ejemplo `"12345"` solo como formato), `mapsUrl` (empieza con `https://`) y `seo.url`.

### Activar o apagar secciones

```json
"secciones": {
  "comoApartar": true,
  "menu": true,
  "sazon": false,
  "reuniones": true,
  "avisos": true,
  "resenas": false,
  "visitanos": true
}
```

Una sección apagada no aparece en el sitio y sus pendientes **no** bloquean la publicación. Al encender `sazon` hacen falta de 3 a 5 pasos completos; al encender `resenas`, al menos una reseña autorizada. Si cambias las secciones, revisa también `navegacion`.

### Aviso del día (barra superior)

```json
"aviso": {
  "activo": true,
  "etiqueta": "Hoy",
  "plantilla": "abrimos {apertura} · {cierre}",
  "apertura": "8:00 a.m.",
  "cierre": "hasta agotar",
  "cta": "Aparta por WhatsApp"
}
```

La plantilla solo admite `{apertura}` y `{cierre}`. Cuando cambie el horario del día, edita `apertura`/`cierre`; para quitar la barra, pon `"activo": false`.

### Avisos especiales

Cierres y cambios de horario. Cada aviso en `avisos.lista`:

```json
"lista": [
  {
    "fecha": "2026-12-24",
    "titulo": "Cerramos temprano",
    "detalle": "Atendemos hasta las 12:00 por Nochebuena.",
    "tipo": "horario",
    "mostrarHasta": "2026-12-25"
  }
]
```

- `fecha` y `mostrarHasta` usan el formato `AAAA-MM-DD`. `tipo` puede ser `cerrado`, `horario` o `general`. `detalle` y `mostrarHasta` son opcionales.
- Sin `mostrarHasta`, el aviso se muestra hasta su `fecha`.
- **Importante**: los avisos vencidos se ocultan al *construir* el sitio (con la fecha de Ciudad de México). Como es un sitio estático, hay que **volver a construir y publicar** para que un aviso vencido desaparezca. Si el sitio está en Cloudflare Pages/Netlify/Vercel, un redeploy basta.

### Reseñas de Google (solo con permiso)

Primero activa `"resenas": true` en `secciones`. Solo agrega reseñas **con autorización de quien las escribió**:

```json
"lista": [
  {
    "autor": "Nombre como lo autorizó",
    "texto": "Texto de la reseña, tal cual.",
    "estrellas": 5,
    "fecha": "2026-10-15",
    "fuente": "Google",
    "url": "https://maps.app.goo.gl/...",
    "autorizada": true
  }
]
```

`autorizada` debe ser exactamente `true`; sin eso el sitio no compila. `url` es opcional.

### Mensajes de WhatsApp

En `whatsapp.apartar` y `whatsapp.eventos` están los mensajes que se precargan al tocar los botones. Los guiones bajos (`__`) son espacios que el cliente completa. Edítalos como texto normal.

## Cómo cambiar los placeholders por fotos reales

Las fotos actuales son ilustraciones provisionales. Hay 5 tomas (medidas actuales de los archivos):

| Clave | Toma | Proporción | Tamaño |
|---|---|---|---|
| `vaporera` | Vaporera abierta con los mixiotes humeando | 4:5 | 1200 × 1500 |
| `mostrador` | Mostrador donde se despacha | 4:3 | 1600 × 1200 |
| `plato` | Mixiote abierto en plato con nopales, salsa y tortillas | 4:3 | 1600 × 1200 |
| `empaque` | Empaque para llevar listo para entregar | 1:1 | 1200 × 1200 |
| `fachada` | Fachada con el letrero, desde la banqueta | 3:2 | 1800 × 1200 |

Pasos para cada foto:

1. Copia el archivo a `src/assets/fotos/` (`jpg`, `png`, `webp` o `avif`). Debe tener **al menos ese tamaño y la misma proporción**.
2. En `sitio.json`, en `imagenes.<clave>`, cambia `archivo` al nombre nuevo.
3. Reescribe `alt` describiendo lo que realmente se ve en la foto.
4. Pon `"placeholder": false`.
5. `toma` es solo la nota de qué fotografiar; puedes borrarla o dejarla.

```json
"vaporera": {
  "archivo": "vaporera-real.jpg",
  "alt": "Vaporera abierta con mixiotes humeando sobre la estufa.",
  "placeholder": false
}
```

Astro genera solo las versiones AVIF/WebP y los tamaños responsivos; no hay que optimizar a mano.

**Imagen para redes** (`public/og.png`, 1200 × 630): reemplaza el archivo y en `seo.imagenSocial` actualiza `alt` y pon `"placeholder": false`.

**Regenerar los placeholders** (solo si se necesitan de nuevo; requiere Playwright global y **sobrescribe** `src/assets/fotos/*.png`, `public/og.png` e íconos):

```bash
node scripts/placeholders/generate.mjs
```

## De `borrador` a `produccion`

`"estado": "borrador"` (valor actual) significa:

- Los datos sin confirmar se muestran marcados con la insignia «Dato pendiente».
- El botón de WhatsApp aparece como «Número pendiente» (sin enlace).
- Las fotos provisionales se aceptan.

> No publiques la versión borrador en el dominio público: muestra datos sin confirmar (aunque marcados). Para que el dueño la revise, usa una URL de vista previa.

Lista para pasar a producción:

1. Completa todo lo de [`PENDIENTES.md`](PENDIENTES.md).
2. Cambia las 5 fotos y la imagen para redes (secciones anteriores).
3. Define `seo.url` con el dominio real (`https://...`).
4. Cambia `"estado": "produccion"`.
5. Corre `npm run verify`.

En producción, el validador **rechaza** el sitio y lista cada pendiente que quede (en secciones activas), fotos provisionales en uso, imagen social provisional y `seo.url` sin `https://`. No hay que adivinar: la lista sale en la terminal con la ruta exacta de cada campo.

## Despliegue recomendado

No está desplegado: hace falta autorización del dueño y el dominio.

- **Cloudflare Pages** (recomendado): gratis, rápido en México y simple.
- **Netlify** o **Vercel**: alternativas equivalentes.

Configuración (la misma en las tres):

| Ajuste | Valor |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 22 |

Después de desplegar:

1. Pon el dominio en `seo.url` y vuelve a desplegar (el sitemap y el robots usan ese dato).
2. Revisa `/robots.txt` y `/sitemap-index.xml`.
3. La ficha de **Google Business Profile** debe coincidir con el sitio: mismo nombre, dirección, teléfono y horario.

## Estructura del proyecto

```text
src/
  data/
    sitio.json        TODO el contenido editable
    schema.ts         reglas del contenido (zod): qué es válido y qué falta en producción
    validate.ts       mensajes de error legibles en español
    site.ts           carga y valida sitio.json; enlaza las fotos
  lib/                utilidades: enlaces (WhatsApp, Maps, tel), JSON-LD, pendientes, avisos, formato
  components/
    sections/         una pieza por sección (Hero, Menu, Visit, Footer, ...)
    ui/               piezas pequeñas (botones, foto, insignia de pendiente, ...)
  layouts/BaseLayout.astro   html, SEO y datos estructurados
  pages/              index.astro, robots.txt.ts, site.webmanifest.ts
  styles/global.css   tokens de diseño (Tailwind 4)
  assets/fotos/       las 5 fotos del sitio
public/               fuentes, favicon, íconos, og.png, textura
scripts/              screenshots.mjs, lighthouse.sh, placeholders/
tests/                pruebas del esquema y de las utilidades
docs/                 diseño, fuentes, referencia, capturas y Lighthouse
astro.config.mjs      sitio estático + sitemap
```

## Verificación

- **Pruebas** (`npm test`): validan el esquema (borrador y producción), enlaces de WhatsApp/Maps, JSON-LD, filtrado de avisos y formatos. Hay un contenido de ejemplo de producción en `tests/fixtures/`.
- **Capturas** en `docs/capturas/` (360 a 1920 px; en `completo/` con todas las secciones).
- **Lighthouse móvil** en `docs/lighthouse/movil.report.html`.

## Más documentación

- [`PENDIENTES.md`](PENDIENTES.md): qué datos faltan y qué bloquea cada uno.
- [`docs/diseno.md`](docs/diseno.md): concepto visual, colores, contraste y tipografía.
- [`docs/fonts.md`](docs/fonts.md): fuentes autoalojadas y licencias.
- [`docs/referencia-franklin.md`](docs/referencia-franklin.md): hipótesis de estructura tomada de otro sitio como inspiración (no se pudo verificar; ver el aviso al inicio).
