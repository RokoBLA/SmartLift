// Procjena oporavka mišićnih grupa. Čista logika, bez AI-ja i bez pristupa bazi.
//
// 1) Svaka radna serija daje "opterećenje" ovisno o RIR-u (što bliže otkazu, to više).
// 2) Zbroj opterećenja uspoređuje se s referentnim brojem serija za tu klasu mišića.
// 3) Trajanje oporavka ide od donje do gornje granice prozora, prema tom omjeru.
// 4) Postotak raste linearno od 0 % (kraj treninga) do 100 % (kraj prozora).
// Ako se mišić ponovno trenira prije nego što se oporavi, dio preostalog umora se zbraja.
import { MUSCLES, MUSCLE_ORDER, exById } from './exercises.js';
import { H, clamp } from './util.js';

export const DEFAULT_WINDOWS = { small: [24, 48], medium: [48, 72], large: [72, 72] };
export const CLASS_LABEL = { small: 'Manji mišići (biceps, triceps, ramena, podlaktice, trbuh)', medium: 'Srednji mišići (prsa, leđa)', large: 'Veliki mišići (noge)' };
const RIR_LOAD = [1.3, 1.15, 1.0, 0.85, 0.7];
const REF_SETS = { small: 6, medium: 10, large: 12 };

export const rirLoad = (rir) => RIR_LOAD[clamp(Number.isFinite(rir) ? Math.round(rir) : 2, 0, 4)];

// Za jedan trening vraća { mišić: { load, t } } samo za radne serije.
export function sessionLoads(session) {
  const out = {};
  for (const ex of session.exercises || []) {
    for (const s of ex.log || []) {
      if (s.warm) continue;
      const o = (out[ex.muscle] ||= { load: 0, t: 0 });
      o.load += rirLoad(s.rir);
      o.t = Math.max(o.t, s.t || session.t || session.t0 || 0);
    }
  }
  return out;
}

export function windowFor(muscle, windows) {
  const cls = MUSCLES[muscle]?.cls || 'small';
  const w = (windows && windows[cls]) || DEFAULT_WINDOWS[cls];
  const lo = Math.max(1, Number(w[0]) || DEFAULT_WINDOWS[cls][0]);
  const hi = Math.max(lo, Number(w[1]) || lo);
  return { cls, lo, hi };
}

export function statusOf(pct) {
  if (pct >= 90) return 'ok';
  if (pct >= 60) return 'warn';
  return 'bad';
}

// Pretvara popis opterećenja jednog mišića (ili dijela) u trenutno stanje oporavka.
function fold(list, cls, windows, muscle, now, ref) {
  if (!list.length) return { pct: 100, hoursLeft: 0, status: 'ok', last: null, hasData: false };
  const { lo, hi } = windowFor(muscle, windows);
  let end = 0, start = 0;
  for (const ev of [...list].sort((a, b) => a.t - b.t)) {
    const dur = (lo + (hi - lo) * clamp(ev.load / ref, 0, 1)) * H;
    const carry = 0.5 * Math.max(0, end - ev.t);
    end = Math.min(ev.t + dur + carry, ev.t + hi * 1.5 * H);
    start = ev.t;
  }
  const pct = clamp(((now - start) / (end - start)) * 100, 0, 100);
  return { pct, hoursLeft: Math.max(0, (end - now) / H), status: statusOf(pct), last: start, hasData: true };
}

const byTime = (sessions) => [...sessions].sort((a, b) => (a.t || a.t0) - (b.t || b.t0));

// Vraća { mišić: { pct, hoursLeft, status, last, hasData } } za sve grupe.
export function computeRecovery(sessions, windows, now = Date.now()) {
  const events = {};
  for (const s of byTime(sessions)) for (const [m, o] of Object.entries(sessionLoads(s))) (events[m] ||= []).push(o);
  const result = {};
  for (const m of MUSCLE_ORDER) {
    const cls = MUSCLES[m].cls;
    result[m] = fold(events[m] || [], cls, windows, m, now, REF_SETS[cls]);
  }
  return result;
}

// Isto, ali po dijelovima mišića (npr. duga glava tricepsa). Opterećenje dobivaju samo dijelovi
// koje vježba gađa; vlastite vježbe (bez poznatih dijelova) utječu samo na grupu.
const PART_REF = { small: 4, medium: 6, large: 7 };
export function computePartRecovery(sessions, windows, now = Date.now()) {
  const events = {};
  for (const s of byTime(sessions)) {
    const acc = {};
    for (const ex of s.exercises || []) {
      const lib = exById(ex.key);
      if (!lib || lib.m !== ex.muscle) continue;
      for (const x of ex.log || []) {
        if (x.warm) continue;
        for (const part of lib.t) {
          const o = (acc[ex.muscle + '|' + part] ||= { load: 0, t: 0 });
          o.load += rirLoad(x.rir);
          o.t = Math.max(o.t, x.t || s.t || s.t0 || 0);
        }
      }
    }
    for (const [k, o] of Object.entries(acc)) (events[k] ||= []).push(o);
  }
  const result = {};
  for (const m of MUSCLE_ORDER) {
    const cls = MUSCLES[m].cls;
    result[m] = MUSCLES[m].parts.map((part) => ({ part, ...fold(events[m + '|' + part] || [], cls, windows, m, now, PART_REF[cls]) }));
  }
  return result;
}

// Prosječni oporavak mišića koje trening obuhvaća (za preporuku sljedećeg dana).
export function dayReadiness(day, rec) {
  const ms = [...new Set((day.exercises || []).map((e) => e.muscle))];
  if (!ms.length) return null;
  return ms.reduce((a, m) => a + (rec[m]?.pct ?? 100), 0) / ms.length;
}
