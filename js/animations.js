// Animacije vježbi: štapić-lik u SVG-u, nacrtan u kodu (bez tuđih materijala).
// Svaka animacija ima dvije poze (a, b). Zglobovi: glava, vrat, kuk, koljeno, stopalo, lakat, šaka.
// Format poze: [Hx,Hy, Nx,Ny, Px,Py, Kx,Ky, Fx,Fy, Ex,Ey, Wx,Wy] u okviru 100 × 100.

const FLOOR = '<line class="sc" x1="6" y1="90" x2="94" y2="90"/>';
const BENCH = '<line class="sc" x1="12" y1="61" x2="66" y2="61" stroke-width="4"/><line class="sc" x1="18" y1="61" x2="18" y2="90"/><line class="sc" x1="60" y1="61" x2="60" y2="90"/>';
const BARS = '<line class="sc" x1="36" y1="54" x2="60" y2="54" stroke-width="3"/><line class="sc" x1="48" y1="54" x2="48" y2="90"/>';
const SEAT = (x1, x2, y) => `<line class="sc" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke-width="4"/>`;

const LYING_A = [20, 53, 29, 56, 57, 56, 74, 64, 78, 86];
const BENT = [70, 34, 62, 38, 40, 52, 44, 70, 40, 88];
const STAND = [50, 16, 50, 25, 50, 52, 50, 70, 50, 88];

const ANIMS = {
  squat:    { a: [47, 15, 47, 24, 48, 50, 50, 69, 48, 88, 52, 31, 45, 23], b: [44, 31, 42, 40, 38, 64, 56, 66, 50, 88, 46, 48, 40, 38], w: 5 },
  bench:    { a: [...LYING_A, 30, 40, 30, 22], b: [...LYING_A, 36, 62, 30, 46], w: 5, scene: BENCH },
  incline:  { a: [27, 38, 34, 47, 53, 66, 68, 66, 70, 86, 37, 32, 37, 14], b: [27, 38, 34, 47, 53, 66, 68, 66, 70, 86, 44, 52, 36, 36], w: 5,
              scene: '<line class="sc" x1="52" y1="70" x2="26" y2="40" stroke-width="4"/>' + SEAT(48, 66, 72) },
  fly:      { a: [...LYING_A, 30, 40, 30, 22], b: [...LYING_A, 26, 68, 22, 76], w: 4, scene: BENCH },
  pushup:   { a: [18, 42, 27, 50, 56, 63, 72, 74, 85, 86, 27, 68, 28, 86], b: [16, 70, 26, 74, 56, 78, 72, 82, 85, 86, 38, 80, 28, 86] },
  dips:     { a: [47, 12, 47, 22, 49, 46, 55, 58, 52, 72, 47, 38, 47, 54], b: [47, 28, 47, 38, 49, 62, 55, 74, 52, 86, 56, 48, 47, 54], scene: BARS },
  pushdown: { a: [40, 16, 40, 25, 40, 52, 41, 70, 40, 88, 42, 40, 52, 32], b: [40, 16, 40, 25, 40, 52, 41, 70, 40, 88, 42, 40, 46, 58], w: 2.5, cable: [60, 2] },
  ohext:    { a: [42, 22, 42, 31, 42, 56, 43, 72, 42, 88, 44, 18, 44, 4], b: [42, 22, 42, 31, 42, 56, 43, 72, 42, 88, 45, 17, 34, 24], w: 4 },
  skull:    { a: [...LYING_A, 30, 40, 30, 22], b: [...LYING_A, 31, 40, 22, 44], w: 4, scene: BENCH },
  kickback: { a: [...BENT, 52, 46, 52, 60], b: [...BENT, 52, 46, 36, 46], w: 4 },
  pullup:   { a: [50, 26, 50, 35, 50, 60, 52, 74, 46, 86, 48, 20, 46, 6], b: [50, 10, 50, 19, 50, 44, 52, 58, 46, 70, 42, 26, 46, 6],
              scene: '<line class="sc" x1="30" y1="6" x2="70" y2="6" stroke-width="3"/>' },
  pulldown: { a: [44, 31, 46, 40, 50, 66, 64, 62, 66, 86, 52, 22, 56, 6], b: [44, 31, 46, 40, 50, 66, 64, 62, 66, 86, 42, 52, 54, 34], w: 3, cable: [56, 2], scene: SEAT(44, 62, 68) },
  row:      { a: [...BENT, 64, 52, 64, 66], b: [...BENT, 50, 52, 58, 54], w: 5 },
  cablerow: { a: [32, 33, 32, 42, 34, 68, 56, 64, 60, 86, 46, 52, 60, 56], b: [32, 33, 32, 42, 34, 68, 56, 64, 60, 86, 38, 58, 44, 56], w: 3, cable: [94, 58], scene: SEAT(22, 46, 70) },
  deadlift: { a: [49, 15, 49, 24, 48, 51, 49, 70, 48, 88, 49, 40, 50, 58], b: [62, 34, 54, 40, 36, 56, 52, 70, 48, 88, 55, 58, 54, 76], w: 6 },
  shrug:    { a: [...STAND, 51, 40, 52, 56], b: [50, 12, 50, 21, 50, 52, 50, 70, 50, 88, 51, 38, 52, 52], w: 4 },
  curl:     { a: [...STAND, 51, 40, 52, 56], b: [...STAND, 51, 40, 62, 30], w: 4 },
  preacher: { a: [40, 31, 40, 40, 42, 64, 56, 64, 58, 86, 52, 50, 66, 62], b: [40, 31, 40, 40, 42, 64, 56, 64, 58, 86, 52, 50, 58, 34], w: 4,
              scene: '<line class="sc" x1="46" y1="42" x2="62" y2="66" stroke-width="4"/>' },
  ohp:      { a: [48, 22, 48, 31, 48, 56, 49, 72, 48, 88, 52, 43, 50, 31], b: [48, 22, 48, 31, 48, 56, 49, 72, 48, 88, 49, 20, 49, 6], w: 5 },
  lateral:  { a: [...STAND, 51, 40, 52, 56], b: [...STAND, 58, 32, 68, 28], w: 4 },
  rearfly:  { a: [...BENT, 64, 52, 64, 66], b: [...BENT, 66, 46, 68, 36], w: 4 },
  facepull: { a: [40, 16, 40, 25, 40, 52, 41, 70, 40, 88, 54, 24, 66, 22], b: [40, 16, 40, 25, 40, 52, 41, 70, 40, 88, 34, 30, 42, 20], w: 2.5, cable: [94, 20] },
  legpress: { a: [16, 68, 24, 72, 40, 80, 50, 62, 60, 52, 30, 76, 38, 78], b: [16, 68, 24, 72, 40, 80, 54, 64, 68, 48, 30, 76, 38, 78], wAt: 'F', w: 5,
              scene: '<line class="sc" x1="10" y1="76" x2="38" y2="86" stroke-width="4"/>' },
  rdl:      { a: [48, 16, 48, 25, 46, 52, 49, 70, 48, 88, 49, 40, 50, 56], b: [70, 36, 62, 42, 36, 52, 41, 70, 40, 88, 62, 56, 58, 70], w: 5 },
  legcurl:  { a: [18, 52, 26, 55, 52, 55, 70, 55, 88, 57, 24, 58, 24, 58], b: [18, 52, 26, 55, 52, 55, 70, 55, 72, 36, 24, 58, 24, 58], wAt: 'F', w: 3.5,
              scene: '<line class="sc" x1="12" y1="60" x2="74" y2="60" stroke-width="4"/><line class="sc" x1="18" y1="60" x2="18" y2="90"/><line class="sc" x1="68" y1="60" x2="68" y2="90"/>' },
  legext:   { a: [28, 29, 30, 38, 34, 62, 58, 62, 62, 84, 36, 52, 40, 62], b: [28, 29, 30, 38, 34, 62, 58, 62, 84, 62, 36, 52, 40, 62], wAt: 'F', w: 3.5, scene: SEAT(24, 46, 64) },
  lunge:    { a: [...STAND, 51, 40, 52, 56], b: [50, 28, 50, 37, 50, 62, 66, 68, 66, 88, 51, 50, 52, 64], w: 4 },
  calf:     { a: [50, 16, 50, 25, 50, 52, 50, 70, 50, 84, 51, 40, 52, 56], b: [50, 11, 50, 20, 50, 47, 50, 65, 52, 79, 51, 35, 52, 51],
              scene: '<rect class="sc" x="36" y="84" width="28" height="6"/>' },
  hipthrust:{ a: [18, 62, 27, 66, 46, 80, 64, 66, 66, 86, 40, 74, 46, 74], b: [18, 62, 27, 66, 46, 60, 64, 60, 66, 86, 40, 56, 46, 56], w: 5,
              scene: '<line class="sc" x1="10" y1="70" x2="34" y2="70" stroke-width="4"/><line class="sc" x1="14" y1="70" x2="14" y2="90"/>' },
  crunch:   { a: [22, 76, 29, 81, 52, 83, 64, 68, 70, 86, 34, 72, 28, 70], b: [32, 64, 36, 74, 52, 83, 64, 68, 70, 86, 42, 64, 38, 60] },
  legraise: { a: [16, 80, 24, 83, 48, 83, 48, 64, 48, 46, 36, 86, 46, 86], b: [16, 80, 24, 83, 48, 83, 66, 82, 86, 84, 36, 86, 46, 86] },
  plank:    { a: [16, 56, 26, 62, 54, 66, 68, 76, 84, 86, 26, 80, 40, 86], b: [16, 54, 26, 60, 54, 63, 68, 74, 84, 86, 26, 80, 40, 86] },
  twist:    { a: [34, 44, 38, 52, 50, 76, 66, 66, 80, 76, 48, 60, 58, 62], b: [34, 44, 38, 52, 50, 76, 66, 66, 80, 76, 42, 62, 38, 72], w: 4 },
  wrist:    { a: [36, 29, 36, 38, 40, 64, 60, 62, 60, 86, 52, 52, 68, 60], b: [36, 29, 36, 38, 40, 64, 60, 62, 60, 86, 52, 52, 68, 46], w: 3, scene: SEAT(28, 48, 66) },
};

export const hasAnimation = (id) => !!ANIMS[id];

const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

function anim(attr, from, to, still) {
  if (still || from === to) return '';
  return `<animate attributeName="${attr}" values="${from};${to};${from}" keyTimes="0;.5;1" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
}
function line(a, b, i, j, still) {
  return `<line class="bd" x1="${a[i]}" y1="${a[i + 1]}" x2="${a[j]}" y2="${a[j + 1]}">`
    + anim('x1', a[i], b[i], still) + anim('y1', a[i + 1], b[i + 1], still)
    + anim('x2', a[j], b[j], still) + anim('y2', a[j + 1], b[j + 1], still) + '</line>';
}

const GENERIC = '<svg viewBox="0 0 100 100" aria-hidden="true"><g class="bd" style="stroke-width:4"><line x1="22" y1="50" x2="78" y2="50"/><line x1="26" y1="34" x2="26" y2="66"/><line x1="36" y1="40" x2="36" y2="60"/><line x1="74" y1="34" x2="74" y2="66"/><line x1="64" y1="40" x2="64" y2="60"/></g></svg>';

// Vraća HTML s animacijom, ili općeniti simbol ako je nema.
export function animHtml(id) {
  const d = id && ANIMS[id];
  if (!d) return `<div class="anim" title="Nema animacije">${GENERIC}</div>`;
  const a = d.a, b = d.b, still = reduced();
  const wi = d.wAt === 'F' ? 8 : 12;
  let s = `<svg viewBox="0 0 100 100" aria-hidden="true">${FLOOR}${d.scene || ''}`;
  if (d.cable) s += `<line class="cb" x1="${d.cable[0]}" y1="${d.cable[1]}" x2="${a[12]}" y2="${a[13]}">`
    + anim('x2', a[12], b[12], still) + anim('y2', a[13], b[13], still) + '</line>';
  // torzo, bedro, potkoljenica, nadlaktica, podlaktica
  s += line(a, b, 2, 4, still) + line(a, b, 4, 6, still) + line(a, b, 6, 8, still) + line(a, b, 2, 10, still) + line(a, b, 10, 12, still);
  s += `<circle class="hd" cx="${a[0]}" cy="${a[1]}" r="5.5">${anim('cx', a[0], b[0], still)}${anim('cy', a[1], b[1], still)}</circle>`;
  if (d.w) s += `<circle class="wt" cx="${a[wi]}" cy="${a[wi + 1]}" r="${d.w}">${anim('cx', a[wi], b[wi], still)}${anim('cy', a[wi + 1], b[wi + 1], still)}</circle>`;
  return `<div class="anim">${s}</svg></div>`;
}
