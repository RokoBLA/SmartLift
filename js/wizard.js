// Čarobnjak pri prvom ulasku: visina, težina, spol, godina rođenja, jedinice, plan.
import { esc, num, uid } from './util.js';
import { actions, inputs } from './ui.js';
import { state, saveDoc, emit } from './store.js';
import { PRESET, exById, planExerciseFromLib } from './exercises.js';

const YEAR = new Date().getFullYear();
let step = null;
let data = { height: '', weight: '', sex: '', birth: '' };
let error = '';

const STEPS = ['height', 'weight', 'sex', 'birth', 'units', 'plan'];

export const NOTICE = 'Administrator može vidjeti tvoj napredak ako ga ti uključiš u postavkama. Bez toga vidi samo broj korisnika i zadnji datum treninga.';

function validate(k) {
  if (k === 'height') { const v = num(data.height); return v >= 100 && v <= 250 ? '' : 'Upiši visinu između 100 i 250 cm.'; }
  if (k === 'weight') { const v = num(data.weight); return v >= 30 && v <= 300 ? '' : 'Upiši težinu između 30 i 300 kg.'; }
  if (k === 'sex') return data.sex ? '' : 'Odaberi jednu opciju.';
  if (k === 'birth') { const v = parseInt(data.birth, 10); return v >= 1920 && v <= YEAR - 10 ? '' : `Upiši godinu između 1920. i ${YEAR - 10}.`; }
  return '';
}

export function wizardView() {
  if (step === null) step = state.doc?.profile ? STEPS.indexOf('plan') : 0;
  const k = STEPS[step];
  const head = `<div class="progress" aria-hidden="true"><i style="width:${((step + 1) / STEPS.length) * 100}%"></i></div>
    <div class="row between small muted" style="margin-top:8px"><span>Korak ${step + 1} od ${STEPS.length}</span>${step > 0 && k !== 'plan' ? '<button class="link" data-act="wiz-back">Natrag</button>' : ''}</div>`;
  let body = '';
  if (k === 'height') body = q('Kolika ti je visina?', 'Visina u centimetrima.') + numField('height', 'cm', 'numeric');
  if (k === 'weight') body = q('Koliko imaš kilograma?', 'Danas, otprilike. Kasnije je možeš ažurirati.') + numField('weight', 'kg', 'decimal');
  if (k === 'sex') body = q('Spol', 'Treba nam za kasnije usporedbe snage. Možeš i ne navesti.') +
    `<div class="seg fill">${[['m', 'Muško'], ['f', 'Žensko'], ['o', 'Drugo'], ['n', 'Radije ne navodim']].map(([v, l]) => `<button class="chip ${data.sex === v ? 'on' : ''}" data-act="wiz-sex" data-v="${v}">${l}</button>`).join('')}</div>`;
  if (k === 'birth') body = q('Koja je tvoja godina rođenja?', 'Samo godina, npr. 1995.') + numField('birth', 'god.', 'numeric');
  if (k === 'units') body = q('Mjerne jedinice', 'Za sada koristimo kilograme.') +
    `<div class="seg"><button class="chip on" disabled>kg (kilogrami)</button></div>`;
  if (k === 'plan') body = `<h2 class="wiz-q">Tvoj plan treninga</h2>
    <p class="muted">Plan se sastoji od dana (npr. „PRSA + TRICEPS“) i vježbi u svakom danu. Sve možeš mijenjati kad god želiš.</p>
    <div class="stack" style="margin-top:20px">
      <button class="btn primary block" data-act="wiz-plan" data-v="own">Složit ću svoj plan</button>
      <button class="btn block" data-act="wiz-plan" data-v="preset">Počni s predloženim planom</button>
      <button class="link" data-act="wiz-plan" data-v="skip" style="display:block;margin:0 auto">Preskoči za sada</button>
    </div>`;
  const next = k !== 'plan' ? `<p class="err" role="alert">${esc(error)}</p><button class="btn primary block" data-act="wiz-next">Dalje</button>` : '';
  return `<section class="stack-lg" style="padding-top:12px">
    ${step === 0 ? `<div class="notice accent">${esc(NOTICE)}</div>` : ''}
    <div>${head}</div><div>${body}</div><div>${next}</div></section>`;
}

const q = (t, s) => `<h2 class="wiz-q">${t}</h2><p class="muted" style="margin-bottom:16px">${s}</p>`;
const numField = (name, unit, mode) => `<div class="row"><input class="input big" name="${name}" inputmode="${mode}" autocomplete="off" value="${esc(data[name])}" data-inp="wiz" data-k="${name}" autofocus><span class="muted" style="font-weight:600;min-width:34px">${unit}</span></div>`;

inputs.wiz = (el) => { data[el.dataset.k] = el.value; };
actions['wiz-sex'] = (el) => { data.sex = el.dataset.v; error = ''; emit(); };
actions['wiz-back'] = () => { step = Math.max(0, step - 1); error = ''; emit(); };
actions['wiz-next'] = () => {
  const k = STEPS[step];
  error = validate(k);
  if (error) return emit();
  if (k === 'units') {
    saveDoc({
      profile: { heightCm: num(data.height), weightKg: num(data.weight), sex: data.sex, birthYear: parseInt(data.birth, 10), units: 'kg' },
      bodyWeights: [{ d: Date.now(), kg: num(data.weight) }],
      createdAt: Date.now(), noticeSeen: false,
      settings: { shareProgress: false },
      plan: { days: [] }, pain: {},
    });
  }
  step++; emit();
};

actions['wiz-plan'] = (el) => {
  const v = el.dataset.v;
  let days = [];
  if (v === 'preset') {
    days = PRESET.map((d) => ({ id: uid(), name: d.name, exercises: d.ex.map((id) => planExerciseFromLib(exById(id), uid())) }));
  } else if (v === 'own') {
    days = [{ id: uid(), name: '', exercises: [] }];
  }
  saveDoc({ setupDone: true, plan: { days } });
  step = null; data = { height: '', weight: '', sex: '', birth: '' };
  location.hash = v === 'own' ? `#/plan/${days[0].id}` : '#/home';
  emit();
};
