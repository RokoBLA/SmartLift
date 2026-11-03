// Testovi čiste logike: node tests/logic.test.mjs
import assert from 'node:assert/strict';
import { computeRecovery, sessionLoads } from '../js/recovery.js';
import { suggest, historyFor } from '../js/progression.js';
import { analyzeDay } from '../js/analysis.js';
import { LIB } from '../js/exercises.js';
import { hasAnimation } from '../js/animations.js';

const H = 3600e3, now = Date.UTC(2026, 10, 3, 12);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('  ok', name); };

const sess = (id, t0, exs) => ({ id, t0, t: t0, exercises: exs.map(([key, muscle, sets]) => ({ key, muscle, name: key, plan: { sets: 3, repMin: 8, repMax: 12 }, log: sets.map(([w, r, rir, warm], i) => ({ id: id + i, w, r, rir, warm: !!warm, t: t0 + i * 60e3 })) })) });

t('oporavak: nema treninga = 100 %', () => {
  const r = computeRecovery([], null, now);
  assert.equal(r.prsa.pct, 100); assert.equal(r.prsa.hasData, false);
});
t('oporavak: svježe nakon treninga je nisko, na kraju prozora 100 %', () => {
  const s = sess('a', now - 1 * H, [['bench', 'prsa', Array(5).fill([60, 8, 1])]]);
  const r1 = computeRecovery([s], null, now);
  assert.ok(r1.prsa.pct < 10 && r1.prsa.status === 'bad');
  const r2 = computeRecovery([s], null, now + 80 * H);
  assert.equal(r2.prsa.pct, 100); assert.equal(r2.prsa.status, 'ok');
});
t('oporavak: teži trening (manji RIR, više serija) traje dulje', () => {
  const lak = sess('l', now - 10 * H, [['bench', 'prsa', Array(3).fill([40, 8, 4])]]);
  const tez = sess('t', now - 10 * H, [['bench', 'prsa', Array(8).fill([40, 8, 0])]]);
  assert.ok(computeRecovery([tez], null, now).prsa.hoursLeft > computeRecovery([lak], null, now).prsa.hoursLeft);
});
t('oporavak: zagrijavanje se ne računa', () => {
  const s = sess('w', now - 2 * H, [['bench', 'prsa', [[20, 10, null, true], [20, 10, null, true]]]]);
  assert.deepEqual(sessionLoads(s), {});
  assert.equal(computeRecovery([s], null, now).prsa.hasData, false);
});
t('oporavak: prozor je konfigurabilan', () => {
  const s = sess('c', now - 12 * H, [['squat', 'noge', Array(12).fill([100, 5, 0])]]);
  const a = computeRecovery([s], { large: [72, 72] }, now).noge.hoursLeft;
  const b = computeRecovery([s], { large: [24, 24] }, now).noge.hoursLeft;
  assert.ok(Math.abs(a - 60) < 0.5 && Math.abs(b - 12) < 0.5);
});
t('oporavak: ponovni trening prije oporavka produljuje', () => {
  const a = sess('a', now - 30 * H, [['bench', 'prsa', Array(8).fill([60, 8, 1])]]);
  const b = sess('b', now - 2 * H, [['bench', 'prsa', Array(8).fill([60, 8, 1])]]);
  assert.ok(computeRecovery([a, b], null, now).prsa.hoursLeft > computeRecovery([b], null, now).prsa.hoursLeft);
});

const ex = { sets: 3, repMin: 8, repMax: 10 };
const hist = (...runs) => runs.map((sets, i) => ({ t: i, sets: sets.map(([w, r, rir]) => ({ w, r, rir, warm: false })) }));

t('progresija: nema povijesti', () => assert.equal(suggest(ex, [], 2.5).kind, 'start'));
t('progresija: sve serije na vrhu = +2,5 kg i donji raspon', () => {
  const s = suggest(ex, hist([[60, 10, 2], [60, 10, 1], [60, 10, 1]]), 2.5);
  assert.equal(s.kind, 'up'); assert.equal(s.weight, 62.5); assert.equal(s.reps, 8);
  assert.match(s.text, /62,5 kg/);
});
t('progresija: nije sve na vrhu = ista težina, više ponavljanja', () => {
  const s = suggest(ex, hist([[60, 9, 2], [60, 8, 1], [60, 8, 1]]), 2.5);
  assert.equal(s.kind, 'hold'); assert.equal(s.weight, 60); assert.equal(s.reps, 9);
  assert.equal(s.text, 'Zadrži 60 kg, cilj 9 ponavljanja.');
});
t('progresija: cilj nikad iznad gornjeg raspona', () => {
  const s = suggest(ex, hist([[60, 10, 2], [60, 10, 2], [60, 10, 2]].slice(0, 2)), 2.5); // samo 2 serije od 3
  assert.equal(s.kind, 'hold'); assert.equal(s.reps, 10);
});
t('progresija: otkaz + bez napretka = zadrži težinu', () => {
  const s = suggest(ex, hist([[60, 8, 2], [60, 8, 1], [60, 8, 0]], [[60, 8, 2], [60, 8, 1], [60, 8, 1]]), 2.5);
  assert.equal(s.kind, 'hold-fail'); assert.equal(s.weight, 60);
});
t('progresija: otkaz, ali sljedeći trening je napredovao = normalno', () => {
  const s = suggest(ex, hist([[60, 8, 2], [60, 8, 1], [60, 8, 0]], [[60, 9, 2], [60, 9, 1], [60, 8, 1]]), 2.5);
  assert.equal(s.kind, 'hold');
});
t('progresija: historyFor preskače zagrijavanje i druge vježbe', () => {
  const s = sess('p', now, [['bench', 'prsa', [[20, 10, null, true], [60, 8, 2]]], ['fly', 'prsa', [[10, 12, 2]]]]);
  const h = historyFor('bench', [s]);
  assert.equal(h.length, 1); assert.equal(h[0].sets.length, 1);
});

const d = (...keys) => ({ exercises: keys.map((k) => { const e = LIB.find((x) => x.id === k); return { key: k, name: e.hr, muscle: e.m, sets: 3 }; }) });
t('analiza: prazan dan', () => assert.equal(analyzeDay({ exercises: [] })[0].kind, 'info'));
t('analiza: triceps bez duge glave predlaže vježbu iznad glave', () => {
  const tips = analyzeDay(d('pushdown'));
  const add = tips.find((x) => x.kind === 'add');
  assert.ok(add && add.exId === 'ohext' || add.exId === 'skull', JSON.stringify(add));
});
t('analiza: premalo serija', () => assert.ok(analyzeDay(d('bench')).some((x) => x.kind === 'sets')));
t('analiza: izolacija prije teške vježbe', () => assert.ok(analyzeDay(d('fly', 'bench', 'incline')).some((x) => x.kind === 'order')));
t('analiza: pokrivene sve glave = nema prijedloga dodavanja', () => {
  const tips = analyzeDay(d('skull', 'pushdown', 'ohext'));
  assert.ok(!tips.some((x) => x.kind === 'add'));
});
t('animacije: izvještaj o vježbama bez animacije', () => {
  const missing = LIB.filter((e) => !e.a || !hasAnimation(e.a)).map((e) => e.hr);
  console.log('     bez animacije:', missing.join(', '));
  assert.ok(LIB.every((e) => !e.a || hasAnimation(e.a)), 'oznaka animacije bez definicije');
});

console.log(`\n${n} testova prošlo.`);
