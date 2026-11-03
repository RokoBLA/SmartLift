// Analiza plana jednog dana: što je propušteno i što bi se moglo bolje.
// Pravila u kodu (bez AI-ja). Savjeti su orijentacijski.
import { LIB, MUSCLES, exById, exName } from './exercises.js';
import { plural } from './util.js';

const MIN_SETS = { small: 4, medium: 6, large: 6 };
const MAX_SETS = 14;

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

    // 1) Dijelovi mišića koje nijedna vježba ne pokriva.
    if (known.length) {
      const covered = new Set(known.flatMap((e) => e.t));
      const missing = info.parts.filter((p) => !covered.has(p));
      for (const part of missing) {
        const cand = LIB.filter((e) => e.m === m && e.t.includes(part) && !exs.some((x) => x.key === e.id))
          .sort((a, b) => b.t.filter((p) => missing.includes(p)).length - a.t.filter((p) => missing.includes(p)).length)[0];
        if (cand) tips.push({ kind: 'add', muscle: m, exId: cand.id, text: `${info.name}: ne gađaš dobro dio „${part}“. Probaj ${exName(cand)}.` });
      }
    }

    // 2) Premalo ili previše serija.
    if (sets < MIN_SETS[info.cls]) {
      tips.push({ kind: 'sets', text: `${info.name}: imaš samo ${sets} ${plural(sets, 'seriju', 'serije', 'serija')} u ovom danu. Za napredak je obično dobro barem ${MIN_SETS[info.cls]}.` });
    } else if (sets > MAX_SETS) {
      tips.push({ kind: 'sets', text: `${info.name}: ${sets} serija u jednom danu je puno. Možda je bolje manje, a kvalitetnije.` });
    }
  }

  // 3) Teške vježbe idu na početak, dok si svjež.
  const firstIso = exs.findIndex((e) => { const l = exById(e.key); return l && !l.c; });
  if (firstIso >= 0) {
    const late = exs.slice(firstIso + 1).find((e) => { const l = exById(e.key); return l && l.c; });
    if (late) tips.push({ kind: 'order', text: `Teže vježbe radi na početku dok si svjež. „${late.name}“ stavi ispred „${exs[firstIso].name}“.` });
  }

  if (!tips.length) tips.push({ kind: 'ok', text: 'Plan za ovaj dan izgleda uravnoteženo. Prati napredak i mijenjaj po potrebi.' });
  return tips;
}
