# App assets

Drop the following image files here before building (referenced by `app.json`):

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App icon |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground |
| `splash.png` | 1284×2778 | Launch splash (deep green bg `#14532d`) |
| `favicon.png` | 48×48 | Web favicon |

Until these exist, `expo start --web` runs fine (with a warning). A production
build (`eas build` / `expo export`) requires them.
