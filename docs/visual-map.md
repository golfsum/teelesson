# Visual coverage map

Updated: 2026-07-13

## Coach dark reference pass

| State | Required content | Evidence |
|---|---|---|
| Dashboard desktop | Dark shell, sidebar, top search, four metrics, upcoming lessons, attention, recent activity, coaching snapshot | `artifacts/visual/dark-final/dashboard-desktop.png` |
| Students desktop | Dark shell, filters, Add Student, table rows, target student order, progress sparklines | `artifacts/visual/dark-final/students-desktop.png` |
| Schedule desktop | Dark shell, Month/Week/List control, date range, calendar grid, colored lesson blocks | `artifacts/visual/dark-final/schedule-desktop.png` |
| Lesson Plans desktop | Back control, Save Plan, Alex Rivera plan header, tabs, checklist, drill card | `artifacts/visual/dark-final/lesson-plans-desktop.png` |
| Video Reviews desktop | Pending/Reviewed/All tabs, review rows, New badge, upload area | `artifacts/visual/dark-final/video-reviews-desktop.png` |
| Analytics desktop | 7D/30D/90D/1Y tabs, improvement chart, revenue and lesson charts | `artifacts/visual/dark-final/analytics-desktop.png` |
| Dashboard small desktop | Responsive dark dashboard at 1024 by 768 | `artifacts/visual/dark-final/dashboard-small-desktop.png` |
| Dashboard phone | Responsive phone dashboard with dark system and no old light dashboard | `artifacts/visual/dark-final/dashboard-phone.png` |

## Functional states exercised

- Student search and profile navigation.
- Schedule navigation and new lesson form reachability.
- Desktop tab navigation for Students, Schedule, Lesson Plans, Video Reviews,
  and Analytics.
- Dashboard action routing to Video Reviews and Schedule.
- Phone dashboard render and old-dashboard absence.

Native permission dialogs, keyboard-open states, push delivery, real Google
sign-in, offline recovery, and store-distributed native builds still require
device or service-bound validation.
