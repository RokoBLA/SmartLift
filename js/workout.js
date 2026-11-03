// Trening: odabir dana, unos serija, odmor, uređivanje serija s poništavanjem.
import { esc, uid, num, fmt, plural, fmtTime } from './util.js';
import { MUSCLES } from './exercises.js';
import { animHtml } from './animations.js';
import { computeRecovery, dayReadiness } from './recovery.js';
import { historyFor, suggest, entryDefaults } from './progression.js';
import { actions, changes, inputs, forms, openSheet, closeSheet, toast, startRest, stopRest, confirmSheet } from './ui.js';
import { state, plan, settings, pain, startActive, finishActive, writeSession, emit } from './store.js';
import { openPicker } from './picker.js';

let openEx = null;           // indeks otvorene vježbe
const drafts = {};           // nacrti unosa po ključu vježbe

const volumeOf = (s) => (s.exercises || []).reduce((a, e) => a + (e.log || []).filter((x) => !x.warm).reduce((b, x) => b + x.w * x.r, 0), 0);
export const sessionVolume = volumeOf;

export function workoutView() {
  return state.active ? activeView(state.active) : dayList();
}

function dayList() {
  const days = plan();
  const rec = computeRecovery(state.sessions, settings().recovery);
  return `<div class="row between" style="margin:4px 0 14px"><h1>Trening</h1><a class="btn sm" href="#/plan">Uredi plan</a></div>
    ${days.length ? days.map((d) => {
      const ready = dayReadiness(d, rec);
      const ms = [...new Set(d.exercises.map((e) => MUSCLES[e.muscle]?.name).filter(Boolean))].join(' · ');
      return `<div class="card" style="margin-bottom:10px"><div class="row between"><div class="grow"><b style="font-size:17px">${esc(d.name || 'Dan bez naziva')}</b>
        <div class="muted small">${d.exercises.length} ${plural(d.exercises.length, 'vježba', 'vježbe', 'vježbi')}${ms ? ' · ' + ms : ''}</div>
        ${ready != null ? `<div class="small" style="margin-top:4px"><span class="dot ${ready >= 90 ? 'ok' : ready >= 60 ? 'warn' : 'bad'}"></span>Spremnost mišića: ${Math.round(ready)}%</div>` : ''}</div>
        <button class="btn primary" data-act="start-day" data-id="${d.id}" ${d.exercises.length ? '' : 'disabled'}>Kreni</button></div>
        ${d.exercises.length ? '' : '<p class="hint" style="margin-top:8px">Dodaj barem jednu vježbu u planu.</p>'}</div>`;
    }).join('') : `<div class="card empty"><p><b>Još nemaš plan treninga.</b></p><p class="muted">Složi prvi dan, npr. „PRSA + TRICEPS“, i odaberi vježbe.</p><a class="btn primary" href="#/plan">Složi plan</a></div>`}
    ${days.length && !state.sessions.length ? '<p class="center muted" style="margin-top:12px">Još nema treninga. Odaberi dan i kreni.</p>' : ''}`;
}

function activeView(a) {
  const sets = a.exercises.reduce((n, e) => n + e.log.length, 0);
  return `<div class="row between" style="margin:4px 0 4px"><div><h1>${esc(a.dayName)}</h1>
      <div class="muted small">Počelo u ${fmtTime(a.t0)} · ${sets} ${plural(sets, 'serija', 'serije', 'serija')} · volumen ${fmt(Math.round(volumeOf(a)))} kg</div></div></div>
    <div style="margin-top:12px">${a.exercises.map((e, i) => exCard(a, e, i)).join('')}</div>
    <button class="btn block" style="margin-top:12px" data-act="wk-add-ex">+ Dodaj vježbu</button>
    <button class="btn primary block" style="margin-top:16px" data-act="wk-finish">Završi trening</button>
    <p class="hint center" style="margin-top:8px">Zagrijavajuće serije se ne računaju u volumen.</p>`;
}

function suggestionFor(a, e) {
  if (pain()[e.muscle]) return { text: 'Boli te ova grupa: prijedlog je isključen. Odmori.', tone: 'neutral', sug: null, hist: [] };
  const hist = historyFor(e.key, state.sessions, a.id);
  const sug = suggest(e.plan, hist, settings().step);
  return { text: sug.text, tone: sug.kind === 'hold-fail' ? 'neutral' : '', sug, hist };
}

function draftFor(a, e, i) {
  if (!drafts[e.key]) {
    const { sug, hist } = suggestionFor(a, e);
    const d = entryDefaults(e.plan, hist, sug);
    drafts[e.key] = { w: d.w, r: d.r, rir: d.rir, warm: false };
  }
  return drafts[e.key];
}

function exCard(a, e, i) {
  const open = openEx === i;
  const work = e.log.filter((s) => !s.warm).length;
  const s = suggestionFor(a, e);
  return `<div class="card ex">
    <button class="ex-head" data-act="ex-toggle" data-i="${i}" aria-expanded="${open}">
      ${animHtml(e.anim)}
      <span class="grow"><span class="ex-name">${esc(e.name)}</span><br>
        <span class="muted small">${e.plan.sets} × ${e.plan.repMin}–${e.plan.repMax} · ${work} ${plural(work, 'serija', 'serije', 'serija')} gotovo</span><br>
        <span class="sug ${s.tone}">${esc(s.text)}</span></span>
      <span class="chev">${open ? '▴' : '▾'}</span></button>
    ${open ? `<div class="ex-body">${setList(e, i)}${entryForm(a, e, i)}</div>` : ''}</div>`;
}

function setList(e, i) {
  if (!e.log.length) return '<p class="hint" style="margin-top:12px">Još nema serija. Unesi prvu ispod.</p>';
  let n = 0;
  return `<ul class="set-list">${e.log.map((s) => `<li><button class="set-row" data-act="set-edit" data-sid="${state.active.id}" data-ei="${i}" data-id="${s.id}">
      <span class="n">${s.warm ? '' : ++n}</span><span class="v">${fmt(s.w)} kg × ${s.r}</span>
      ${s.warm ? '<span class="warm-tag">zagrijavanje</span>' : `<span class="muted small">RIR ${s.rir}</span>`}<span class="chev">✎</span></button></li>`).join('')}</ul>`;
}

function entryForm(a, e, i) {
  const d = draftFor(a, e, i);
  const st = settings().step;
  return `<div class="entry">
    <div class="field-label">Težina <small>kg</small></div>
    <div class="stepper"><button class="icon-btn" data-act="adj" data-i="${i}" data-f="w" data-d="${-st}" aria-label="Manje">−</button>
      <input class="input num" inputmode="decimal" value="${fmt(d.w)}" data-inp="draft" data-i="${i}" data-f="w" aria-label="Težina u kilogramima">
      <button class="icon-btn" data-act="adj" data-i="${i}" data-f="w" data-d="${st}" aria-label="Više">+</button></div>
    <div class="field-label">Ponavljanja</div>
    <div class="stepper"><button class="icon-btn" data-act="adj" data-i="${i}" data-f="r" data-d="-1" aria-label="Manje">−</button>
      <input class="input num" inputmode="numeric" value="${d.r}" data-inp="draft" data-i="${i}" data-f="r" aria-label="Broj ponavljanja">
      <button class="icon-btn" data-act="adj" data-i="${i}" data-f="r" data-d="1" aria-label="Više">+</button></div>
    <div class="field-label">Koliko ponavljanja je ostalo u rezervi? <small>RIR</small></div>
    <div class="rir">${[0, 1, 2, 3, 4].map((n) => `<button class="chip ${d.rir === n ? 'on' : ''}" data-act="rir" data-i="${i}" data-v="${n}">${n}</button>`).join('')}</div>
    <p class="hint" style="margin-top:6px">0 = nisi mogao ni jedno više, 4 = bilo je lagano.</p>
    <label class="switch"><input type="checkbox" ${d.warm ? 'checked' : ''} data-chg="warm" data-i="${i}"> Zagrijavajuća serija</label>
    <button class="btn primary block" data-act="set-save" data-i="${i}">Spremi seriju</button></div>`;
}

const exAt = (i) => state.active.exercises[+i];

actions['start-day'] = (el) => {
  if (state.active) { toast('Prvo završi trening koji je u tijeku.'); location.hash = '#/workout'; return; }
  const day = plan().find((d) => d.id === el.dataset.id);
  if (!day || !day.exercises.length) return;
  openEx = 0;
  startActive(day);
  location.hash = '#/workout';
};
actions['ex-toggle'] = (el) => { openEx = openEx === +el.dataset.i ? null : +el.dataset.i; emit(); };

inputs.draft = (el) => {
  const d = drafts[exAt(el.dataset.i).key];
  const v = num(el.value);
  if (Number.isFinite(v)) d[el.dataset.f] = el.dataset.f === 'r' ? Math.round(v) : v;
};
actions.adj = (el) => {
  const d = drafts[exAt(el.dataset.i).key], f = el.dataset.f;
  d[f] = Math.max(f === 'r' ? 1 : 0, Math.round((d[f] + Number(el.dataset.d)) * 100) / 100);
  emit();
};
actions.rir = (el) => { drafts[exAt(el.dataset.i).key].rir = +el.dataset.v; emit(); };
changes.warm = (el) => { drafts[exAt(el.dataset.i).key].warm = el.checked; };

actions['set-save'] = (btn) => {
  const a = state.active, e = exAt(btn.dataset.i), d = drafts[e.key];
  if (!(d.r >= 1)) return toast('Upiši broj ponavljanja.');
  if (!(d.w >= 0)) return toast('Upiši težinu.');
  e.log.push({ id: uid(), w: d.w, r: d.r, rir: d.warm ? null : d.rir, warm: !!d.warm, t: Date.now() });
  writeSession(a);
  const s = settings();
  if (!d.warm) startRest(s.rest, { sound: s.sound, vibrate: s.vibrate });
  d.warm = false;
  emit();
};

actions['wk-add-ex'] = () => openPicker((ex) => {
  const a = state.active;
  a.exercises.push({ key: ex.key, name: ex.name, muscle: ex.muscle, anim: ex.anim ?? null, plan: { sets: ex.sets, repMin: ex.repMin, repMax: ex.repMax }, log: [] });
  openEx = a.exercises.length - 1;
  writeSession(a); emit();
});

actions['wk-finish'] = () => {
  const a = state.active;
  const sets = a.exercises.reduce((n, e) => n + e.log.length, 0);
  const done = () => { finishActive(); stopRest(); openEx = null; Object.keys(drafts).forEach((k) => delete drafts[k]); location.hash = '#/home'; toast('Trening spremljen. Dobar posao!'); };
  if (!sets) return confirmSheet({ title: 'Završiti bez serija?', text: 'Nisi unio nijednu seriju pa se ovaj trening neće spremiti.', ok: 'Završi', onOk: done });
  confirmSheet({ title: 'Završiti trening?', text: 'Serije su već spremljene. Oporavak mišića računa se prema njima.', ok: 'Završi trening', onOk: done });
};

// ---- uređivanje i brisanje serije (koristi se i u povijesti) ----
export function findSession(id) { return state.active?.id === id ? state.active : state.sessions.find((s) => s.id === id); }

actions['set-edit'] = (el) => {
  const s = findSession(el.dataset.sid);
  const set = s?.exercises[+el.dataset.ei]?.log.find((x) => x.id === el.dataset.id);
  if (!set) return;
  openSheet(`<h2>Uredi seriju</h2>
    <form class="stack" data-form="set-edit" style="margin-top:14px" novalidate>
      <input type="hidden" name="sid" value="${s.id}"><input type="hidden" name="ei" value="${el.dataset.ei}"><input type="hidden" name="id" value="${set.id}">
      <label class="field"><span>Težina (kg)</span><input class="input" name="w" inputmode="decimal" value="${fmt(set.w)}"></label>
      <label class="field"><span>Ponavljanja</span><input class="input" name="r" inputmode="numeric" value="${set.r}"></label>
      <div><div class="field-label" style="margin-top:0">RIR <small>ponavljanja u rezervi</small></div>
        <div class="rir">${[0, 1, 2, 3, 4].map((n) => `<label class="chip ${set.rir === n ? 'on' : ''}" style="cursor:pointer"><input type="radio" name="rir" value="${n}" ${set.rir === n ? 'checked' : ''} hidden>${n}</label>`).join('')}</div></div>
      <label class="switch"><input type="checkbox" name="warm" ${set.warm ? 'checked' : ''}> Zagrijavajuća serija</label>
      <p class="err" id="se-err"></p>
      <button class="btn primary block" type="submit">Spremi</button>
      <button class="btn danger block" type="button" data-act="set-del" data-sid="${s.id}" data-ei="${el.dataset.ei}" data-id="${set.id}">Obriši seriju</button>
    </form>`);
};
// Kratki odabir RIR-a unutar prozora.
document.addEventListener('change', (ev) => {
  const r = ev.target.closest && ev.target.closest('input[name="rir"]');
  if (r) r.closest('.rir').querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.contains(r)));
});

forms['set-edit'] = (form) => {
  const s = findSession(form.sid.value);
  const set = s?.exercises[+form.ei.value]?.log.find((x) => x.id === form.id.value);
  if (!set) return closeSheet();
  const w = num(form.w.value), r = parseInt(form.r.value, 10);
  if (!(w >= 0) || !(r >= 1)) { document.getElementById('se-err').textContent = 'Upiši težinu i ponavljanja.'; return; }
  const before = JSON.parse(JSON.stringify(s));
  const rirEl = form.querySelector('input[name="rir"]:checked');
  set.w = w; set.r = r; set.warm = form.warm.checked; set.rir = set.warm ? null : rirEl ? +rirEl.value : set.rir ?? 2;
  closeSheet();
  writeSession(s);
  toast('Serija promijenjena.', { label: 'Poništi', onClick: () => writeSession(before) });
};

actions['set-del'] = (el) => {
  const s = findSession(el.dataset.sid);
  if (!s) return;
  const before = JSON.parse(JSON.stringify(s));
  const log = s.exercises[+el.dataset.ei].log;
  log.splice(log.findIndex((x) => x.id === el.dataset.id), 1);
  closeSheet();
  writeSession(s);
  toast('Serija obrisana.', { label: 'Poništi', onClick: () => writeSession(before) });
};
