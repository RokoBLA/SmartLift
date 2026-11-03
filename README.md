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

## Vježbe i animacije

Biblioteka ima 115 vježbi (`js/exercises.js`), a svaka ima animaciju (82 različita pokreta). Animacije su štapić-likovi nacrtani u SVG-u (`js/animations.js`), bez tuđih materijala. Vježbe koje dijele isti pokret (npr. šipka i bučice) dijele i animaciju. Vlastite vježbe koje korisnik doda imaju običan simbol.

Pregled svih animacija: pokreni lokalni server i otvori `tests/animations.html`.

Nova vježba: dodaj redak u `LIB` (`js/exercises.js`) i, ako treba novi pokret, objekt u `ANIMS` (dvije poze od 14 brojeva). Testovi provjeravaju da svaka vježba ima animaciju i da svaki dio svakog mišića ima barem dvije vježbe.

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

## Vježbe koje nedostaju

Korisnici ne mogu dodavati vlastite vježbe, da usporedbe u fazi 3 imaju smisla (svi rade iste vježbe). Umjesto toga u odabiru vježbe postoji gumb „Nema tvoje vježbe? Javi nam“, koji otvara mail s pripremljenom porukom na adresu iz `js/config-app.js` (`REQUEST_EMAIL`). Nova vježba se dodaje u `js/exercises.js` (vidi gore).

## Plan za fazu 3 (usporedba snage)

- „Bolji si od 80 % korisnika“ i „ovu vježbu radi N korisnika“ traže zbirne podatke svih korisnika. Sadašnja pravila to ne dopuštaju (svatko čita samo svoje) i **ne treba** ih otvarati.
- Predloženo rješenje bez Cloud Functions: korisnik koji to uključi (u postavkama) sam upisuje samo anonimni zapis o svojoj najboljoj seriji po vježbi u zasebnu kolekciju (npr. `stats/{vježba}/entries/{uid}`: spol, dobna skupina, težinski razred, procijenjeni 1RM). Pravila: pisati smije samo vlasnik zapisa, čitati svaki prijavljeni korisnik, bez emaila i imena.
- Postotak i broj korisnika računaju se u pregledniku iz tih zapisa (uz ograničenje broja pročitanih dokumenata zbog besplatne kvote).
- Tjelesna težina i profil već se spremaju u fazi 1 za te provjere.

## Napomene

- Email se ne verificira (nije traženo u fazi 1).
- Obavijest o administratoru prikazuje se pri prvom koraku čarobnjaka i na početnoj stranici dok je korisnik ne potvrdi. U fazi 1 postoji samo prekidač `shareProgress` (zadano isključeno); sam admin dolazi kasnije.
