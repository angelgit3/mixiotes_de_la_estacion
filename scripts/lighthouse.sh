#!/usr/bin/env bash
# Lighthouse (mobile, default throttling) against the built site served by `astro preview`.
#
#   npm run build && npm run preview -- --port 4321    # terminal 1
#   npm run lighthouse                                   # terminal 2
#
# Writes docs/lighthouse/movil.report.{html,json} and prints the scores.
# CHROME_PATH defaults to the Chromium preinstalled with Playwright; override it if needed.
set -euo pipefail
URL="${1:-http://localhost:4321/}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/docs/lighthouse/movil"
export CHROME_PATH="${CHROME_PATH:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}"
npx -y lighthouse@13.6.0 "$URL" --quiet \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output=html --output-path="$OUT"
node -e '
const r = require(process.argv[1]);
const a = r.audits;
for (const [k, v] of Object.entries(r.categories)) console.log(`${v.title}: ${Math.round(v.score * 100)}`);
for (const k of ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "first-contentful-paint", "speed-index"])
  console.log(`${a[k].title}: ${a[k].displayValue}`);
' "$OUT.report.json"
