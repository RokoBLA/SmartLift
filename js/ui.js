// Zajednički dijelovi sučelja: događaji, prozori, obavijesti, odmor (timer).
import { esc } from './util.js';

export const actions = {};   // data-act="ime"   (klik)
export const changes = {};   // data-chg="ime"   (promjena)
export const inputs = {};    // data-inp="ime"   (tipkanje)
export const forms = {};     // data-form="ime"  (slanje obrasca)

const $ = (id) => document.getElementById(id);

// ---- prozor (bottom sheet) ----
export function openSheet(html) {
  $('sheet').innerHTML = html;
  $('overlay').hidden = false;
  const f = $('sheet').querySelector('[autofocus]'); if (f) setTimeout(() => f.focus(), 50);
}
export function closeSheet() { $('overlay').hidden = true; $('sheet').innerHTML = ''; }
actions.close = () => closeSheet();

export function confirmSheet({ title, text, ok = 'Da', danger = false, onOk }) {
  openSheet(`<h2>${esc(title)}</h2><p class="muted" style="margin:8px 0 18px">${esc(text)}</p>
    <div class="stack"><button class="btn block ${danger ? 'danger' : 'primary'}" data-act="confirm-ok">${esc(ok)}</button>
    <button class="btn block ghost" data-act="close">Odustani</button></div>`);
  actions['confirm-ok'] = () => { closeSheet(); onOk(); };
}

// ---- obavijest s mogućnošću poništavanja ----
let toastTimer;
export function toast(msg, { label, onClick, ms = 6000 } = {}) {
  const t = $('toast');
  t.innerHTML = `<span>${esc(msg)}</span>${label ? `<button data-act="toast-act">${esc(label)}</button>` : ''}`;
  t.hidden = false;
  actions['toast-act'] = () => { t.hidden = true; clearTimeout(toastTimer); onClick && onClick(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

// ---- odmor između serija ----
let rest = null; // { end, total }
let restTick;
let audio;

function beep() {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.connect(g); g.connect(audio.destination);
    o.frequency.value = 880; g.gain.value = 0.15;
    o.start(); o.stop(audio.currentTime + 0.35);
  } catch { /* zvuk nije dostupan */ }
}

export function startRest(seconds, opts = {}) {
  rest = { end: Date.now() + seconds * 1000, done: false, opts };
  // Zvuk smije krenuti tek nakon dodira, pa ga budimo ovdje.
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume && audio.resume(); } catch { /* ništa */ }
  clearInterval(restTick);
  restTick = setInterval(drawRest, 250);
  drawRest();
}
export function stopRest() { rest = null; clearInterval(restTick); $('timer').hidden = true; document.body.classList.remove('resting'); }

function drawRest() {
  const el = $('timer');
  if (!rest) return;
  const left = Math.ceil((rest.end - Date.now()) / 1000);
  if (left <= 0 && !rest.done) {
    rest.done = true;
    if (rest.opts.vibrate && navigator.vibrate) navigator.vibrate([250, 120, 250]);
    if (rest.opts.sound) beep();
    setTimeout(() => { if (rest && rest.done) stopRest(); }, 8000);
  }
  const s = Math.max(0, left);
  el.hidden = false;
  document.body.classList.add('resting');
  el.className = 'timer' + (rest.done ? ' done' : '');
  el.innerHTML = `<div class="t">${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</div>
    <div class="lbl">${rest.done ? 'Odmor gotov. Kreni!' : 'Odmor'}</div>
    <button data-act="rest-add" data-s="-15">−15</button><button data-act="rest-add" data-s="15">+15</button><button data-act="rest-stop">${rest.done ? 'U redu' : 'Preskoči'}</button>`;
}
actions['rest-add'] = (el) => { if (rest) { rest.end += Number(el.dataset.s) * 1000; rest.done = false; drawRest(); } };
actions['rest-stop'] = () => stopRest();
