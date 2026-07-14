# App assets

All production app assets are generated from `brand-mark.svg`, the original
TeeLesson flag-and-ball mark created in this repository. Regenerate them with:

```powershell
npm run assets:generate
```

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | iOS and web app icon |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground |
| `splash.png` | 1284×2778 | Launch splash on the workspace navy background |
| `favicon.png` | 48×48 | Web favicon |
| `social-card.svg` | 1200×630 | First-party social preview source |
| `mobile-app-preview.png` | 390×844 | First-party app screenshot used in the coach sidebar |

The generator also writes 192 and 512 pixel web icons plus the social preview
PNG to `public/`.

The SVG and generated PNG files are first-party project assets. They contain no
third-party artwork, photography, fonts, or trademarked visual material.
