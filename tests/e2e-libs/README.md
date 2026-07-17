# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers.

Fixtures (in `exercises/`, registered in `libraries.mjs`):
- **rxjs** — headless reactive pipelines.
- **three** — a real headless **three.js** scene *project* (scene-graph, transforms, an "animation"
  step, raycasting, geometry, math). A large modern-ES codebase for the throughput tier, and — since
  it's verified by its numeric state, not pixels — a functional runtime check that the project **still
  computes correctly** after unplugin + Babel down-compile to ES5.

- **throughput** — measure unplugin's processing cost across the bundlers.
  `node throughput.mjs [libFilter] [bundlerFilter]` → `report/throughput.md` + `.json`
  (7 bundlers: rollup/rolldown/esbuild/vite/webpack/rspack/rsbuild — farm is excluded because its
  native compiler hard-crashes on the workspace v4 core-js modules; see `build.mjs`.)
- **runtime** — Babel (syntax → ES5) + unplugin (stdlib polyfills) → ES5 UMD + self-checking HTML,
  built under **both Babel 7 and Babel 8** (unplugin's post phase consumes Babel's helper output, so
  each version is exercised — matching the repo's `test-transpiling` dual-Babel convention).
  `node artifacts.mjs [libFilter]` → `artifacts/<lib>/babel{7,8}/<method>/{bundle.js,index.html}` + `manifest.json`
  A node pre-flight runs first; the real IE11 check is manual (upload the HTML to BrowserStack/SauceLabs).
  Babel 8's toolchain lives in `babel8/` (its own install — two `@babel/core` majors can't share one
  `node_modules`); Babel 7 is the suite's own `@babel/core`/`@babel/preset-env`.
- **injection snapshot** — `node snapshot.mjs [--update]` → `snapshots/<lib>.<method>.txt`
- **exercise self-check** — `node check-exercise.mjs [lib]`

Node ≥ 22.18 required. `npm install` here first. Add libraries in `libraries.mjs`.

`core-js` is pinned to the workspace **v4** (`file:../../packages/core-js`) so injected polyfills
resolve to this monorepo's code, not a transitively-hoisted published v3. (`@core-js/pure`, used by
`usage-pure`, already resolves to the workspace.)

core-js only polyfills the ECMAScript stdlib (+ a few web primitives); it cannot make DOM/Canvas/
Worker/Node-stream code run on IE11. The runtime tier therefore only holds headless, computational
libraries whose sole legacy barrier is syntax + stdlib.
