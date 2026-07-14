# Visual coverage map

Updated: 2026-07-13

## Coach workspace

| State | Required content | Evidence |
|---|---|---|
| Dashboard | Functional timeframe controls, coaching brief, five metrics, fluid focus grid, AI Coach expanded, Operations Hub, Action Center, Spotlight, activity, Performance, Upcoming, Communication, Wins, true bottom | `artifacts/visual/forest-reference/final/*/dashboard/` |
| Students | Search, filters, pending requests, roster grid, true bottom | `artifacts/visual/forest-reference/final/*/students/` |
| Schedule | Day, week, month, year controls, populated calendar, true bottom | `artifacts/visual/forest-reference/final/*/schedule/` |
| Lessons | Populated session list and true bottom | `artifacts/visual/forest-reference/final/*/lessons/` |
| Messages | Conversation list, selected thread, composer | `artifacts/visual/forest-reference/final/*/messages/` |
| Programs | Populated program cards | `artifacts/visual/forest-reference/final/*/programs/` |
| Payments | Collected summary, unpaid rows, mutation controls | `artifacts/visual/forest-reference/final/*/payments/` |
| Reports | KPI cards and annual chart | `artifacts/visual/forest-reference/final/*/reports/` |
| Videos | Populated review library | `artifacts/visual/forest-reference/final/*/videos/` |
| Drills | Populated drill library | `artifacts/visual/forest-reference/final/*/drills-library/` |
| Settings | Profile form, availability, true bottom | `artifacts/visual/forest-reference/final/*/settings/` |

Coach routes are captured at 1812 by 893, 1440 by 900, 1024 by 768,
768 by 1024, 390 by 844, and 360 by 740. Scroll positions are calculated from
the rendered container for each route and viewport. Dedicated phone captures
cover the More menu and expanded and collapsed AI Coach states.

## Public, auth, and player routes

Fresh signed-out captures cover landing, login, sign-up, public coach,
features, for-coaches, privacy, and terms at 1536 by 1024 and 390 by 844 under
`artifacts/visual/forest-reference/final/public/`.

Fresh player-mode captures cover My Lessons and Book a Lesson at the same sizes
under `artifacts/visual/forest-reference/final/player/`.

## Functional states exercised

- Student search and profile navigation
- Message compose and send
- Demo payment mutation without Firestore writes
- New lesson form reachability
- Every Action Center destination
- AI Coach recommendation to student profile
- Every desktop tab and every phone More-menu destination
- Public route and player mode runtime error collection
- Realtime loading behavior through coach hooks

Native permission dialogs, push delivery, keyboard-open layouts, real Google
sign-in, offline recovery, and store-distributed builds still require device or
service-bound validation.
