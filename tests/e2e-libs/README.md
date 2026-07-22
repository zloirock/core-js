# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers.

Fixtures (in `exercises/`, registered in `libraries.mjs`). The three cover three different **module
topologies**, which is what actually drives unplugin's cost — see the note at the end:
- **rxjs** — headless reactive pipelines. Many small modules.
- **three** — a real headless **three.js** scene *project* (scene-graph, transforms, an "animation"
  step, raycasting, geometry, math). A large modern-ES codebase for the throughput tier, and — since
  it's verified by its numeric state, not pixels — a functional runtime check that the project **still
  computes correctly** after unplugin + Babel down-compile to ES5. One ~1.4 MB monolithic module.
- **codemirror** — the headless half of a real **CodeMirror 6** editor: `EditorState` transactions
  with position/selection mapping, a Lezer parse, an **incremental** reparse checked against a full
  one, token highlighting, plus CSS and HTML grammars. A deep graph of mid-sized modules.
  Only the view-independent layer is used. `@codemirror/language` is deliberately NOT imported: it
  works fine headlessly (it touches the DOM only when an `EditorView` is constructed), but it drags
  in `@codemirror/view` — ~1.1 MB that no headless check ever executes. Parsing comes from Lezer
  directly instead, which is what CodeMirror delegates to anyway.
  Its checks favour version-robust invariants (zero parse errors, incremental === full, ordered
  highlight spans, semantic names) over magic node totals, so a grammar bump doesn't redden the suite.

  **Known-red:** `usage-pure` currently fails at runtime. This is a known `@core-js/unplugin` bug,
  not a fixture bug — a fix is expected on the `v4` branch. `entry-global` and `usage-global` pass.

- **pipeline** — the full picture: **size AND time at each stage** of the real IE11 build, per
  (lib × method). Stages: `[A]` library bundled, no transforms → `[B]` + Babel (ES5, no polyfills) →
  `[C]` + unplugin (polyfills = IE11). Also reports injection count, the Babel-vs-unplugin time split
  of `[C]`, and the minified + gzip **wire size** of `[C]`.
  `node pipeline.mjs [libFilter] [methodFilter]` → `report/pipeline.md` + `.json`
  (This is the report to read for "how big / how slow is each stage". `entry-global` shows only `[C]`.)
- **throughput** — isolate unplugin's processing cost across the bundlers (unplugin only, **no Babel**;
  overhead = build-with-plugin − plugin-less baseline). A diagnostic — **not** the IE11 build cost
  (that's `[C]` in `pipeline`, which is Babel + unplugin and slower).
  `node throughput.mjs [libFilter] [bundlerFilter] [--full]` → `report/throughput.md` + `.json`
  Every cell is a **single** build — no repeat/median axis. The suite looks for whole-second
  differences while run-to-run noise is tens of ms, so repeats cost more than they buy; read the
  numbers as indicative magnitudes, not as a benchmark.
  Two profiles. **Default = smoke** (~2 min): fast libs on all bundlers, slow libs (three) on
  **rollup only**, phase `post` only. **`--full`**: every bundler × every phase. The exhaustive
  matrix showed the overhead is ~invariant across bundlers and that `pre+post ≈ 2× post`, so the
  smoke drops exactly those re-proven dimensions; reach for `--full` only to re-characterise.
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

**Why the fixtures differ in module topology.** unplugin's usage-mode cost is driven by the size of
the *individual module*, not by total code volume: the scope/variable resolution it runs is
superlinear **within** a module, so the same bytes spread across a graph are far cheaper than the same
bytes in one file. Measured at stage `[B]` (the actual input unplugin sees in an IE11 build):

| fixture | topology | `[B]` size | unplugin time |
| --- | --- | --- | --- |
| rxjs | many small modules | 115 KB | 0.4 s |
| codemirror | deep graph of mid-sized modules | 497 KB | **1.0 s** |
| three | one ~1.4 MB monolith | 647 KB | **24.5 s** |

1.3x the bytes, ~25x the time. (Same-run figures — `pipeline.mjs` is single-run, and codemirror
measures ~2.6 s when run alone vs ~1.0 s after rxjs has warmed the JIT. three lands at 22–26 s
either way, so the order of magnitude is not a measurement artefact.)

Keep all three topologies represented — a regression in that resolution shows up on `three` long
before it shows up anywhere else.
