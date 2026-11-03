# Pendientes para publicar

Lista de todo lo que falta confirmar con el dueño antes de pasar el sitio de `borrador` a `produccion`. Los campos están en `src/data/sitio.json` (la ruta se escribe con puntos; `[0]` es el primer elemento de una lista). Cómo reemplazar cada valor: ver [`README.md`](README.md#un-dato-pendiente-y-cómo-confirmarlo).

Los valores marcados **«por confirmar»** son candidatos que ya aparecen en el borrador pero **no están confirmados**. No los des por buenos.

## Resumen

Hay 32 campos pendientes en `sitio.json`, más 6 fotos y 6 decisiones del dueño que no son campos del JSON.

| Grupo | Pendientes | ¿Bloquea producción? |
|---|---|---|
| 1. Contacto y WhatsApp | 3 | Sí |
| 2. Ubicación | 5 | Sí |
| 3. Horario y aviso del día | 3 | Sí |
| 4. Menú y precios | 8 | Sí |
| 5. Pedidos para reuniones | 3 | Sí |
| 6. El sazón (sección desactivada) | 8 | No, solo bloquea activar la sección |
| 7. Reseñas (sección desactivada) | 1 (no es campo) | No, solo bloquea activar la sección |
| 8. SEO y dominio | 2 | Sí |
| 9. Fotos | 6 | Sí |
| 10. Decisiones del dueño | 6 | Sí (varias de ellas condicionan los datos de arriba) |

Total: **32 campos en JSON** (24 bloquean producción, 8 son de El sazón) + 6 fotos + 1 de reseñas + 6 decisiones = **45 puntos**.

## Lo mínimo para publicar

1. Nombre comercial exacto, WhatsApp, teléfono.
2. Dirección completa (calle, colonia, C.P.), enlace de Maps y coordenadas.
3. Horario de los 7 días y el aviso del día (apertura y cierre).
4. Nombre, precios y qué incluye cada producto del menú.
5. Precios y anticipación de pedidos para reuniones.
6. Dominio (`seo.url`) y la decisión sobre la página de Facebook (dirección real o quitarla).
7. Las 5 fotos reales y la imagen para redes.
8. Aprobar el aviso de privacidad y alinear la ficha de Google.
9. Cambiar `"estado": "produccion"` y correr `npm run verify` (debe terminar sin errores).

**El sazón** y **Reseñas** quedan apagadas: no hacen falta para publicar.

---

## 1. Contacto y WhatsApp

### 1.1 Número de WhatsApp
- **Qué es:** el número de 10 dígitos que recibe los apartados.
- **Aparece en:** botones «Aparta por WhatsApp» (portada, cómo apartar, reuniones, barra de aviso, barra rápida del celular).
- **Campo:** `contacto.whatsapp`
- **Por confirmar:** ninguno. No se sabe si es el mismo teléfono de Google (ver decisión D1).
- **Bloquea:** el botón de WhatsApp (hoy aparece como «Número pendiente», sin enlace) y pasar a producción.

### 1.2 Teléfono para llamadas
- **Qué es:** teléfono de contacto y llamadas.
- **Aparece en:** Visítanos, pie de página, datos estructurados (JSON-LD `telephone`).
- **Campo:** `contacto.telefono`
- **Por confirmar:** 775 755 3530 (tomado de la ficha de Google; falta confirmar que es correcto y que contestan ahí).
- **Bloquea:** pasar a producción; el enlace para llamar y el `telephone` del JSON-LD.

### 1.3 Página de Facebook
- **Qué es:** dirección de la página de Facebook, si existe.
- **Aparece en:** pie de página (Redes) y `sameAs` del JSON-LD.
- **Campo:** `contacto.redes[0].url`
- **Por confirmar:** ninguno.
- **Bloquea:** pasar a producción. Si no existe, borra ese elemento de `contacto.redes` (la lista puede quedar vacía).

## 2. Ubicación

### 2.1 Calle y número
- **Qué es:** calle y número del local.
- **Aparece en:** Visítanos, pie de página, búsqueda del botón «Cómo llegar».
- **Campo:** `ubicacion.calle`
- **Por confirmar:** Calle Rodolfo Guzmán Huerta (El Santo) #13 (de la ficha de Google).
- **Bloquea:** pasar a producción y el `address` del JSON-LD (sin calle no se genera).

### 2.2 Colonia o zona
- **Qué es:** colonia o referencia de zona.
- **Aparece en:** Visítanos y búsqueda del mapa.
- **Campo:** `ubicacion.colonia`
- **Por confirmar:** Col. Álamos, Zona de la Estación (de la ficha de Google).
- **Bloquea:** pasar a producción.

### 2.3 Código postal
- **Qué es:** C.P. de 5 dígitos.
- **Aparece en:** Visítanos y `postalCode` del JSON-LD.
- **Campo:** `ubicacion.codigoPostal`
- **Por confirmar:** ninguno.
- **Bloquea:** pasar a producción.

### 2.4 Enlace de Google Maps
- **Qué es:** enlace de «Compartir» de la ficha de Google Maps.
- **Aparece en:** botones «Cómo llegar».
- **Campo:** `ubicacion.mapsUrl`
- **Por confirmar:** ninguno. Mientras falte, el botón hace una búsqueda de la dirección en Google Maps.
- **Bloquea:** pasar a producción (el botón funciona en borrador).

### 2.5 Coordenadas
- **Qué es:** latitud y longitud del local.
- **Aparece en:** no se ve; solo en el JSON-LD (`geo`).
- **Campo:** `ubicacion.geo`
- **Por confirmar:** ninguno.
- **Bloquea:** pasar a producción y el `geo` del JSON-LD.

## 3. Horario y aviso del día

### 3.1 Horario semanal
- **Qué es:** horario de los 7 días y qué días se descansa. Posiblemente abre temprano y vende hasta agotar (no confirmado).
- **Aparece en:** Visítanos y JSON-LD (`openingHoursSpecification`).
- **Campo:** `horario.semana`
- **Por confirmar:** ninguno.
- **Bloquea:** pasar a producción y el horario en el JSON-LD.

### 3.2 Hora de apertura de hoy
- **Qué es:** la hora a la que se abre hoy; se edita cada vez que cambia.
- **Aparece en:** barra de aviso superior («Hoy: abrimos …»).
- **Campo:** `aviso.apertura`
- **Por confirmar:** ninguno.
- **Bloquea:** pasar a producción mientras `aviso.activo` sea `true`. Alternativa: poner `"activo": false` y quitar la barra.

### 3.3 Cierre del día
- **Qué es:** si se vende hasta agotar o a una hora fija.
- **Aparece en:** barra de aviso superior.
- **Campo:** `aviso.cierre`
- **Por confirmar:** «hasta agotar» (no confirmado).
- **Bloquea:** pasar a producción mientras el aviso esté activo.

## 4. Menú y precios

Cada producto tiene 4 campos. Aparecen en la sección **Menú**.

### Mixiote de carnero
| Campo | Qué es | Por confirmar |
|---|---|---|
| `menu.productos[0].nombre` | Si se vende de carnero o de borrego y cómo se llama | «Mixiote de carnero» |
| `menu.productos[0].presentaciones[0].precio` | Precio por pieza | ninguno |
| `menu.productos[0].presentaciones[1].precio` | Precio por orden (y cuántas piezas trae) | ninguno |
| `menu.productos[0].incluye` | Qué se entrega con el pedido | Consomé, Salsas, Nopales, Tortillas |

### Mixiote de pollo
| Campo | Qué es | Por confirmar |
|---|---|---|
| `menu.productos[1].nombre` | Si de verdad se vende de pollo | «Mixiote de pollo» |
| `menu.productos[1].presentaciones[0].precio` | Precio por pieza | ninguno |
| `menu.productos[1].presentaciones[1].precio` | Precio por orden (y cuántas piezas trae) | ninguno |
| `menu.productos[1].incluye` | Qué se entrega con el pedido | Consomé, Salsas, Nopales, Tortillas |

- **Bloquea:** pasar a producción (los 8). Los precios se escriben como número en pesos. Si no se vende el pollo, borra ese producto de `menu.productos`. Si cuántas piezas trae la orden se quiere mostrar, hay que ponerlo en el texto del producto o en `menu.intro`.
- Todos los "por confirmar" son suposiciones del borrador, no datos del dueño.

## 5. Pedidos para reuniones

Aparecen en la sección **Pedidos para reuniones**. Bloquean pasar a producción.

| Campo | Qué es | Por confirmar |
|---|---|---|
| `reuniones.opciones[0].precio` | Precio por docena | ninguno |
| `reuniones.opciones[1].precio` | Precio por kilo | ninguno |
| `reuniones.anticipacion` | Con cuántos días de anticipación se encarga un pedido | ninguno |

Ver también las decisiones D3 y D4 (entrega o recoger, pedido mínimo). Si el negocio no maneja docena o kilo, ajusta la lista `opciones`.

## 6. El sazón (sección desactivada)

`secciones.sazon` está en `false`. Estos 8 campos **no bloquean producción**; solo bloquean activar la sección. Al activarla hacen falta de 3 a 5 pasos completos. Aparecen en la sección **El sazón** («Así se prepara cada mixiote»). Los textos deben estar en palabras del dueño, sin revelar la receta ni cifras que no estén confirmadas.

| Paso | Campo del título | Por confirmar (título) | Campo del texto | Qué falta en el texto |
|---|---|---|---|---|
| 1 | `sazon.pasos[0].titulo` | Adobo | `sazon.pasos[0].texto` | Descripción del adobo |
| 2 | `sazon.pasos[1].titulo` | Envuelto | `sazon.pasos[1].texto` | Con qué se envuelve cada mixiote |
| 3 | `sazon.pasos[2].titulo` | Al vapor | `sazon.pasos[2].texto` | Cómo se cuece |
| 4 | `sazon.pasos[3].titulo` | Despacho | `sazon.pasos[3].texto` | Cómo se empaca para llevar |

## 7. Reseñas (sección desactivada)

`secciones.resenas` está en `false`. No bloquea producción.

- **Qué falta:** reseñas reales de Google **con permiso de quien las escribió** (ver D6).
- **Campo:** `resenas.lista` (hoy vacía)
- **Bloquea:** activar la sección. Con la sección activa y la lista vacía, el sitio no compila en producción; cada reseña necesita `"autorizada": true`.

## 8. SEO y dominio

### 8.1 Nombre comercial exacto
- **Qué es:** el nombre tal como va en el letrero (mayúsculas y acentos).
- **Aparece en:** encabezado, título de la pestaña y de Google (`seo.titulo`), pie, mapa y JSON-LD.
- **Campo:** `negocio.nombre`
- **Por confirmar:** Mixiotes De La Estación.
- **Bloquea:** pasar a producción y todo el JSON-LD (sin nombre confirmado no se genera).

### 8.2 Dominio del sitio
- **Qué es:** dirección definitiva (`https://...`).
- **Aparece en:** etiquetas SEO y para compartir, sitemap, `robots.txt` y JSON-LD.
- **Campo:** `seo.url`
- **Por confirmar:** ninguno. Puede ser un dominio propio o el de Cloudflare Pages.
- **Bloquea:** pasar a producción (debe empezar con `https://`) y que el sitemap tenga el dominio correcto.

## 9. Fotos

Reemplazo paso a paso: [README](README.md#cómo-cambiar-los-placeholders-por-fotos-reales). Todas las fotos provisionales **bloquean pasar a producción** (si su sección está activa; las 5 lo están).

| Foto | Qué fotografiar | Proporción y tamaño | Campo | Aparece en |
|---|---|---|---|---|
| Vaporera | Vaporera abierta con los mixiotes humeando | 4:5, 1200 × 1500 | `imagenes.vaporera` | Portada |
| Mostrador | Mostrador donde se despacha | 4:3, 1600 × 1200 | `imagenes.mostrador` | Cómo apartar |
| Plato | Mixiote abierto en plato con nopales, salsa y tortillas | 4:3, 1600 × 1200 | `imagenes.plato` | Menú |
| Empaque | Empaque para llevar listo para entregar | 1:1, 1200 × 1200 | `imagenes.empaque` | Reuniones |
| Fachada | Fachada con el letrero, desde la banqueta | 3:2, 1800 × 1200 | `imagenes.fachada` | Visítanos |
| Imagen para redes | Imagen al compartir el enlace | 1200 × 630 | `public/og.png` y `seo.imagenSocial` | WhatsApp, Facebook, Google |

## 10. Decisiones del dueño (no son campos del JSON)

Estas decisiones definen qué se escribe en los campos de arriba o dan permiso para publicar.

| # | Decisión | Qué bloquea |
|---|---|---|
| D1 | ¿El teléfono registrado en Google es también el WhatsApp de apartados, o son números distintos? | `contacto.whatsapp` y `contacto.telefono` (grupo 1) |
| D2 | ¿Las reservaciones de reuniones se recogen en el local o se entregan? | El texto de `reuniones` y la promesa «solo para llevar» |
| D3 | ¿Hay pedido mínimo para reuniones? ¿Cuál? | El texto y las opciones de `reuniones` |
| D4 | Aprobar el texto del aviso de privacidad (`pie.privacidad`): «Este sitio no usa cookies, no tiene formularios y no guarda datos personales…» | Pasar a producción |
| D5 | Hacer que la ficha de Google Business Profile coincida con el sitio: nombre, dirección, teléfono y horario idénticos | Una buena presencia en Google/Maps; hacerlo al publicar |
| D6 | Permiso de cada cliente para publicar su reseña en el sitio | Activar `resenas` |

Nota: D2 y D3 todavía no tienen campo propio en `sitio.json`; al decidirlas hay que ajustar `reuniones.texto` (o agregar el dato donde el dueño prefiera).
