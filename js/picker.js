// Odabir vježbe iz biblioteke. Ako vježbe nema, korisnik nam je javi mailom (pa je dodamo svima).
import { esc, uid } from './util.js';
import { LIB, MUSCLES, MUSCLE_ORDER, exById, exName, planExerciseFromLib } from './exercises.js';
import { animHtml } from './animations.js';
import { REQUEST_EMAIL } from './config-app.js';
import { actions, inputs, forms, openSheet, closeSheet } from './ui.js';

let cb = null, filter = 'all', query = '', request = false;

export function openPicker(onPick) { cb = onPick; filter = 'all'; query = ''; request = false; draw(); }

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

function listHtml() {
  const q = norm(query.trim());
  const items = LIB.filter((e) => (filter === 'all' || e.m === filter) && (!q || norm(exName(e)).includes(q)));
  if (!items.length) return '<p class="muted center pad">Nema takve vježbe. Javi nam je gumbom ispod.</p>';
  return items.map((e) => `<button class="list-item" data-act="pick" data-id="${e.id}">
      <span style="width:44px;height:44px;flex:none;display:block" class="pk">${animHtml(e.a).replace('class="anim"', 'class="anim" style="width:44px;height:44px"')}</span>
      <span class="grow"><b>${esc(exName(e))}</b><br><span class="muted small">${MUSCLES[e.m].name}</span></span></button>`).join('');
}

function draw() {
  if (request) {
    openSheet(`<h2>Nema tvoje vježbe?</h2>
      <p class="muted" style="margin:8px 0 14px">Upiši naziv vježbe. Otvorit će se tvoj mail s gotovom porukom, samo je pošalji. Vježbu dodajemo svima u sljedećoj verziji.</p>
      <form class="stack" data-form="pick-request" novalidate>
        <label class="field"><span>Naziv vježbe</span><input class="input" name="name" maxlength="80" placeholder="npr. Čučanj s pauzom / Pause squat" autofocus></label>
        <label class="field"><span>Mišićna grupa (nije obavezno)</span><select class="input" name="muscle"><option value="">Ne znam</option>${MUSCLE_ORDER.map((m) => `<option value="${MUSCLES[m].name}">${MUSCLES[m].name}</option>`).join('')}</select></label>
        <p class="err" id="pk-err"></p>
        <button class="btn primary block" type="submit">Otvori mail</button>
        <button class="btn block ghost" type="button" data-act="pick-back">Natrag</button>
      </form>`);
    return;
  }
  openSheet(`<div class="row between"><h2>Dodaj vježbu</h2><button class="icon-btn sm" data-act="close" aria-label="Zatvori">✕</button></div>
    <input class="input" style="margin-top:12px" placeholder="Traži vježbu" data-inp="pick-q" value="${esc(query)}" autocomplete="off">
    <div class="seg" style="margin:12px 0;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px">
      <button class="chip sm ${filter === 'all' ? 'on' : ''}" data-act="pick-f" data-m="all">Sve</button>
      ${MUSCLE_ORDER.map((m) => `<button class="chip sm ${filter === m ? 'on' : ''}" data-act="pick-f" data-m="${m}">${MUSCLES[m].name}</button>`).join('')}
    </div>
    <div id="pick-list">${listHtml()}</div>
    <button class="btn block" style="margin-top:14px" data-act="pick-request">Nema tvoje vježbe? Javi nam</button>`);
}

actions['pick-f'] = (el) => { filter = el.dataset.m; draw(); };
actions['pick-request'] = () => { request = true; draw(); };
actions['pick-back'] = () => { request = false; draw(); };
inputs['pick-q'] = (el) => { query = el.value; const l = document.getElementById('pick-list'); if (l) l.innerHTML = listHtml(); };
actions.pick = (el) => { const e = exById(el.dataset.id); const f = cb; closeSheet(); f && f(planExerciseFromLib(e, uid())); };
forms['pick-request'] = (form) => {
  const name = form.name.value.trim();
  if (!name) { document.getElementById('pk-err').textContent = 'Upiši naziv vježbe.'; return; }
  const body = `Pozdrav,\n\nmolim dodajte vježbu u SmartLift:\n\nNaziv: ${name}\nMišićna grupa: ${form.muscle.value || 'ne znam'}\n\nHvala!`;
  location.href = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent('SmartLift: nova vježba')}&body=${encodeURIComponent(body)}`;
  closeSheet();
};
