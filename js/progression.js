// Prijedlog progresije: dvostruka progresija (double progression). Čista logika, bez AI-ja.
// Ako su sve radne serije dosegle gornji raspon ponavljanja → veća težina, povratak na donji raspon.
// Inače → još ponavljanja uz istu težinu.
import { fmt } from './util.js';

function working(entry) { return (entry.log || []).filter((s) => !s.warm); }

// Povijest jedne vježbe (po ključu), od najstarijeg do najnovijeg treninga.
export function historyFor(key, sessions, excludeId) {
  return [...sessions]
    .filter((s) => s.id !== excludeId)
    .sort((a, b) => a.t0 - b.t0)
    .map((s) => ({ s, e: (s.exercises || []).find((x) => x.key === key) }))
    .filter((x) => x.e && working(x.e).length)
    .map((x) => ({ t: x.s.t || x.s.t0, sets: working(x.e) }));
}

function summarize(sets) {
  const top = Math.max(...sets.map((s) => s.w));
  const atTop = sets.filter((s) => s.w === top);
  return { top, atTop, reps: atTop.reduce((a, s) => a + s.r, 0), lastRir: sets[sets.length - 1].rir };
}
const progressed = (cur, prev) => cur.top > prev.top || (cur.top === prev.top && cur.reps > prev.reps);

/**
 * @param ex       stavka plana { sets, repMin, repMax }
 * @param hist     rezultat historyFor()
 * @param step     korak težine (kg)
 * @returns { kind, weight, reps, text }
 */
export function suggest(ex, hist, step = 2.5) {
  const { repMin, repMax } = ex;
  if (!hist.length) {
    return { kind: 'start', weight: null, reps: repMin, text: `Prvi put: odaberi težinu s kojom možeš ${repMin}–${repMax} ponavljanja.` };
  }
  const last = summarize(hist[hist.length - 1].sets);
  const prev = hist.length > 1 ? summarize(hist[hist.length - 2].sets) : null;
  const allMax = last.atTop.length >= ex.sets && last.atTop.every((s) => s.r >= repMax);

  if (allMax) {
    if (last.top === 0) return { kind: 'up', weight: 0, reps: repMin, text: `Sve serije su na vrhu raspona. Dodaj opterećenje (npr. ${fmt(step)} kg) i ciljaj ${repMin} ponavljanja.` };
    const w = last.top + step;
    return { kind: 'up', weight: w, reps: repMin, text: `Povećaj na ${fmt(w)} kg, cilj ${repMin} ponavljanja.` };
  }

  // Zadnja serija prošlog treninga bila je do otkaza, a zadnji trening nije napredovao.
  if (prev && prev.lastRir === 0 && !progressed(last, prev)) {
    return { kind: 'hold-fail', weight: last.top, reps: Math.min(repMax, Math.max(repMin, ...last.atTop.map((s) => s.r))),
      text: `Zadrži ${fmt(last.top)} kg. Zadnji put si išao do otkaza bez napretka, ostavi 1–2 ponavljanja u rezervi.` };
  }

  const minReps = Math.min(...last.atTop.map((s) => s.r));
  const target = Math.min(repMax, Math.max(repMin, minReps + 1));
  return { kind: 'hold', weight: last.top, reps: target, text: `Zadrži ${fmt(last.top)} kg, cilj ${target} ponavljanja.` };
}

// Početne vrijednosti za unos serije: zadnja radna serija ili prijedlog.
export function entryDefaults(ex, hist, sug) {
  const lastSets = hist.length ? hist[hist.length - 1].sets : [];
  const w = sug && sug.weight != null ? sug.weight : lastSets.length ? lastSets[lastSets.length - 1].w : 0;
  const r = sug ? sug.reps : ex.repMin;
  return { w, r, rir: 2 };
}
