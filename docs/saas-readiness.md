# SaaS readiness

Updated: 2026-07-13

| Criterion | Status | Target | Implementation and test evidence | Risk and next action |
|---|---|---|---|---|
| Real pain point | not verified | Confirm recurring admin cost with 5 active coaches | Product contract and current alternative analysis exist | No direct interview or support evidence in this repository |
| Fast time to value | not verified | Student plus first lesson in under 5 minutes | Direct invite and session flows exist | Add onboarding telemetry and timed usability test |
| Differentiation | pass | One clear workflow difference | Today converts lesson, practice, student, communication, and revenue context into a routed Action Center | Revalidate against market before launch |
| Simple interface | pass | Primary action visible on every target | Screenshot matrix and critical-flow tests | Continue testing long real-world content |
| Smooth onboarding | not verified | Activation without dead ends | Auth and sign-up screens are reachable | First-run, invited, interrupted, and failure paths need dedicated tests |
| Reliability and perceived speed | not verified | p95 common interaction under 200 ms after load | Realtime hooks stop loading on errors; demo mutations are isolated | Define production SLOs and measure live dependencies |
| Behavior analytics | fail | Activation, booking, completion, failure, return | Vercel page analytics package exists | Add privacy-reviewed product event taxonomy and implementation |
| Scalable architecture | not verified | Bounded tenant queries and tested isolation | Firestore coach and player filters plus security rules exist | Load, tenant-isolation, restore, and duplicate-event tests are missing |
| Value-aligned pricing | not verified | Price against active student or coaching revenue value | Marketing tiers exist | Payment, entitlement, downgrade, cancellation, and recovery are not implemented |
| Contrast and hierarchy | pass | WCAG-readable core surfaces | Bright emerald actions use forest labels; operational green and muted text were corrected until the Axe scan passed | Extend automation to keyboard order and native font scaling |
| Information density | pass | No unnecessary drilling on Today | The coaching brief, five KPIs, complete Operations Hub, and Student Spotlight fit in the first large-desktop frame; the uncapped canvas expands with the window | Validate with coaches who manage larger rosters |
| Intentional color | pass | Emerald only for action, success, selection, and live data | Shared forest-white token system and 207 reviewed screenshots | None in changed scope |
| Component consistency | pass | Shared cards, controls, inputs, badges | Shared UI kit drives existing and new workspaces | Continue removing isolated legacy radii |
| Feedback motion | pass | No blocking or decorative motion | Desktop tab motion removed; mobile uses restrained shift | Add reduced-motion device verification |
| Standard iconography | pass | Familiar labeled icons | Ionicons with text labels and accessible names | Native SF Symbol migration is optional |
| Scalable typography | pass | Data, labels, headings remain readable across matrix | Five responsive dashboard sizes pass | Device font-scaling extremes not yet verified |
| Theme flexibility | fail | Light, dark, and system themes | The requested fixed white canvas with dark forest structure is implemented consistently | User-selectable light, dark, and system modes are not implemented |
| Minimalist focus | pass | One primary action per surface | New, Book, and contextual actions are visually distinct | None in changed scope |
| Responsive layouts | pass | Desktop, tablet, small and large phone | Coach suite passes six sizes; signed-out and player modes pass desktop and phone capture matrices | Browser emulation does not prove native safe-area rendering |
