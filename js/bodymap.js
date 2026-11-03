// Skica tijela s označenom mišićnom grupom i boja oporavka (crveno → narančasto → zeleno).
import { clamp } from './util.js';

const STOPS = [[0, [196, 80, 63]], [50, [224, 138, 46]], [100, [92, 154, 107]]];

// 0 % = crveno, 50 % = narančasto, 100 % = zeleno; između se boje miješaju.
export function recoveryColor(pct) {
  const p = clamp(pct, 0, 100);
  const i = p <= STOPS[1][0] ? 0 : 1;
  const [p0, c0] = STOPS[i], [p1, c1] = STOPS[i + 1];
  const t = (p - p0) / (p1 - p0);
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(',')})`;
}

const BODY = `<circle cx="30" cy="9" r="6.5"/>
  <path d="M17 21 Q30 17 43 21 L40 42 Q39 50 38 58 L22 58 Q21 50 20 42 Z"/>
  <path d="M15 23 L10 52 M45 23 L50 52 M26 58 L24 93 M34 58 L36 93" fill="none" stroke="var(--body)" stroke-width="7.5" stroke-linecap="round"/>
  <path d="M26 58 L24 93 M34 58 L36 93" fill="none" stroke="var(--body)" stroke-width="10.5" stroke-linecap="round"/>`;

const ARMS_UPPER = (c) => `<ellipse cx="13.2" cy="33" rx="3.2" ry="6" transform="rotate(-12 13.2 33)" fill="${c}"/><ellipse cx="46.8" cy="33" rx="3.2" ry="6" transform="rotate(12 46.8 33)" fill="${c}"/>`;

const SHAPES = {
  prsa:       { view: 'front', draw: (c) => `<ellipse cx="24.5" cy="28" rx="6.3" ry="4.8" fill="${c}"/><ellipse cx="35.5" cy="28" rx="6.3" ry="4.8" fill="${c}"/>` },
  ramena:     { view: 'front', draw: (c) => `<circle cx="15.5" cy="23" r="4.6" fill="${c}"/><circle cx="44.5" cy="23" r="4.6" fill="${c}"/>` },
  biceps:     { view: 'front', draw: ARMS_UPPER },
  podlaktice: { view: 'front', draw: (c) => `<ellipse cx="11.2" cy="46" rx="3" ry="6" transform="rotate(-10 11.2 46)" fill="${c}"/><ellipse cx="48.8" cy="46" rx="3" ry="6" transform="rotate(10 48.8 46)" fill="${c}"/>` },
  trbuh:      { view: 'front', draw: (c) => `<rect x="25" y="35" width="10" height="20" rx="3.5" fill="${c}"/>` },
  noge:       { view: 'front', draw: (c) => `<ellipse cx="25.2" cy="70" rx="5.2" ry="12" fill="${c}"/><ellipse cx="34.8" cy="70" rx="5.2" ry="12" fill="${c}"/><ellipse cx="24.3" cy="87" rx="3.5" ry="6.5" fill="${c}"/><ellipse cx="35.7" cy="87" rx="3.5" ry="6.5" fill="${c}"/>` },
  leđa:       { view: 'back',  draw: (c) => `<path d="M22 21 Q30 18.5 38 21 L41 33 Q38 46 33 53 L27 53 Q22 46 19 33 Z" fill="${c}"/>` },
  triceps:    { view: 'back',  draw: ARMS_UPPER },
};

export function bodyMap(muscle, color, label) {
  const s = SHAPES[muscle];
  if (!s) return '';
  return `<svg class="bodymap" viewBox="0 0 60 100" role="img" aria-label="${label || muscle}">
    <g fill="var(--body)">${BODY}</g>${s.draw(color)}</svg>`;
}
