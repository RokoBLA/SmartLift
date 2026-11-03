// Analiza plana jednog dana: što je propušteno i što bi se moglo bolje.
// Pravila u kodu (bez AI-ja). Savjeti su orijentacijski.
import { LIB, MUSCLES, exById, exName } from './exercises.js';
import { plural } from './util.js';

const MIN_SETS = { small: 4, medium: 6, large: 6 };
const MAX_SETS = 14;
const MAX_EXERCISES = 9;
const MAX_GAP_TIPS = 2;   // najviše toliko prijedloga "dodaj" po mišićnoj grupi

export function analyzeDay(day) {
  const exs = day.exercises || [];
  if (!exs.length) return [{ kind: 'info', text: 'Dodaj prvu vježbu. Zatim ćeš ovdje dobiti savjete što još dodati.' }];
  const tips = [];

  const muscles = [...new Set(exs.map((e) => e.muscle))];
  for (const m of muscles) {
    const info = MUSCLES[m];
    if (!info) continue;
    const mine = exs.filter((e) => e.muscle === m);
    const sets = mine.reduce((a, e) => a + (Number(e.sets) || 0), 0);
    const known = mine.map((e) => exById(e.key)).filter(Boolean);

    // 1) Dijelovi mišića koje nijedna vježba ne pokriva (redom po važnosti, najviše dva).
    if (known.length) {
      const covered = new Set(known.flatMap((e) => e.t));
      const missing = info.parts.filter((p) => !covered.has(p));
      const used = new Set();
      let n = 0;
      for (const part of missing) {
        if (n >= MAX_GAP_TIPS) break;
        if ([...used].some((id) => exById(id).t.includes(part))) continue; // već pokriveno prethodnim prijedlogom
        const cand = LIB.filter((e) => e.m === m && e.t.includes(part) && !exs.some((x) => x.key === e.id))
          // Prvo vježba koja pokriva najviše propuštenih dijelova, a uz isti broj ona koja je ciljanija.
          .sort((a, b) => b.t.filter((p) => missing.includes(p)).length - a.t.filter((p) => missing.includes(p)).length || a.t.length - b.t.length)[0];
        if (!cand) continue;
        used.add(cand.id); n++;
        tips.push({ kind: 'add', muscle: m, exId: cand.id, text: `${info.name}: ne gađaš dobro dio „${part}“. Probaj ${exName(cand)}.` });
      }
    }

    // 2) Premalo ili previše serija.
    if (sets < MIN_SETS[info.cls]) {
      tips.push({ kind: 'sets', text: `${info.name}: imaš samo ${sets} ${plural(sets, 'seriju', 'serije', 'serija')} u ovom danu. Za napredak je obično dobro barem ${MIN_SETS[info.cls]}.` });
    } else if (sets > MAX_SETS) {
      tips.push({ kind: 'sets', text: `${info.name}: ${sets} serija u jednom danu je puno. Možda je bolje manje, a kvalitetnije.` });
    }

    // 3) Teška vježba za istu grupu treba biti prije lakše (dok si svjež).
    const iso = mine.findIndex((e) => { const l = exById(e.key); return l && !l.c; });
    if (iso >= 0) {
      const late = mine.slice(iso + 1).find((e) => { const l = exById(e.key); return l && l.c; });
      if (late) tips.push({ kind: 'order', text: `${info.name}: teže vježbe radi na početku dok si svjež. „${late.name}“ stavi ispred „${mine[iso].name}“.` });
    }
  }

  // 4) Ista vježba dvaput u danu.
  const seen = new Set();
  for (const e of exs) {
    if (seen.has(e.key)) tips.push({ kind: 'dup', text: `„${e.name}“ imaš dvaput u istom danu. Radije povećaj broj serija.` });
    seen.add(e.key);
  }

  // 5) Predugačak dan.
  if (exs.length > MAX_EXERCISES) tips.push({ kind: 'long', text: `Imaš ${exs.length} vježbi u jednom danu. Dulji trening često znači slabiju kvalitetu pri kraju.` });

  if (!tips.length) tips.push({ kind: 'ok', text: 'Plan za ovaj dan izgleda uravnoteženo. Prati napredak i mijenjaj po potrebi.' });
  return tips;
}
