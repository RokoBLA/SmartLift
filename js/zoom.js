// Uvećani prikaz mišićne grupe: anatomska skica mišićavog tijela s crnom vanjskom linijom.
// Mišići koji pripadaju grupi obojeni su prema oporavku (crveno → narančasto → zeleno), ostali su sivi.
// Tijelo je nacrtano u platnu 200 × 400 (sprijeda i straga); svaka grupa prikazuje samo svoj izrez.
import { clamp } from './util.js';

const STOPS = [[0, [196, 80, 63]], [50, [224, 138, 46]], [100, [92, 154, 107]]];

export function recoveryColor(pct) {
  const p = clamp(pct, 0, 100);
  const i = p <= STOPS[1][0] ? 0 : 1;
  const [p0, c0] = STOPS[i], [p1, c1] = STOPS[i + 1];
  const t = (p - p0) / (p1 - p0);
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(',')})`;
}

const MIRROR = 'transform="translate(200 0) scale(-1 1)"';

// ---- obris tijela (isti sprijeda i straga) ----
const SILHOUETTE = [
  ['M85 30 a15 19 0 1 0 30 0 a15 19 0 1 0 -30 0 Z', false],
  ['M90 44 L110 44 L114 64 L86 64 Z', false],
  ['M56 70 Q76 60 100 62 Q124 60 144 70 Q158 84 156 112 Q150 150 142 196 Q138 222 134 238 L66 238 Q62 222 58 196 Q50 150 44 112 Q42 84 56 70 Z', false],
  ['M48 74 Q28 80 24 106 Q20 130 26 156 Q20 184 18 214 L14 238 Q12 254 16 266 Q26 270 34 264 Q36 246 40 224 Q50 194 54 166 Q62 136 62 108 Q64 84 48 74 Z', true],
  ['M68 232 Q54 252 54 292 Q56 318 66 332 Q60 360 62 394 Q62 404 74 404 Q86 404 86 396 Q88 364 86 332 Q96 316 98 290 Q102 258 98 236 Z', true],
];

// ---- mišići: [id, putanja, zrcalni par?]. id = "grupa:indeks dijela" ili "x:..." za sive mišiće ----
const FRONT = [
  ['x:shin', 'M64 336 Q62 364 66 392 L80 394 Q86 364 84 336 Z', true],
  ['noge:0', 'M70 240 Q58 258 58 292 Q60 316 72 326 Q88 318 92 292 Q98 262 94 242 Q82 232 70 240 Z', true],
  ['prsa:0', 'M98 72 Q82 67 66 72 Q62 78 62 88 Q80 84 98 91 Z', true],
  ['prsa:1', 'M62 88 Q80 84 98 91 L98 106 Q80 103 63 103 Q60 95 62 88 Z', true],
  ['prsa:2', 'M63 103 Q80 103 98 106 L98 114 Q92 124 78 122 Q66 116 63 103 Z', true],
  ['trbuh:2', 'M82 126 Q70 138 68 168 Q68 198 78 218 Q84 204 84 172 Q84 148 82 126 Z', true],
  ['trbuh:0', 'M85 128 Q85 126 88 126 H97 V144 H85 Z M85 147 H97 V165 H85 Z', true],
  ['trbuh:1', 'M85 168 H97 V186 H85 Z M85 189 H97 V204 Q91 210 85 204 Z', true],
  ['ramena:0', 'M66 68 Q54 64 46 72 Q44 90 50 104 Q60 96 64 82 Q68 74 66 68 Z', true],
  ['ramena:1', 'M46 72 Q36 74 32 88 Q30 106 38 124 Q46 114 50 104 Q44 90 46 72 Z', true],
  ['biceps:2', 'M34 128 Q30 142 36 154 Q40 158 44 158 Q38 146 38 134 Z', true],
  ['biceps:0', 'M42 108 Q35 116 36 134 Q38 148 44 158 Q48 144 48 130 Q48 116 42 108 Z', true],
  ['biceps:1', 'M48 110 Q48 126 48 132 Q48 146 44 158 Q54 154 58 142 Q60 124 56 112 Q54 106 48 110 Z', true],
  ['podlaktice:1', 'M28 166 Q24 192 26 230 L32 234 Q36 212 42 168 Q38 160 32 162 Z', true],
  ['podlaktice:0', 'M42 164 Q44 184 36 212 L32 234 L38 236 Q48 214 52 188 Q54 170 50 162 Q46 160 42 164 Z', true],
];

const BACK = [
  ['x:calfbase', 'M66 380 Q68 392 72 398 L80 398 Q82 390 82 380 Z', true],
  ['noge:3', 'M63 336 Q56 356 64 378 Q72 388 82 378 Q90 356 84 336 Q72 328 63 336 Z', true],
  ['noge:1', 'M64 266 Q58 292 62 320 Q72 332 86 324 Q96 298 94 266 Q80 258 64 266 Z', true],
  ['noge:2', 'M98 214 Q80 206 64 222 Q58 246 74 264 Q92 268 98 252 Z', true],
  ['leđa:0', 'M66 118 Q52 136 58 168 Q66 196 86 210 Q92 190 90 164 Q86 140 72 124 Z', true],
  ['leđa:2', 'M98 144 Q88 150 87 176 Q86 200 91 218 L98 220 Z', true],
  ['leđa:1', 'M100 100 Q74 88 64 76 Q60 102 70 122 Q84 130 100 142 Q116 130 130 122 Q140 102 136 76 Q126 88 100 100 Z', false],
  ['leđa:3', 'M100 52 Q82 58 62 70 Q70 84 100 100 Q130 84 138 70 Q118 58 100 52 Z', false],
  ['ramena:2', 'M60 70 Q44 70 36 88 Q32 106 40 122 Q54 114 60 98 Q66 84 60 70 Z', true],
  ['triceps:1', 'M38 108 Q27 122 30 144 Q34 158 44 162 Q46 144 46 126 Q46 114 38 108 Z', true],
  ['triceps:0', 'M50 110 Q44 120 44 138 Q46 152 50 162 Q58 148 60 130 Q60 116 50 110 Z', true],
  ['triceps:2', 'M36 142 Q46 150 58 142 Q58 158 50 170 Q40 168 36 142 Z', true],
];

// Izrezi [x, y, širina, visina] po grupi; dva izreza = sprijeda i straga.
const VIEWS = {
  prsa:       [['front', [38, 50, 124, 108]]],
  leđa:       [['back',  [34, 46, 132, 184]]],
  noge:       [['front', [38, 228, 124, 174]], ['back', [38, 204, 124, 198]]],
  ramena:     [['front', [14, 52, 64, 96]], ['back', [14, 52, 64, 96]]],
  biceps:     [['front', [10, 98, 66, 72]]],
  triceps:    [['back',  [10, 98, 66, 76]]],
  podlaktice: [['front', [4, 154, 66, 102]]],
  trbuh:      [['front', [56, 118, 88, 106]]],
};
const HEIGHT = 112;

function silhouette() {
  const shapes = SILHOUETTE.map(([d, m]) => `<path d="${d}"/>` + (m ? `<path d="${d}" ${MIRROR}/>` : '')).join('');
  // Prvo debela crna linija, pa ista ispuna preko nje: ostaje samo vanjski obris.
  return `<g fill="var(--text)" stroke="var(--text)" stroke-width="5" stroke-linejoin="round">${shapes}</g><g fill="var(--card2)" stroke="none">${shapes}</g>`;
}

function muscles(list, group, colors) {
  return list.map(([id, d, mirror]) => {
    const [g, idx] = id.split(':');
    const hot = g === group && colors[+idx];
    const attrs = hot
      ? `fill="${colors[+idx]}" stroke="var(--text)" stroke-width="1.5" stroke-linejoin="round"`
      : `fill="var(--body)" stroke="var(--text)" stroke-width="1" stroke-opacity=".45" stroke-linejoin="round"`;
    const tf = g === 'biceps' || g === 'triceps' ? ' transform="translate(-16 0) scale(1.35 1)"' : '';
    return `<path d="${d}" ${attrs}${tf}/>` + (mirror ? `<g ${MIRROR}><path d="${d}" ${attrs}${tf}/></g>` : '');
  }).join('');
}

export function zoomMap(muscle, colors, label) {
  const views = VIEWS[muscle];
  if (!views) return '';
  const svgs = views.map(([v, box]) => {
    const w = Math.round((HEIGHT * box[2]) / box[3]);
    return `<svg class="zoom" viewBox="${box.join(' ')}" style="width:${w}px;height:${HEIGHT}px" role="img" aria-label="${label || muscle}">${silhouette()}${muscles(v === 'front' ? FRONT : BACK, muscle, colors)}</svg>`;
  }).join('');
  return `<div class="zoomwrap">${svgs}</div>`;
}
