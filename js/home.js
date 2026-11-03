// Početna: preporuka dana i oporavak mišića (health bar).
import { esc, fmtHours, ago, H } from './util.js';
import { MUSCLES, MUSCLE_ORDER } from './exercises.js';
import { computeRecovery, computePartRecovery, dayReadiness } from './recovery.js';
import { actions } from './ui.js';
import { state, plan, settings, pain, setPain, saveDoc, latestWeight } from './store.js';
import { NOTICE } from './wizard.js';
import { zoomMap, recoveryColor } from './zoom.js';

export const PAIN_TEXT = 'Odmori / preporučeno se posavjetuj s liječnikom ili fizioterapeutom';

export function homeView() {
  const rec = computeRecovery(state.sessions, settings().recovery);
  const partRec = computePartRecovery(state.sessions, settings().recovery);
  const p = pain();
  const days = plan().filter((d) => d.exercises.length);
  const lw = latestWeight();
  const needW = !lw || Date.now() - lw.d > 7 * 24 * H;

  let next = '';
  if (state.active) {
    next = `<div class="card"><b>Trening je u tijeku</b><p class="muted small" style="margin:4px 0 12px">${esc(state.active.dayName)}</p>
      <a class="btn primary block" href="#/workout">Nastavi trening</a></div>`;
  } else if (days.length) {
    const best = days.map((d) => ({ d, r: dayReadiness(d, rec) ?? 100 })).sort((a, b) => b.r - a.r)[0];
    next = `<div class="card"><div class="muted small">Preporuka za danas</div>
      <div class="row between" style="margin-top:4px"><div class="grow"><b style="font-size:19px">${esc(best.d.name || 'Dan bez naziva')}</b>
        <div class="muted small">Spremnost mišića: ${Math.round(best.r)}%</div></div>
        <button class="btn primary" data-act="start-day" data-id="${best.d.id}">Kreni</button></div></div>`;
  } else {
    next = `<div class="card empty"><p><b>Još nemaš plan treninga.</b></p><p class="muted">Složi prvi dan i odaberi vježbe.</p><a class="btn primary" href="#/plan">Složi plan</a></div>`;
  }

  return `<div class="stack" style="margin-top:4px">
    ${!state.doc?.noticeSeen ? `<div class="notice accent"><p>${esc(NOTICE)}</p><button class="link" style="margin-top:8px" data-act="notice-ok">Razumijem</button></div>` : ''}
    ${next}
    ${days.length && !state.sessions.length && !state.active ? '<p class="center muted">Još nema treninga. Odaberi dan i kreni.</p>' : ''}
    ${needW ? `<div class="notice"><p>${lw ? 'Prošlo je više od tjedan dana od zadnjeg vaganja.' : 'Još nisi upisao tjelesnu težinu.'}</p><button class="link" style="margin-top:6px" data-act="bw-add">Upiši težinu</button></div>` : ''}
  </div>
  <h2 class="section-title">Oporavak mišića</h2>
  ${MUSCLE_ORDER.map((m) => muscleCard(m, rec[m], !!p[m], partRec[m])).join('')}
  <p class="hint" style="margin-top:14px">Ovo je orijentacijska procjena, a ne medicinska tvrdnja. Slušaj svoje tijelo.</p>`;
}

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function muscleCard(m, r, hurt, parts) {
  const name = MUSCLES[m].name;
  const pct = Math.round(r.pct);
  const color = hurt ? 'var(--bad)' : recoveryColor(r.pct);
  const colors = parts.map((x) => (hurt ? 'var(--bad)' : recoveryColor(x.pct)));
  let bar, text;
  if (hurt) {
    bar = `<div class="bar pain"><i style="width:100%;background:${color}"></i></div>`;
    text = `<b>${name}:</b> ${PAIN_TEXT}`;
  } else {
    bar = `<div class="bar" role="img" aria-label="${name} ${pct} posto"><i style="width:${Math.max(pct, 3)}%;background:${color}"></i></div>`;
    text = !r.hasData ? `<b>${name}:</b> nema treninga, spremna`
      : pct >= 100 ? `<b>${name}:</b> 100%, spremna`
      : `<b>${name}: ~${pct}%</b>, spremna za ${fmtHours(r.hoursLeft)}`;
  }
  const list = parts.map((x, i) => `<li><span class="dot" style="background:${colors[i]}"></span><span class="grow">${cap(x.part)}</span>${hurt ? '' : `<span class="muted">${x.hasData ? Math.round(x.pct) + '%' : 'spremno'}</span>`}</li>`).join('');
  return `<div class="card mus"><div class="row between" style="margin-bottom:10px">
      <div><b style="font-size:17px">${name}</b><div class="muted small">${r.last && !hurt ? 'zadnji put ' + ago(r.last) : hurt ? 'označeno: boli me' : 'još nema treninga'}</div></div>
      <button class="link small" data-act="pain" data-m="${m}" data-on="${hurt ? 0 : 1}">${hurt ? 'Više me ne boli' : 'Boli me'}</button></div>
    <div class="row" style="gap:14px;margin-bottom:12px">${zoomMap(m, colors, `${name}: podskupine mišića`)}<ul class="parts grow">${list}</ul></div>
    ${bar}<p class="small" style="margin-top:8px">${text}</p></div>`;
}

actions.pain = (el) => setPain(el.dataset.m, el.dataset.on === '1');
actions['notice-ok'] = () => saveDoc({ noticeSeen: true });
