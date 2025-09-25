# Fingyaan

A multi‑page, mobile‑first HTML + CSS + Vanilla JavaScript project to help students budget, simulate micro‑investing, and learn financial literacy. No external frameworks.

## Run locally
- Open `index.html` in your browser directly, or
- Serve with any static server (recommended for fetch of JSON files):
  - Python: `python -m http.server 8000` then open http://localhost:8000
  - VS Code Live Server or any simple HTTP server
  - https://fingyaan-eco.netlify.app  deployed link
## Structure
- `/index.html` — Landing with hero, features, carousel
- `/budget.html` — Budget dashboard, LocalStorage, CSV export, pie chart
- `/invest.html` — Allocation sliders, risk score, compound growth graph, news feed
- `/learn.html` — Articles, glossary, video embed, quiz with badges
- `/profile.html` — Avatar upload preview, stats, theme toggle, reset data
- `/admin.html` — Optional insights charts from local data
- `assets/css/style.css` — Theme variables (light/dark), responsive layout, animations
- `assets/js/common.js` — Theme toggle, carousel, helpers
- `assets/js/budget.js` — Budget logic
- `assets/js/invest.js` — Investment simulator logic
- `assets/js/learn.js` — Quiz logic
- `assets/js/profile.js` — Profile and data reset
- `assets/data/*.json` — Sample portfolios, news, quiz

## Theme
Primary palette based on the requested colors:
- `#FFECC0`, `#FFC29B`, `#F39F9F`, `#B95E82`
- `rgb(255, 236, 192)`, `rgb(255, 194, 155)`, `rgb(243, 159, 159)`, `rgb(185, 94, 130)`

Dark mode is toggled via the 🌓 button and persisted in LocalStorage.

## Notes
- All data is stored in the browser via LocalStorage. Use `Profile → Reset All Data` to clear.
- Charts are drawn with `<canvas>` and no external libraries.
- Replace images and video placeholders under `assets/images/` as desired.

## Customization
- Color theme: edit CSS variables in `assets/css/style.css` under `:root` and `:root.dark`.
- Quiz: edit questions in `assets/data/quiz.json`.
- Portfolios and news: edit `assets/data/portfolios.json` and `assets/data/news.json`.
