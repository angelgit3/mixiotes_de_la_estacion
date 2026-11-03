# Diseño: «Rótulo de barrio»

## Concepto
El sitio imita un letrero pintado a mano de barrio: letras condensadas y pesadas, marcos dobles, sellos ligeramente girados, números en insignias y sombras duras (sin desenfoques). Una sola idea fuerte por sección. Se inspira en la estructura de franklinbbq.com (ver `referencia-franklin.md`), no en su marca. Sin JavaScript: todo es HTML y CSS.

## Tokens (`src/styles/global.css`, bloque `@theme`)
Marca: `papel #F3E9D8`, `adobo #9E2B1D`, `maiz #F0B83C`, `nopal #2E5A3A`, `tinta #1E1A16`.
Añadidos para contraste y profundidad: `papel-claro #FBF6EA` (tarjetas), `papel-oscuro #E6D8BE` (bandas), `adobo-oscuro #7E2015` (hover), `nopal-oscuro #224A2E` (hover y tarjetas), `tinta-suave #4A4036` (texto secundario).
Alias semánticos: `background`, `surface`, `foreground`, `muted`, `primary`, `primary-foreground`, `accent`, `success`, `inverse`, `border`; `rounded-brand`; sombras `shadow-sello`, `shadow-tarjeta`, `shadow-placa`.
El grano del papel es un SVG (feTurbulence) en data-URI, en mosaico de 160 px.

## Contraste medido (WCAG 2.x)
| Texto | Fondo | Razón | Dónde | Resultado |
|---|---|---|---|---|
| tinta | papel | 14.37:1 | Texto base sobre fondo | AA |
| tintaSuave | papel | 8.40:1 | Texto secundario, antetítulo | AA |
| adobo | papel | 6.20:1 | Títulos, h1 | AA |
| adobo | papelClaro | 6.91:1 | Títulos en tarjetas | AA |
| tintaSuave | papelClaro | 9.37:1 | Fecha, etiquetas en tarjetas | AA |
| tinta | papelOscuro | 12.29:1 | Texto en secciones oscuras de papel | AA |
| adobo | papelOscuro | 5.30:1 | Títulos en bandas papel-oscuro | AA |
| papel | adobo | 6.20:1 | Botón primario, placa del logo | AA |
| papel | nopal | 6.61:1 | Botón WhatsApp, sección Reuniones | AA |
| papel | nopalOscuro | 8.37:1 | Tarjetas de precio en Reuniones | AA |
| tinta | maiz | 9.57:1 | Barra de aviso, botón maiz, sello | AA |
| tintaSuave | maiz | 5.60:1 | Chip pendiente en la barra de aviso | AA |
| maiz | tinta | 9.57:1 | Etiqueta Hoy, títulos de pie | AA |
| papel | tinta | 14.37:1 | Pie de página, etiqueta de foto | AA |
| papelOscuro | tinta | 12.29:1 | Texto secundario del pie | AA |
| maiz | nopal | 4.40:1 | Anillo de foco en Reuniones (no texto, mínimo 3) | solo no-texto / texto grande |
| maiz | adobo | 4.13:1 | Referencia: solo texto grande (no usado en texto) | solo no-texto / texto grande |
| tinta | papelClaro | 16.03:1 | Texto en tarjetas | AA |

Regla: maíz sobre nopal (4.40) y maíz sobre adobo (4.13) nunca se usan para texto pequeño. El anillo de foco es de 3 px: `tinta` por defecto y `maiz` en superficies oscuras (Reuniones, pie); ambos superan 3:1 contra su fondo.

## Tipografía
- **Anton** (títulos): condensada y pesada, da el aspecto de rótulo y permite palabras largas en español (SAZÓN, REUNIONES, ESTACIÓN) en pantallas de 360 px. Es la única con precarga (es la fuente del h1).
- **Yellowtail** (acento, una vez por pantalla): trazo de pincel para el sello «¡Aparta los tuyos!».
- **Archivo** 400/600/700 (texto): legible y neutra, con buena presencia en mayúsculas espaciadas.
Las tres tienen ñ, acentos, ¿ ¡ « » (ver `fonts.md`). Total cercano a 80 KB, con `font-display: swap`, `unicode-range` Latin y fallbacks con métricas ajustadas (`size-adjust`, `ascent-override`) para limitar el CLS.

## Mapa de componentes
- `layouts/BaseLayout.astro`: html, SEO, JSON-LD, enlace de salto.
- `components/ui/`: Container, Section, SectionHeading, Button, WhatsAppButton, MapsButton, Wordmark, Photo, Steam, SazonIcon, Pending, Value.
- `components/sections/`: NoticeBar, Header, MobileBar, Hero, HowToOrder, Menu, Sazon, Gatherings, Notices, Reviews, Visit, Footer.
- `pages/index.astro` los ordena según `secciones` de `sitio.json`.

Datos pendientes: `Value` muestra el valor o `porConfirmar` y añade la insignia «Dato pendiente» solo en borrador. Si el WhatsApp está pendiente, los botones son un `span` con la misma forma y la insignia «Número pendiente». Los botones «Cómo llegar» (`MapsButton`) muestran la insignia «Dirección pendiente» (mismo estilo) mientras `mapsUrl` y la calle o colonia estén pendientes.

Utilidad `textura-papel` (antes `bg-textura`): añade el grano de papel como `background-image`. No lleva prefijo `bg-` a propósito: tailwind-merge lo confundía con un color de fondo y eliminaba `bg-papel-oscuro` en `Section`.

Accesibilidad: `html` define `scroll-padding-top/bottom` (el inferior reserva la barra móvil fija, < 64rem) para que el foco y los anclas no queden tapados; los botones animan solo `background-color`, `color` y `border-color` (no `outline-color`) para que el anillo de foco no parpadee.

## Movimiento
La única animación es el vapor sobre la vaporera (`.vapor`): solo `transform` y `opacity`, y se oculta con `prefers-reduced-motion: reduce`. El desplazamiento suave también se desactiva con esa preferencia.

## Cómo ajustar
- Colores: edita los `--color-*` en `@theme`; revisa la tabla de contraste después.
- Textos: solo en `src/data/sitio.json` (las cadenas de interfaz van en `ui`, con su regla en `schema.ts`).
- Capturas: `npm run build`, `npm run preview -- --port 4321` y `npm run screenshots` (o `-- --completo` con `PREVIEW_ALL_SECTIONS=1` para ver todas las secciones).
