# M-Hike — Hiker Management App

Coursework for **COMP1786 Mobile Application Design and Development** (University of Greenwich, 2025/26).

M-Hike lets hikers record planned hikes, add observations during a hike, and search their records. Data is stored in the cloud so hikes can be shared with the community.

The submission consists of **two apps sharing one Firebase backend**:

| App | Features | Tech |
|---|---|---|
| Native Android | a) Enter hikes, b) Store/view/delete/reset, c) Observations, d) Search | Java, Android SDK, MVVM |
| Cross-platform | e) Prototype, f) Persistence, g) Additional features | React Native (approved by partnership centre, replacing Xamarin/MAUI) |

**Build order (confirmed):** React Native app first (features e–g, covering the full functional scope of a–d as reference implementation), then port a–d to native Android Java.

---

## Key design decisions (confirmed)

1. **Firebase Firestore for ALL persistence — no SQLite.**
   - Both apps connect to the same Firestore project, same collections, same field names.
   - Rationale: real cloud sharing (the spec's end goal), realtime sync between the two apps, one schema to maintain.
   - Accepted trade-off: deviates from the literal "SQLite database" wording in the spec (risk acknowledged); mitigated by enabling Firestore **offline persistence** in both apps so the apps still work without a network.
2. **MVVM from the start** (not MVC) for the Android app.
   - Reasons: Firestore snapshot listeners survive rotation inside ViewModel (no leak / duplicate callbacks); ViewModels are unit-testable; form state survives configuration changes.
   - React Native reaches the same separation of concerns via Context API + hooks (hooks/state play the ViewModel role).
3. **Email/Password Authentication** (Firebase Auth).
   - Every document carries a `userId`; Security Rules allow public read (sharing) but only the owner can update/delete. Users register/sign in with email + password (Login/Register screens); no anonymous fallback.
4. **Feature g) choice:** automatic location capture + external weather API (OpenWeatherMap) — covers two of the spec's suggested enhancements ("pick up the location automatically" + "use an external web service") in one implementation.
5. **Design process follows the SCADET framework** (System requirements → Considerations → Architecture & API design → Evaluation → Trade-offs). Reference: Fahim ul Haq, "A detailed guide on Mobile System Design", Medium, 2026.

---

## SRS summary

### Functional requirements

| ID | Feature | Required fields | Optional fields |
|---|---|---|---|
| FR1 (a) | Enter hike details, validate, confirm before save | name, location, date, parking (Yes/No), length, difficulty | description, estimatedDuration, terrainType |
| FR2 (b) | List / view / edit / delete hikes, reset database | — | — |
| FR3 (c) | Add observations to a hike (multiple per hike) | observation text, time (defaults to now) | comments |
| FR4 (d) | Search by name (prefix match); advanced: name + location + length + date | — | — |
| FR5 (e) | Cross-platform prototype of FR1 (React Native) | — | — |
| FR6 (f) | Cross-platform persistence of FR2 (React Native + Firestore) | — | — |
| FR7 (g) | Location capture + weather via OpenWeatherMap | — | — |

Validation: missing required field → inline error message under the field (red), field focused. Confirmation screen shown before every save, with Edit to go back.

### Non-functional requirements

- No crashes, no sluggishness; usable without a manual (marked criteria).
- Works offline via Firestore offline persistence; syncs automatically when reconnected.
- Battery: detach snapshot listeners when screens are not visible.
- Screen sizes: layouts built with ConstraintLayout (Android) / Flexbox (RN); tested on phone + tablet emulators. Target Android 8+.
- Security: no hardcoded secrets; Firestore Security Rules enforce per-user write access.

---

## Architecture

Layered architecture + Repository pattern, MVVM on Android.

**Android (Java):**

```
Activity / Fragment          (Presentation — observes LiveData, renders)
        ↓ observes
ViewModel  (LiveData)        (holds screen state, survives rotation)
        ↓ calls
Repository                   (HikeRepository, ObservationRepository — all CRUD/queries)
        ↓ Firebase Android SDK
Firebase Firestore           (collections: hikes, observations)
```

**React Native:**

```
Screens (Home, Entry, Detail, Observations, Search)
        ↓ useContext / hooks
FirebaseContext → services   (hikeService.js, observationService.js)
        ↓ Firebase JS SDK
Same Firestore project
```

Rules:
- UI **never** calls Firestore directly — everything goes through Repository/services.
- ViewModels hold no reference to Activities/Views.
- Model classes (Hike, Observation) are plain POJOs / JS objects mapping 1:1 to Firestore documents.
- Backend model is **BaaS (serverless)**: the Firebase SDK is the API layer; no custom REST server. Weather feature adds one extra branch: `service → OpenWeatherMap REST API`.

---

## Data model (Firestore)

### Collection `hikes`

| Field | Type | Notes |
|---|---|---|
| id | string | document id (auto) |
| userId | string | owner (Firebase Auth UID) |
| name | string | required |
| location | string | required |
| hikeDate | timestamp | required |
| parkingAvailable | boolean | required |
| length | number | required, km |
| difficulty | string | required: Easy / Moderate / Hard |
| description | string | optional |
| estimatedDuration | string | custom field 1 |
| terrainType | string | custom field 2 |
| createdAt / updatedAt | timestamp | server timestamps |

### Collection `observations`

| Field | Type | Notes |
|---|---|---|
| id | string | document id (auto) |
| hikeId | string | reference to hikes.id |
| userId | string | owner |
| observationText | string | required |
| observedAt | timestamp | required, defaults to now |
| comments | string | optional |
| latitude / longitude | number | feature g |
| weather | map | feature g, cached OpenWeatherMap response |

Security Rules (summary): authenticated users can read all documents (sharing); create requires `request.auth.uid == userId`; update/delete only by owner. Full rules in `firestore.rules`.

---

## UI screens (designed, confirmed)

Android bottom navigation: Home · Add Hike · Hikes · Search.

1. **Home dashboard** — totals, recent hikes
2. **Add New Hike** — form, inline validation
3. **Confirm Hike** — review before save, Edit / Save
4. **All Hikes** — list, FAB add; overflow menu (⋮) holds **Reset database** with confirm dialog
5. **Hike Details** — full details, Edit / Delete / View observations
6. **Observations list** — per hike, item menu for edit/delete
7. **Add/Edit Observation** — same form both modes; delete icon in header
8. **Search** — name search + **Advanced** expander (location, length, date filters)
9. **Login / Register** — email + password, inline validation, shown when signed out

---

## Conventions

**Android:** package `com.example.mhike` (`activities/`, `viewmodels/`, `repositories/`, `models/`, `adapters/`, `utils/`). Classes PascalCase, methods/vars camelCase, layouts `activity_*.xml` / `item_*.xml`. Java code conventions per Oracle standard.

**React Native:**

```
MHikeRN/
├── src/
│   ├── components/     # reusable UI parts
│   ├── screens/        # HomeScreen, EntryScreen, DetailScreen, ObservationScreen, SearchScreen
│   ├── navigation/     # React Navigation setup
│   ├── services/       # hikeService.js, observationService.js, weatherService.js, authService.js
│   ├── context/        # FirebaseContext
│   └── App.js
├── index.js
└── package.json
```

Comments: meaningful, explain *why* not *what*. Any borrowed code referenced explicitly (plagiarism policy).

---

## Report notes (COMP1786 template)

- Section 1: feature checklist + **video link** (≈15 min demo, record before finishing the report).
- Section 2: screenshots per feature, captioned — capture as each feature is completed.
- Section 3: reflection ~350 words — keep a running log of lessons learned during development.
- Section 4: evaluation 700–1000 words **as criteria tables with academic references** (Nielsen 1993; ISO 9241-210:2019; Shneiderman 2010; OWASP Mobile Top 10; Material Design guidelines). Cover: HCI, Security, Screen sizes, Live deployment changes.
- Section 5: folder structure figures for **both** apps + key source code, labelled with file and language.