// Postavke: izgled, odmor, prozori oporavka, tjelesna težina, backup, bol, brisanje računa.
import { esc, num, fmt, fmtDate, clamp } from './util.js';
import { MUSCLES, MUSCLE_ORDER } from './exercises.js';
import { CLASS_LABEL, DEFAULT_WINDOWS } from './recovery.js';
import { actions, changes, forms, openSheet, closeSheet, toast, confirmSheet } from './ui.js';
import { A, auth } from './firebase.js';
import { state, settings, saveSettings, pain, bodyWeights, latestWeight, addBodyWeight, removeBodyWeight, exportData, importData, deleteAccount, emit } from './store.js';

const themePref = () => { try { return localStorage.getItem('sl_theme') || 'auto'; } catch { return 'auto'; } };
export function applyTheme() {
  const t = themePref();
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
}

export function settingsView() {
  const s = settings(), bw = bodyWeights(), lw = latestWeight(), p = pain(), th = themePref();
  const hurt = MUSCLE_ORDER.filter((m) => p[m]);
  return `<h1 style="margin:4px 0 4px">Postavke</h1><p class="muted small">${esc(state.user?.email || '')}</p>

  <h2 class="section-title">Izgled</h2>
  <div class="seg fill">${[['auto', 'Kao sustav'], ['light', 'Svijetla'], ['dark', 'Tamna']].map(([v, l]) => `<button class="chip ${th === v ? 'on' : ''}" data-act="theme" data-v="${v}">${l}</button>`).join('')}</div>

  <h2 class="section-title">Trening</h2>
  <div class="card stack">
    <label class="field"><span>Odmor između serija (sekunde)</span><input class="input" inputmode="numeric" value="${s.rest}" data-chg="set-num" data-k="rest" data-min="10" data-max="600"></label>
    <label class="field"><span>Korak težine (kg)</span><input class="input" inputmode="decimal" value="${fmt(s.step)}" data-chg="set-num" data-k="step" data-min="0.25" data-max="20"></label>
    <label class="switch"><input type="checkbox" ${s.vibrate ? 'checked' : ''} data-chg="set-bool" data-k="vibrate"> Vibracija kad odmor završi</label>
    <label class="switch"><input type="checkbox" ${s.sound ? 'checked' : ''} data-chg="set-bool" data-k="sound"> Zvuk kad odmor završi</label>
  </div>

  <h2 class="section-title">Prozor oporavka (sati)</h2>
  <div class="card stack">
    ${['small', 'medium', 'large'].map((c) => `<div><div class="small" style="font-weight:600;margin-bottom:6px">${CLASS_LABEL[c]}</div>
      <div class="row"><input class="input num" inputmode="numeric" value="${s.recovery[c][0]}" data-chg="rec" data-c="${c}" data-i="0" aria-label="od"><span class="muted">do</span>
      <input class="input num" inputmode="numeric" value="${s.recovery[c][1]}" data-chg="rec" data-c="${c}" data-i="1" aria-label="do"></div></div>`).join('')}
    <p class="hint">Teži trening produljuje oporavak do gornje granice. Lakši ostaje blizu donje.</p>
    <button class="link" data-act="rec-reset" style="text-align:left">Vrati zadane vrijednosti</button>
  </div>

  <h2 class="section-title">Tjelesna težina</h2>
  <div class="card">
    <div class="row between"><div><b style="font-size:22px">${lw ? fmt(lw.kg) + ' kg' : '—'}</b><div class="muted small">${lw ? 'upisano ' + fmtDate(lw.d) : 'Još nema unosa'}</div></div>
      <button class="btn primary sm" data-act="bw-add">Upiši težinu</button></div>
    ${bw.length ? `<div style="margin-top:10px">${[...bw].reverse().slice(0, 6).map((b) => `<div class="kv"><span>${fmtDate(b.d)}</span><span><b>${fmt(b.kg)} kg</b> <button class="link small" data-act="bw-del" data-d="${b.d}" aria-label="Obriši unos">obriši</button></span></div>`).join('')}</div>` : ''}
  </div>

  <h2 class="section-title">Ozljede i bol</h2>
  <div class="card">
    ${hurt.length ? `<p class="small">Označeno „boli me“: <b>${hurt.map((m) => MUSCLES[m].name).join(', ')}</b>. Za njih nema prijedloga progresije.</p>
      <div class="seg" style="margin-top:10px">${hurt.map((m) => `<button class="chip sm" data-act="pain" data-m="${m}" data-on="0">Skini: ${MUSCLES[m].name}</button>`).join('')}</div>`
      : '<p class="small muted">Nijedna grupa nije označena. Oznaku „Boli me“ nađeš uz svaku grupu na početnoj stranici.</p>'}
  </div>

  <h2 class="section-title">Privatnost</h2>
  <div class="card stack">
    <label class="switch"><input type="checkbox" ${s.shareProgress ? 'checked' : ''} data-chg="set-bool" data-k="shareProgress"> Dopusti administratoru da vidi moj napredak</label>
    <p class="hint">Isključeno: administrator vidi samo broj korisnika i zadnji datum treninga.</p>
  </div>

  <h2 class="section-title">Podaci</h2>
  <div class="card stack">
    <button class="btn block" data-act="export">Izvezi backup (JSON)</button>
    <button class="btn block" data-act="import">Uvezi backup</button>
    <input type="file" id="import-file" accept="application/json,.json" hidden>
    <p class="hint">Uvoz zamjenjuje sve trenutne podatke podacima iz datoteke.</p>
  </div>

  <h2 class="section-title">Račun</h2>
  <div class="stack">
    <button class="btn block" data-act="logout">Odjavi se</button>
    <button class="btn block ghost" style="color:var(--bad)" data-act="del-account">Obriši račun i sve podatke</button>
  </div>
  <p class="tiny muted center" style="margin-top:24px">SmartLift · faza 1</p>`;
}

actions.theme = (el) => {
  try { localStorage.setItem('sl_theme', el.dataset.v); } catch { /* nije bitno */ }
  applyTheme(); emit();
};

changes['set-num'] = (el) => {
  const v = num(el.value), k = el.dataset.k;
  if (!Number.isFinite(v)) return emit();
  saveSettings({ [k]: clamp(v, Number(el.dataset.min), Number(el.dataset.max)) });
};
changes['set-bool'] = (el) => saveSettings({ [el.dataset.k]: el.checked });
changes.rec = (el) => {
  const rec = JSON.parse(JSON.stringify(settings().recovery));
  const v = clamp(parseInt(el.value, 10) || rec[el.dataset.c][el.dataset.i], 1, 240);
  rec[el.dataset.c][el.dataset.i] = v;
  if (rec[el.dataset.c][1] < rec[el.dataset.c][0]) { if (el.dataset.i === '0') rec[el.dataset.c][1] = v; else rec[el.dataset.c][0] = v; }
  saveSettings({ recovery: rec });
};
actions['rec-reset'] = () => saveSettings({ recovery: JSON.parse(JSON.stringify(DEFAULT_WINDOWS)) });

// ---- tjelesna težina ----
actions['bw-add'] = () => {
  const lw = latestWeight();
  openSheet(`<h2>Tjelesna težina</h2>
    <form class="stack" data-form="bw" style="margin-top:14px" novalidate>
      <div class="row"><input class="input big" name="kg" inputmode="decimal" value="${lw ? fmt(lw.kg) : ''}" autocomplete="off" autofocus><span class="muted" style="font-weight:600">kg</span></div>
      <p class="err" id="bw-err"></p><button class="btn primary block" type="submit">Spremi</button>
    </form>`);
};
forms.bw = (form) => {
  const v = num(form.kg.value);
  if (!(v >= 30 && v <= 300)) { document.getElementById('bw-err').textContent = 'Upiši težinu između 30 i 300 kg.'; return; }
  closeSheet(); addBodyWeight(Math.round(v * 10) / 10); toast('Težina spremljena.');
};
actions['bw-del'] = (el) => removeBodyWeight(Number(el.dataset.d));

// ---- backup ----
actions.export = () => {
  const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `smartlift-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
actions.import = () => document.getElementById('import-file').click();
document.addEventListener('change', async (ev) => {
  if (ev.target.id !== 'import-file') return;
  const f = ev.target.files[0]; ev.target.value = '';
  if (!f) return;
  let data;
  try { data = JSON.parse(await f.text()); } catch { return toast('Datoteka nije ispravan backup.'); }
  if (data?.app !== 'smartlift') return toast('Ovo nije SmartLift backup.');
  confirmSheet({
    title: 'Uvesti backup?', text: `Svi sadašnji podaci bit će zamijenjeni (${data.sessions?.length ?? 0} treninga iz datoteke).`, ok: 'Uvezi', danger: true,
    onOk: async () => {
      if (!navigator.onLine) return toast('Za uvoz je potrebna internetska veza.');
      try { await importData(data); toast('Backup je uvezen.'); } catch { toast('Uvoz nije uspio. Podaci nisu promijenjeni ili su djelomično uvezeni, pokušaj ponovno.', { ms: 9000 }); }
    },
  });
});

// ---- račun ----
actions.logout = () => A.signOut(auth);

actions['del-account'] = () => openSheet(`<h2>Obriši račun i sve podatke</h2>
  <p class="muted" style="margin:8px 0 14px">Briše se tvoj račun, plan, svi treninzi i težine. To se ne može poništiti. Prije toga možeš izvesti backup.</p>
  <form class="stack" data-form="del-account" novalidate>
    <label class="field"><span>Lozinka</span><input class="input" name="pw" type="password" autocomplete="current-password"></label>
    <label class="field"><span>Za potvrdu upiši riječ OBRIŠI</span><input class="input" name="word" autocomplete="off" autocapitalize="characters"></label>
    <p class="err" id="del-err"></p>
    <button class="btn danger block" type="submit">Trajno obriši</button>
    <button class="btn block ghost" type="button" data-act="close">Odustani</button>
  </form>`);

forms['del-account'] = async (form) => {
  const err = document.getElementById('del-err');
  if (form.word.value.trim().toLocaleUpperCase('hr') !== 'OBRIŠI') { err.textContent = 'Upiši točno riječ OBRIŠI.'; return; }
  if (!form.pw.value) { err.textContent = 'Upiši lozinku.'; return; }
  if (!navigator.onLine) { err.textContent = 'Za brisanje je potrebna internetska veza.'; return; }
  err.textContent = 'Brišem…';
  try {
    await deleteAccount(form.pw.value);
    closeSheet(); toast('Račun i svi podaci su obrisani.', { ms: 8000 });
  } catch (e) {
    err.textContent = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' ? 'Lozinka nije točna.' : 'Brisanje nije uspjelo. Pokušaj ponovno.';
  }
};
