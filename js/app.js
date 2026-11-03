// SmartLift: pokretanje, usmjeravanje i događaji.
import { configured } from './firebase.js';
import { state, init, onChange, needsWizard } from './store.js';
import { actions, changes, inputs, forms } from './ui.js';
import { authView } from './auth.js';
import { wizardView } from './wizard.js';
import { homeView } from './home.js';
import { workoutView } from './workout.js';
import { planView } from './plan.js';
import { historyView } from './history.js';
import { settingsView, applyTheme } from './settings.js';
import { modules } from './modules/index.js';

const $ = (id) => document.getElementById(id);
const view = $('view'), nav = $('nav');

const ICON = {
  home: '<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z"/>',
  workout: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
  history: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
};
const NAV = [
  { r: 'home', t: 'Početna', i: ICON.home },
  { r: 'workout', t: 'Trening', i: ICON.workout },
  { r: 'history', t: 'Povijest', i: ICON.history },
  { r: 'settings', t: 'Postavke', i: ICON.settings },
  ...modules.filter((m) => m.nav).map((m) => ({ r: m.route, t: m.title, i: m.icon })),
];

const VIEWS = {
  home: homeView, workout: workoutView, plan: planView, history: historyView, settings: settingsView,
  ...Object.fromEntries(modules.map((m) => [m.route, m.view])),
};

const route = () => (location.hash.replace(/^#\/?/, '') || 'home').split('/');

let pending = false;

function setup() {
  return `<section class="stack-lg" style="padding-top:24px"><h1>Skoro gotovo</h1>
    <div class="notice accent"><p>Firebase još nije postavljen. Otvori <b>config.js</b> i upiši svoje Firebase postavke, a koraci su u <b>README.md</b>.</p></div>
    <p class="muted small">Nakon toga osvježi stranicu.</p></section>`;
}

function render(remote = false) {
  // Dok korisnik tipka, promjene iz baze čekaju da završi.
  const ae = document.activeElement;
  if (remote && ae && ae !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) { pending = true; return; }
  pending = false;

  let html, showNav = false, r = route();
  if (!configured) html = setup();
  else if (!state.authReady) html = '<p class="center muted pad">Učitavanje…</p>';
  else if (!state.user) html = authView();
  else if (state.doc === undefined) html = '<p class="center muted pad">Učitavanje podataka…</p>';
  else if (needsWizard()) html = wizardView();
  else {
    showNav = true;
    html = (VIEWS[r[0]] || homeView)(r);
  }
  const y = scrollY;
  view.innerHTML = html;
  view.classList.toggle('no-nav', !showNav);
  nav.hidden = !showNav;
  if (showNav) {
    const cur = VIEWS[r[0]] ? (r[0] === 'plan' ? 'workout' : r[0]) : 'home';
    nav.innerHTML = `<div class="nav-in">${NAV.map((n) => `<a href="#/${n.r}" class="${n.r === cur ? 'on' : ''}" ${n.r === cur ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${n.i}</svg>${n.t}</a>`).join('')}</div>`;
  } else $('timer').hidden = true;
  const f = view.querySelector('[autofocus]'); if (f && !remote) f.focus({ preventScroll: true });
  scrollTo(0, y);
}

onChange(render);
window.addEventListener('hashchange', () => { scrollTo(0, 0); render(); });
document.addEventListener('focusout', () => setTimeout(() => {
  const ae = document.activeElement;
  if (pending && !(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))) render();
}, 0));

// ---- događaji ----
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', (e) => { const el = e.target.closest('[data-chg]'); if (el && changes[el.dataset.chg]) changes[el.dataset.chg](el, e); });
document.addEventListener('input', (e) => { const el = e.target.closest('[data-inp]'); if (el && inputs[el.dataset.inp]) inputs[el.dataset.inp](el, e); });
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-form]');
  if (f) { e.preventDefault(); forms[f.dataset.form] && forms[f.dataset.form](f, e); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') actions.close(); });

// ---- veza i tema ----
const offline = () => { $('offline').hidden = navigator.onLine; };
addEventListener('online', offline); addEventListener('offline', offline); offline();
applyTheme();

// Osvježi oporavak kad se aplikacija ponovno otvori i svakih par minuta.
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(true); });
setInterval(() => { if (!document.hidden && route()[0] === 'home') render(true); }, 5 * 60 * 1000);

if (configured) init(); else render();

if ('serviceWorker' in navigator) {
  // Kad stigne nova verzija, stranica se sama osvježi jednom (da ne ostane stara iz spremnika).
  const had = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (had && !reloaded) { reloaded = true; location.reload(); }
  });
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
