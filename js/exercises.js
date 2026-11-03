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
  X('dbpress', 'Potisak bučicama', 'Dumbbell bench press', 'prsa', [P.prsa.parts[1]], true, 'bench'),
  X('inclinedb', 'Kosa klupa s bučicama', 'Incline dumbbell press', 'prsa', [P.prsa.parts[0]], true, 'incline'),
  X('declinebench', 'Negativna klupa', 'Decline bench press', 'prsa', [P.prsa.parts[2]], true, 'bench'),
  X('machinepress', 'Potisak na spravi', 'Machine chest press', 'prsa', [P.prsa.parts[1]], true, 'bench'),
  X('cablefly', 'Razvlačenje na kablovima', 'Cable fly', 'prsa', [P.prsa.parts[1]], false, 'fly'),
  X('inclfly', 'Razvlačenje na kosoj klupi', 'Incline fly', 'prsa', [P.prsa.parts[0]], false, 'fly'),
  X('pecdeck', 'Pec deck', 'Machine fly', 'prsa', [P.prsa.parts[1]], false, 'fly'),
  X('lowcable', 'Kabel odozdo prema gore', 'Low-to-high cable fly', 'prsa', [P.prsa.parts[0]], false, 'fly'),

  X('pullup',    'Zgib',                     'Pull-up',             'leđa', [P.leđa.parts[0]], true, 'pullup'),
  X('pulldown',  'Spuštanje šipke',          'Lat pulldown',        'leđa', [P.leđa.parts[0]], true, 'pulldown'),
  X('brow',      'Veslanje šipkom',          'Barbell row',         'leđa', [P.leđa.parts[1]], true, 'row'),
  X('crow',      'Veslanje na kablu',        'Seated cable row',    'leđa', [P.leđa.parts[1]], true, 'cablerow'),
  X('deadlift',  'Mrtvo dizanje',            'Deadlift',            'leđa', [P.leđa.parts[2], P.leđa.parts[1]], true, 'deadlift'),
  X('shrug',     'Podizanje ramena',         'Shrug',               'leđa', [P.leđa.parts[3]], false, 'shrug'),
  X('hyper',     'Hiperekstenzija',          'Back extension',      'leđa', [P.leđa.parts[2]], false, null),
  X('chinup', 'Zgib podhvatom', 'Chin-up', 'leđa', [P.leđa.parts[0]], true, 'pullup'),
  X('closepulldown', 'Spuštanje uskim hvatom', 'Close-grip pulldown', 'leđa', [P.leđa.parts[0], P.leđa.parts[1]], true, 'pulldown'),
  X('dbrow', 'Veslanje bučicom', 'One-arm dumbbell row', 'leđa', [P.leđa.parts[1], P.leđa.parts[0]], true, 'row'),
  X('tbar', 'T-veslanje', 'T-bar row', 'leđa', [P.leđa.parts[1]], true, 'row'),
  X('machrow', 'Veslanje na spravi', 'Machine row', 'leđa', [P.leđa.parts[1]], true, 'cablerow'),
  X('rackpull', 'Povlačenje iz stalka', 'Rack pull', 'leđa', [P.leđa.parts[1], P.leđa.parts[3]], true, 'deadlift'),
  X('straightarm', 'Povlačenje ravnim rukama', 'Straight-arm pulldown', 'leđa', [P.leđa.parts[0]], false, 'pulldown'),
  X('dbshrug', 'Podizanje ramena bučicama', 'Dumbbell shrug', 'leđa', [P.leđa.parts[3]], false, 'shrug'),
  X('goodmorning', 'Dobro jutro', 'Good morning', 'leđa', [P.leđa.parts[2]], false, 'rdl'),

  X('squat',     'Čučanj',                   'Squat',               'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'squat'),
  X('legpress',  'Potisak nogama',           'Leg press',           'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'legpress'),
  X('rdl',       'Rumunjsko mrtvo dizanje',  'Romanian deadlift',   'noge', [P.noge.parts[1], P.noge.parts[2]], true, 'rdl'),
  X('lunge',     'Iskorak',                  'Lunge',               'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'lunge'),
  X('legext',    'Opružanje nogu',           'Leg extension',       'noge', [P.noge.parts[0]], false, 'legext'),
  X('legcurl',   'Pregib nogu',              'Leg curl',            'noge', [P.noge.parts[1]], false, 'legcurl'),
  X('hipthrust', 'Podizanje kukova',         'Hip thrust',          'noge', [P.noge.parts[2]], false, 'hipthrust'),
  X('calf',      'Podizanje na prste',       'Calf raise',          'noge', [P.noge.parts[3]], false, 'calf'),
  X('frontsquat', 'Prednji čučanj', 'Front squat', 'noge', [P.noge.parts[0]], true, 'squat'),
  X('goblet', 'Čučanj s bučicom', 'Goblet squat', 'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'squat'),
  X('hacksquat', 'Hack čučanj', 'Hack squat', 'noge', [P.noge.parts[0]], true, 'legpress'),
  X('bulgarian', 'Bugarski čučanj', 'Bulgarian split squat', 'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'lunge'),
  X('stepup', 'Penjanje na klupu', 'Step-up', 'noge', [P.noge.parts[0], P.noge.parts[2]], true, 'lunge'),
  X('sldl', 'Mrtvo dizanje s ravnim nogama', 'Stiff-leg deadlift', 'noge', [P.noge.parts[1], P.noge.parts[2]], true, 'rdl'),
  X('sumo', 'Sumo mrtvo dizanje', 'Sumo deadlift', 'noge', [P.noge.parts[1], P.noge.parts[2]], true, 'deadlift'),
  X('seatedcurl', 'Pregib nogu sjedeći', 'Seated leg curl', 'noge', [P.noge.parts[1]], false, 'legcurl'),
  X('glutebridge', 'Mostić', 'Glute bridge', 'noge', [P.noge.parts[2]], false, 'hipthrust'),
  X('seatedcalf', 'Podizanje na prste sjedeći', 'Seated calf raise', 'noge', [P.noge.parts[3]], false, 'calf'),

  X('ohp',       'Potisak iznad glave',      'Overhead press',      'ramena', [P.ramena.parts[0], P.ramena.parts[1]], true, 'ohp'),
  X('lateral',   'Bočno podizanje',          'Lateral raise',       'ramena', [P.ramena.parts[1]], false, 'lateral'),
  X('rearfly',   'Stražnje podizanje',       'Rear delt fly',       'ramena', [P.ramena.parts[2]], false, 'rearfly'),
  X('facepull',  'Povlačenje do lica',       'Face pull',           'ramena', [P.ramena.parts[2]], false, 'facepull'),
  X('dbohp', 'Potisak bučicama', 'Dumbbell shoulder press', 'ramena', [P.ramena.parts[0], P.ramena.parts[1]], true, 'ohp'),
  X('arnold', 'Arnoldov potisak', 'Arnold press', 'ramena', [P.ramena.parts[0], P.ramena.parts[1]], true, 'ohp'),
  X('machshoulder', 'Potisak za ramena na spravi', 'Machine shoulder press', 'ramena', [P.ramena.parts[0], P.ramena.parts[1]], true, 'ohp'),
  X('uprow', 'Veslanje do brade', 'Upright row', 'ramena', [P.ramena.parts[1]], true, 'row'),
  X('cablelateral', 'Bočno podizanje na kablu', 'Cable lateral raise', 'ramena', [P.ramena.parts[1]], false, 'lateral'),
  X('frontraise', 'Prednje podizanje', 'Front raise', 'ramena', [P.ramena.parts[0]], false, 'lateral'),
  X('reversepec', 'Obrnuti pec deck', 'Reverse pec deck', 'ramena', [P.ramena.parts[2]], false, 'rearfly'),

  X('curl',      'Pregib šipkom',            'Barbell curl',        'biceps', [P.biceps.parts[1], P.biceps.parts[0]], false, 'curl'),
  X('inclcurl',  'Pregib na kosoj klupi',    'Incline curl',        'biceps', [P.biceps.parts[0]], false, 'curl'),
  X('preacher',  'Pregib na Scott klupi',    'Preacher curl',       'biceps', [P.biceps.parts[1]], false, 'preacher'),
  X('hammer',    'Pregib čekićem',           'Hammer curl',         'biceps', [P.biceps.parts[2]], false, 'curl'),
  X('dbcurl', 'Pregib bučicama', 'Dumbbell curl', 'biceps', [P.biceps.parts[1], P.biceps.parts[0]], false, 'curl'),
  X('ezcurl', 'Pregib EZ šipkom', 'EZ-bar curl', 'biceps', [P.biceps.parts[1], P.biceps.parts[0]], false, 'curl'),
  X('cablecurl', 'Pregib na kablu', 'Cable curl', 'biceps', [P.biceps.parts[1], P.biceps.parts[0]], false, 'curl'),
  X('concentration', 'Koncentrirani pregib', 'Concentration curl', 'biceps', [P.biceps.parts[1]], false, 'preacher'),
  X('spider', 'Pregib na prsnoj podlozi', 'Spider curl', 'biceps', [P.biceps.parts[1]], false, 'preacher'),
  X('bayesian', 'Pregib na kablu iza tijela', 'Bayesian curl', 'biceps', [P.biceps.parts[0]], false, 'curl'),
  X('crosshammer', 'Pregib čekićem preko tijela', 'Cross-body hammer curl', 'biceps', [P.biceps.parts[2]], false, 'curl'),
  X('revcurl', 'Obrnuti pregib', 'Reverse curl', 'biceps', [P.biceps.parts[2]], false, 'curl'),

  X('pushdown',  'Triceps na užetu',         'Rope pushdown',       'triceps', [P.triceps.parts[1], P.triceps.parts[2]], false, 'pushdown'),
  X('skull',     'Francuski potisak',        'Skull crusher',       'triceps', [P.triceps.parts[0], P.triceps.parts[1]], false, 'skull'),
  X('ohext',     'Triceps iznad glave',      'Overhead extension',  'triceps', [P.triceps.parts[0]], false, 'ohext'),
  X('closegrip', 'Uska klupa',               'Close-grip bench',    'triceps', [P.triceps.parts[1], P.triceps.parts[2]], true, 'bench'),
  X('tridips',   'Dips za triceps',          'Triceps dips',        'triceps', [P.triceps.parts[1], P.triceps.parts[2]], true, 'dips'),
  X('kickback',  'Zamah unatrag',            'Triceps kickback',    'triceps', [P.triceps.parts[1]], false, 'kickback'),
  X('vbarpushdown', 'Triceps na ravnoj šipki', 'Straight-bar pushdown', 'triceps', [P.triceps.parts[1], P.triceps.parts[2]], false, 'pushdown'),
  X('singlepush', 'Triceps jednom rukom na kablu', 'Single-arm pushdown', 'triceps', [P.triceps.parts[1]], false, 'pushdown'),
  X('cableohext', 'Triceps iznad glave na kablu', 'Cable overhead extension', 'triceps', [P.triceps.parts[0]], false, 'ohext'),
  X('dbskull', 'Francuski potisak bučicama', 'Dumbbell skull crusher', 'triceps', [P.triceps.parts[0], P.triceps.parts[1]], false, 'skull'),
  X('benchdips', 'Dips na klupi', 'Bench dips', 'triceps', [P.triceps.parts[1], P.triceps.parts[2]], true, 'dips'),
  X('diamond', 'Dijamantni sklek', 'Diamond push-up', 'triceps', [P.triceps.parts[1], P.triceps.parts[2]], true, 'pushup'),

  X('wristcurl', 'Pregib zapešća',           'Wrist curl',          'podlaktice', [P.podlaktice.parts[0]], false, 'wrist'),
  X('revwrist',  'Obrnuti pregib zapešća',   'Reverse wrist curl',  'podlaktice', [P.podlaktice.parts[1]], false, 'wrist'),
  X('farmer',    'Nošenje utega',            "Farmer's walk",       'podlaktice', [P.podlaktice.parts[0]], false, null),
  X('behindwrist', 'Pregib zapešća iza leđa', 'Behind-the-back wrist curl', 'podlaktice', [P.podlaktice.parts[0]], false, 'wrist'),
  X('deadhang', 'Vis na šipki', 'Dead hang', 'podlaktice', [P.podlaktice.parts[0]], false, 'pullup'),
  X('pinch', 'Držanje pločice', 'Plate pinch', 'podlaktice', [P.podlaktice.parts[0]], false, null),
  X('wristroller', 'Valjak za zapešća', 'Wrist roller', 'podlaktice', [P.podlaktice.parts[0], P.podlaktice.parts[1]], false, null),

  X('crunch',    'Trbušnjak',                'Crunch',              'trbuh', [P.trbuh.parts[0]], false, 'crunch'),
  X('legraise',  'Podizanje nogu',           'Leg raise',           'trbuh', [P.trbuh.parts[1]], false, 'legraise'),
  X('plank',     'Daska',                    'Plank',               'trbuh', [P.trbuh.parts[0], P.trbuh.parts[2]], false, 'plank'),
  X('twist',     'Ruski okret',              'Russian twist',       'trbuh', [P.trbuh.parts[2]], false, 'twist'),
  X('cablecrunch', 'Trbušnjak na kablu', 'Cable crunch', 'trbuh', [P.trbuh.parts[0]], false, 'crunch'),
  X('hangleg', 'Podizanje nogu u visu', 'Hanging leg raise', 'trbuh', [P.trbuh.parts[1]], false, 'legraise'),
  X('reversecrunch', 'Obrnuti trbušnjak', 'Reverse crunch', 'trbuh', [P.trbuh.parts[1]], false, 'legraise'),
  X('bicycle', 'Bicikl trbušnjak', 'Bicycle crunch', 'trbuh', [P.trbuh.parts[0], P.trbuh.parts[2]], false, 'crunch'),
  X('vup', 'V-trbušnjak', 'V-up', 'trbuh', [P.trbuh.parts[0], P.trbuh.parts[1]], false, 'crunch'),
  X('abwheel', 'Kotačić za trbuh', 'Ab wheel rollout', 'trbuh', [P.trbuh.parts[0], P.trbuh.parts[1]], false, 'plank'),
  X('sideplank', 'Bočna daska', 'Side plank', 'trbuh', [P.trbuh.parts[2]], false, 'plank'),
  X('woodchop', 'Drvosječa na kablu', 'Cable woodchop', 'trbuh', [P.trbuh.parts[2]], false, 'twist'),
  X('deadbug', 'Mrtva buba', 'Dead bug', 'trbuh', [P.trbuh.parts[1]], false, 'legraise'),
  X('mountain', 'Penjač', 'Mountain climbers', 'trbuh', [P.trbuh.parts[1], P.trbuh.parts[0]], false, 'plank'),
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
