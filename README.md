# T.A.S. Engineering Co. — website

Demo build of the TAS Engineering website ("The Counter" concept) and its admin panel.

**This is a clickable demo, not the production app.** Admin changes are saved in the visitor's browser (localStorage), there is no database, OTP or file upload server.

- `index.html` / `app.js` — public site: product lines, search, quote basket, "show us the part", thread finder, price list, scroll gauge
- `admin.html` / `admin.js` — admin panel (demo password `tas2026`): leads, products & prices, Excel price list upload, business details, banner
- `data.js` — default content; `common.js` — shared store and icons; `styles.css` — shared styles

Run locally: `python3 -m http.server` and open http://localhost:8000.

Next: rebuild as Next.js + Payload CMS + Postgres, reusing this design and content.
