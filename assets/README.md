# App assets

All production app assets are generated from `teelesson-logo.png`, the
user-supplied TeeLesson TL brand mark. Regenerate them with:

```powershell
npm run assets:generate
```

| File | Size | Purpose |
|------|------|---------|
| `teelesson-logo.png` | 183x183 | Canonical user-supplied TL brand mark |
| `icon.png` | 1024×1024 | iOS and web app icon |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground |
| `splash.png` | 1284×2778 | Launch splash on the workspace navy background |
| `favicon.png` | 48×48 | Web favicon |
| `social-card.svg` | 1200×630 | First-party social preview source |
| `mobile-app-preview.png` | 390×844 | First-party app screenshot used in the coach sidebar |
| `coach-dashboard.png` | 1280×720 | First-party screenshot captured from the live local TeeLesson dashboard for the marketing homepage |

The generator also writes 192 and 512 pixel web icons plus the social preview
PNG to `public/`.

The TL logo is a user-supplied first-party brand asset. The remaining generated
PNG files are derived from it and require no external attribution.
