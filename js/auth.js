// Prijava, registracija i zaboravljena lozinka.
import { auth, A } from './firebase.js';
import { esc } from './util.js';
import { actions, forms, toast } from './ui.js';
import { emit } from './store.js';

let mode = 'login';   // login | register | reset
let msg = '';
let busy = false;
let emailVal = '';

const ERR = {
  'auth/invalid-credential': 'Email ili lozinka nisu točni.',
  'auth/user-not-found': 'Ne postoji račun s tim emailom.',
  'auth/wrong-password': 'Lozinka nije točna.',
  'auth/email-already-in-use': 'Taj email je već registriran. Pokušaj se prijaviti.',
  'auth/weak-password': 'Lozinka je prekratka. Upiši barem 6 znakova.',
  'auth/invalid-email': 'Email nije ispravan.',
  'auth/too-many-requests': 'Previše pokušaja. Pričekaj malo pa pokušaj ponovno.',
  'auth/network-request-failed': 'Nema interneta. Za prijavu je potrebna veza.',
};

export function authView() {
  const title = { login: 'Dobro došao natrag', register: 'Napravi račun', reset: 'Zaboravljena lozinka' }[mode];
  const sub = { login: 'Prijavi se da nastaviš s treninzima.', register: 'Treba ti samo email i lozinka.', reset: 'Upiši email i poslat ćemo ti poveznicu za novu lozinku.' }[mode];
  return `<section class="auth stack-lg">
    <div><h1>${title}</h1><p class="muted" style="margin-top:6px">${sub}</p></div>
    <form class="stack" data-form="auth" novalidate>
      <label class="field"><span>Email</span><input class="input" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" value="${esc(emailVal)}" required></label>
      ${mode !== 'reset' ? `<label class="field"><span>Lozinka</span><input class="input" name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="6" required></label>` : ''}
      <p class="err" role="alert">${esc(msg)}</p>
      <button class="btn primary block" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Sekundu…' : { login: 'Prijavi se', register: 'Registriraj se', reset: 'Pošalji poveznicu' }[mode]}</button>
    </form>
    <div class="stack center">
      ${mode === 'login' ? `<button class="link" data-act="auth-mode" data-m="reset">Zaboravio sam lozinku</button>
        <p class="muted small">Nemaš račun? <button class="link" data-act="auth-mode" data-m="register">Registriraj se</button></p>` : ''}
      ${mode !== 'login' ? `<button class="link" data-act="auth-mode" data-m="login">Natrag na prijavu</button>` : ''}
    </div>
  </section>`;
}

actions['auth-mode'] = (el) => { mode = el.dataset.m; msg = ''; emit(); };

forms.auth = async (form) => {
  if (busy) return;
  const email = form.email.value.trim();
  emailVal = email;
  const password = form.password ? form.password.value : '';
  msg = '';
  if (!email) { msg = 'Upiši email.'; return emit(); }
  if (mode !== 'reset' && !password) { msg = 'Upiši lozinku.'; return emit(); }
  busy = true; emit();
  try {
    if (mode === 'login') await A.signInWithEmailAndPassword(auth, email, password);
    else if (mode === 'register') await A.createUserWithEmailAndPassword(auth, email, password);
    else {
      await A.sendPasswordResetEmail(auth, email);
      mode = 'login';
      toast('Ako račun postoji, poslali smo poveznicu na email.', { ms: 8000 });
    }
  } catch (e) {
    msg = ERR[e.code] || 'Nešto nije u redu. Pokušaj ponovno.';
  }
  busy = false; emit();
};
