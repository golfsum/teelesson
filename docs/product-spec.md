# TeeLesson product contract

Updated: 2026-07-13

## Product and user

TeeLesson is a coaching operations workspace for independent golf coaches and
small academies. It replaces the recurring mix of text threads, paper or shared
calendars, payment notes, and disconnected student progress records.

The primary user is a coach managing an active student roster. The buyer is the
coach or academy owner. Students use a smaller companion experience to request
lessons, review upcoming sessions, and see their coach relationship.

## Primary journey

1. A coach opens Today and sees the next lesson, five business metrics, AI
   guidance, and a prioritized list of work that deserves attention.
2. The coach opens a student, reviews goals and progress, then schedules a
   lesson or assigns follow-up work.
3. The coach handles requests, messages the student, records completion and
   payment status, and sees the result reflected in reports.
4. A student opens their compact app, checks the next lesson, and requests an
   available time.

Activation is the first completed student-plus-lesson setup. The target time to
first value is under five minutes and no more than four required actions after
account creation.

## Required behavior

- Preserve Firebase Auth, Firestore, Storage, realtime hooks, roles, deep links,
  availability, scheduling, progress, public profiles, and payment status.
- Provide coach workspaces for Today, Students, Schedule, Lessons, Messages,
  Programs, Payments, Reports, Videos, Drills, and Settings.
- Keep new demo-only data deterministic and clearly isolated from production.
- Make mutation controls work in demo mode without writing to Firestore.
- Support desktop, tablet, small phone, large phone, and common Android widths.
- Keep public landing, login, sign-up, public coach, legal, and player routes.

Payment processing, SMS delivery, native video annotation, and production push
delivery are explicit post-MVP integrations. Current payment functionality is a
coach-owned paid or unpaid status, not a payment processor.

## Visual contract

The user's local ClientPlot dashboard is the structural reference for the
work-first Today hierarchy, timeframe brief, metric row, and asymmetric focus
grid. The supplied 808 by 632 technical analytics reference remains the visual
target for density, card anatomy, compact controls, live-data accents, and chart
treatment. TeeLesson keeps its existing navigation, name, golf data, routes,
and integrations. The interface is responsive React Native code and does not
rasterize either reference.

## Acceptance checks

- The desktop dashboard has a persistent forest sidebar, timeframe controls,
  a coaching brief, five compact business metrics, a dominant Operations Hub, rich Student Spotlight,
  Performance, Upcoming Lessons, Communication Center, and Today’s Wins.
- The Action Center includes booking, payment, homework, video, and parent
  priorities. Every row opens the matching working route.
- The operational canvas has no dashboard maximum width and expands fluidly
  between the unchanged navigation rail and the window edge.
- Phones show the same combined dashboard with two-column business metrics,
  stacked Operations Hub, Student Spotlight, Performance,
  Communication Center, Today’s Wins, and a five-action bottom bar.
- Every visible control used by a critical flow is reachable and functional.
- Typecheck, web export, browser flows, and visual coverage pass without console
  errors.
- Screenshot coverage reaches the true bottom of every scrollable mapped state.
- No changed screen has blocking clipping, overlap, unreadable text, or dead
  navigation at the target sizes.
