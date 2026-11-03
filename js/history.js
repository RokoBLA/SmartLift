// Povijest treninga: popis i detalji (s uređivanjem serija).
import { esc, fmt, fmtDay, fmtTime, plural } from './util.js';
import { actions, confirmSheet, toast } from './ui.js';
import { state, deleteSession, writeSession } from './store.js';
import { sessionVolume } from './workout.js';
import { MUSCLES } from './exercises.js';

export function historyView(route) {
  if (route[1]) return detail(route[1]);
  const list = [...state.sessions].filter((s) => s.id !== state.active?.id || s.exercises.some((e) => e.log.length)).sort((a, b) => b.t0 - a.t0);
  if (!list.length) {
    return `<h1 style="margin:4px 0 14px">Povijest</h1><div class="card empty"><p><b>Još nema treninga.</b></p><p class="muted">Odaberi dan i kreni. Svaki trening ćeš naći ovdje.</p><a class="btn primary" href="#/workout">Odaberi dan</a></div>`;
  }
  return `<h1 style="margin:4px 0 14px">Povijest</h1>${list.map((s) => {
    const sets = s.exercises.reduce((n, e) => n + e.log.length, 0);
    return `<a class="list-item" href="#/history/${s.id}"><div class="grow"><b>${esc(s.dayName)}</b>
      <div class="muted small">${fmtDay(s.t0)} · ${sets} ${plural(sets, 'serija', 'serije', 'serija')} · ${fmt(Math.round(sessionVolume(s)))} kg</div></div><span class="chev">›</span></a>`;
  }).join('')}`;
}

function detail(id) {
  const s = state.sessions.find((x) => x.id === id);
  if (!s) return `<a class="link" href="#/history">← Povijest</a><div class="card empty" style="margin-top:12px"><p>Taj trening više ne postoji.</p></div>`;
  return `<a class="link" href="#/history" style="display:inline-block;margin:4px 0 8px">← Povijest</a>
    <h1>${esc(s.dayName)}</h1>
    <p class="muted small" style="margin:4px 0 14px">${fmtDay(s.t0)} u ${fmtTime(s.t0)} · volumen ${fmt(Math.round(sessionVolume(s)))} kg</p>
    ${s.exercises.filter((e) => e.log.length).map((e, _i) => {
      const ei = s.exercises.indexOf(e); let n = 0;
      return `<div class="card" style="margin-bottom:10px"><b>${esc(e.name)}</b><div class="muted small">${MUSCLES[e.muscle]?.name || ''}</div>
        <ul class="set-list">${e.log.map((x) => `<li><button class="set-row" data-act="set-edit" data-sid="${s.id}" data-ei="${ei}" data-id="${x.id}">
          <span class="n">${x.warm ? '' : ++n}</span><span class="v">${fmt(x.w)} kg × ${x.r}</span>
          ${x.warm ? '<span class="warm-tag">zagrijavanje</span>' : `<span class="muted small">RIR ${x.rir}</span>`}<span class="chev">✎</span></button></li>`).join('')}</ul></div>`;
    }).join('')}
    <p class="hint">Dodirni seriju da je urediš ili obrišeš.</p>
    <button class="btn block ghost" style="margin-top:20px;color:var(--bad)" data-act="sess-del" data-id="${s.id}">Obriši cijeli trening</button>`;
}

actions['sess-del'] = (el) => {
  const s = state.sessions.find((x) => x.id === el.dataset.id);
  if (!s) return;
  confirmSheet({
    title: 'Obrisati ovaj trening?', text: 'Brišu se sve njegove serije.', ok: 'Obriši', danger: true,
    onOk: () => {
      const copy = JSON.parse(JSON.stringify(s));
      deleteSession(s);
      location.hash = '#/history';
      toast('Trening obrisan.', { label: 'Poništi', onClick: () => writeSession(copy) });
    },
  });
};
