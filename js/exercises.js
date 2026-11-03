// Mišićne grupe, njihovi dijelovi i biblioteka vježbi.
// cls = klasa oporavka (small / medium / large), t = dijelovi koje vježba dobro gađa,
// c = višezglobna (teška) vježba, a = oznaka animacije (null = nema animacije).

export const MUSCLES = {
  prsa:       { name: 'Prsa',       cls: 'medium', parts: ['gornji dio prsa', 'srednji dio prsa', 'donji dio prsa'] },
  leđa:       { name: 'Leđa',       cls: 'medium', parts: ['širina leđa', 'debljina leđa', 'donja leđa', 'trapez'] },
  noge:       { name: 'Noge',       cls: 'large',  parts: ['prednja strana bedra', 'stražnja strana bedra', 'stražnjica', 'listovi'] },
  ramena:     { name: 'Ramena',     cls: 'small',  parts: ['prednji dio ramena', 'bočni dio ramena', 'stražnji dio ramena'] },
  biceps:     { name: 'Biceps',     cls: 'small',  parts: ['duga glava bicepsa', 'kratka glava bicepsa', 'brahijalis'] },
  triceps:    { name: 'Triceps',    cls: 'small',  parts: ['duga glava tricepsa', 'bočna glava tricepsa', 'medijalna glava tricepsa'] },
  podlaktice: { name: 'Podlaktice', cls: 'small',  parts: ['pregibači zapešća', 'opružači zapešća'] },
  trbuh:      { name: 'Trbuh',      cls: 'small',  parts: ['gornji trbuh', 'donji trbuh', 'kosi trbušni mišići'] },
};
export const MUSCLE_ORDER = ['prsa', 'leđa', 'noge', 'ramena', 'biceps', 'triceps', 'podlaktice', 'trbuh'];

const X = (id, hr, en, m, t, c, a) => ({ id, hr, en, m, t, c, a });
const P = MUSCLES;

export const LIB = [
  X('bench',     'Klupa',                    'Bench press',         'prsa', [P.prsa.parts[1]], true, 'bench'),
  X('incline',   'Kosa klupa',               'Incline press',       'prsa', [P.prsa.parts[0]], true, 'incline'),
  X('chestdips', 'Sklekovi na razboju',      'Chest dips',          'prsa', [P.prsa.parts[2]], true, 'dips'),
  X('pushup',    'Sklek',                    'Push-up',             'prsa', [P.prsa.parts[1]], true, 'pushup'),
  X('fly',       'Razvlačenje s bučicama',   'Dumbbell fly',        'prsa', [P.prsa.parts[1]], false, 'fly'),

  X('pullup',    'Zgib',                     'Pull-up',             'leđa', [P.leđa.parts[0]], true, 'pullup'),
  X('pulldown',  'Spuštanje šipke',          'Lat pulldown',        'leđa', [P.leđa.parts[0]], true, 'pulldown'),
  X('brow',      'Veslanje šipkom',          'Barbell row',         'leđa', [P.leđa.parts[1]], true, 'row'),
  X('crow',      'Veslanje na kablu',        'Seated cable row',    'leđa', [P.leđa.parts[1]], true, 'cablerow'),
  X('deadlift',  'Mrtvo dizanje',            'Deadlift',            'leđa', [P.leđa.parts[2], P.leđa.parts[1]], true, 'deadlift'),
  X('shrug',     'Podizanje ramena',         'Shrug',               'leđa', [P.leđa.parts[3]], false, 'shrug'),
  X('hyper',     'Hiperekstenzija',          'Back extension',      'leđa', [P.leđa.parts[2]], false, null),

  X('squat',     'Čučanj',                   'Squat',               'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'squat'),
  X('legpress',  'Potisak nogama',           'Leg press',           'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'legpress'),
  X('rdl',       'Rumunjsko mrtvo dizanje',  'Romanian deadlift',   'noge', [P.noge.parts[1], P.noge.parts[2]], true, 'rdl'),
  X('lunge',     'Iskorak',                  'Lunge',               'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'lunge'),
  X('legext',    'Opružanje nogu',           'Leg extension',       'noge', [P.noge.parts[0]], false, 'legext'),
  X('legcurl',   'Pregib nogu',              'Leg curl',            'noge', [P.noge.parts[1]], false, 'legcurl'),
  X('hipthrust', 'Podizanje kukova',         'Hip thrust',          'noge', [P.noge.parts[2]], false, 'hipthrust'),
  X('calf',      'Podizanje na prste',       'Calf raise',          'noge', [P.noge.parts[3]], false, 'calf'),

  X('ohp',       'Potisak iznad glave',      'Overhead press',      'ramena', [P.ramena.parts[0], P.ramena.parts[1]], true, 'ohp'),
  X('lateral',   'Bočno podizanje',          'Lateral raise',       'ramena', [P.ramena.parts[1]], false, 'lateral'),
  X('rearfly',   'Stražnje podizanje',       'Rear delt fly',       'ramena', [P.ramena.parts[2]], false, 'rearfly'),
  X('facepull',  'Povlačenje do lica',       'Face pull',           'ramena', [P.ramena.parts[2]], false, 'facepull'),

  X('curl',      'Pregib šipkom',            'Barbell curl',        'biceps', [P.biceps.parts[1], P.biceps.parts[0]], false, 'curl'),
  X('inclcurl',  'Pregib na kosoj klupi',    'Incline curl',        'biceps', [P.biceps.parts[0]], false, 'curl'),
  X('preacher',  'Pregib na Scott klupi',    'Preacher curl',       'biceps', [P.biceps.parts[1]], false, 'preacher'),
  X('hammer',    'Pregib čekićem',           'Hammer curl',         'biceps', [P.biceps.parts[2]], false, 'curl'),

  X('pushdown',  'Triceps na užetu',         'Rope pushdown',       'triceps', [P.triceps.parts[1], P.triceps.parts[2]], false, 'pushdown'),
  X('skull',     'Francuski potisak',        'Skull crusher',       'triceps', [P.triceps.parts[0], P.triceps.parts[1]], false, 'skull'),
  X('ohext',     'Triceps iznad glave',      'Overhead extension',  'triceps', [P.triceps.parts[0]], false, 'ohext'),
  X('closegrip', 'Uska klupa',               'Close-grip bench',    'triceps', [P.triceps.parts[1], P.triceps.parts[2]], true, 'bench'),
  X('tridips',   'Dips za triceps',          'Triceps dips',        'triceps', [P.triceps.parts[1], P.triceps.parts[2]], true, 'dips'),
  X('kickback',  'Zamah unatrag',            'Triceps kickback',    'triceps', [P.triceps.parts[1]], false, 'kickback'),

  X('wristcurl', 'Pregib zapešća',           'Wrist curl',          'podlaktice', [P.podlaktice.parts[0]], false, 'wrist'),
  X('revwrist',  'Obrnuti pregib zapešća',   'Reverse wrist curl',  'podlaktice', [P.podlaktice.parts[1]], false, 'wrist'),
  X('farmer',    'Nošenje utega',            "Farmer's walk",       'podlaktice', [P.podlaktice.parts[0]], false, null),

  X('crunch',    'Trbušnjak',                'Crunch',              'trbuh', [P.trbuh.parts[0]], false, 'crunch'),
  X('legraise',  'Podizanje nogu',           'Leg raise',           'trbuh', [P.trbuh.parts[1]], false, 'legraise'),
  X('plank',     'Daska',                    'Plank',               'trbuh', [P.trbuh.parts[0], P.trbuh.parts[2]], false, 'plank'),
  X('twist',     'Ruski okret',              'Russian twist',       'trbuh', [P.trbuh.parts[2]], false, 'twist'),
];

export const exById = (id) => LIB.find((e) => e.id === id) || null;
export const exName = (e) => `${e.hr} / ${e.en}`;
export const clsOf = (muscle) => (MUSCLES[muscle] ? MUSCLES[muscle].cls : 'small');

// Zadani raspon: teške vježbe 6–10, ostale 10–15.
export function planExerciseFromLib(e, pid) {
  return {
    id: pid, key: e.id, name: exName(e), muscle: e.m, anim: e.a,
    sets: 3, repMin: e.c ? 6 : 10, repMax: e.c ? 10 : 15,
  };
}

// Predloženi početni plan (korisnik ga može potpuno promijeniti).
export const PRESET = [
  { name: 'PRSA + TRICEPS',      ex: ['bench', 'incline', 'fly', 'pushdown', 'ohext'] },
  { name: 'LEĐA + BICEPS',       ex: ['pulldown', 'brow', 'crow', 'curl', 'hammer'] },
  { name: 'NOGE + RAMENA',       ex: ['squat', 'rdl', 'legext', 'ohp', 'lateral'] },
  { name: 'TRBUH + PODLAKTICE',  ex: ['crunch', 'legraise', 'plank', 'wristcurl', 'revwrist'] },
];

// Vježbe iz biblioteke koje nemaju animaciju (za izvještaj).
export const withoutAnimation = () => LIB.filter((e) => !e.a).map(exName);
