// Stanje aplikacije i sinkronizacija s Firestoreom.
// Podaci: users/{uid} (profil, postavke, plan, bol, tjelesna težina) i users/{uid}/sessions/{id} (treninzi).
import { auth, db, A, F } from './firebase.js';
import { DEFAULT_WINDOWS } from './recovery.js';

export const state = {
  user: null, authReady: false,
  doc: undefined,          // undefined = učitava se, null = novi korisnik
  sessions: [], sessionsReady: false,
  active: null,            // trening koji je u tijeku
  error: null,
};

const subs = new Set();
export const onChange = (fn) => subs.add(fn);
// remote = true za izmjene koje stižu iz baze; one ne smiju prekinuti tipkanje.
export const emit = (remote = false) => subs.forEach((f) => f(remote));

let unsubs = [];
const activeKey = () => `sl_active_${state.user?.uid}`;

export const DEFAULT_SETTINGS = { rest: 90, step: 2.5, sound: true, vibrate: true, shareProgress: false, recovery: DEFAULT_WINDOWS };
export const settings = () => ({ ...DEFAULT_SETTINGS, ...(state.doc?.settings || {}), recovery: { ...DEFAULT_WINDOWS, ...(state.doc?.settings?.recovery || {}) } });
export const plan = () => state.doc?.plan?.days || [];
export const pain = () => state.doc?.pain || {};
export const bodyWeights = () => [...(state.doc?.bodyWeights || [])].sort((a, b) => a.d - b.d);
export const latestWeight = () => { const b = bodyWeights(); return b.length ? b[b.length - 1] : null; };
export const needsWizard = () => !state.doc || !state.doc.setupDone;

const userRef = () => F.doc(db, 'users', state.user.uid);
const sessRef = (id) => F.doc(db, 'users', state.user.uid, 'sessions', id);
const clean = (o) => JSON.parse(JSON.stringify(o));

function fail(e) {
  console.error(e);
  state.error = e;
  import('./ui.js').then((u) => u.toast('Spremanje nije uspjelo. Provjeri vezu i pokušaj ponovno.'));
}

export function init() {
  A.onAuthStateChanged(auth, (user) => {
    unsubs.forEach((u) => u()); unsubs = [];
    state.user = user; state.authReady = true;
    state.doc = undefined; state.sessions = []; state.sessionsReady = false; state.active = null;
    if (user) startSync(user.uid);
    emit();
  });
}

function startSync(uid) {
  unsubs.push(F.onSnapshot(F.doc(db, 'users', uid), (snap) => {
    // Prvi odgovor iz lokalnog spremnika bez dokumenta ne znači da je korisnik nov; čekamo server.
    if (!snap.exists() && snap.metadata.fromCache && navigator.onLine && state.doc === undefined) return;
    state.doc = snap.exists() ? snap.data() : null;
    if (state.active === null) loadActive();
    emit(true);
  }, (e) => { state.error = e; emit(true); }));
  unsubs.push(F.onSnapshot(F.collection(db, 'users', uid, 'sessions'), (snap) => {
    state.sessions = snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => a.t0 - b.t0);
    state.sessionsReady = true;
    emit(true);
  }, (e) => { state.error = e; emit(true); }));
}

// ---- korisnički dokument ----
export function saveDoc(patch, { silent = false } = {}) {
  state.doc = mergeLocal(state.doc || {}, patch);
  if (!silent) emit();
  return F.setDoc(userRef(), clean(patch), { merge: true }).catch(fail);
}
function mergeLocal(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' ? mergeLocal(a[k], v) : v;
  return out;
}
export const savePlan = (days, opts) => saveDoc({ plan: { days } }, opts);
export const saveSettings = (patch) => saveDoc({ settings: patch });

// ---- treninzi ----
export function newSession(day) {
  const now = Date.now();
  return {
    id: 's' + now.toString(36) + Math.random().toString(36).slice(2, 5), t0: now, t: now,
    dayId: day.id, dayName: day.name || 'Trening',
    exercises: day.exercises.map((e) => ({ key: e.key, name: e.name, muscle: e.muscle, anim: e.anim ?? null, plan: { sets: e.sets, repMin: e.repMin, repMax: e.repMax }, log: [] })),
  };
}
export function startActive(day) {
  state.active = newSession(day);
  persistActive(); emit();
}
export function finishActive() {
  state.active = null;
  try { localStorage.removeItem(activeKey()); } catch { /* nije bitno */ }
  emit();
}
function persistActive() {
  try { if (state.active) localStorage.setItem(activeKey(), JSON.stringify(state.active)); } catch { /* nije bitno */ }
}
function loadActive() {
  try {
    const raw = localStorage.getItem(activeKey());
    const a = raw && JSON.parse(raw);
    // Ako je trening starije od 12 h, smatra se završenim.
    state.active = a && Date.now() - a.t < 12 * 3600e3 ? a : null;
    if (!state.active && raw) localStorage.removeItem(activeKey());
  } catch { state.active = null; }
}

export const setCount = (s) => (s.exercises || []).reduce((a, e) => a + (e.log || []).length, 0);

// Zapisuje trening (ili ga briše ako nema nijedne serije) i osvježava zadnji datum treninga.
export function writeSession(s) {
  const times = (s.exercises || []).flatMap((e) => (e.log || []).map((x) => x.t));
  if (times.length) s.t = Math.max(...times);
  if (state.active && state.active.id === s.id) { state.active = s; persistActive(); }
  const i = state.sessions.findIndex((x) => x.id === s.id);
  if (!setCount(s)) {
    if (i >= 0) state.sessions.splice(i, 1);
    emit();
    return F.deleteDoc(sessRef(s.id)).catch(fail);
  }
  if (i >= 0) state.sessions[i] = s; else state.sessions.push(s);
  state.sessions.sort((a, b) => a.t0 - b.t0);
  emit();
  const last = Math.max(s.t, ...state.sessions.map((x) => x.t || 0));
  F.setDoc(userRef(), { lastWorkoutAt: last }, { merge: true }).catch(fail);
  return F.setDoc(sessRef(s.id), clean(s)).catch(fail);
}

export function deleteSession(s) {
  const i = state.sessions.findIndex((x) => x.id === s.id);
  if (i >= 0) state.sessions.splice(i, 1);
  if (state.active?.id === s.id) finishActive();
  emit();
  return F.deleteDoc(sessRef(s.id)).catch(fail);
}

// ---- tjelesna težina ----
export function addBodyWeight(kg) {
  const list = bodyWeights();
  list.push({ d: Date.now(), kg });
  return saveDoc({ bodyWeights: list, profile: { weightKg: kg } });
}
export function removeBodyWeight(d) {
  return saveDoc({ bodyWeights: bodyWeights().filter((b) => b.d !== d) });
}

// ---- bol ----
export const setPain = (muscle, on) => saveDoc({ pain: { [muscle]: !!on } });

// ---- backup ----
export function exportData() {
  return clean({ app: 'smartlift', version: 1, exportedAt: Date.now(), doc: state.doc, sessions: state.sessions });
}

async function batchDelete(refs) {
  for (let i = 0; i < refs.length; i += 400) {
    const b = F.writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => b.delete(r));
    await b.commit();
  }
}

export async function importData(data) {
  if (!data || data.app !== 'smartlift' || !data.doc || !Array.isArray(data.sessions)) throw new Error('bad-file');
  const old = await F.getDocs(F.collection(db, 'users', state.user.uid, 'sessions'));
  await batchDelete(old.docs.map((d) => d.ref));
  await F.setDoc(userRef(), clean(data.doc));
  for (let i = 0; i < data.sessions.length; i += 400) {
    const b = F.writeBatch(db);
    data.sessions.slice(i, i + 400).forEach((s) => b.set(sessRef(s.id), clean(s)));
    await b.commit();
  }
}

// ---- brisanje računa ----
export async function deleteAccount(password) {
  const user = auth.currentUser;
  const cred = A.EmailAuthProvider.credential(user.email, password);
  await A.reauthenticateWithCredential(user, cred);
  const snap = await F.getDocs(F.collection(db, 'users', user.uid, 'sessions'));
  await batchDelete(snap.docs.map((d) => d.ref));
  await F.deleteDoc(userRef());
  try { localStorage.removeItem(activeKey()); } catch { /* nije bitno */ }
  await A.deleteUser(user);
}
