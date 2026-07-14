# TeeLesson

**Lesson Management & Booking Platform for Golf Pros**

Manage players, schedule lessons, share lesson plans, and review swing videos
in one clean platform built for independent golf coaches and teaching pros.
Runs on **iOS, Android, and the web** from a single Expo + React Native codebase,
with a **Firebase** backend and a responsive web dashboard for full management.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| App | React Native 0.81 + **Expo SDK 54** (iOS / Android / Web) |
| Styling | **NativeWind v4** (Tailwind classes), golf-green professional theme |
| Backend | **Firebase**: Auth, Firestore, Storage |
| Data/State | **TanStack Query** + Firestore realtime listeners |
| Navigation | **React Navigation v7** (native-stack + bottom-tabs) |
| Web hosting | **Vercel** (`expo export -p web` → static `dist/`) |
| Mobile builds | **EAS Build** (`eas.json`) |

---

## Features (MVP)

**Scope:** replace a coach's text-message-and-paper-calendar chaos. Roster +
booking + a shareable page. Charge from day one; let coach requests decide what's
built next.

- **Auth & roles**: email/password + Google sign-in; `coach` and `player` roles
  with role-based navigation and Firestore-enforced access. Players join via a
  coach **invite link**. Keep the player side minimal (book + view only).
- **Coach dashboard**: responsive web layout with active players, lessons this month,
  pending booking requests, and quick actions.
- **Player CRM**: searchable roster; profiles with contact, handicap, goals,
  private notes, lesson history, and **progress tracking** (handicap, scoring
  average, GIR, fairways, putts, driving distance over time); invite via link.
- **Scheduling & booking**: coach availability (recurring + one-off), player
  booking requests, one-tap approve/decline, agenda calendar view. Supports
  individual lessons, **group sessions / classes** (multiple players), and
  player-less **online review blocks**. *(This is the feature they pay for.)*
- **Public booking page**: shareable `/coach/{slug}` that serves as both the
  booking entry point **and** the SEO marketing page (one page, two jobs).
- **Lesson payment status**: a simple "mark as paid" toggle per lesson for the
  coach's own tracking. No payment processing yet.

## Later (post-MVP, build once coaches are using it)

- **In-app payments**: Stripe (take payment at booking). Replaces the manual paid
  toggle.
- **Lesson plans**: reusable drills/goals/attachments shared per player.
- **Video review**: start with **link attach** (YouTube/cloud) on a lesson note
  for zero storage cost; only build native upload + comments + **drawing overlay**
  + **side-by-side comparison** when paying coaches ask, and gate it behind a
  higher tier to cover storage/bandwidth.
- **Messaging**: lightweight 1:1 coach ↔ player chat.

---

## Project structure

```
teelesson/
├── App.tsx                  # Providers: SafeArea, Query, Auth, Navigation
├── index.ts                 # Expo entry
├── global.css               # Tailwind directives (NativeWind)
├── app.json                 # Expo + web SEO config
├── tailwind.config.js       # Golf theme tokens (fairway / ink / sand)
├── firebase.json · firestore.rules · storage.rules · firestore.indexes.json
├── vercel.json · eas.json
└── src/
    ├── components/          # ui/ kit + domain components (PlayerCard, LessonCard, …)
    ├── screens/             # auth/ · coach/ · player/ · shared (Landing, Account, PublicCoachProfile)
    ├── navigation/          # RootNavigator + CoachTabs/PlayerTabs + param types
    ├── firebase/            # config, authService, dbService, storageService
    ├── hooks/               # useAuth, usePlayers, useLessons, useAvailability, …
    ├── types/               # shared domain interfaces
    ├── theme/               # color tokens + label maps for plain-JS use
    ├── lib/                 # queryClient
    └── utils/               # date / format helpers
```

---

## Getting started (Windows + PowerShell)

### 1. Prerequisites
- [Node.js LTS](https://nodejs.org) and Git
- (Optional) [Expo Go](https://expo.dev/go) on your phone for device testing

### 2. Install dependencies
```powershell
cd C:\Users\ND\Documents\GitHub\golfstructurepro
npm install
# Align native package versions with the installed Expo SDK:
npx expo install --fix
```

### 3. Configure Firebase
1. Create a Firebase project → add a **Web app**.
2. Enable **Authentication** (Email/Password + Google), **Firestore**, **Storage**.
3. Copy the web config values into a `.env` file (see `.env.example`):
   ```powershell
   Copy-Item .env.example .env
   ```
   Fill in each `EXPO_PUBLIC_FIREBASE_*` value. (These are safe to ship in a
   client bundle. Access is enforced by the security rules.)
4. Deploy the security rules + indexes:
   ```powershell
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

### 4. Add app assets
Drop `icon.png`, `adaptive-icon.png`, `splash.png`, and `favicon.png` into
`assets/` (see `assets/README.md`). Not required for `expo start --web`.

### 5. Run
```powershell
npm run web
# opens the current web app on http://localhost:19006

npm start
# press w → web · i → iOS simulator · a → Android emulator
```

The same responsive dashboard source is used by web, Expo Go, iOS, and
Android. The dedicated web port is also available as `npm run web:19006`.

### 6. Type-check
```powershell
npm run lint   # tsc --noEmit
```

---

## Deploying the web app to Vercel

```powershell
npx expo export -p web      # outputs static site to ./dist
```
`vercel.json` is preconfigured (build command + SPA rewrites). Either:
- Connect the repo in the Vercel dashboard (it runs the build command), or
- `npm i -g vercel && vercel --prod`

The public coach profile is reachable at `/coach/<slug>` and the marketing
landing page at `/`.

---

## Building mobile apps (EAS)

```powershell
npm install -g eas-cli
eas login
eas build --platform ios       # or android
```
Set your real `eas.projectId` in `app.json` and bundle identifiers as needed.

---

## Data model (Firestore)

| Collection | Key fields |
|------------|-----------|
| `users/{uid}` | `name, email, role, photoURL, coachId?, handicap?, goals?, goalItems?, notes?, bio?, specialties?, publicSlug?` |
| `lessons` | `coachId, playerId?, playerIds?, title?, seriesId?, date, startTime, duration, type, status, notes, paid?` |
| `progress` | `coachId, playerId, date, handicap?, scoringAverage?, gir?, fairways?, putts?, drivingDistance?, upDown?, sandSaves?, threePutts?` |
| `availability` | `coachId, date?/weekday?, recurring, startTime, endTime, type?` |

Security rules (`firestore.rules`, `storage.rules`): coaches own their data;
players can only read/write their own content.

---

## Notes & next steps

- **Auth persistence:** `getAuth()` is used for cross-platform simplicity. For
  persisted native sessions, wire `initializeAuth` with
  `getReactNativePersistence(AsyncStorage)`.
- **Google sign-in** uses a popup (web). Native Google auth needs
  `expo-auth-session` wiring (Phase 2).
- **Push notifications** are scaffolded via `expo-notifications` only; reminder
  delivery (Cloud Functions / Messaging) is Phase 2.
