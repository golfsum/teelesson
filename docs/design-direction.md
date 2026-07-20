# Reference-led design direction

Updated: 2026-07-13

## Source and intent

- Primary structural source: the user's local `ClientPlot/src/app/dashboard/page.tsx` dashboard
- Visual-system source: user-supplied `codex-clipboard-0c84551d-7def-4516-af63-3f91585f4b05.png`, 808 by 632
- Classification: ClientPlot is the target for information hierarchy and work-first dashboard anatomy; the supplied image remains the target for density, card anatomy, controls, chart treatment, and technical product character
- Explicit override: replace the reference's black workspace with white canvases, dark forest structure, and emerald actions
- Rights status: supplied by the user for this implementation
- Production use: responsive component and design-system guidance only

The production interface reuses the user's ClientPlot hierarchy without copying
its client, task, invoice, or project language. TeeLesson keeps its golf data,
existing navigation, routes, integrations, product name, and brand assets.

## Extracted system

The operational canvas is cool white `#F6FAF8`. Persistent navigation and
high-attention panels use deep forest `#031D18`. Emerald is reserved for live
state, primary actions, success, and selected navigation. Blue, orange, red,
and purple remain compact semantic accents.

Cards use 14 to 20 pixel continuous radii, thin green-gray borders, shallow
two-layer elevation, compact uppercase labels, tabular metrics, and small icon
tiles. Metric cards include a two-pixel live-data rail. Buttons and filter
controls use compact rounded geometry. Strong color never replaces readable
contrast.

## Dashboard composition

The dashboard combines ClientPlot's work-first composition with TeeLesson's
technical forest-white visual system:

1. Compact Today status, search, notifications, and primary action
2. Functional Today, This Week, and This Month segmented control
3. Timeframe-aware coaching brief with workload and attention indicators
4. Five chart-led business metrics
5. A fluid two-column work area with Operations Hub as the primary surface
6. A golf-specific Student Spotlight paired with the Operations Hub
7. Full-width recent activity, then Performance, Upcoming Lessons,
   Communication Center, and Today's Wins

The desktop workspace keeps a dark forest navigation rail and a white content
field. The content canvas has no desktop maximum width, so it expands to the
available edge after the persistent rail. Phone layouts retain the same
information order rather than switching to an unrelated legacy dashboard.

## Responsive rules

- 1500 pixels and above: 224 pixel rail, five metrics in one row, 1.65-to-1 primary work grid
- 1180 to 1499 pixels: 204 pixel rail, five metrics in one row and the same primary work grid
- 900 to 1179 pixels: 204 pixel rail, 3-plus-2 metric grid, two-column Operations Hub, horizontal activity, and two-column supporting cards
- 700 to 1023 pixels: bottom navigation and adaptive two-column workspace
- Below 700 pixels: two-column metrics, horizontal timeframe control, stacked hub, full-width actions
- Below 380 pixels: compact metric labels and tighter dashboard padding
- Forms and public routes retain readable maximum widths instead of stretching

## Assets and provenance

`assets/teelesson-logo.png` is the user-supplied first-party TeeLesson TL mark
used throughout the product and generated platform assets.
`assets/mobile-app-preview.png` is a first-party product capture.
`scripts/generate-assets.mjs` generates the app icon, adaptive icon, splash,
favicon, install icons, and social preview. Ionicons come from the installed
MIT-licensed Expo package. No reference artwork or third-party photography was
added.
