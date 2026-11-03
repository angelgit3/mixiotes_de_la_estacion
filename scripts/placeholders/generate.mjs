// Generates the illustrated placeholders (photos, og.png, icons) for the site.
// Re-run from the repo root:   node scripts/placeholders/generate.mjs
// Requires Playwright + Chromium available globally (no install needed here).
// Python Pillow is used (optionally) to build public/favicon.ico from the 32px PNG.
// Outputs: src/assets/fotos/*.png, public/og.png, public/favicon.svg, public/*icon*.png,
//          and the SVG sources next to this script (scripts/placeholders/*.svg).
// Swap the PNGs in src/assets/fotos/ for real photos of the same pixel size later.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const fotos = path.join(root, 'src/assets/fotos');
const pub = path.join(root, 'public');
for (const d of [fotos, pub]) fs.mkdirSync(d, { recursive: true });

// Brand tokens + tints
const C = {
  papel: '#F3E9D8', papel2: '#E9DAC0', adobo: '#9E2B1D', adobo2: '#6E1D13',
  maiz: '#F0B83C', maiz2: '#D99A1F', nopal: '#2E5A3A', nopal2: '#4C7D55',
  tinta: '#1E1A16', kraft: '#D9B476', kraft2: '#B98B4A', kraft3: '#EBD3A2',
};
const SW = 7; // outline width, sign-painter style

const defs = (dot = C.papel2) => `<defs>
  <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
    <circle cx="7" cy="7" r="3" fill="${dot}"/><circle cx="22" cy="22" r="3" fill="${dot}"/></pattern>
  <pattern id="dotsM" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="6" cy="6" r="3" fill="${C.maiz2}"/><circle cx="19" cy="19" r="3" fill="${C.maiz2}"/></pattern>
  <pattern id="dotsR" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="6" cy="6" r="2.8" fill="${C.adobo2}"/><circle cx="19" cy="19" r="2.8" fill="${C.adobo2}"/></pattern>
  <pattern id="stripeV" width="120" height="10" patternUnits="userSpaceOnUse">
    <rect width="60" height="10" fill="${C.adobo}"/><rect x="60" width="60" height="10" fill="${C.papel}"/></pattern>
</defs>`;

const svgWrap = (w, h, body, dot) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(dot)}${body}</svg>`;

const o = (extra = '') => {
  const m = extra.match(/stroke-width="([\d.]+)"/);
  return `stroke="${C.tinta}" stroke-width="${m ? m[1] : SW}" stroke-linejoin="round" stroke-linecap="round" ${extra.replace(/stroke-width="[\d.]+"/, '')}`;
};

// --- reusable pieces -------------------------------------------------------
// A mixiote: a paper pouch gathered at the top and tied with string.
function mixiote(cx, by, r, tilt = 0) {
  return `<g transform="rotate(${tilt} ${cx} ${by})">
  <path d="M${cx - r},${by} C${cx - r},${by - 1.5 * r} ${cx - .3 * r},${by - 1.15 * r} ${cx - .2 * r},${by - 1.6 * r}
    L${cx + .2 * r},${by - 1.6 * r} C${cx + .3 * r},${by - 1.15 * r} ${cx + r},${by - 1.5 * r} ${cx + r},${by} Q${cx},${by + .45 * r} ${cx - r},${by} Z" fill="${C.kraft}" ${o()}/>
  <path d="M${cx - .55 * r},${by - .15 * r} C${cx - .6 * r},${by - .8 * r} ${cx - .35 * r},${by - 1 * r} ${cx - .2 * r},${by - 1.25 * r}" fill="none" stroke="${C.kraft2}" stroke-width="${SW - 1}" stroke-linecap="round"/>
  <path d="M${cx + .5 * r},${by - .2 * r} C${cx + .55 * r},${by - .7 * r} ${cx + .4 * r},${by - .95 * r} ${cx + .22 * r},${by - 1.2 * r}" fill="none" stroke="${C.kraft3}" stroke-width="${SW - 1}" stroke-linecap="round"/>
  <path d="M${cx - .22 * r},${by - 1.6 * r} L${cx - .55 * r},${by - 2.05 * r} L${cx - .05 * r},${by - 1.75 * r} L${cx + .45 * r},${by - 2.1 * r} L${cx + .22 * r},${by - 1.6 * r} Z" fill="${C.kraft}" ${o()}/>
  <rect x="${cx - .27 * r}" y="${by - 1.74 * r}" width="${.54 * r}" height="${.2 * r}" rx="${.09 * r}" fill="${C.adobo}" ${o()}/>
  </g>`;
}
const steamPath = (x, y, h, amp = 34) =>
  `M${x},${y} c${-amp},${-h * .18} ${amp},${-h * .34} 0,${-h * .5} s${amp},${-h * .32} 0,${-h * .5}`;
function steam(list, color = C.papel, w = 36) {
  return list.map(([x, y, h, a]) => `<path d="${steamPath(x, y, h, a)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`).join('');
}
// Steamer pot, front view with open top. cx = center, rimY = rim center, rx = half width of rim.
function pot(cx, rimY, rx, h, withMixiotes = true) {
  const ry = rx * .24, bw = rx * .93, bot = rimY + h;
  const mix = withMixiotes ? [
    [cx - rx * .52, rimY - 4, rx * .27, -8], [cx + rx * .5, rimY - 4, rx * .27, 8],
    [cx - rx * .08, rimY - ry * .6, rx * .31, 0], [cx - rx * .3, rimY + ry * .45, rx * .28, -4], [cx + rx * .3, rimY + ry * .45, rx * .28, 5],
  ].map(([x, y, r, t]) => mixiote(x, y, r, t)).join('') : '';
  return `<g>
  <ellipse cx="${cx}" cy="${bot + 22}" rx="${rx * 1.05}" ry="${ry * .55}" fill="${C.adobo2}" opacity=".35"/>
  <rect x="${cx - rx - 58}" y="${rimY + ry * 1.3}" width="130" height="46" rx="23" fill="${C.maiz2}" ${o()}/>
  <rect x="${cx + rx - 72}" y="${rimY + ry * 1.3}" width="130" height="46" rx="23" fill="${C.maiz2}" ${o()}/>
  <ellipse cx="${cx}" cy="${rimY}" rx="${rx}" ry="${ry}" fill="${C.tinta}" ${o()}/>
  ${mix}
  <path d="M${cx - rx},${rimY} A${rx},${ry} 0 0 0 ${cx + rx},${rimY} L${cx + bw},${bot - 40} Q${cx + bw},${bot} ${cx + bw - 40},${bot} L${cx - bw + 40},${bot} Q${cx - bw},${bot} ${cx - bw},${bot - 40} Z" fill="${C.adobo}" ${o()}/>
  <path d="M${cx - rx * .985},${rimY + h * .2} A${rx * .985},${ry * 1.04} 0 0 0 ${cx + rx * .985},${rimY + h * .2} L${cx + rx * .975},${rimY + h * .36} A${rx * .975},${ry * 1.04} 0 0 1 ${cx - rx * .975},${rimY + h * .36} Z" fill="${C.maiz}" ${o('stroke-width="5"')}/>
  <path d="M${cx - rx * .8},${bot - 26} A${rx * .8},${ry * .6} 0 0 0 ${cx + rx * .8},${bot - 26}" fill="none" stroke="${C.adobo2}" stroke-width="12" stroke-linecap="round" opacity=".55"/>
  <path d="M${cx - rx},${rimY} A${rx},${ry} 0 0 0 ${cx + rx},${rimY}" fill="none" stroke="${C.maiz}" stroke-width="10" stroke-linecap="round"/>
  <path d="M${cx - rx},${rimY} A${rx},${ry} 0 0 0 ${cx + rx},${rimY}" fill="none" ${o()}/>
  </g>`;
}
function bag(cx, top, w, h, sticker = true) {
  const x = cx - w / 2, fold = h * .14;
  return `<g>
  <rect x="${x}" y="${top + fold}" width="${w}" height="${h - fold}" rx="10" fill="${C.kraft}" ${o()}/>
  <rect x="${x + w * .72}" y="${top + fold + 6}" width="${w * .28 - 4}" height="${h - fold - 12}" fill="${C.kraft2}" opacity=".45"/>
  <path d="M${x - 6},${top + fold} L${x + 14},${top} L${x + w - 14},${top} L${x + w + 6},${top + fold} Z" fill="${C.kraft3}" ${o()}/>
  <path d="M${cx - w * .3},${top + 2} C${cx - w * .3},${top - h * .28} ${cx + w * .3},${top - h * .28} ${cx + w * .3},${top + 2}" fill="none" ${o('stroke-width="9"')}/>
  <rect x="${x}" y="${top + h - h * .13}" width="${w}" height="${h * .13}" fill="${C.nopal}" ${o()}/>
  ${sticker ? `<circle cx="${cx}" cy="${top + h * .5}" r="${w * .2}" fill="${C.adobo}" ${o()}/><circle cx="${cx}" cy="${top + h * .5}" r="${w * .12}" fill="${C.maiz}" ${o('stroke-width="5"')}/>` : ''}
  </g>`;
}
const nopalPad = (x, y, rw, rh, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${rw}" ry="${rh}" fill="${C.nopal2}" ${o()}/>
  ${[[-.4, -.2], [.1, -.45], [.4, .05], [-.1, .3], [-.5, .35], [.2, .5]].map(([a, b]) => `<circle cx="${x + a * rw}" cy="${y + b * rh}" r="${rw * .045}" fill="${C.papel}"/>`).join('')}</g>`;
const groundBand = (w, y, h) => `<rect y="${y}" width="${w}" height="${h}" fill="${C.adobo}"/><rect y="${y + h * .18}" width="${w}" height="${h * .1}" fill="${C.maiz}"/><rect y="${y}" width="${w}" height="6" fill="${C.tinta}"/>`;

// --- images ----------------------------------------------------------------
const imgs = {};

imgs.vaporera = { w: 1200, h: 1500, dir: fotos, svg: svgWrap(1200, 1500, `
  <rect width="1200" height="1500" fill="${C.papel}"/><rect width="1200" height="1500" fill="url(#dots)"/>
  <circle cx="600" cy="640" r="470" fill="${C.maiz}" ${o()}/>
  <circle cx="600" cy="640" r="470" fill="url(#dotsM)" opacity=".55"/>
  <circle cx="600" cy="640" r="470" fill="none" stroke="${C.adobo}" stroke-width="16" stroke-dasharray="2 34" stroke-linecap="round" transform="scale(.93) translate(46 44)"/>
  ${steam([[470, 800, 520, 38], [600, 760, 470, -44], [735, 800, 480, 36]], C.papel, 40)}
  ${groundBand(1200, 1370, 130)}
  ${pot(600, 960, 340, 330)}
  `) };

imgs.mostrador = { w: 1600, h: 1200, dir: fotos, svg: (() => {
  const scallops = Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200},300 a100,90 0 0 0 200,0 Z" fill="${i % 2 ? C.papel : C.adobo}" ${o()}/>`).join('');
  return svgWrap(1600, 1200, `
  <rect width="1600" height="1200" fill="${C.maiz}"/><rect width="1600" height="1200" fill="url(#dotsM)" opacity=".5"/>
  <rect y="0" width="1600" height="300" fill="url(#stripeV)" transform="scale(1 1)"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200}" y="0" width="100" height="300" fill="${C.papel}"/>`).join('')}
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 100}" y="0" width="100" height="300" fill="${C.adobo}"/>`).join('')}
  ${scallops}
  <rect x="0" y="0" width="1600" height="10" fill="${C.tinta}"/>
  <circle cx="800" cy="650" r="250" fill="${C.papel}" ${o()}/><circle cx="800" cy="650" r="250" fill="url(#dots)"/>
  <rect x="0" y="790" width="1600" height="60" fill="${C.kraft3}" ${o()}/>
  <rect x="0" y="850" width="1600" height="350" fill="${C.nopal}" ${o()}/>
  ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100 + 8}" y="880" width="84" height="290" rx="6" fill="${i % 2 ? C.nopal : C.nopal2}" opacity=".9"/>`).join('')}
  <rect x="0" y="1160" width="1600" height="40" fill="${C.tinta}"/>
  ${steam([[330, 500, 150, 18], [430, 490, 130, -16]], C.papel, 22)}
  ${pot(380, 625, 175, 165, true)}
  ${bag(800, 520, 250, 300)}
  ${bag(1100, 590, 210, 230)}
  <g>
    <ellipse cx="1330" cy="780" rx="90" ry="14" fill="${C.adobo2}" opacity=".35"/>
    <ellipse cx="1330" cy="745" rx="82" ry="20" fill="${C.kraft3}" ${o()}/><ellipse cx="1330" cy="722" rx="82" ry="20" fill="${C.maiz2}" ${o()}/>
    <ellipse cx="1330" cy="699" rx="82" ry="20" fill="${C.kraft3}" ${o()}/>
  </g>
  `);
})() };

imgs.plato = { w: 1600, h: 1200, dir: fotos, svg: (() => {
  const meat = [[760, 560, 52], [850, 520, 58], [905, 610, 50], [800, 650, 56], [715, 640, 44], [870, 700, 42], [770, 480, 38]];
  return svgWrap(1600, 1200, `
  <rect width="1600" height="1200" fill="${C.adobo}"/><rect width="1600" height="1200" fill="url(#dotsR)" opacity=".5"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${i * 260 - 100}" y="0" width="90" height="1200" fill="${C.adobo2}" opacity=".35"/>`).join('')}
  <circle cx="828" cy="632" r="450" fill="${C.adobo2}" opacity=".55"/>
  <circle cx="800" cy="600" r="450" fill="${C.papel}" ${o()}/>
  <circle cx="800" cy="600" r="372" fill="none" stroke="${C.maiz}" stroke-width="22"/>
  <circle cx="800" cy="600" r="338" fill="${C.papel2}" ${o('stroke-width="5"')}/>
  <!-- opened mixiote paper -->
  <path d="M590,560 C560,430 690,370 800,400 C930,370 1050,450 1010,580 C1060,700 940,810 820,780 C700,830 560,730 590,560 Z" fill="${C.kraft}" ${o()}/>
  <path d="M640,520 C650,470 720,450 780,460" fill="none" stroke="${C.kraft3}" stroke-width="10" stroke-linecap="round"/>
  <path d="M990,640 C970,720 920,750 860,752" fill="none" stroke="${C.kraft2}" stroke-width="10" stroke-linecap="round"/>
  ${meat.map(([x, y, r], i) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .78}" fill="${i % 2 ? C.adobo : '#7F2418'}" ${o('stroke-width="5"')} transform="rotate(${i * 37} ${x} ${y})"/>`).join('')}
  <path d="M740,600 q30,-30 60,0 M830,560 q24,-24 50,0 M780,690 q24,-22 52,0" fill="none" stroke="${C.maiz}" stroke-width="7" stroke-linecap="round" opacity=".9"/>
  <!-- nopales strips -->
  ${[0, 1, 2].map(i => `<rect x="${1010 + i * 16}" y="${420 + i * 66}" width="210" height="46" rx="23" fill="${C.nopal2}" ${o()} transform="rotate(${-8 + i * 6} ${1115 + i * 16} ${443 + i * 66})"/>`).join('')}
  <circle cx="1090" cy="800" r="6" fill="${C.papel}"/><circle cx="1130" cy="780" r="6" fill="${C.papel}"/>
  <!-- salsa bowl -->
  <circle cx="1330" cy="270" r="140" fill="${C.adobo2}" opacity=".4" transform="translate(14 16)"/>
  <circle cx="1330" cy="270" r="140" fill="${C.nopal}" ${o()}/><circle cx="1330" cy="270" r="106" fill="${C.adobo2}" ${o('stroke-width="5"')}/>
  <circle cx="1330" cy="270" r="92" fill="${C.adobo}"/>
  <circle cx="1295" cy="245" r="9" fill="${C.maiz}"/><circle cx="1350" cy="300" r="8" fill="${C.maiz}"/><circle cx="1360" cy="238" r="7" fill="${C.maiz}"/><circle cx="1300" cy="305" r="7" fill="${C.maiz}"/>
  <!-- tortillas -->
  <circle cx="300" cy="960" r="200" fill="${C.adobo2}" opacity=".4" transform="translate(14 16)"/>
  ${[0, 1, 2].map(i => `<circle cx="${300 - i * 8}" cy="${960 - i * 12}" r="190" fill="${i % 2 ? C.kraft3 : C.papel}" ${o()}/>`).join('')}
  ${[[250, 900], [330, 920], [290, 1000], [370, 990], [230, 980], [300, 860]].map(([x, y]) => `<circle cx="${x - 16}" cy="${y - 24}" r="12" fill="${C.kraft2}" opacity=".7"/>`).join('')}
  <!-- lime -->
  <circle cx="1330" cy="950" r="110" fill="${C.nopal}" ${o()}/><circle cx="1330" cy="950" r="86" fill="${C.nopal2}"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M1330,950 L${1330 + 84 * Math.cos(i * Math.PI / 3)},${950 + 84 * Math.sin(i * Math.PI / 3)}" stroke="${C.papel}" stroke-width="7" stroke-linecap="round"/>`).join('')}
  `);
})() };

imgs.empaque = { w: 1200, h: 1200, dir: fotos, svg: svgWrap(1200, 1200, `
  <rect width="1200" height="1200" fill="${C.papel}"/><rect width="1200" height="1200" fill="url(#dots)"/>
  <circle cx="600" cy="560" r="440" fill="${C.maiz}" ${o()}/><circle cx="600" cy="560" r="440" fill="url(#dotsM)" opacity=".55"/>
  ${groundBand(1200, 1040, 160)}
  <ellipse cx="610" cy="1060" rx="330" ry="26" fill="${C.adobo2}" opacity=".4"/>
  ${bag(600, 350, 440, 700)}
  ${mixiote(280, 1030, 90, -6)}
  <g><ellipse cx="930" cy="1032" rx="70" ry="16" fill="${C.adobo2}" opacity=".4"/>
  <path d="M870,900 h120 l-14,126 h-92 Z" fill="${C.papel}" ${o()}/><ellipse cx="930" cy="900" rx="60" ry="14" fill="${C.adobo}" ${o()}/>
  <rect x="876" y="950" width="108" height="26" fill="${C.nopal}"/></g>
  `) };

imgs.fachada = { w: 1800, h: 1200, dir: fotos, svg: (() => {
  const tiles = Array.from({ length: 16 }, (_, i) => Array.from({ length: 3 }, (_, j) => `<rect x="${i * 102.5 + 86}" y="${770 + j * 80 + 4}" width="92" height="72" rx="4" fill="${(i + j) % 2 ? C.nopal : C.nopal2}" opacity=".95"/>`).join('')).join('');
  const awn = Array.from({ length: 14 }, (_, i) => `<path d="M${330 + i * 81.43},470 h81.43 v100 a40.7,38 0 0 1 -81.43,0 Z" fill="${i % 2 ? C.papel : C.adobo}" ${o('stroke-width="5"')}/>`).join('');
  const joints = Array.from({ length: 10 }, (_, i) => `<path d="M${i * 220 - 40},1030 L${i * 220 - 110},1200" ${o('stroke-width="4"')} opacity=".4"/>`).join('');
  return svgWrap(1800, 1200, `
  <rect width="1800" height="1200" fill="${C.papel}"/><rect width="1800" height="1200" fill="url(#dots)"/>
  <circle cx="1560" cy="110" r="80" fill="${C.maiz}" ${o()}/>
  <rect x="80" y="150" width="1640" height="640" fill="${C.maiz}" ${o()}/>
  <rect x="80" y="150" width="1640" height="640" fill="url(#dotsM)" opacity=".5"/>
  <rect x="60" y="120" width="1680" height="44" fill="${C.adobo}" ${o()}/>
  <rect x="80" y="760" width="1640" height="250" fill="${C.nopal}" ${o()}/>
  ${tiles}
  <rect x="80" y="760" width="1640" height="14" fill="${C.tinta}"/>
  <!-- blank painted sign: stripes only, no lettering -->
  <rect x="470" y="190" width="860" height="230" rx="16" fill="${C.adobo}" ${o()}/>
  <rect x="496" y="214" width="808" height="182" rx="8" fill="${C.papel}" ${o('stroke-width="5"')}/>
  <rect x="520" y="238" width="760" height="34" fill="${C.adobo}"/><rect x="520" y="338" width="760" height="34" fill="${C.adobo}"/>
  <rect x="520" y="290" width="760" height="32" fill="${C.maiz}"/>
  <path d="M640,190 v-30 M1160,190 v-30" ${o('stroke-width="6"')}/>
  <!-- serving window -->
  <rect x="330" y="560" width="1140" height="260" fill="${C.tinta}" ${o()}/>
  <rect x="350" y="580" width="1100" height="200" fill="${C.adobo2}"/>
  <ellipse cx="900" cy="680" rx="420" ry="90" fill="${C.maiz}" opacity=".35"/>
  <g transform="scale(.62) translate(2 332)">${pot(1450, 700, 170, 200, false)}</g>
  ${[[600, 640], [1200, 640]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="${C.maiz}"/><path d="M${x},${y - 26} v-40" ${o('stroke-width="5"')}/>`).join('')}
  ${awn}
  <rect x="330" y="450" width="1140" height="30" fill="${C.nopal}" ${o()}/>
  <rect x="300" y="800" width="1200" height="40" fill="${C.kraft3}" ${o()}/>
  <!-- side doors -->
  <rect x="140" y="440" width="150" height="330" fill="${C.adobo2}" ${o()}/><rect x="162" y="466" width="106" height="130" fill="${C.maiz}" ${o('stroke-width="5"')}/>
  <rect x="1510" y="440" width="150" height="330" fill="${C.adobo2}" ${o()}/><rect x="1532" y="466" width="106" height="130" fill="${C.maiz}" ${o('stroke-width="5"')}/>
  <!-- sidewalk -->
  <rect y="1010" width="1800" height="190" fill="${C.papel2}" ${o()}/>
  ${joints}
  <rect y="1010" width="1800" height="26" fill="${C.tinta}"/>
  <rect y="1140" width="1800" height="60" fill="${C.adobo}"/><rect y="1160" width="1800" height="14" fill="${C.papel}"/>
  <!-- planters with nopal pads -->
  ${[[220, 1010], [1580, 1010]].map(([x, y]) => `<g>${nopalPad(x - 30, y - 120, 44, 70, -18)}${nopalPad(x + 36, y - 100, 40, 62, 22)}${nopalPad(x + 2, y - 170, 38, 60, 4)}
    <path d="M${x - 70},${y - 56} h140 l-18,56 h-104 Z" fill="${C.adobo}" ${o()}/><rect x="${x - 76}" y="${y - 66}" width="152" height="20" fill="${C.maiz}" ${o('stroke-width="5"')}/></g>`).join('')}
  `);
})() };

// --- page-level assets ------------------------------------------------------
const markBody = `
  <path d="M26,27 L22,17 L32,23 L42,17 L38,27 Z" fill="${C.adobo}" stroke="${C.tinta}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M9,46 C9,35 24,34 26.5,27 L37.5,27 C40,34 55,35 55,46 C55,56 46,61.5 32,61.5 C18,61.5 9,56 9,46Z" fill="${C.adobo}" stroke="${C.tinta}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M15,45 C16,40 21,38 24,37" fill="none" stroke="${C.maiz}" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="25" y="25.5" width="14" height="6.5" rx="3" fill="${C.maiz}" stroke="${C.tinta}" stroke-width="2.2"/>
  <path d="M24,13 C20,10 28,7 24,3 M40,13 C36,10 44,7 40,3" fill="none" stroke="${C.tinta}" stroke-width="3.6" stroke-linecap="round"/>`;
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.maiz}"/>${markBody}</svg>\n`;
const iconSvg = (size, scale) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" fill="${C.maiz}"/><g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${markBody}</g></svg>`;

const b64 = f => fs.readFileSync(path.join(pub, 'fonts', f)).toString('base64');
const ogHtml = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(data:font/woff2;base64,${b64('anton-latin-400.woff2')})}
@font-face{font-family:Yellowtail;src:url(data:font/woff2;base64,${b64('yellowtail-latin-400.woff2')})}
@font-face{font-family:Archivo;font-weight:600;src:url(data:font/woff2;base64,${b64('archivo-latin-600.woff2')})}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:${C.adobo}}
.bg{position:absolute;inset:0;background:${C.adobo};}
.dots{position:absolute;inset:0;opacity:.5}
.t{position:absolute;left:72px;top:150px;white-space:nowrap;color:${C.papel};font-family:Anton;font-size:150px;line-height:.98;text-transform:uppercase;letter-spacing:1px}
.t span{color:${C.maiz};font-size:112px;display:block;margin-top:8px}
.s{position:absolute;left:76px;top:440px;font-family:Yellowtail;font-size:64px;color:${C.maiz}}
.rule{position:absolute;left:76px;top:120px;width:180px;height:12px;background:${C.maiz}}
.tag{position:absolute;left:76px;bottom:38px;font:600 18px Archivo;letter-spacing:.14em;text-transform:uppercase;color:${C.papel};opacity:.75;border:2px solid rgba(243,233,216,.6);padding:6px 14px;border-radius:99px}
svg.art{position:absolute;left:0;top:0}
</style><div class="bg"></div>
<svg class="dots" width="1200" height="630"><defs><pattern id="d" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.8" fill="${C.adobo2}"/><circle cx="22" cy="22" r="2.8" fill="${C.adobo2}"/></pattern></defs><rect width="1200" height="630" fill="url(#d)"/></svg>
<svg class="art" width="1200" height="630" viewBox="0 0 1200 630">${defs()}
<circle cx="900" cy="315" r="270" fill="${C.maiz}" stroke="${C.tinta}" stroke-width="${SW}"/><circle cx="900" cy="315" r="270" fill="url(#dotsM)" opacity=".55"/>
${steam([[820, 380, 270, 26], [900, 360, 330, -28], [985, 380, 250, 24]], C.papel, 26)}
<rect x="0" y="560" width="1200" height="70" fill="${C.adobo2}"/><rect x="0" y="574" width="1200" height="9" fill="${C.maiz}"/>
${pot(900, 440, 200, 150)}
</svg>
<div class="rule"></div><div class="t">Mixiotes<br><span>para llevar</span></div><div class="s">Tulancingo, Hgo.</div><div class="tag">Imagen provisional</div>`;

// --- render -----------------------------------------------------------------
const browser = await chromium.launch();
async function shot(page, w, h, out, opts = {}) {
  await page.setViewportSize({ width: w, height: h });
  await page.screenshot({ path: out, ...opts });
}
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const [name, d] of Object.entries(imgs)) {
  const svgFile = path.join(here, `${name}.svg`);
  fs.writeFileSync(svgFile, d.svg);
  await page.setViewportSize({ width: d.w, height: d.h });
  await page.goto('file://' + svgFile);
  await page.screenshot({ path: path.join(d.dir, `${name}.png`) });
  console.log('photo', name);
}

fs.writeFileSync(path.join(here, 'og.html'), ogHtml);
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto('file://' + path.join(here, 'og.html'));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(pub, 'og.png') });

fs.writeFileSync(path.join(pub, 'favicon.svg'), faviconSvg);
const icons = [['apple-touch-icon.png', 180, 1.0], ['icon-192.png', 192, 1.0], ['icon-512.png', 512, 1.0], ['icon-maskable-512.png', 512, 0.62], ['_fav32.png', 32, 1.0], ['_fav16.png', 16, 1.0], ['_fav48.png', 48, 1.0]];
for (const [file, size, scale] of icons) {
  const isFav = file.startsWith('_fav');
  const svg = isFav ? faviconSvg.replace('<svg ', `<svg width="${size}" height="${size}" `) : iconSvg(size, scale === 1 ? 0.84 : scale);
  fs.writeFileSync(path.join(here, '_icon.svg'), svg);
  await page.setViewportSize({ width: size, height: size });
  await page.goto('file://' + path.join(here, '_icon.svg'));
  await page.screenshot({ path: isFav ? path.join(here, file) : path.join(pub, file), omitBackground: isFav });
}
fs.unlinkSync(path.join(here, '_icon.svg'));
await browser.close();

try {
  execSync(`python3 -I -c "from PIL import Image; import sys; d=sys.argv[1]; im=Image.open(d+'/_fav48.png').convert('RGBA'); im.save(sys.argv[2], format='ICO', sizes=[(16,16),(32,32),(48,48)])" "${here}" "${path.join(pub, 'favicon.ico')}"`);
} catch (e) { console.warn('favicon.ico skipped (Pillow missing?)', e.message); }
for (const f of ['_fav16.png', '_fav32.png', '_fav48.png']) fs.rmSync(path.join(here, f), { force: true });
console.log('done');
