# Fonts

Self-hosted, Latin subset, woff2, from `@fontsource/*` v5.3.0 (fetched with `npm pack`). Files in `public/fonts/`.

| File | Role | Bytes |
|---|---|---|
| `anton-latin-400.woff2` | display / headlines | 18,612 |
| `yellowtail-latin-400.woff2` | script accents | 18,308 |
| `archivo-latin-400.woff2` | body | 14,700 |
| `archivo-latin-600.woff2` | body semibold | 13,820 |
| `archivo-latin-700.woff2` | body bold | 14,508 |

Total: about 80 KB.

## Glyph coverage (checked with fontTools)

Checked in every file: `ñ Ñ á é í ó ú Á É Í Ó Ú ü Ü ¿ ¡ « » · —`, digits `0-9` and `$`.
Result: all five files contain every one of these glyphs (nothing missing).

## Licenses

All three families are under the SIL Open Font License 1.1. Each package's LICENSE is in
`public/fonts/LICENSE-anton.txt`, `LICENSE-yellowtail.txt` and `LICENSE-archivo.txt`.
Self-hosting and redistribution are allowed; keep the license files next to the fonts. The fonts must not be sold on their own.

## Usage hint

Preload only `anton-latin-400` and `archivo-latin-400`/`700` if used above the fold, and use `font-display: swap`.
