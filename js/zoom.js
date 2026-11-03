// Uvećani prikaz mišićne grupe s podskupinama obojenima prema oporavku.
// Boja: crveno (tek trenirano) → narančasto → zeleno (spremno).
// Oblici su nacrtani rukom (krivulje) da nalikuju mišićima: prsa kao dva lepeza, leđa kao krila, itd.
import { clamp } from './util.js';

const STOPS = [[0, [196, 80, 63]], [50, [224, 138, 46]], [100, [92, 154, 107]]];

export function recoveryColor(pct) {
  const p = clamp(pct, 0, 100);
  const i = p <= STOPS[1][0] ? 0 : 1;
  const [p0, c0] = STOPS[i], [p1, c1] = STOPS[i + 1];
  const t = (p - p0) / (p1 - p0);
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(',')})`;
}

const SEP = 'stroke="var(--card)" stroke-width="1.3" stroke-linejoin="round"';
const MIRROR = 'transform="translate(100 0) scale(-1 1)"';
const path = (d, c, extra = '') => `<path d="${d}" fill="${c}" ${SEP} ${extra}/>`;
const P = (d) => (c) => path(d, c);                          // jedan oblik
const PM = (d) => (c) => path(d, c) + path(d, c, MIRROR);    // oblik i njegov zrcalni par
const N = (d, extra = '') => `<path d="${d}" fill="var(--body)" ${extra}/>`;   // neutralan (kontekst)
const NM = (d) => N(d) + N(d, MIRROR);

// Podkontura ruke (kontekst za biceps i triceps).
const ARM_CTX = N('M30 3 Q50 -3 70 3 Q82 38 73 70 Q71 92 50 97 Q29 92 27 70 Q18 38 30 3 Z');

// Redoslijed dijelova isti je kao MUSCLES[m].parts u exercises.js.
const D = {
  // gornji, srednji, donji dio prsa: dva prsna mišića u obliku lepeze od prsne kosti prema ruci
  prsa: {
    ctx: N('M40 4 Q50 13 60 4 L65 16 Q50 24 35 16 Z') + NM('M3 30 Q-2 48 8 62 Q14 56 12 36 Z') + N('M37 66 Q50 74 63 66 L61 94 Q50 98 39 94 Z'),
    o: 'M52 19 Q72 15 91 29 Q96 45 84 57 Q68 69 52 63 Z M48 19 Q28 15 9 29 Q4 45 16 57 Q32 69 48 63 Z',
    parts: [P('M0 0 H100 V32 Q78 45 52 34 Q26 45 0 32 Z'), P('M0 32 Q26 45 52 34 Q78 45 100 32 V49 Q78 59 52 49 Q26 59 0 49 Z'), P('M0 49 Q26 59 52 49 Q78 59 100 49 V100 H0 Z')],
    extra: '<path d="M50 17 V65" stroke="var(--card)" stroke-width="1.6" fill="none"/>' +
           '<g stroke="var(--card)" stroke-width=".8" fill="none" opacity=".7"><path d="M54 30 Q72 28 88 34 M54 40 Q72 40 88 46 M54 52 Q70 52 82 56"/><path d="M46 30 Q28 28 12 34 M46 40 Q28 40 12 46 M46 52 Q30 52 18 56"/></g>',
  },

  // širina (lat), debljina (sredina leđa), donja leđa, trapez: pogled straga
  leđa: {
    ctx: N('M26 10 Q50 0 74 10 Q97 20 97 40 Q92 72 78 94 L22 94 Q8 72 3 40 Q3 20 26 10 Z'),
    parts: [
      PM('M70 40 Q84 36 93 28 Q98 54 83 77 Q72 84 60 81 Q56 67 51 61 Q66 55 70 40 Z'),
      P('M50 28 Q59 30 67 39 Q65 53 50 59 Q35 53 33 39 Q41 30 50 28 Z'),
      P('M41 63 Q50 59 59 63 L61 90 Q50 96 39 90 Z'),
      P('M50 4 Q59 8 69 12 Q85 16 93 25 Q81 33 67 39 Q59 30 50 28 Q41 30 33 39 Q19 33 7 25 Q15 16 31 12 Q41 8 50 4 Z'),
    ],
    extra: '<path d="M50 6 V92" stroke="var(--card)" stroke-width="1" fill="none" opacity=".6"/>',
  },

  // prednja strana bedra, stražnja strana bedra, stražnjica, listovi (lijevo noga sprijeda, desno straga)
  noge: {
    ctx: N('M17 65 Q25 63 33 65 Q36 80 31 95 L21 95 Q14 80 17 65 Z') + N('M50 4 V96', 'stroke="var(--line)" stroke-width="1" opacity=".0"'),
    parts: [
      P('M22 6 Q38 9 40 34 Q41 52 35 63 Q26 68 19 63 Q11 52 11 34 Q11 11 22 6 Z'),
      P('M64 36 Q76 39 89 36 Q94 52 87 64 Q78 69 70 64 Q61 52 64 36 Z'),
      P('M62 6 Q82 2 95 13 Q99 28 89 35 Q75 40 64 33 Q55 22 62 6 Z'),
      P('M68 67 Q80 65 87 67 Q94 78 85 95 Q78 98 71 95 Q62 80 68 67 Z'),
    ],
    extra: '<path d="M26 12 Q30 36 25 60" stroke="var(--card)" stroke-width="1" fill="none" opacity=".7"/>',
  },

  // prednji, bočni, stražnji dio ramena: pogled sa strane (lice udesno)
  ramena: {
    ctx: N('M41 76 Q50 86 59 76 L61 98 L39 98 Z') + N('M30 14 Q50 0 70 14 L64 20 Q50 9 36 20 Z'),
    o: 'M21 27 Q50 1 79 27 Q77 49 61 79 Q50 90 39 79 Q23 49 21 27 Z',
    parts: [P('M60 0 H100 V100 H54 Q59 50 60 0 Z'), P('M40 0 H60 Q59 50 54 100 H46 Q41 50 40 0 Z'), P('M0 0 H40 Q41 50 46 100 H0 Z')],
    extra: '',
  },

  // duga glava, kratka glava, brahijalis: pogled sprijeda
  biceps: {
    ctx: ARM_CTX,
    parts: [
      P('M61 7 Q69 30 66 54 Q62 72 52 78 Q50 54 52 30 Q54 16 61 7 Z'),
      P('M39 7 Q31 30 34 54 Q38 72 48 78 Q50 54 48 30 Q46 16 39 7 Z'),
      P('M64 58 Q73 68 68 84 Q60 92 52 82 Q58 70 64 58 Z'),
    ],
    extra: '',
  },

  // duga, bočna, medijalna glava tricepsa: pogled straga
  triceps: {
    ctx: ARM_CTX,
    parts: [
      P('M38 7 Q27 32 35 58 Q41 76 53 83 Q55 52 52 28 Q48 14 38 7 Z'),
      P('M62 9 Q74 32 69 57 Q65 76 54 83 Q58 50 56 26 Q56 16 62 9 Z'),
      P('M39 64 Q54 58 67 64 Q66 84 53 95 Q41 86 39 64 Z'),
    ],
    extra: '',
  },

  // pregibači, opružači: podlaktica sprijeda, od lakta prema zapešću
  podlaktice: {
    ctx: N('M31 3 Q50 -3 69 3 Q79 30 63 62 L59 99 L41 99 L37 62 Q21 30 31 3 Z'),
    parts: [
      P('M33 6 Q25 26 37 52 Q43 70 46 96 L51 96 Q52 60 51 30 Q48 12 33 6 Z'),
      P('M67 6 Q75 26 63 52 Q57 70 54 96 L49 96 Q48 60 49 30 Q52 12 67 6 Z'),
    ],
    extra: '',
  },

  // gornji trbuh, donji trbuh, kosi mišići: ravni mišić u šest kocki i kosi mišići sa strana
  trbuh: {
    ctx: N('M24 6 Q50 -2 76 6 Q96 40 82 96 L18 96 Q4 40 24 6 Z'),
    parts: [
      (c) => ['M36 12 H48.5 V30 H36 Z', 'M51.5 12 H64 V30 H51.5 Z', 'M36 33 H48.5 V50 H36 Z', 'M51.5 33 H64 V50 H51.5 Z'].map((d) => path(d, c)).join(''),
      (c) => ['M36 53 H48.5 V70 H36 Z', 'M51.5 53 H64 V70 H51.5 Z', 'M37 73 H48.5 V90 Q42 92 37 88 Z', 'M51.5 73 H63 V88 Q58 92 51.5 90 Z'].map((d) => path(d, c)).join(''),
      PM('M68 12 Q88 34 84 62 Q80 86 68 94 Q73 60 68 12 Z'),
    ],
    extra: '',
  },
};

export function zoomMap(muscle, colors, label) {
  const d = D[muscle];
  if (!d) return '';
  const body = d.parts.map((p, i) => p(colors[i])).join('');
  const inner = d.o
    ? `${d.ctx}<defs><clipPath id="zc-${muscle}"><path d="${d.o}"/></clipPath></defs>
       <path d="${d.o}" fill="var(--body)"/><g clip-path="url(#zc-${muscle})">${body}</g>
       <path d="${d.o}" fill="none" stroke="var(--muted)" stroke-width="1" opacity=".5"/>${d.extra || ''}`
    : `${d.ctx || ''}${body}${d.extra || ''}`;
  return `<svg class="zoom" viewBox="0 0 100 100" role="img" aria-label="${label || muscle}">${inner}</svg>`;
}
