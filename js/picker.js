// Odabir vježbe iz biblioteke ili unos vlastite vježbe.
import { esc, uid } from './util.js';
import { LIB, MUSCLES, MUSCLE_ORDER, exById, exName, planExerciseFromLib } from './exercises.js';
import { animHtml } from './animations.js';
import { actions, inputs, forms, openSheet, closeSheet } from './ui.js';

let cb = null, filter = 'all', query = '', custom = false;

export function openPicker(onPick) { cb = onPick; filter = 'all'; query = ''; custom = false; draw(); }

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

function listHtml() {
  const q = norm(query.trim());
  const items = LIB.filter((e) => (filter === 'all' || e.m === filter) && (!q || norm(exName(e)).includes(q)));
  if (!items.length) return '<p class="muted center pad">Nema takve vježbe. Možeš dodati vlastitu.</p>';
  return items.map((e) => `<button class="list-item" data-act="pick" data-id="${e.id}">
      <span style="width:44px;height:44px;flex:none;display:block" class="pk">${animHtml(e.a).replace('class="anim"', 'class="anim" style="width:44px;height:44px"')}</span>
      <span class="grow"><b>${esc(exName(e))}</b><br><span class="muted small">${MUSCLES[e.m].name}</span></span></button>`).join('');
}

function draw() {
  if (custom) {
    openSheet(`<h2>Vlastita vježba</h2>
      <form class="stack" data-form="pick-custom" style="margin-top:14px" novalidate>
        <label class="field"><span>Naziv</span><input class="input" name="name" maxlength="50" placeholder="npr. Čučanj / Squat" autofocus></label>
        <label class="field"><span>Mišićna grupa</span><select class="input" name="muscle">${MUSCLE_ORDER.map((m) => `<option value="${m}">${MUSCLES[m].name}</option>`).join('')}</select></label>
        <p class="hint">Za vlastite vježbe nema animacije, prikazuje se običan simbol.</p>
        <p class="err" id="pk-err"></p>
        <button class="btn primary block" type="submit">Dodaj</button>
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
    <button class="btn block" style="margin-top:14px" data-act="pick-custom">+ Vlastita vježba</button>`);
}

actions['pick-f'] = (el) => { filter = el.dataset.m; draw(); };
actions['pick-custom'] = () => { custom = true; draw(); };
actions['pick-back'] = () => { custom = false; draw(); };
inputs['pick-q'] = (el) => { query = el.value; const l = document.getElementById('pick-list'); if (l) l.innerHTML = listHtml(); };
actions.pick = (el) => { const e = exById(el.dataset.id); const f = cb; closeSheet(); f && f(planExerciseFromLib(e, uid())); };
forms['pick-custom'] = (form) => {
  const name = form.name.value.trim();
  if (!name) { document.getElementById('pk-err').textContent = 'Upiši naziv vježbe.'; return; }
  const f = cb; closeSheet();
  f && f({ id: uid(), key: 'c_' + uid(), name, muscle: form.muscle.value, anim: null, sets: 3, repMin: 8, repMax: 12 });
};
