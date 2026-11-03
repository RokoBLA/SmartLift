// Uređivanje plana: dani i vježbe. Sve u sučelju, bez JSON-a.
import { esc, uid, clamp, plural } from './util.js';
import { MUSCLES, exById, planExerciseFromLib } from './exercises.js';
import { animHtml } from './animations.js';
import { analyzeDay } from './analysis.js';
import { actions, changes, confirmSheet } from './ui.js';
import { plan, savePlan } from './store.js';
import { openPicker } from './picker.js';

const back = (href, label) => `<a class="link" href="${href}" style="display:inline-block;margin:4px 0 8px">← ${label}</a>`;
const muscleLabel = (day) => [...new Set(day.exercises.map((e) => MUSCLES[e.muscle]?.name).filter(Boolean))].join(' · ');
const cloneDays = () => JSON.parse(JSON.stringify(plan()));

export function planView(route) {
  const id = route[1];
  if (id) return dayView(id);
  const days = plan();
  return `${back('#/workout', 'Trening')}
    <div class="row between" style="margin-bottom:12px"><h1>Moj plan</h1></div>
    ${days.length ? days.map((d, i) => `<div class="list-item" style="padding:10px 10px 10px 16px">
        <a class="grow" href="#/plan/${d.id}" style="color:inherit;text-decoration:none"><b>${esc(d.name || 'Dan bez naziva')}</b><br>
          <span class="muted small">${d.exercises.length} ${plural(d.exercises.length, 'vježba', 'vježbe', 'vježbi')}${muscleLabel(d) ? ' · ' + muscleLabel(d) : ''}</span></a>
        <button class="icon-btn sm" data-act="day-move" data-i="${i}" data-d="-1" aria-label="Pomakni gore" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-btn sm" data-act="day-move" data-i="${i}" data-d="1" aria-label="Pomakni dolje" ${i === days.length - 1 ? 'disabled' : ''}>↓</button>
      </div>`).join('') : `<div class="card empty"><p><b>Još nemaš nijedan dan.</b></p><p class="muted">Dan je jedan trening, npr. „PRSA + TRICEPS“.</p></div>`}
    <button class="btn primary block" style="margin-top:16px" data-act="day-add">+ Dodaj dan</button>`;
}

function dayView(id) {
  const day = plan().find((d) => d.id === id);
  if (!day) return `${back('#/plan', 'Plan')}<div class="card empty"><p>Taj dan više ne postoji.</p></div>`;
  const tips = analyzeDay(day);
  return `${back('#/plan', 'Moj plan')}
    <label class="field"><span>Naziv dana</span><input class="input" value="${esc(day.name)}" maxlength="40" placeholder="npr. PRSA + TRICEPS" data-chg="day-name" data-id="${id}"></label>
    <h3 class="section-title">Vježbe</h3>
    ${day.exercises.length ? day.exercises.map((e, i) => exRow(e, i, day.exercises.length, id)).join('') :
      `<div class="card empty"><p><b>Ovaj dan još nema vježbi.</b></p><p class="muted">Dodaj prvu vježbu i poslije ćeš dobiti savjete što još ubaciti.</p></div>`}
    <button class="btn primary block" style="margin-top:12px" data-act="ex-add" data-id="${id}">+ Dodaj vježbu</button>
    <h3 class="section-title">Savjeti za ovaj dan</h3>
    <div>${tips.map((t) => `<div class="tip">${esc(t.text)}${t.kind === 'add' ? `<div style="margin-top:8px"><button class="btn sm" data-act="tip-add" data-id="${id}" data-ex="${t.exId}">+ Dodaj</button></div>` : ''}</div>`).join('')}</div>
    <p class="hint" style="margin-top:8px">Savjeti su orijentacijski i temelje se na tome koje dijelove mišića vježbe gađaju.</p>
    <button class="btn block ghost" style="margin-top:24px;color:var(--bad)" data-act="day-del" data-id="${id}">Obriši ovaj dan</button>`;
}

function exRow(e, i, n, id) {
  return `<div class="card ex-card" style="padding:12px;margin-top:10px">
    <div class="row">${animHtml(e.anim)}
      <div class="grow"><div class="ex-name">${esc(e.name)}</div><div class="muted small">${MUSCLES[e.muscle]?.name || ''}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="icon-btn sm" data-act="ex-move" data-id="${id}" data-i="${i}" data-d="-1" aria-label="Gore" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-btn sm" data-act="ex-move" data-id="${id}" data-i="${i}" data-d="1" aria-label="Dolje" ${i === n - 1 ? 'disabled' : ''}>↓</button>
      </div>
    </div>
    <div class="row" style="margin-top:10px;align-items:flex-end">
      ${numField('Serije', 'sets', e.sets, id, i)}${numField('Pon. od', 'repMin', e.repMin, id, i)}${numField('do', 'repMax', e.repMax, id, i)}
      <button class="icon-btn" data-act="ex-del" data-id="${id}" data-i="${i}" aria-label="Ukloni vježbu" style="color:var(--bad)">✕</button>
    </div></div>`;
}
const numField = (label, f, v, id, i) => `<label class="field grow"><span class="small">${label}</span><input class="input num" inputmode="numeric" value="${v}" data-chg="ex-field" data-f="${f}" data-id="${id}" data-i="${i}"></label>`;

function mutate(fn, opts) {
  const days = cloneDays();
  fn(days);
  savePlan(days, opts);
}
const dayOf = (days, id) => days.find((d) => d.id === id);

actions['day-add'] = () => {
  const id = uid();
  mutate((days) => days.push({ id, name: '', exercises: [] }));
  location.hash = `#/plan/${id}`;
};
actions['day-move'] = (el) => mutate((days) => {
  const i = +el.dataset.i, j = i + +el.dataset.d;
  if (j < 0 || j >= days.length) return;
  [days[i], days[j]] = [days[j], days[i]];
});
actions['day-del'] = (el) => confirmSheet({
  title: 'Obrisati ovaj dan?', text: 'Plan za taj dan nestaje. Prošli treninzi ostaju u povijesti.', ok: 'Obriši', danger: true,
  onOk: () => { mutate((days) => { days.splice(days.findIndex((d) => d.id === el.dataset.id), 1); }); location.hash = '#/plan'; },
});
changes['day-name'] = (el) => mutate((days) => { dayOf(days, el.dataset.id).name = el.value.trim(); }, { silent: true });

actions['ex-add'] = (el) => {
  const id = el.dataset.id;
  openPicker((ex) => mutate((days) => dayOf(days, id).exercises.push(ex)));
};
actions['ex-del'] = (el) => mutate((days) => { dayOf(days, el.dataset.id).exercises.splice(+el.dataset.i, 1); });
actions['ex-move'] = (el) => mutate((days) => {
  const list = dayOf(days, el.dataset.id).exercises, i = +el.dataset.i, j = i + +el.dataset.d;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
});
actions['tip-add'] = (el) => mutate((days) => dayOf(days, el.dataset.id).exercises.push(planExerciseFromLib(exById(el.dataset.ex), uid())));

changes['ex-field'] = (el) => {
  const f = el.dataset.f;
  const lim = { sets: [1, 10], repMin: [1, 50], repMax: [1, 50] }[f];
  const v = clamp(parseInt(el.value, 10) || lim[0], lim[0], lim[1]);
  // Bez ponovnog crtanja, da fokus ostane u sljedećem polju koje korisnik dira.
  mutate((days) => {
    const e = dayOf(days, el.dataset.id).exercises[+el.dataset.i];
    e[f] = v;
    if (e.repMax < e.repMin) { if (f === 'repMin') e.repMax = e.repMin; else e.repMin = e.repMax; }
    el.closest('.ex-card').querySelectorAll('input[data-f]').forEach((inp) => { inp.value = e[inp.dataset.f]; });
  }, { silent: true });
};
