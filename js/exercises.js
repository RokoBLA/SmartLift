// Mišićne grupe, njihovi dijelovi i biblioteka vježbi.
// cls = klasa oporavka (small / medium / large).
// Vježba: id, hrvatski naziv, engleski naziv, grupa, dijelovi koje dobro gađa (indeksi u parts),
// c = višezglobna (teška) vježba, a = oznaka animacije u animations.js.

export const MUSCLES = {
  prsa:       { name: 'Prsa',       cls: 'medium', parts: ['gornji dio prsa', 'srednji dio prsa', 'donji dio prsa'] },
  leđa:       { name: 'Leđa',       cls: 'medium', parts: ['širina leđa', 'debljina leđa', 'donja leđa', 'trapez'] },
  noge:       { name: 'Noge',       cls: 'large',  parts: ['prednja strana bedra', 'stražnja strana bedra', 'stražnjica', 'listovi', 'unutarnja strana bedra'] },
  ramena:     { name: 'Ramena',     cls: 'small',  parts: ['prednji dio ramena', 'bočni dio ramena', 'stražnji dio ramena'] },
  biceps:     { name: 'Biceps',     cls: 'small',  parts: ['duga glava bicepsa', 'kratka glava bicepsa', 'brahijalis'] },
  triceps:    { name: 'Triceps',    cls: 'small',  parts: ['duga glava tricepsa', 'bočna glava tricepsa', 'medijalna glava tricepsa'] },
  podlaktice: { name: 'Podlaktice', cls: 'small',  parts: ['pregibači zapešća', 'opružači zapešća'] },
  trbuh:      { name: 'Trbuh',      cls: 'small',  parts: ['gornji trbuh', 'donji trbuh', 'kosi trbušni mišići'] },
};
export const MUSCLE_ORDER = ['prsa', 'leđa', 'noge', 'ramena', 'biceps', 'triceps', 'podlaktice', 'trbuh'];

const X = (id, hr, en, m, t, c, a) => ({ id, hr, en, m, t: t.map((i) => MUSCLES[m].parts[i]), c: !!c, a });

export const LIB = [
  // ---- prsa: 0 gornji, 1 srednji, 2 donji ----
  X('bench',        'Klupa',                        'Bench press',               'prsa', [1], 1, 'bench'),
  X('incline',      'Kosa klupa',                   'Incline press',             'prsa', [0], 1, 'incline'),
  X('declinebench', 'Negativna klupa',              'Decline bench press',       'prsa', [2], 1, 'declinebench'),
  X('dbpress',      'Potisak bučicama',             'Dumbbell bench press',      'prsa', [1], 1, 'bench'),
  X('inclinedb',    'Kosa klupa s bučicama',        'Incline dumbbell press',    'prsa', [0], 1, 'incline'),
  X('machinepress', 'Potisak na spravi',            'Machine chest press',       'prsa', [1], 1, 'bench'),
  X('chestdips',    'Sklekovi na razboju',          'Chest dips',                'prsa', [2], 1, 'dips'),
  X('pushup',       'Sklek',                        'Push-up',                   'prsa', [1], 1, 'pushup'),
  X('declinepush',  'Sklek s nogama na povišenju',  'Decline push-up',           'prsa', [0], 1, 'declinepush'),
  X('landmine',     'Landmine potisak',             'Landmine press',            'prsa', [0], 1, 'landmine'),
  X('fly',          'Razvlačenje s bučicama',       'Dumbbell fly',              'prsa', [1], 0, 'fly'),
  X('inclfly',      'Razvlačenje na kosoj klupi',   'Incline fly',               'prsa', [0], 0, 'fly'),
  X('cablefly',     'Razvlačenje na kablovima',     'Cable fly',                 'prsa', [1], 0, 'crossover'),
  X('lowcable',     'Kabel odozdo prema gore',      'Low-to-high cable fly',     'prsa', [0], 0, 'crossover'),
  X('highcable',    'Kabel odozgo prema dolje',     'High-to-low cable fly',     'prsa', [2], 0, 'crossover'),
  X('pecdeck',      'Pec deck',                     'Machine fly',               'prsa', [1], 0, 'pecdeck'),

  // ---- leđa: 0 širina, 1 debljina, 2 donja leđa, 3 trapez ----
  X('pullup',       'Zgib',                         'Pull-up',                   'leđa', [0], 1, 'pullup'),
  X('chinup',       'Zgib podhvatom',               'Chin-up',                   'leđa', [0], 1, 'pullup'),
  X('pulldown',     'Spuštanje šipke',              'Lat pulldown',              'leđa', [0], 1, 'pulldown'),
  X('closepulldown','Spuštanje uskim hvatom',       'Close-grip pulldown',       'leđa', [0, 1], 1, 'pulldown'),
  X('straightarm',  'Povlačenje ravnim rukama',     'Straight-arm pulldown',     'leđa', [0], 0, 'straightarm'),
  X('brow',         'Veslanje šipkom',              'Barbell row',               'leđa', [1], 1, 'row'),
  X('dbrow',        'Veslanje bučicom',             'One-arm dumbbell row',      'leđa', [1, 0], 1, 'row'),
  X('tbar',         'T-veslanje',                   'T-bar row',                 'leđa', [1], 1, 'row'),
  X('crow',         'Veslanje na kablu',            'Seated cable row',          'leđa', [1], 1, 'cablerow'),
  X('machrow',      'Veslanje na spravi',           'Machine row',               'leđa', [1], 1, 'cablerow'),
  X('csrow',        'Veslanje s osloncem na prsa',  'Chest-supported row',       'leđa', [1], 1, 'csrow'),
  X('invrow',       'Australski zgib',              'Inverted row',              'leđa', [1], 1, 'invrow'),
  X('pullover',     'Pull-over s bučicom',          'Dumbbell pullover',         'leđa', [0], 0, 'pullover'),
  X('deadlift',     'Mrtvo dizanje',                'Deadlift',                  'leđa', [2, 1], 1, 'deadlift'),
  X('rackpull',     'Povlačenje iz stalka',         'Rack pull',                 'leđa', [1, 3], 1, 'deadlift'),
  X('shrug',        'Podizanje ramena',             'Shrug',                     'leđa', [3], 0, 'shrug'),
  X('dbshrug',      'Podizanje ramena bučicama',    'Dumbbell shrug',            'leđa', [3], 0, 'shrug'),
  X('hyper',        'Hiperekstenzija',              'Back extension',            'leđa', [2], 0, 'hyper'),
  X('goodmorning',  'Dobro jutro',                  'Good morning',              'leđa', [2], 0, 'goodmorning'),
  X('superman',     'Superman',                     'Superman',                  'leđa', [2], 0, 'superman'),

  // ---- noge: 0 prednja strana bedra, 1 stražnja, 2 stražnjica, 3 listovi ----
  X('squat',        'Čučanj',                       'Squat',                     'noge', [0, 2], 1, 'squat'),
  X('frontsquat',   'Prednji čučanj',               'Front squat',               'noge', [0], 1, 'frontsquat'),
  X('goblet',       'Čučanj s bučicom',             'Goblet squat',              'noge', [0, 2], 1, 'goblet'),
  X('hacksquat',    'Hack čučanj',                  'Hack squat',                'noge', [0], 1, 'hack'),
  X('legpress',     'Potisak nogama',               'Leg press',                 'noge', [0, 2], 1, 'legpress'),
  X('bulgarian',    'Bugarski čučanj',              'Bulgarian split squat',     'noge', [0, 2], 1, 'bulgarian'),
  X('lunge',        'Iskorak',                      'Lunge',                     'noge', [0, 2], 1, 'lunge'),
  X('revlunge',     'Iskorak unatrag',              'Reverse lunge',             'noge', [0, 2], 1, 'lunge'),
  X('stepup',       'Penjanje na klupu',            'Step-up',                   'noge', [0, 2], 1, 'stepup'),
  X('rdl',          'Rumunjsko mrtvo dizanje',      'Romanian deadlift',         'noge', [1, 2], 1, 'rdl'),
  X('sldl',         'Mrtvo dizanje s ravnim nogama','Stiff-leg deadlift',        'noge', [1, 2], 1, 'rdl'),
  X('sumo',         'Sumo mrtvo dizanje',           'Sumo deadlift',             'noge', [1, 2, 4], 1, 'sumo'),
  X('sumogoblet',   'Sumo čučanj s bučicom',        'Sumo goblet squat',         'noge', [4, 2], 1, 'goblet'),
  X('legext',       'Opružanje nogu',               'Leg extension',             'noge', [0], 0, 'legext'),
  X('legcurl',      'Pregib nogu ležeći',           'Lying leg curl',            'noge', [1], 0, 'legcurl'),
  X('seatedcurl',   'Pregib nogu sjedeći',          'Seated leg curl',           'noge', [1], 0, 'seatedcurl'),
  X('hipthrust',    'Podizanje kukova',             'Hip thrust',                'noge', [2], 0, 'hipthrust'),
  X('glutebridge',  'Mostić',                       'Glute bridge',              'noge', [2], 0, 'glutebridge'),
  X('glutekick',    'Zamah nogom na kablu',         'Cable glute kickback',      'noge', [2], 0, 'glutekick'),
  X('hipabduction', 'Abdukcija kuka na spravi',     'Hip abduction machine',     'noge', [2], 0, 'abduction'),
  X('sidelegraise', 'Podizanje noge u ležanju na boku', 'Side-lying leg raise',  'noge', [2], 0, 'abduction'),
  X('hipadduction', 'Adukcija kuka na spravi',      'Hip adduction machine',     'noge', [4], 0, 'adduction'),
  X('sideadduct',   'Adukcija u ležanju na boku',   'Side-lying adduction',      'noge', [4], 0, 'adduction'),
  X('copenhagen',   'Kopenhagen daska',             'Copenhagen plank',          'noge', [4], 0, 'sideplank'),
  X('calf',         'Podizanje na prste stojeći',   'Standing calf raise',       'noge', [3], 0, 'calf'),
  X('seatedcalf',   'Podizanje na prste sjedeći',   'Seated calf raise',         'noge', [3], 0, 'seatedcalf'),

  // ---- ramena: 0 prednji, 1 bočni, 2 stražnji ----
  X('ohp',          'Potisak iznad glave',          'Overhead press',            'ramena', [0, 1], 1, 'ohp'),
  X('dbohp',        'Potisak bučicama',             'Dumbbell shoulder press',   'ramena', [0, 1], 1, 'ohp'),
  X('arnold',       'Arnoldov potisak',             'Arnold press',              'ramena', [0, 1], 1, 'arnold'),
  X('machshoulder', 'Potisak za ramena na spravi',  'Machine shoulder press',    'ramena', [0, 1], 1, 'ohp'),
  X('uprow',        'Veslanje do brade',            'Upright row',               'ramena', [1], 1, 'uprow'),
  X('lateral',      'Bočno podizanje',              'Lateral raise',             'ramena', [1], 0, 'lateral'),
  X('cablelateral', 'Bočno podizanje na kablu',     'Cable lateral raise',       'ramena', [1], 0, 'lateral'),
  X('frontraise',   'Prednje podizanje',            'Front raise',               'ramena', [0], 0, 'frontraise'),
  X('rearfly',      'Stražnje podizanje',           'Rear delt fly',             'ramena', [2], 0, 'rearfly'),
  X('reversepec',   'Obrnuti pec deck',             'Reverse pec deck',          'ramena', [2], 0, 'revpec'),
  X('facepull',     'Povlačenje do lica',           'Face pull',                 'ramena', [2], 0, 'facepull'),

  // ---- biceps: 0 duga glava, 1 kratka glava, 2 brahijalis ----
  X('curl',         'Pregib šipkom',                'Barbell curl',              'biceps', [1, 0], 0, 'curl'),
  X('ezcurl',       'Pregib EZ šipkom',             'EZ-bar curl',               'biceps', [1, 0], 0, 'curl'),
  X('dbcurl',       'Pregib bučicama',              'Dumbbell curl',             'biceps', [1, 0], 0, 'curl'),
  X('cablecurl',    'Pregib na kablu',              'Cable curl',                'biceps', [1, 0], 0, 'cablecurl'),
  X('inclcurl',     'Pregib na kosoj klupi',        'Incline curl',              'biceps', [0], 0, 'inclcurl'),
  X('bayesian',     'Pregib na kablu iza tijela',   'Bayesian curl',             'biceps', [0], 0, 'cablecurl'),
  X('preacher',     'Pregib na Scott klupi',        'Preacher curl',             'biceps', [1], 0, 'preacher'),
  X('spider',       'Pregib na prsnom osloncu',     'Spider curl',               'biceps', [1], 0, 'spider'),
  X('concentration','Koncentrirani pregib',         'Concentration curl',        'biceps', [1], 0, 'concentration'),
  X('hammer',       'Pregib čekićem',               'Hammer curl',               'biceps', [2], 0, 'curl'),
  X('crosshammer',  'Pregib čekićem preko tijela',  'Cross-body hammer curl',    'biceps', [2], 0, 'curl'),
  X('revcurl',      'Obrnuti pregib',               'Reverse curl',              'biceps', [2], 0, 'curl'),

  // ---- triceps: 0 duga glava, 1 bočna, 2 medijalna ----
  X('pushdown',     'Triceps na užetu',             'Rope pushdown',             'triceps', [1, 2], 0, 'pushdown'),
  X('vbarpushdown', 'Triceps na ravnoj šipki',      'Straight-bar pushdown',     'triceps', [1, 2], 0, 'pushdown'),
  X('singlepush',   'Triceps jednom rukom na kablu','Single-arm pushdown',       'triceps', [1], 0, 'pushdown'),
  X('ohext',        'Triceps iznad glave',          'Overhead extension',        'triceps', [0], 0, 'ohext'),
  X('cableohext',   'Triceps iznad glave na kablu', 'Cable overhead extension',  'triceps', [0], 0, 'ohext'),
  X('skull',        'Francuski potisak',            'Skull crusher',             'triceps', [0, 1], 0, 'skull'),
  X('dbskull',      'Francuski potisak bučicama',   'Dumbbell skull crusher',    'triceps', [0, 1], 0, 'skull'),
  X('closegrip',    'Uska klupa',                   'Close-grip bench',          'triceps', [1, 2], 1, 'bench'),
  X('tridips',      'Dips za triceps',              'Triceps dips',              'triceps', [1, 2], 1, 'dips'),
  X('benchdips',    'Dips na klupi',                'Bench dips',                'triceps', [1, 2], 1, 'benchdips'),
  X('diamond',      'Dijamantni sklek',             'Diamond push-up',           'triceps', [1, 2], 1, 'pushup'),
  X('kickback',     'Zamah unatrag',                'Triceps kickback',          'triceps', [1], 0, 'kickback'),

  // ---- podlaktice: 0 pregibači, 1 opružači ----
  X('wristcurl',    'Pregib zapešća',               'Wrist curl',                'podlaktice', [0], 0, 'wrist'),
  X('behindwrist',  'Pregib zapešća iza leđa',      'Behind-the-back wrist curl','podlaktice', [0], 0, 'wrist'),
  X('revwrist',     'Obrnuti pregib zapešća',       'Reverse wrist curl',        'podlaktice', [1], 0, 'wrist'),
  X('farmer',       'Nošenje utega',                "Farmer's walk",             'podlaktice', [0], 0, 'farmer'),
  X('deadhang',     'Vis na šipki',                 'Dead hang',                 'podlaktice', [0], 0, 'deadhang'),
  X('pinch',        'Držanje pločice',              'Plate pinch',               'podlaktice', [0], 0, 'pinch'),
  X('wristroller',  'Valjak za zapešća',            'Wrist roller',              'podlaktice', [0, 1], 0, 'roller'),

  // ---- trbuh: 0 gornji, 1 donji, 2 kosi ----
  X('crunch',       'Trbušnjak',                    'Crunch',                    'trbuh', [0], 0, 'crunch'),
  X('situp',        'Podizanje trupa',              'Sit-up',                    'trbuh', [0, 1], 0, 'situp'),
  X('cablecrunch',  'Trbušnjak na kablu',           'Cable crunch',              'trbuh', [0], 0, 'cablecrunch'),
  X('vup',          'V-trbušnjak',                  'V-up',                      'trbuh', [0, 1], 0, 'vup'),
  X('legraise',     'Podizanje nogu',               'Leg raise',                 'trbuh', [1], 0, 'legraise'),
  X('revcrunch',    'Obrnuti trbušnjak',            'Reverse crunch',            'trbuh', [1], 0, 'revcrunch'),
  X('hangleg',      'Podizanje nogu u visu',        'Hanging leg raise',         'trbuh', [1], 0, 'hangleg'),
  X('hangknee',     'Podizanje koljena u visu',     'Hanging knee raise',        'trbuh', [1], 0, 'hangknee'),
  X('deadbug',      'Mrtva buba',                   'Dead bug',                  'trbuh', [1], 0, 'deadbug'),
  X('plank',        'Daska',                        'Plank',                     'trbuh', [0, 2], 0, 'plank'),
  X('sideplank',    'Bočna daska',                  'Side plank',                'trbuh', [2], 0, 'sideplank'),
  X('abwheel',      'Kotačić za trbuh',             'Ab wheel rollout',          'trbuh', [0, 1], 0, 'abwheel'),
  X('heeltap',      'Dodirivanje peta',             'Heel taps',                 'trbuh', [2], 0, 'heeltap'),
  X('bicycle',     'Bicikl trbušnjak',             'Bicycle crunch',            'trbuh', [0, 2], 0, 'bicycle'),
  X('twist',        'Ruski okret',                  'Russian twist',             'trbuh', [2], 0, 'twist'),
  X('woodchop',     'Drvosječa na kablu',           'Cable woodchop',            'trbuh', [2], 0, 'woodchop'),
  X('pallof',       'Pallof potisak',               'Pallof press',              'trbuh', [2], 0, 'pallof'),
  X('mountain',     'Penjač',                       'Mountain climbers',         'trbuh', [1, 0], 0, 'mountain'),
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
