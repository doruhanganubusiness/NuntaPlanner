# Specificații Tehnice — Platformă de Planificare a Nunții

**Document pentru echipa de dezvoltare**
Versiune 1.2 · Faza 1 (Web) + Faza 2 (Aplicație mobilă nativă)

---

## Cuprins

1. [Viziune și scop](#1-viziune-și-scop)
2. [Arhitectura sistemului](#2-arhitectura-sistemului)
3. [Modelul de date (schema bazei de date)](#3-modelul-de-date)
4. [Câmpurile de input colectate de la miri](#4-câmpurile-de-input)
5. [Motorul de calcul — formule complete](#5-motorul-de-calcul)
6. [Specificația API](#6-specificația-api)
7. [Structura site-ului și a dashboard-ului (UI)](#7-structura-site-ului-și-ui)
8. [Roluri și permisiuni](#8-roluri-și-permisiuni)
9. [Sistemul de Lead-uri și Monetizare](#9-sistemul-de-lead-uri-și-monetizare)
10. [CMS de conținut — WordPress headless](#10-cms-de-conținut--wordpress-headless)
11. [Faza 2 — aplicația mobilă](#11-faza-2-aplicația-mobilă)
12. [Stack tehnologic recomandat](#12-stack-tehnologic-recomandat)

---

## 1. Viziune și scop

Platforma ajută mirii să-și planifice nunta de la zero. Mirii își creează un cont partajat, completează informații despre eveniment (invitați, buget, sloturi, stil), iar **motorul de calcul** generează automat recomandări concrete: cantități de băutură pe sortiment, dimensiunea necesară a sălii, formație vs DJ, defalcarea bugetului pe categorii, cantități de dulciuri/șampanie/pahare pentru fiecare slot etc.

**Principii de produs:**

- Toate datele despre eveniment sunt **opționale la început** (mirii poate nu au stabilit data). Motorul lucrează cu estimări și se rafinează pe măsură ce se completează informații.
- Un singur „eveniment" (nunta) poate avea **mai multe sloturi** (cununie civilă, cununie religioasă, botez, petrecere), fiecare cu oră, locație și număr de invitați propriu.
- Băutura poate fi tratată în **două moduri, la alegerea mirilor**: (a) calcul de cantități (mirii aduc băutura), sau (b) calcul de cost (băutura e inclusă în meniul restaurantului).
- **Marketplace-ul de furnizori este integrat în Faza 1**, dar ca sistem de lead-uri și chat, NU de plată. Mirii și furnizori negociază și plătesc serviciile DIRECT, în afara platformei.

---

## 2. Arhitectura sistemului

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENȚI                            │
│   Web App (Faza 1)          Mobile App nativ (Faza 2)   │
│   React / Next.js           iOS (Swift) / Android (Kotlin)│
└───────────────┬─────────────────────┬───────────────────┘
                │   HTTPS / REST/JSON  │
                ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                  API GATEWAY / BACKEND                  │
│   Autentificare (JWT)  ·  Rate limiting  ·  Validare    │
├─────────────────────────────────────────────────────────┤
│   Serviciu Conturi   │  Serviciu Eveniment │ Serviciu    │
│   & Membri           │  & Sloturi          │ Calcul      │
│   & Furnizori        │  & Lead-uri & Chat  │ (Engine)    │
├─────────────────────────────────────────────────────────┤
│   PostgreSQL (date)  │  Redis (cache/sesiuni) │ S3 (media)│
└─────────────────────────────────────────────────────────┘
```

**Componente centrale:**
- **Calculation Engine**: serviciu stateless care primește starea evenimentului și returnează recomandări. Rezultatele sunt cache-uite. Logica trăiește exclusiv pe backend pentru refolosire în app mobile (Faza 2).
- **Lead Management System**: gestionează cererile mirilor către furnizori, deblocarea mesajelor (CPL) și abonamente furnizori.
- **Messaging System**: chat direct între furnizori și miri (după debloc mesaj).
- **Stripe Integration**: plăți CPL și abonamente (doar de la furnizori, NU de la miri).

**Configurabilitate:** toate constantele (consum mediu de băutură, m²/invitat, praguri de preț regionale, procente de buget) sunt stocate în tabele de configurare, NU hardcodate.

---

## 3. Modelul de date

### 3.1 `users` — conturi individuale (persoane fizice și furnizori)

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `email` | varchar, unique | email de autentificare |
| `password_hash` | varchar | bcrypt/argon2 |
| `full_name` | varchar | |
| `phone` | varchar, nullable | |
| `user_type` | enum | `client` (mire) sau `vendor` (furnizor) |
| `email_verified` | boolean | default false |
| `created_at` / `updated_at` | timestamptz | |

### 3.2 `weddings` — evenimentul (nunta), entitatea partajată

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `name` | varchar | ex. „Nunta Ana & Andrei" |
| `wedding_date` | date, **nullable** | opțional — poate fi necompletat |
| `date_status` | enum | `set`, `estimated`, `undecided` |
| `estimated_season` | enum, nullable | `spring/summer/autumn/winter` dacă nedecisă |
| `estimated_year` | int, nullable | |
| `wedding_type` | enum[] | combinație: `civil`, `religious`, `baptism` |
| `region` | varchar | județ/oraș — critică pentru recomandări |
| `style` | enum | stilul alesat (clasic, rustic, boho, modern, etc.) |
| `total_budget` | numeric, nullable | RON |
| `currency` | varchar | default `RON` |
| `drink_mode` | enum | `quantities` (mirii aduc) / `cost` (inclus în meniu) |
| `budget_priorities` | jsonb | ranking pe categorii (drag&drop) |
| `created_at` / `updated_at` | timestamptz | |

### 3.3 `wedding_members` — membrii contului (multi-email)

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `wedding_id` | UUID FK → weddings | |
| `user_id` | UUID FK → users, nullable | null până acceptă invitația |
| `email` | varchar | email-ul invitat |
| `role` | enum | `groom`, `bride`, `parent`, `godparent`, `viewer` |
| `permission` | enum | `owner`, `editor`, `viewer` |
| `status` | enum | `pending`, `active` |
| `invited_at` / `joined_at` | timestamptz | |

### 3.4 `event_slots` — sloturile complexe ale zilei

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `wedding_id` | UUID FK | |
| `slot_type` | enum | `civil_ceremony`, `religious_ceremony`, `baptism`, `reception` |
| `title` | varchar | ex. „Cununia religioasă" |
| `start_time` | timestamptz, nullable | dată + oră |
| `duration_minutes` | int, nullable | ex. petrecere 600 min (10h) |
| `location_name` | varchar | ex. „Biserica Sf. Nicolae" |
| `location_address` | varchar | |
| `guests_adults` | int | nr. adulți la acest slot |
| `guests_children` | int | nr. copii la acest slot |
| `serves_alcohol` | boolean | se servește alcool |
| `serves_full_meal` | boolean | true doar la petrecere |
| `order_index` | int | ordinea în zi |

### 3.5 `calc_results` — rezultate cache-uite ale motorului

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `wedding_id` | UUID FK | |
| `input_hash` | varchar | hash al inputurilor; invalidare cache |
| `results` | jsonb | tot output-ul motorului |
| `computed_at` | timestamptz | |

### 3.6 `config_parameters` — constante ajustabile

Tabel cheie-valoare versionat, pe regiune, pentru consum băutură, m²/invitat, praguri preț, procente buget.

### 3.7 `vendors` — furnizori de servicii

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `business_name` | varchar | |
| `category` | varchar | DJ, Fotograf, Florar, Restaurant, etc. |
| `tier` | enum | `budget` (5 RON/lead), `mid` (10 RON), `premium` (20 RON) |
| `regions` | text[] | ['București', 'Cluj', ...] |
| `description` | text | |
| `logo_url` | varchar, nullable | |
| `phone` | varchar | |
| `email` | varchar | |
| `website` | varchar, nullable | |
| `rating` | numeric, default 5.0 | rating mediu (1-5) |
| `verified` | boolean | default false — verificat de platformă |
| `status` | enum | `active`, `suspended`, `inactive` |
| `stripe_connect_id` | varchar, nullable | Stripe Connected Account ID |
| `created_at` / `updated_at` | timestamptz | |

### 3.8 `leads` — cererile mirilor către furnizori

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `wedding_id` | UUID FK → weddings | |
| `vendor_id` | UUID FK → vendors | |
| `client_email` | varchar | email mire |
| `client_phone` | varchar | telefon mire |
| `event_date` | date | data evenimentului |
| `event_region` | varchar | regiunea |
| `message` | text | mesajul mirelor |
| `status` | enum | `new` (blocat), `unlocked` (deblocheat), `contacted`, `converted`, `lost` |
| `is_unlocked_by_vendor` | boolean | furnizor a plătit pentru a vedea |
| `unlocked_at` | timestamptz, nullable | când s-a deblocheat |
| `vendor_contacted_at` | timestamptz, nullable | când furnizor a abordat |
| `created_at` / `updated_at` | timestamptz | |

### 3.9 `payments` — jurnalul de plăți (doar de la furnizori)

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `vendor_id` | UUID FK → vendors | |
| `payment_type` | enum | `cpl_lead` (per lead) sau `subscription_monthly` |
| `amount` | numeric | suma în RON |
| `currency` | varchar | default `RON` |
| `stripe_payment_intent_id` | varchar | ID Stripe |
| `stripe_subscription_id` | varchar, nullable | dacă e subscription |
| `status` | enum | `pending`, `succeeded`, `failed`, `refunded` |
| `created_at` / `updated_at` | timestamptz | |

### 3.10 `subscriptions` — abonamente lunare furnizori

| Câmp | Tip | Note |
|---|---|---|
| `id` | UUID PK | |
| `vendor_id` | UUID FK → vendors | |
| `tier` | varchar | „budget" (100), „mid" (200), „premium" (500) |
| `monthly_price` | numeric | 100 / 200 / 500 RON |
| `subscription_start_date` | date | ziua din calendar când s-a creat |
| `renewal_day_of_month` | int | 10, 15, 30, etc. — ziua reînnoririi |
| `stripe_subscription_id` | varchar | Stripe subscription ID |
| `status` | enum | `active`, `cancelled`, `paused` |
| `next_renewal_date` | date | data următoarei reînnori |
| `cancelled_at` | timestamptz, nullable | când s-a anulat |
| `created_at` / `updated_at` | timestamptz | |

---

## 4. Câmpurile de input

### 4.1 Cont și membri (pentru miri)

- Email + parolă (owner). Posibilitatea de a **adăuga emailuri suplimentare** cu rol: mire, mireasă, părinte, naș — fiecare cu permisiune (editor/viewer).

### 4.2 Despre eveniment

- **Tipul nunții** (selecție multiplă): `Religioasă`, `Civilă`, `Botez`, și orice combinație.
- **Data nunții**: opțională. Trei stări: dată fixă / interval estimat (sezon + an) / nedecisă.
- **Regiunea** (oraș/județ) — obligatorie.

### 4.3 Sloturile (fiecare cu structură completă)

Pentru fiecare slot (cununie civilă, cununie religioasă, botez, petrecere), mirii completează:

- **Ora** și data
- **Durata** (pentru petrecere, influențează consumul)
- **Locația** (nume + adresă)
- **Invitați** (adulți + copii) la acel slot specific
- Se servește alcool? / masă completă?

### 4.4 Invitați (simplificat)

- **Adulți** (global sau per slot)
- **Copii** (global sau per slot)

Motorul aplică medie statistică de consum pe adult (amestec realist: abstinenți + consum mic/mediu/mare).

### 4.5 Buget

- **Buget total** (opțional)
- **Prioritizare** (drag & drop): miri ordonează categoriile după importanță
- **Mod băutură**: „Calculează cantități" sau „Calculează cost"

### 4.6 Stil nuntă (cu descrieri)

8 opțiuni cu descrieri explicative (clasic, rustic, boho, modern, glamour, vintage, garden, tradițional).

---

## 5. Motorul de calcul — formule complete

[... secțiuni 5.1 - 5.7 rămân IDENTICE cu versiunea anterioară ...]

### 5.1 Băutură — cantități (mod `quantities`)

**Pas 1 — adulți consumatori echivalenți:**

```
factor_consum_mediu = 0.75   # băuturi standard/oră per adult, ca medie statistică
ore_petrecere = duration_minutes_petrecere / 60
adulti = guests_adults (la slotul respectiv)

total_bauturi_standard = adulti × factor_consum_mediu × ore_petrecere
```

**Pas 2 — defalcare pe sortimente** (procente implicite):

| Sortiment | % din total | Conversie |
|---|---|---|
| Vin (alb + roșu) | 40% | × 150 ml/pahar → litri → sticle 0.75 L |
| Bere | 20% | × 330 ml → sticle |
| Tărie | 15% | × 50 ml → litri → sticle 0.7 L |
| Apă / sucuri | restul | ~0.5 L apă + 0.3 L suc / persoană / oră |
| Șampanie (toast) | separat | 1 sticlă la 6–8 persoane |

**Pas 3 — pahare:**
```
pahare_vin = ceil(adulti × 1.5)
pahare_sampanie = adulti
pahare_apa/suc = (adulti + copii) × 1.5
pahare_tarie = ceil(adulti × 0.8)
```

**Pas 4 — buffer de siguranță:** se adaugă **+10%** la toate cantitățile.

### 5.2 Băutură — cost (mod `cost`)

```
cost_bautura_per_persoana = config(regiune).pret_bautura_inclusa
cost_total_bautura = adulti × cost_bautura_per_persoana
```

### 5.3 Dulciuri / candy bar / tort (per slot)

```
tort_grame = (adulti + copii) × 120
tort_kg = ceil(tort_grame / 1000)

candy_bar_kg = (adulti + copii) × 0.15

dulciuri_civil_kg = invitati_slot × 0.10
sampanie_civil_sticle = ceil(adulti_slot / 7)
pahare_civil = adulti_slot
```

### 5.4 Dimensiunea sălii / locației (per slot petrecere)

```
suprafata_mp = invitati_petrecere × factor_mp
# factor_mp implicit = 1.8

min_mp = invitati × 1.5
max_mp = invitati × 2.0

mese_rotunde = ceil(invitati / 10)
```

### 5.5 Formație vs DJ

```
buget_muzica = total_budget × procent_muzica   # default 9%
cost_estimat_formatie = config(regiune).cost_formatie
cost_estimat_dj = config(regiune).cost_dj

invitati = guests_adults + guests_children (petrecere)

DECIZIE:
  dacă invitati < 80 SAU buget_muzica < cost_estimat_dj:
      → DJ
  altfel dacă 80 ≤ invitati ≤ 200 ȘI buget_muzica ≥ cost_estimat_formatie:
      → Formație + DJ
  altfel dacă invitati > 200 ȘI buget_muzica ≥ cost_estimat_formatie:
      → Formație completă
  altfel:
      → DJ (buget insuficient)
```

### 5.6 Alocarea bugetului pe categorii

Procente implicite ajustate de prioritizarea mirilor prin drag&drop.

| Categorie | % implicit |
|---|---|
| Locație + Catering | 48% |
| Muzică | 9% |
| Foto-Video | 11% |
| Decor + Flori | 9% |
| Ținute | 8% |
| Băutură (dacă mod `cost`) | 6% |
| Invitații + mărturii + tort | 5% |
| Diverse / Neprevăzute | 4% |

### 5.7 Verificări de fezabilitate (sanity checks)

- `cost_per_persoana_catering < prag_minim_regiune` → avertizare
- `suma_sloturi_invitati` inconsistentă → notă (nu eroare)
- `total_budget` lipsă → calcule doar pe cantități, nu pe cost

---

## 6. Specificația API

REST/JSON, autentificare JWT (Bearer). Rutele sub `/api/v1`.

### Autentificare & conturi

```
POST   /auth/register            { email, password, full_name, user_type }
POST   /auth/login               { email, password } → { token, user_type }
POST   /auth/verify-email        { token }
POST   /auth/refresh
```

### Nunta (eveniment)

```
POST   /weddings                 creează nunta (owner)
GET    /weddings/:id
PATCH  /weddings/:id             update parțial
DELETE /weddings/:id
```

### Membri

```
GET    /weddings/:id/members
POST   /weddings/:id/members     { email, role, permission }
PATCH  /weddings/:id/members/:mid
DELETE /weddings/:id/members/:mid
POST   /members/accept-invite    { invite_token }
```

### Sloturi

```
GET    /weddings/:id/slots
POST   /weddings/:id/slots       { slot_type, start_time, location_name, ... }
PATCH  /weddings/:id/slots/:sid
DELETE /weddings/:id/slots/:sid
```

### Motorul de calcul

```
GET    /weddings/:id/calculations
       → output-ul motorului (bauturi, dulciuri, sala, muzica, buget, warnings)
POST   /weddings/:id/calculations/recompute
```

### Furnizori (Marketplace)

```
GET    /vendors                  liste furnizori cu filtre (categoria, regiune, rating)
GET    /vendors/:id              detalii furnizor
POST   /vendors                  înregistrare furnizor
PATCH  /vendors/:id              update profil furnizor
```

### Lead-uri și Mesaje

```
GET    /weddings/:id/vendors     lista furnizori recomandați pentru nunta asta
POST   /weddings/:id/leads       { vendor_id, message } → creează cerere
GET    /leads                    (mire) liste propriile cereri
GET    /vendors/:id/leads        (furnizor) liste propriile lead-uri
PATCH  /leads/:id/status         { status: 'contacted' / 'converted' / 'lost' }

# Debloc mesaj (CPL)
POST   /leads/:id/unlock         { payment_intent_id } → deblochează și marcează paid

# Abonament furnizor
POST   /subscriptions            { vendor_id, tier } → Stripe Checkout Session
PATCH  /subscriptions/:id        { action: 'cancel' }
GET    /subscriptions/:id/status
```

### Messaging (chat după debloc)

```
GET    /leads/:id/messages       lista mesaje din converație
POST   /leads/:id/messages       { message_text } → trimite mesaj
```

---

## 7. Structura site-ului și UI

### 7.1 Zona publică (pre-login)

- **Landing page**: prezentare, "Cum funcționează", exemple, CTA
- **Despre / Întrebări / Blog** (din WordPress headless)
- **Înregistrare / Autentificare**

### 7.2 Dashboard mirlor (post-login)

**a) Overview**
- Card cu data nunții / countdown
- Progres planificare (%)
- Carduri-rezumat: buget, invitați, sloturi
- Recomandări rapide din engine

**b) Detalii eveniment**
- Tip nuntă, dată, regiune, stil

**c) Sloturi (Programul zilei)**
- Editor pentru fiecare slot
- Panou rezultate: „Ai nevoie de X dulciuri, Y șampanie, Z pahare"

**d) Invitați**
- Nr. adulți și copii

**e) Buget**
- Input buget total, prioritizare drag&drop
- Grafic donut alocare

**f) Planul generat (Recomandări)**
- Tabel băuturi, dulciuri, sală, muzică
- Verificări și avertizări
- Buton export PDF

**g) Furnizori Recomandați**
- Cardul fiecărui furnizor: categorie, rating, regiune
- Buton: „Contactează" → formular cerere
- Cereri trimise: status și timeline

**h) Setări & Membri**
- Gestionare emailuri, roluri, permisiuni

### 7.3 Dashboard furnizor (post-login)

**a) Overview**
- Statistici: cereri noi, deblochete, convertite
- Status abonament: "Activ până pe [zi/lună]" sau "Per lead: 10/15/30 RON"

**b) Cereri Primite**
- Tabel cu lista: Nume mire, Data, Regiune, Status
- Mesaj: 🔒 Blocat (dacă nu e deblocheat)
- Buton: „Deblochează & Plăteşte" (CPL) sau „Citeşte" (dacă abonament activ)

**c) Mesaje Deblocate**
- Lista cu contact deblocheat
- Opțiune de chat pe platformă (nice-to-have)
- Posbilitate exportare CSV

**d) Abonament**
- Status: Active / Pauzat / Anulat
- Următoarea reînnoire: [zi lună]
- Buton: „Anulează" (cu confirmare)
- Buton: „Upgrade la alt tier"

**e) Analytics**
- Grafice: cereri/luna, conversie %
- ROI calculator

**f) Setări**
- Date business, categorie, regiuni, website
- Conectare Stripe (dacă nu e conectat)
- Referral link (opțional)

### 7.4 Principii de design

- Responsive (Faza 1 pe mobil via browser)
- Salvare automată
- Recalcul live
- Design curat, profesional

---

## 8. Roluri și permisiuni

| Rol | Permisiune | Editare eveniment | Vedere buget | Invitare membri |
|---|---|---|---|---|
| Mire / Mireasă | `owner` | Da | Da | Da |
| Părinte | Configurabil | Configurabil | Configurabil | Nu |
| Naș | Configurabil | Configurabil | Configurabil | Nu |
| Viewer | `viewer` | Nu | Nu | Nu |

---

## 9. Sistemul de Lead-uri și Monetizare

### 9.1 Principiul de bază

**NuntaPlanner este o platformă de organizare și lead-uri, NU o platformă de plată.**

- Mirii folosesc calculatorul **gratuit** și contactează furnizori.
- Mirii și furnizori negociază și achită serviciile **DIRECT**, în afara NuntaPlanner.
- **NuntaPlanner nu gestionează bani de la miri.**
- **NuntaPlanner colectează bani doar de la furnizori**: plăți CPL și abonamente lunare.

### 9.2 Categoriile furnizorilor și Prețuri per Lead

#### **TIER 1 — BUGET (10 RON/lead, 100 RON/lună abonament)**

Fotografi, Videografi, Coafor & Makeup Artist, Papeterie Luxury & Invitații, Decoruri & Baloane, Dulciuri & Candy Bar, Tort & Patiserie, Ținute & Închiriere Costume, Transport & Închiriere Mașini.

#### **TIER 2 — MEDIU (15 RON/lead, 200 RON/lună abonament)**

DJ & Sound (orice nivel), Florar & Designer Floral (orice nivel), Fotografi (orice nivel), Videografi (orice nivel), Animator & Entertainer, Creatoare Rochii & Tailoring, Designer & Styling Eveniment, Planner & Coordinator Parțial, Gazebo & Mobilier Exterior, Photo Booth & Entertainment Tech.

#### **TIER 3 — PREMIUM (30 RON/lead, 500 RON/lună abonament)**

Restaurante & Catering, Săli de Evenimente & Locații, Formații Live & Cântareți, Planificatori Full-Service, Event Production & Tehnologie, After-Party, Honeymoon Planner & Travel, Inel & Bijuterii, Închiriere Mobilier & Decor Premium.

### 9.3 Fluxul de Lead-uri

```
MIRE (GRATUIT, FĂRĂ PLATĂ)
├─ Vede card furnizor
├─ Clic: „Contactează"
├─ Formular: email, telefon, data, mesaj
└─ Submit

BACKEND
├─ Creează lead în DB (status: 'new', blocat)
├─ Trimite EMAIL furnizor: „Ai o nouă cerere!"

FURNIZOR (PLĂTITOR)
├─ Primeşte notificare email
├─ Intră în dashboard
├─ Vede cerere: 🔒 Blocat
├─ DECIZIE:
│  ├─ Plată CPL: Clic „Deblochează & Plăteşte [5/10/20] RON"
│  │  └─ Stripe Checkout (one-time)
│  │     └─ Success → Mesaj deblocheat instant
│  │
│  └─ Are abonament activ: Mesaj instant deblocheat (0 RON suplimentar)
│
├─ Vede: email, telefon, mesajul complet al mirilor
└─ Contactează direct mirul (WhatsApp, telefon, email) pentru negociere serviciu & preț

NEGOCIERE ȘI PLATĂ (AFARA PLATFORMEI)
├─ Furnizor și mire discută detalii și preț
├─ Se aranjează plată directă:
│  ├─ Cash pe zi
│  ├─ Transfer bancar
│  ├─ Card mireilor (al mireului/miresei, nu al platformei)
│  └─ Alte metode
└─ Serviciul se prestează
```

**CLARIFICARE CRUCIALĂ:** Mirii NU plătesc NIMIC pe NuntaPlanner. Furnizori contactează miri și-și aranjează plătile direct. NuntaPlanner este doar intermediar pentru lead-uri și chat.

### 9.4 Abonament Lunar — Reînnoire pe Data Calendaristică

#### **Mecanică**

Abonamentul se reînnuiește **pe aceeași dată a lunii calendaristice**, nu la 30 de zile.

**Exemple:**

```
EXEMPLU 1:
├─ Furnizor se abonează pe 10 ianuarie (joi, ora 14:00)
├─ Reînnoire automată: 10 februarie, 10 martie, 10 aprilie, etc.
├─ Dacă anulează pe 9 februarie → plata februarie NU se efectuează
├─ Dacă anulează pe 10 februarie (ora 00:00) → prea târziu, a fost deja plătit
└─ Acces se termină pe 10 martie, ora 00:00

EXEMPLU 2 (Luna cu zi lipsă):
├─ Furnizor se abonează pe 30 ianuarie
├─ Reînnoire automată: 28/29 februarie (ultima zi disponibilă în februarie)
├─ Reînnoire: 30 martie, 30 aprilie, etc.
└─ Algoritm: dacă luna nu are ziua specificată, reînnoire pe ultima zi a lunii

EXEMPLU 3 (Anulare și reactivare):
├─ Furnizor are abonament, anulează pe 9 martie
├─ Acces se termină pe 10 martie
├─ Pe 20 martie, se reabonează
├─ Noua dată de reînnoire: 20 aprilie, 20 mai, etc. (reseteaza data, nu revine la inițial)
```

#### **Cutoff pentru Anulare**

Furnizor poate anula oricând, dar:
- **Până la 0 zile înainte de reînnoire** (la ora 00:00, ziua reînnoririi) → plata NU se efectuează
- **După ora 00:00** → plata a fost deja procesată; anularea ia efect pentru luna următoare

**Alert-uri:**
- 7 zile înainte: Email „Abonamentul se reînnuiește pe [zi/lună]"
- 1 zi înainte: Email „Azi e ultima zi pentru anulare!"
- După reînnoire: Email „Abonament reînnuit. Următoarea reînnoire: [zi/lună]"

#### **Care sunt Beneficiile Abonamentului**

- Acces **nelimitat** la TOATE cererile primite (fără cost suplimentar per mesaj)
- Status pe dashboard: „Abonament activ până pe [zi/lună]"
- Mesajele noi se deblochează instant
- Furnizor contactează direct miri pentru negociere & plată

### 9.5 Plată CPL (Per Lead)

**One-time payment per mesaj deblocheat:**

```
Titlu: „Deblochează mesajul complet"
Preț: 10 / 15 / 30 RON (în funcție de tier)
Descriere: „Mesaj de [Mire], [Data Evenimentului], [Regiune]"
Destinație: NuntaPlanner (nu mire)
Opțiuni plată: Card Stripe

După SUCCESS:
├─ Mesaj deblocheat instant pe platformă
├─ Furnizor vede: email, telefon, mesajul mireilor
├─ Email: chitanță 10/15/30 RON
└─ Furnizor contactează direct mire pentru negociere
```

**CLARIFICARE:** Plata CPL e doar pentru **accesul furnizorului** la mesajul mirilor, NU pentru serviciile furnizorului. Serviciile se achită direct între furnizor și mire, în afara platformei.

### 9.6 Onboarding Furnizor (5 Minute)

```
1. Înregistrare: Email + Parolă
2. Date Business: Nume, categorie, regiuni, descriere, logo
3. Conectare Stripe: Clic → KYC (Stripe verifică)
4. Model Plată: Alege CPL sau Abonament
5. Verificare Platformă: Upload foto + document
   └─ 24-48 ore, manager verific adresă/existență
6. Approval: Email „Ești listat în platformă!"

OPȚIONAL: Referral link pentru a invita alți furnizori
```

### 9.7 Referral Program

Furnizor invită alți furnizori → dacă noul furnizor e **verificat de platformă** → invitator primește **1 lună abonament gratuită**.

```
Limite:
- Max 5 invitații/lună per furnizor
- Noul furnizor trebuie activ 30 zile
- Abonament gratuit se aplică la luna curentă sau următoare (nu se cumulează)
```

### 9.8 Review & Rating

**După eveniment:**
- Furnizorul evaluează mirii pe scara 1-5:
  - ⭐ 1: Fals / inexistent
  - ⭐⭐ 2: Neserios / nu a răspuns
  - ⭐⭐⭐ 3: Caută preț mic / Negociază prețul
  - ⭐⭐⭐⭐ 4: Serios, dar se decide greu
  - ⭐⭐⭐⭐⭐ 5: Serios și hotărât

de asemenea, 

- Mirii evaluează furnizorul pe scara 1-5:
  - ⭐ 1: Neserios / Nu a prestat serviciul
  - ⭐⭐ 2: Nu răspunde la solicitări
  - ⭐⭐⭐ 3: Servicii de calitate slabă
  - ⭐⭐⭐⭐ 4: Servicii de calitate medie
  - ⭐⭐⭐⭐⭐ 5: Servicii de calitate excelentă

- Comentariu opțional
- Rating cumulativ vizibil pe card furnizor

### 9.9 Monitorizare și Abuse Prevention

- Mirii raportează lead-uri false / bot-uri
- Furnizori raportează lead-uri din alte platform/neserios
- Flagging și suspension pentru abuzuri
- Refund-uri parțiale pentru lead-uri confirmate false

---

## 10. CMS de conținut — WordPress headless

Pe lângă dashboard de planificare, site-ul are **pagini de conținut și articole de blog** optimizate SEO. Sursa: WordPress pe `cms.domain.ro`, consumat headless de Next.js.

### 10.1 Conectarea și Slug-ul

**Endpoint:** `https://cms.domain.ro/wp-json/wp/v2/` (REST API) sau `/graphql` (WPGraphQL).

**Regula slug:** Mapare plată pe URL site-ul:
```
Rută site: /pagina/sub-pagina
Slug WordPress: pagina-sub-pagina

Rută site: /blog/cum-calculezi-bautura
Slug WordPress: blog-cum-calculezi-bautura
```

Next.js fetch după slug plat, randează conținut Gutenberg + parse-ază shortcodes.

### 10.2 Shortcodes Inline

[faq] — Acordeon FAQ cu schema markup JSON-LD

[faq] Întrebări frecvente
Intrebare1? | Raspuns1.
Intrebare2? | Raspuns2.

[versus] X vs Y
Despre X | Despre Y
Despre X | Despre Y

[cta title="Titlu CTA" text="Mesaj de tip engaging CTA." button="Hook CTA" href="/xxxxxx"]

[search]

```

### 10.3 SEO și Schema Markup

- Meta title, description din plugin SEO
- JSON-LD `FAQPage` pentru `[faq]`
- Canonical, Open Graph
- Sitemap generat de Next.js

---

## 11. Faza 2 — Aplicația mobilă

- Native iOS (Swift/SwiftUI) și Android (Kotlin/Jetpack Compose)
- Consumă **același API v1** — zero logică duplicată
- Funcții native: push notifications, calendar integration, offline sync
- Autentificare partajată cu web

---

## 12. Stack tehnologic recomandat

| Strat | Recomandare | Alternativă |
|---|---|---|
| Frontend web | Next.js (React) + TypeScript | Nuxt/Vue |
| Stilizare | Tailwind CSS + shadcn/ui | CSS Modules |
| Backend | Node.js (NestJS) sau Python (FastAPI) | Go |
| Bază de date | PostgreSQL + Supabase | — |
| Cache / sesiuni | Redis | — |
| Stocare media | S3 / Cloudflare R2 | — |
| Auth | Supabase Auth (JWT) | Auth0 |
| Pagini de plată | Stripe (CPL + abonamente furnizori) | Paddle |
| CMS | WordPress headless (cms.domain.ro) | Strapi, Sanity |
| Mobil (Faza 2) | Swift (iOS), Kotlin (Android) | Flutter, React Native |
| Hosting | Vercel (web) + container backend (Railway/Render) | — |

**Calculation Engine:** modul izolat, testat complet, fără dependențe de DB. Reutilizabil web + mobile.

---

*Sfârșit document — Versiune 1.2*
*Schimbări principale vs v1.1: Clarificare că mirii nu plătesc prin platformă; abonament reînnuire pe data calendaristică; integrare completă a sistemului de lead-uri.*
