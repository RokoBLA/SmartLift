// Uvećani prikaz mišićne grupe s podskupinama obojenima prema oporavku.
// Boja: crveno (tek trenirano) → narančasto → zeleno (spremno).
import { clamp } from './util.js';

const STOPS = [[0, [196, 80, 63]], [50, [224, 138, 46]], [100, [92, 154, 107]]];

export function recoveryColor(pct) {
  const p = clamp(pct, 0, 100);
  const i = p <= STOPS[1][0] ? 0 : 1;
  const [p0, c0] = STOPS[i], [p1, c1] = STOPS[i + 1];
  const t = (p - p0) / (p1 - p0);
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(',')})`;
}

const SEP = 'stroke="var(--card)" stroke-width="1.6"';
const rect = (x, y, w, h) => (c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${SEP}/>`;
const two = (a, b) => (c) => a(c) + b(c);
const ell = (cx, cy, rx, ry) => (c) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`;

const ARM = 'M32 6 Q50 0 68 6 L74 58 Q72 92 50 95 Q28 92 26 58 Z';

// Redoslijed dijelova isti je kao MUSCLES[m].parts u exercises.js.
const D = {
  // gornji, srednji, donji dio prsa
  prsa: { o: 'M10 30 Q50 8 90 30 L86 62 Q70 84 50 76 Q30 84 14 62 Z',
          extra: '<path d="M50 14 V78" stroke="var(--card)" stroke-width="1.6" fill="none"/>',
          parts: [rect(0, 0, 100, 42), rect(0, 42, 100, 18), rect(0, 60, 100, 40)] },
  // širina (lat), debljina, donja leđa, trapez
  leđa: { o: 'M30 10 L70 10 Q93 26 88 50 L68 72 L66 92 L34 92 L32 72 L12 50 Q7 26 30 10 Z',
          parts: [two(rect(0, 28, 31, 56), rect(69, 28, 31, 56)), rect(31, 30, 38, 28), rect(31, 58, 38, 40), rect(31, 0, 38, 30)] },
  // prednja strana bedra, stražnja strana bedra, stražnjica, listovi (lijevo sprijeda, desno straga)
  noge: { ctx: `<ellipse cx="27" cy="79" rx="8.5" ry="16" fill="var(--body)"/>`,
          parts: [ell(27, 34, 15, 27), ell(73, 43, 13, 17), ell(73, 15, 17, 12), ell(73, 79, 10, 15)] },
  // prednji, bočni, stražnji dio ramena (pogled sa strane, lice udesno)
  ramena: { o: 'M18 32 Q50 4 82 32 L74 76 Q50 88 26 76 Z',
            parts: [rect(62, 0, 40, 100), rect(38, 0, 24, 100), rect(0, 0, 38, 100)] },
  // duga glava, kratka glava, brahijalis
  biceps: { o: ARM, parts: [rect(50, 0, 50, 62), rect(0, 0, 50, 62), rect(0, 62, 100, 40)] },
  // duga, bočna, medijalna glava
  triceps: { o: ARM, parts: [rect(0, 0, 50, 62), rect(50, 0, 50, 62), rect(0, 62, 100, 40)] },
  // pregibači, opružači
  podlaktice: { o: 'M32 6 L68 6 Q64 50 62 94 L38 94 Q36 50 32 6 Z', parts: [rect(0, 0, 50, 100), rect(50, 0, 50, 100)] },
  // gornji, donji trbuh, kosi mišići
  trbuh: { o: 'M22 8 L78 8 Q94 50 74 92 L26 92 Q6 50 22 8 Z',
           extra: '<path d="M50 10 V90 M26 38 H74 M24 64 H76" stroke="var(--card)" stroke-width="1.8" fill="none"/>',
           parts: [rect(28, 0, 44, 48), rect(28, 48, 44, 52), two(rect(0, 0, 28, 100), rect(72, 0, 28, 100))] },
};

export function zoomMap(muscle, colors, label) {
  const d = D[muscle];
  if (!d) return '';
  const body = d.parts.map((p, i) => p(colors[i])).join('');
  const inner = d.o
    ? `<defs><clipPath id="zc-${muscle}"><path d="${d.o}"/></clipPath></defs>
       <path d="${d.o}" fill="var(--body)"/><g clip-path="url(#zc-${muscle})">${body}</g>
       <path d="${d.o}" fill="none" stroke="var(--muted)" stroke-width="1.2" opacity=".55"/>${d.extra || ''}`
    : `${d.ctx || ''}${body}`;
  return `<svg class="zoom" viewBox="0 0 100 100" role="img" aria-label="${label || muscle}">${inner}</svg>`;
}
