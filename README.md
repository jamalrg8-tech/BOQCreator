# ALUMIL BOQ Builder

An installable, offline-first web app (PWA) for producing bills of quantities for
aluminium doors, windows and curtain wall on **ALUMIL Middle East** systems.

Open a drawing, measure or key in each opening, and the app builds a priced,
sectioned BOQ that exports to **Excel** (with live formulas) and **PDF**.

---

## What it does

| Step | Screen | What happens |
|---|---|---|
| 1 | **Project** | Project, client, consultant, drawing references, finish, glazing, currency. Multiple BOQs are saved and reopened from the list. |
| 2 | **Drawings** | Load a PDF drawing set or an image. Set the scale once per page by dragging along a known dimension, then drag a box around an opening to read its size in millimetres. |
| 3 | **Takeoff** | The opening schedule. Marks (SD-01, FW-03, CW-02 …) are generated automatically per type. Keyboard-driven: `Enter` saves and starts the next opening, `Esc` closes. |
| 4 | **Rates & notes** | Per-system rates, minimum billable area, ancillary items, contingency, VAT, exclusions and free-text notes. |
| 5 | **Bill of quantities** | Live bill grouped into a section per system with subtotals and a grand total. Export to `.xlsx` or PDF. |

### Try it immediately

`examples/villa-23-meadows-9.boq.json` is a complete worked BOQ — the 21-unit
Villa 23, Meadows 9 schedule. On the **Project** screen choose **Import project
file** and pick it. It reproduces a grand total of **AED 97,084.50**, which is a
useful check that a fresh deployment is calculating correctly.

### Systems included

Configured in [`src/catalogue.js`](src/catalogue.js):

| System | Category | Used for |
|---|---|---|
| SUPREME **S600 EDGE** | Sliding | Sliding doors and windows |
| SUPREME **S650 PHOS** | Sliding | Sliding doors and windows, wide spans |
| SMARTIA **S67 — Hinged** | Hinged | Hinged / tilt & turn doors and windows |
| SMARTIA **S67 — Fixed** | Fixed | Fixed lights |
| SMARTIA **M35** | Curtain wall | Stick curtain wall, 35 mm sightline |
| SMARTIA **M50** | Curtain wall | Stick curtain wall, 50 mm sightline |

Published specification data (frame depths, Uf, performance classes, glazing
thickness) is carried against each system and printed into the BOQ notes.

> **Two data caveats, also shown in the app.**
> *S600 EDGE* — a published technical page was not retrievable from `alumil.com/uae`
> when this app was built. Confirm frame depth, Uf, maximum sash weight and permissible
> sash dimensions against ALUMIL's S600 EDGE prequalification file before tendering.
> *M50* — published on ALUMIL's international and USA pages; the current UAE curtain
> wall listing shows M35, M6, M7, M4, M78 and M10800. Confirm regional availability.

### Adding or changing systems

Everything lives in one array in `src/catalogue.js`:

```js
{
  id: 'S91',                       // unique, stable — used as the rate key
  name: 'SMARTIA S91',
  family: 'SMARTIA',
  category: 'Hinged',
  kinds: ['hinged-door', 'hinged-window'],   // which opening types offer it
  desc: 'Thermally insulated hinged system for passive buildings.',
  rate: 1400,                      // default AED/m², editable in-app
  specs: { 'Frame depth': '91 mm', 'Uf': '0.9 – 1.6 W/m²K' },
  note: 'Optional caveat printed in the BOQ notes.'
}
```

Bump `VERSION` in `sw.js` after any change so browsers pick up the new build.

---

## Deploying to GitHub + Vercel

This is a static site — no build step, no dependencies to install.

### 1. Push to GitHub

```bash
cd alumil-boq
git init
git add .
git commit -m "ALUMIL BOQ Builder"
git branch -M main
git remote add origin https://github.com/<your-account>/alumil-boq.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to **vercel.com → Add New → Project** and pick the repository.
2. **Framework Preset:** `Other`.
3. **Build Command:** leave empty. **Output Directory:** leave empty (repo root).
4. Deploy.

`vercel.json` sets the service-worker and manifest headers correctly, so the PWA
installs properly on the first deploy. Every later `git push` to `main` redeploys
automatically.

Optional CLI route:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

### 3. Install it

Open the deployed URL and use **Install app** in the header, or your browser's
install option (Chrome/Edge: address-bar install icon; iOS Safari: Share →
Add to Home Screen). After the first load it runs with no network at all.

### Running locally

A service worker needs `http://`, not `file://`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Where your data lives

* BOQ data (project details, openings, rates, notes) — **`localStorage`** on the device.
* Loaded drawing files — **IndexedDB** on the device.

Nothing is uploaded anywhere; the app has no back end and makes no network calls
after the first load. That also means data is per-browser and per-device: use
**Export project file** on the Project screen to back a BOQ up or move it to
another machine, and **Import project file** to bring it back.

Clearing site data in the browser deletes saved BOQs.

---

## Notes on accuracy

* Sizes measured off a drawing are a drafting aid. Where a dimension is printed on
  the drawing, type that in instead — and verify everything on site before fabrication.
* Rates are indicative defaults for budgeting. They are not a quotation from ALUMIL.
  Replace them with tendered figures on the Rates screen before issuing a bill.
* The default minimum billable area is 1.50 m² per unit, the usual UAE aluminium
  trade convention for small lights. Change it on the Rates screen if you price
  small units differently.

## Project layout

```
alumil-boq/
├── index.html              app shell and all screens
├── manifest.webmanifest    PWA manifest
├── sw.js                   service worker (offline cache)
├── vercel.json             static hosting headers
├── icons/                  app icons
├── examples/               worked example BOQ (import to test a deployment)
├── src/
│   ├── app.js              application logic
│   ├── catalogue.js        ALUMIL systems, typologies, default rates, notes
│   └── styles.css          styles, including the print stylesheet
└── vendor/
    ├── pdf.min.js          PDF.js 3.11.174 (Apache-2.0) — drawing viewer
    ├── pdf.worker.min.js
    └── xlsx.full.min.js    SheetJS 0.18.5 (Apache-2.0) — Excel export
```

Libraries are vendored rather than loaded from a CDN so the app is genuinely
offline-capable and has no third-party runtime dependencies.
