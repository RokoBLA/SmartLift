# SmartLift

Jednostavno praćenje treninga u teretani. Jedna web aplikacija (HTML, CSS i JavaScript, bez servera i bez build alata) koja radi na mobitelu i računalu, može se instalirati na početni zaslon i radi offline.

**Faza 1:** prijava, setup (čarobnjak), plan, unos treninga, prijedlog progresije i prikaz oporavka mišića.
**Kasnije (faze 2 i 3):** usporedba snage, admin, analiza. Struktura je pripremljena u `js/modules/`.

## Što treba

- Google račun (za Firebase, besplatni plan **Spark**; ne treba Blaze, Cloud Functions ni Storage)
- GitHub račun (za hosting na GitHub Pages)
- Za lokalno pokretanje: Python ili Node.js (bilo koji jednostavan web server)

## 1. Firebase projekt

1. Otvori [console.firebase.google.com](https://console.firebase.google.com) i klikni **Add project**. Daj mu ime (npr. `smartlift`). Google Analytics možeš isključiti.
2. U projektu klikni ikonu **Web (`</>`)** i registriraj web aplikaciju (ime npr. `SmartLift`). **Hosting ne uključuj.**
3. Firebase će ti pokazati `firebaseConfig`. Zapiši ga, treba ti u koraku 4.

### Uključi prijavu emailom

**Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**

(Poveznica za zaboravljenu lozinku koristi Firebaseov zadani email predložak. Tekst možeš promijeniti u *Authentication → Templates*.)

### Uključi Firestore (europska regija)

1. **Build → Firestore Database → Create database.**
2. Lokacija: **`eur3 (europe-west)`** ili **`europe-west3` (Frankfurt)**. Regija se poslije ne može promijeniti.
3. Odaberi **Production mode** (pravila postavljamo u sljedećem koraku).

### Pravila

U **Firestore Database → Rules** zalijepi sadržaj datoteke [`firestore.rules`](firestore.rules) i klikni **Publish**.
Pravilo: prijavljeni korisnik čita i piše samo vlastiti dokument `users/{uid}` i njegove podkolekcije. Nitko drugi nema pristup.

## 2. Konfiguracija

Otvori [`config.js`](config.js) i zamijeni predložene vrijednosti onima iz `firebaseConfig`. Ključ nije tajna; sigurnost čine pravila iz prethodnog koraka.

## 3. Lokalno pokretanje

Aplikacija koristi ES module, pa se ne smije otvarati dvoklikom na `index.html`. Pokreni mali web server u ovoj mapi:

```bash
python -m http.server 8000
```

Zatim otvori <http://localhost:8000>. (Alternativa: `npx serve`.)
`localhost` je već na popisu dopuštenih domena u Firebase Authentication.

Testovi logike (oporavak, progresija, savjeti za plan):

```bash
node tests/logic.test.mjs
```

## 4. GitHub Pages

1. Napravi novi repozitorij na GitHubu (npr. `smartlift`) i pošalji cijelu mapu u njega.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, mapa `/ (root)` → Save.**
3. Nakon minute-dvije aplikacija je na `https://KORISNIK.github.io/smartlift/`.
4. **Važno:** u Firebaseu dodaj tu domenu u **Authentication → Settings → Authorized domains → Add domain** (`KORISNIK.github.io`). Bez toga prijava na hostanoj stranici ne radi.

### Instalacija na početni zaslon

- **Android (Chrome):** izbornik ⋮ → *Instaliraj aplikaciju* / *Dodaj na početni zaslon*.
- **iPhone (Safari):** gumb Dijeli → *Dodaj na početni zaslon*.
- **Računalo (Chrome/Edge):** ikona instalacije u adresnoj traci.

Offline: nakon prvog otvaranja s internetom aplikacija se sprema u preglednik. Bez veze možeš unositi treninge; Firestore ih sprema lokalno i sinkronizira čim se veza vrati. Prijava i brisanje računa traže internet.

### Nova verzija aplikacije

Nakon izmjena datoteka promijeni `VERSION` u [`sw.js`](sw.js) (npr. `smartlift-v2`) da se stari spremnik zamijeni.

## Kako aplikacija radi

- **Plan:** korisnik sam slaže dane (npr. „PRSA + TRICEPS“), bira vježbe iz biblioteke ili dodaje vlastite, određuje redoslijed, broj serija i raspon ponavljanja. Uz svaki dan prikazuju se **savjeti**: koji dio mišića nije pokriven (npr. duga glava tricepsa), premalo ili previše serija, i redoslijed teških i lakih vježbi. Pravila su u [`js/analysis.js`](js/analysis.js), bez AI-ja.
- **Progresija** ([`js/progression.js`](js/progression.js)): dvostruka progresija. Ako su sve radne serije dosegle gornji raspon, predlaže se +2,5 kg (korak se mijenja u postavkama) i povratak na donji raspon. Inače još ponavljanja uz istu težinu. Ako je zadnja serija prošlog treninga bila do otkaza (RIR 0) i zadnji trening nije napredovao, savjet je da se težina zadrži. Za grupu označenu „boli me“ prijedlog se ne prikazuje.
- **Oporavak** ([`js/recovery.js`](js/recovery.js)): svaka radna serija daje opterećenje prema RIR-u (RIR 0 teže, RIR 4 lakše). Zbroj se uspoređuje s referentnim brojem serija za tu klasu mišića i određuje trajanje unutar prozora (manji mišići 24–48 h, prsa i leđa 48–72 h, noge 72 h; prozori se mijenjaju u postavkama). Postotak raste od 0 % do 100 %. Zeleno ≥ 90 %, žuto 60–89 %, crveno < 60 %. Zagrijavajuće serije se ne računaju. To je orijentacijska procjena, ne medicinska tvrdnja.
- **Podaci:** `users/{uid}` (profil, postavke, plan, oznake boli, tjelesna težina, `lastWorkoutAt`, `shareProgress`) i `users/{uid}/sessions/{id}` (treninzi).
- **Backup:** *Postavke → Izvezi backup* sprema JSON. *Uvezi backup* zamjenjuje sve trenutne podatke.
- **Brisanje računa:** *Postavke → Obriši račun i sve podatke*. Traži lozinku (Firebase zahtijeva svježu prijavu) i upis riječi `OBRIŠI`. Briše treninge, korisnički dokument i račun.

## Vježbe bez animacije

Animacije su štapić-likovi nacrtani u SVG-u ([`js/animations.js`](js/animations.js)), bez tuđih materijala. Vježbe iz biblioteke koje **nemaju animaciju** (prikazuje se običan simbol):

- Hiperekstenzija / Back extension
- Nošenje utega / Farmer's walk
- Držanje pločice / Plate pinch
- Valjak za zapešća / Wrist roller

Isto vrijedi za sve vlastite vježbe koje korisnik doda. Animacija se dodaje u objekt `ANIMS` (dvije poze) i u `a` polje vježbe u `js/exercises.js`.

## Struktura

```
index.html, config.js, manifest.webmanifest, sw.js, firestore.rules
css/styles.css          teme (svijetla/tamna), komponente
js/app.js               pokretanje, usmjeravanje, događaji
js/firebase.js          Firebase (CDN, v10.12.2), offline spremnik
js/store.js             stanje i sinkronizacija
js/auth.js, wizard.js   prijava i čarobnjak
js/home.js              preporuka dana i oporavak
js/plan.js, picker.js   uređivanje plana, odabir vježbe
js/workout.js           unos serija, odmor, uređivanje s poništavanjem
js/history.js           povijest
js/settings.js          postavke, težina, backup, brisanje računa
js/recovery.js, progression.js, analysis.js   čista logika (testirana)
js/exercises.js, animations.js                biblioteka vježbi i animacije
js/modules/index.js     mjesto za faze 2 i 3
tests/logic.test.mjs    testovi logike
tools/make-icons.cjs    izrada PNG ikona
```

### Dodavanje modula u kasnijim fazama

U `js/modules/index.js` dodaj objekt `{ id, route, title, nav, icon, view(route) }`. Ruta postaje dostupna, a uz `nav: true` pojavljuje se u donjoj navigaciji.
Za administratorski uvid trebat će proširiti pravila (npr. polje `shareProgress` na dokumentu korisnika i uloga admina) i to **bez Cloud Functions**, uz provjeru u pravilima.

## Napomene

- Email se ne verificira (nije traženo u fazi 1).
- Obavijest o administratoru prikazuje se pri prvom koraku čarobnjaka i na početnoj stranici dok je korisnik ne potvrdi. U fazi 1 postoji samo prekidač `shareProgress` (zadano isključeno); sam admin dolazi kasnije.
