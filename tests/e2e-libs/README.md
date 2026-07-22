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

  This fixture is what surfaced the `usage-pure` `new`-expression bug in `@core-js/unplugin`
  (`new Foo(bar.name)` had its injected getter wrapper re-wrapped as a constructor call). Fixed on
  `v4`; all three methods pass.

- **pipeline** — the full picture: **size AND time at each stage** of the real IE11 build, per
  (lib × method). Stages: `[A]` library bundled, no transforms → `[B]` + Babel (ES5, no polyfills) →
  `[C]` + unplugin (polyfills = IE11). Also reports injection count, the Babel-vs-unplugin time split
  of `[C]`, and the minified + gzip **wire size** of `[C]`.
  `npm run e2e-libs-pipeline [-- libFilter methodFilter]` → `report/pipeline.md` + `.json`
  (This is the report to read for "how big / how slow is each stage". `entry-global` shows only `[C]`.)
- **throughput** — isolate unplugin's processing cost across the bundlers (unplugin only, **no Babel**;
  overhead = build-with-plugin − plugin-less baseline). A diagnostic — **not** the IE11 build cost
  (that's `[C]` in `pipeline`, which is Babel + unplugin and slower).
  `npm run e2e-libs-throughput [-- libFilter bundlerFilter]` → `report/throughput.md` + `.json`
  Every cell is a **single** build — no repeat/median axis. The suite looks for whole-second
  differences while run-to-run noise is tens of ms, so repeats cost more than they buy; read the
  numbers as indicative magnitudes, not as a benchmark.
  One profile: the whole matrix, every bundler × every phase — **147 cells, ~3.5 min**. It used to
  hide behind a `--full` flag with a trimmed default, back when the matrix cost ~50 min; that was
  almost all `three`, which `v4` made ~40x cheaper. Re-measuring also sank the two claims the
  trimming rested on — overhead is *not* bundler-invariant (up to 14x spread on rxjs, 5.4x on
  codemirror; only `three` is flat at 1.8x) and `pre+post` is ~1.3x a single phase, not ~2x. Only
  `pre ≈ post` survived. Nothing left to justify dropping dimensions, so all of them run.
  (7 bundlers: rollup/rolldown/esbuild/vite/webpack/rspack/rsbuild — farm is excluded because its
  native compiler hard-crashes on the workspace v4 core-js modules; see `build.mjs`.)
- **artifacts** — the real IE11 build: Babel (syntax → ES5) + unplugin (stdlib polyfills) → ES5 UMD +
  self-checking HTML, under **both Babel 7 and Babel 8** (unplugin's post phase consumes Babel's helper
  output, so each version is exercised — matching the repo's `test-transpiling` dual-Babel convention).
  `npm run e2e-libs-artifacts [-- libFilter]` → `artifacts/<lib>/babel{7,8}/<method>/{bundle.js,index.html}` + `manifest.json`
  (manifest records raw / minified / gzip sizes + injections). A node pre-flight runs first; the real
  IE11 check is manual (upload the HTML to BrowserStack/SauceLabs). Babel 8's toolchain lives in
  `babel8/` (its own install — two `@babel/core` majors can't share one `node_modules`).
- **injection snapshot** — `npm run e2e-libs-snapshot [-- --update]` → `snapshots/<lib>.<method>.txt`
- **exercise self-check** — `npm run e2e-libs-check-exercise [-- lib]` — runs every exercise raw
  (no bundler, no polyfills) when given no argument.

**Running it.** All five runners are exposed as root scripts, and `npm run e2e-libs` chains the three
that assert (`check-exercise` → `snapshot` → `artifacts`); `pipeline` and `throughput` only report, so
they stay out of it. The suite is deliberately NOT part of `test-raw` / `test-transpiling` — it pulls
rxjs, three, codemirror and seven bundlers, and a full pass takes minutes.

Arguments go after `--`, e.g. `npm run e2e-libs-throughput -- three rollup`. The scripts run through
`scripts/zxi.mjs`, which installs this directory's dependencies for you (so no separate `npm install`
here) but also *imports* the runner rather than spawning it — which is why the runners read their
arguments via `args.mjs` instead of `process.argv.slice(2)`. Calling `node throughput.mjs …` directly
still works and is equivalent.

Node ≥ 22.18 required. Add libraries in `libraries.mjs`.

`core-js` is pinned to the workspace **v4** (`file:../../packages/core-js`) so injected polyfills
resolve to this monorepo's code, not a transitively-hoisted published v3. (`@core-js/pure`, used by
`usage-pure`, already resolves to the workspace.)

core-js only polyfills the ECMAScript stdlib (+ a few web primitives); it cannot make DOM/Canvas/
Worker/Node-stream code run on IE11. The runtime tier therefore only holds headless, computational
libraries whose sole legacy barrier is syntax + stdlib.

**Why the fixtures differ in module topology.** unplugin's usage-mode cost is driven by the size of
the *individual module*, not by total code volume: the scope/variable resolution it runs is
superlinear **within** a module, so the same bytes spread across a graph are cheaper than the same
bytes in one file. Measured at stage `[B]` (the actual input unplugin sees in an IE11 build):

| fixture | topology | `[B]` size | largest module | unplugin time |
| --- | --- | --- | --- | --- |
| rxjs | many small modules | 115 KB | small | 0.3 s |
| codemirror | deep graph of mid-sized modules | 497 KB | 142 KB | 0.4 s |
| three | one ~1.4 MB monolith | 647 KB | 1409 KB | **1.5 s** |

three costs 1.3x codemirror's bytes but ~3.7x its time. The effect is real and still worth a fixture,
but it is no longer dramatic: it used to be **24.5 s** for that same row — ~25x codemirror rather
than ~3.7x — until `v4` reworked the resolution. Feeding the 647 KB of stage-`[B]` ES5 straight to
`transform` now takes ~0.5 s where it took 22–26 s.

Note this pathology only ever showed up on **down-compiled ES5** input (var hoisting, no block
scopes, inlined helpers), which is why `tests/transpiler-perf` — which measures modern source — stayed
green through all of it at bounds of 5 s.

Keep all three topologies represented — a regression in that resolution shows up on `three` first.
