# ALUMIL BOQ Builder

Installable, offline-first web app for producing bills of quantities for aluminium
doors, windows and curtain wall on **ALUMIL Middle East** systems.

**Everything is inside `index.html`** — styles, application code, the PDF viewer
and the Excel writer are all embedded. There are no subfolders and nothing is
fetched from a CDN, so the app cannot break because a folder failed to upload.

---

## Deploying — the short version

Put these files in the **root** of the repository (not inside a folder):

```
index.html                            ← the entire app
sw.js                                 ← offline caching        (optional)
manifest.webmanifest                  ← install metadata       (optional)
icon-192.png                          ← app icon               (optional)
icon-512.png                          ← app icon               (optional)
icon-maskable-512.png                 ← app icon               (optional)
vercel.json                           ← hosting headers        (optional)
example-villa-23-meadows-9.boq.json   ← worked example         (optional)
```

Only `index.html` is required. If every other file is missing, the app still runs
completely — you simply lose offline caching and the install button.

On Vercel: **Framework Preset** `Other`, **Build Command** empty, **Output
Directory** empty. Then deploy.

### Uploading to GitHub without losing files

GitHub's drag-and-drop uploader is the usual culprit when files go missing. The
reliable way is the command line:

```bash
cd boq-creator
git init
git add .
git commit -m "ALUMIL BOQ Builder"
git branch -M main
git remote add origin https://github.com/<account>/<repo>.git
git push -u origin main
```

If you must use the browser: on the repo page choose **Add file → Upload files**,
then drag in the **individual files** (select them all inside the folder — do not
drag the folder itself). After uploading, confirm the repo root lists
`index.html` and not a folder containing it.

### Checking a deployment is healthy

Open the deployed URL and check three things:

1. The page is styled — dark navy header, five numbered tabs.
2. Clicking a tab switches screens.
3. On the **Project** screen, **Import project file** →
   `example-villa-23-meadows-9.boq.json` → the **Bill of quantities** tab shows a
   grand total of **AED 97,084.50**.

If the page appears as unstyled black text on white and the tabs do nothing,
`index.html` did not upload completely — re-upload it.

---

## Using it

| Step | Screen | What happens |
|---|---|---|
| 1 | **Project** | Project, client, consultant, drawing references, finish, glazing, currency. Bills are saved automatically and reopened from the list. |
| 2 | **Drawings** | Load a PDF drawing set or an image. Set the scale once per page by dragging along a known dimension, then drag a box around an opening to read its size in millimetres. |
| 3 | **Takeoff** | The opening schedule. Marks (SD-01, FW-03, CW-02 …) are generated automatically per type. `Enter` saves and starts the next opening, `Esc` closes. |
| 4 | **Rates & notes** | Per-system rates, minimum billable area, ancillary items, contingency, VAT, exclusions and notes. |
| 5 | **Bill of quantities** | Live bill grouped into a section per system with subtotals and a grand total. Exports to `.xlsx` and PDF. |

### Systems included

| System | Category | Used for |
|---|---|---|
| SUPREME **S600 EDGE** | Sliding | Sliding doors and windows |
| SUPREME **S650 PHOS** | Sliding | Sliding doors and windows, wide spans |
| SMARTIA **S67 — Hinged** | Hinged | Hinged / tilt & turn doors and windows |
| SMARTIA **S67 — Fixed** | Fixed | Fixed lights |
| SMARTIA **M35** | Curtain wall | Stick curtain wall, 35 mm sightline |
| SMARTIA **M50** | Curtain wall | Stick curtain wall, 50 mm sightline |

> **Two data caveats, also shown in the app.**
> *S600 EDGE* — a published technical page was not retrievable from `alumil.com/uae`
> when this app was built. Confirm frame depth, Uf, maximum sash weight and permissible
> sash dimensions against ALUMIL's S600 EDGE prequalification file before tendering.
> *M50* — published on ALUMIL's international and USA pages; the current UAE curtain
> wall listing shows M35, M6, M7, M4, M78 and M10800. Confirm regional availability.

### Editing the system list or rates

Open `index.html` in a text editor and search for `const SYSTEMS`. Each entry looks
like this:

```js
{
  id: 'S91',                                 // unique, stable — the rate key
  name: 'SMARTIA S91',
  family: 'SMARTIA',
  category: 'Hinged',
  kinds: ['hinged-door', 'hinged-window'],   // which opening types offer it
  desc: 'Thermally insulated hinged system for passive buildings.',
  rate: 1400,                                // default AED/m², editable in-app
  specs: { 'Frame depth': '91 mm', 'Uf': '0.9 – 1.6 W/m²K' },
  note: 'Optional caveat printed in the BOQ notes.'
}
```

Search for `const VERSION` in `sw.js` and bump it after any change, so browsers
pick up the new build rather than serving the cached one.

---

## Where your data lives

* BOQ data (project details, openings, rates, notes) — **`localStorage`** on the device.
* Loaded drawing files — **IndexedDB** on the device.

Nothing is uploaded anywhere; the app has no back end and makes no network calls
at all after the page loads. Data is therefore per-browser and per-device — use
**Export project file** to back a BOQ up or move it to another machine, and
**Import project file** to bring it back. Clearing site data deletes saved bills.

## Notes on accuracy

* Sizes measured off a drawing are a drafting aid. Where a dimension is printed on
  the drawing, type that in instead — and verify everything on site before fabrication.
* Rates are indicative defaults for budgeting, not a quotation from ALUMIL. Replace
  them with tendered figures on the Rates screen before issuing a bill.
* The default minimum billable area is 1.50 m² per unit, the usual UAE aluminium
  trade convention for small lights.

## Running locally

A service worker needs `http://`, not `file://`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk also works for everything except the
install prompt and offline caching.

## Embedded libraries

`index.html` embeds, as base64 blobs decoded at load:

* **PDF.js 3.11.174** (Apache-2.0) — drawing viewer, including its worker
* **SheetJS 0.18.5** (Apache-2.0), `mini` build — Excel export

This is why the file is around 2.2 MB. It compresses to roughly a third of that
over the wire and is cached after the first load.
