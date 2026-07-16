# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers. Seeded with RxJS.

- **throughput** — measure unplugin's processing cost across all bundlers.
  `node throughput.mjs [libFilter] [bundlerFilter]` → `report/throughput.md` + `.json`
- **runtime** — Babel (syntax → ES5) + unplugin (stdlib polyfills) → ES5 UMD + self-checking HTML.
  `node artifacts.mjs [libFilter]` → `artifacts/<lib>/<method>/{bundle.js,index.html}` + `manifest.json`
  A node pre-flight runs first; the real IE11 check is manual (upload the HTML to BrowserStack/SauceLabs).
- **injection snapshot** — `node snapshot.mjs [--update]` → `snapshots/<lib>.<method>.txt`
- **exercise self-check** — `node check-exercise.mjs [lib]`

Node ≥ 22.18 required. `npm install` here first. Add libraries in `libraries.mjs`.

core-js only polyfills the ECMAScript stdlib (+ a few web primitives); it cannot make DOM/Canvas/
Worker/Node-stream code run on IE11. The runtime tier therefore only holds headless, computational
libraries whose sole legacy barrier is syntax + stdlib.
