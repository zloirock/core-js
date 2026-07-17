# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers.

Fixtures (in `exercises/`, registered in `libraries.mjs`):
- **rxjs** — headless reactive pipelines.
- **three** — a real headless **three.js** scene *project* (scene-graph, transforms, an "animation"
  step, raycasting, geometry, math). A large modern-ES codebase for the throughput tier, and — since
  it's verified by its numeric state, not pixels — a functional runtime check that the project **still
  computes correctly** after unplugin + Babel down-compile to ES5.

- **pipeline** — the full picture: **size AND time at each stage** of the real IE11 build, per
  (lib × method). Stages: `[A]` library bundled, no transforms → `[B]` + Babel (ES5, no polyfills) →
  `[C]` + unplugin (polyfills = IE11). Also reports injection count, the Babel-vs-unplugin time split
  of `[C]`, and the minified + gzip **wire size** of `[C]`.
  `node pipeline.mjs [libFilter] [methodFilter]` → `report/pipeline.md` + `.json`
  (This is the report to read for "how big / how slow is each stage". `entry-global` shows only `[C]`.)
- **throughput** — isolate unplugin's processing cost across the bundlers (unplugin only, **no Babel**;
  overhead = build-with-plugin − plugin-less baseline). A diagnostic — **not** the IE11 build cost
  (that's `[C]` in `pipeline`, which is Babel + unplugin and slower).
  `node throughput.mjs [libFilter] [bundlerFilter]` → `report/throughput.md` + `.json`
  (7 bundlers: rollup/rolldown/esbuild/vite/webpack/rspack/rsbuild — farm is excluded because its
  native compiler hard-crashes on the workspace v4 core-js modules; see `build.mjs`.)
- **artifacts** — the real IE11 build: Babel (syntax → ES5) + unplugin (stdlib polyfills) → ES5 UMD +
  self-checking HTML, under **both Babel 7 and Babel 8** (unplugin's post phase consumes Babel's helper
  output, so each version is exercised — matching the repo's `test-transpiling` dual-Babel convention).
  `node artifacts.mjs [libFilter]` → `artifacts/<lib>/babel{7,8}/<method>/{bundle.js,index.html}` + `manifest.json`
  (manifest records raw / minified / gzip sizes + injections). A node pre-flight runs first; the real
  IE11 check is manual (upload the HTML to BrowserStack/SauceLabs). Babel 8's toolchain lives in
  `babel8/` (its own install — two `@babel/core` majors can't share one `node_modules`).
- **injection snapshot** — `node snapshot.mjs [--update]` → `snapshots/<lib>.<method>.txt`
- **exercise self-check** — `node check-exercise.mjs [lib]`

Node ≥ 22.18 required. `npm install` here first. Add libraries in `libraries.mjs`.

`core-js` is pinned to the workspace **v4** (`file:../../packages/core-js`) so injected polyfills
resolve to this monorepo's code, not a transitively-hoisted published v3. (`@core-js/pure`, used by
`usage-pure`, already resolves to the workspace.)

core-js only polyfills the ECMAScript stdlib (+ a few web primitives); it cannot make DOM/Canvas/
Worker/Node-stream code run on IE11. The runtime tier therefore only holds headless, computational
libraries whose sole legacy barrier is syntax + stdlib.
