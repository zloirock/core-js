# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers.

**Fixtures** (in `exercises/`, registered in `libraries.mjs`). The three cover three different
**module topologies**, which is what actually drives unplugin's cost — see the note at the end:
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

**Runners.** Four entry points, each exposed as a root npm script:

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
  Every cell is a **single** build — no repeat/median axis. Repeats cost more than they buy, and
  they cannot buy back the dominant source of spread: whatever else the machine is doing. A cell
  measured on a busy box reads high. **Read a cell as an order of magnitude**, and trust a ratio
  between cells only when it is large. For the same reason no figure from this report is quoted in
  prose anywhere — the live numbers live in `report/throughput.{md,json}`.
  One profile: the whole matrix, every bundler × every phase (147 cells). It used to hide behind a
  `--full` flag with a trimmed default, back when the matrix took the better part of an hour; that was almost all
  `three`, which `v4` made far cheaper. Re-measuring also sank the two claims the trimming rested
  on — overhead is *not* bundler-invariant (the spread across bundlers is wide on the fast libs and
  narrow on `three`) and `pre+post` costs more than a single phase but nothing like 2x. Only
  `pre ≈ post` survived. Nothing left to justify dropping dimensions, so all of them run.
  Each bundler is **warmed** with a throwaway build before anything is timed: cold JIT — and, for the
  five bundlers loaded lazily, their `import()` — would otherwise land entirely in its baseline,
  deflating every overhead subtracted from it. That once produced a *negative* overhead for
  rxjs/webpack.
  Caveat on the `p+p` columns: unplugin downgrades `pre+post` to a single `post` pass for **esbuild**
  (it is in unplugin's `PRE_POST_UNSAFE_BUNDLERS`), so those two esbuild cells are not what the header
  says they are.
  (7 bundlers: rollup/rolldown/esbuild/vite/webpack/rspack/rsbuild — farm is excluded because its
  resolver fails on the extensionless `core-js/modules/*` specifiers whose name contains the substring
  `js` (`es.json.*`, `web.url.to-json`) — which node and the other bundlers resolve fine — not the
  native crash once assumed; see `build.mjs` for the real cause and the one-plugin shim that fixes it.)
- **runtime (one pass, the whole tier)** — `npm run e2e-libs-runtime [-- libFilter] [-- --update]` —
  the real IE11 build for every (library × method × unplugin phase) = **21 cells**: rollup + Babel
  (syntax → ES5) + unplugin (stdlib polyfills). Each cell is built **once**, and that single build then
  feeds every consumer:
  - **gates** — a real acorn parse at `ecmaVersion: 5` (*not* an esbuild `target: 'es5'` transform,
    which silently **lowers** arrows, `?.`, `??` and template literals instead of rejecting them); the
    chunk must actually **contain core-js bytes** (`assertPayload`) — an injection count only proves the
    specifier *text* was seen, and that survives even when rollup tree-shakes the polyfills away;
    nothing may be left **external**, since a `require(...)` in the UMD header is fine in node and fatal
    in a browser; and the injected set must be non-empty.
  - **injection snapshot** → `snapshots/<lib>.<method>.<phase>.txt`, 18 cells (the **usage-\*** methods ×
    all three phases). `entry-global` is not snapshotted: it never reads the library, it expands
    `import 'core-js'` into whatever `targets` selects, so its per-library baselines came out
    byte-identical — a fiction of a per-library gate. That set is pinned exactly (full-text compare) in
    `tests/transpiler-fixtures/entry-global`. Because the snapshot comes from the shipping build, Babel
    runs before unplugin, and *that* is what gives the phase axis meaning: with plain unplugin (no
    Babel) all three phases inject byte-identical sets, whereas here `post` also sees what Babel's own
    helpers reach for — codemirror `usage-global` 121 (`pre`) → 133 (`post`), three 156 → 172, while
    rxjs stays flat at 96 because its source already pulls the iterator machinery in. That delta used to
    be unsnapshotted, so a post-phase ordering regression (the class of bug commit `20718df3b0` fixed)
    could not redden this gate; now it can. `post` is a strict superset of `pre` on every fixture and
    `pre+post` currently equals `post` — the `pre+post` cells gate exactly that. Trade-off: these
    baselines are **Babel-dependent**; a `@babel/preset-env` update may legitimately move them — read
    the diff, then rerun with `--update`.
  - **node pre-flight** — the bundle executed in a **fresh child process** (isolation is required, not
    tidiness: `mode: full` permanently patches globals, so two methods in one process would let one
    method's injection mask another's miss), with every self-check passing.
  - **artifact** → `artifacts/<lib>/<method>[/<phase>]/{bundle.js,index.html}` + `manifest.json`
    (raw / minified / gzip sizes + injections). The minified form is parsed as ES5 too, that being the
    byte count the manifest publishes as shippable. An unfiltered run wipes `artifacts/` first and a
    filtered one wipes just the libraries it rebuilds (merging into the existing manifest), so a failed
    cell cannot leave a stale green page behind while the manifest claims otherwise. The HTML pages are
    for a manual BrowserStack/SauceLabs pass.
  - **real IE11 via Karma** — the same bundle plus a QUnit driver, run in **actual IE11** (the
    karma-qunit / IE stack `tests/unit-karma` already drives), **one bundle per page**: nothing is
    co-loaded, so a global bundle's load-time prototype patching can never mask another cell's
    `usage-pure` (or `pre`) miss into a false green; it also keeps each page to a single library copy
    (three's is ~1.4 MB) and sidesteps three's "multiple instances" warning. The driver asserts it is
    **really on IE11** (`document.documentMode`), so an `iexplore`→Edge substitution reddens rather than
    passing green. `post` / `pre+post` / `entry-global` **gate**; `pre` — which runs unplugin *before*
    Babel and so can miss the polyfills Babel's helpers pull in — is a **non-gating per-library
    diagnostic**, expected to fail for some libraries, which is exactly the signal we want. Off a
    machine with IE11 (and outside CI) everything above still runs and only Karma is skipped; the CI job
    `e2e-libs-ie11` (windows-2022) is where the browser run happens on every push.

  One build per cell is the point. These consumers used to be three runners that each rebuilt the same
  configurations — 48 builds for 21 distinct cells — and each gated on a build of its own, so the set
  being snapshotted was not provably the set inside the bundle that shipped. Now it is, by construction.
  **Timings are deliberately not measured here** — minification, pre-flight child processes and file
  writes land between consecutive builds and move the CPU state each one starts from; `pipeline` does
  the measuring, in its own quiet process. Sizes and injection counts *are* reported here: they are
  deterministic.
- **exercise self-check** — `npm run e2e-libs-check-exercise [-- lib]` — runs every exercise raw
  (no bundler, no polyfills) when given no argument.

**What a green artifact proves — and doesn't.** It proves the exercise still *executes* on the
target; a green *node pre-flight* does **not** by itself prove per-site *detection*. A global polyfill
patches the prototype once, so one correctly-detected use of a feature masks a missed sibling use of
the same feature elsewhere in the same bundle — the bundle runs regardless. `usage-pure` has no such
masking (each site is rewritten to a local import, so a missed site stays a native call) — but only on
real IE11: the pre-flight's modern realm has the native either way. The **karma** leg above runs the
whole matrix on real IE11, so for `usage-pure` a missed site on these libraries now reddens CI. The
global methods run there too but stay masked even on IE11 (they only prove the exercise executes);
per-site detection for them is the unplugin unit tests' job (`tests/unplugin/unit.mjs`), on the
transform output directly. Sibling to the snapshot gap above.

**Running it.** All four runners are exposed as root scripts, and `npm run e2e-libs` chains the two
that assert (`check-exercise` → `runtime`); `pipeline` and `throughput` only report, so they stay out
of it. `runtime` needs no special environment — off a machine with IE11 it runs every gate and skips
only the browser leg. The suite is deliberately NOT part of `test-raw` /
`test-transpiling` — it pulls rxjs, three, codemirror and seven bundlers, and a full pass takes
minutes; the IE11 leg runs as its own `e2e-libs-ie11` CI job on windows-2022.

Arguments go after `--`, e.g. `npm run e2e-libs-throughput -- three rollup`. The scripts run through
`scripts/zxi.mjs`, which installs this directory's dependencies for you (so no separate `npm install`
here) but also *imports* the runner rather than spawning it — which is why the runners read their
arguments via `args.mjs` instead of `process.argv.slice(2)`. Calling `node throughput.mjs …` directly
still works and is equivalent.

Node `^22.18.0 || >=24.11.0` (the repo-wide tooling range) required. Add libraries in `libraries.mjs`.

`core-js` is pinned to the workspace **v4** (`file:../../packages/core-js`) so injected polyfills
resolve to this monorepo's code, not a transitively-hoisted published v3. (`@core-js/pure`, used by
`usage-pure`, already resolves to the workspace.)

core-js only polyfills the ECMAScript stdlib (+ a few web primitives); it cannot make DOM/Canvas/
Worker/Node-stream code run on IE11. The runtime tier therefore only holds headless, computational
libraries whose sole legacy barrier is syntax + stdlib.

**Why the fixtures differ in module topology.** unplugin's usage-mode cost is driven by the size of
the *individual module*, not by total code volume: the scope/variable resolution it runs is
superlinear **within** a module, so the same bytes spread across a graph are cheaper than the same
bytes in one file. Below is the largest single **source** module in each graph; what unplugin
actually sees at `[C]` is the Babel-lowered form of these:

| fixture | topology | largest single module (source) |
| --- | --- | --- |
| rxjs | many small modules | small |
| codemirror | deep graph of mid-sized modules | 142 KB |
| three | one ~1.4 MB monolith | 1409 KB |

unplugin time orders rxjs < codemirror < three, tracking that last column rather than total bytes.
Sizes and times per run are in `report/pipeline.{md,json}`; they are deliberately not restated here,
because they move with the machine's load and with any change to the instrumentation, and every
previous attempt to keep them in sync went stale.

three's stage-`[B]` byte count is close to codemirror's yet it costs several times the unplugin time —
the effect is real and still worth a fixture, but it is no longer dramatic: that row used to sit well
over an order of magnitude above codemirror until `v4` reworked the resolution. The current split is
in `report/pipeline.{md,json}`.

Note this pathology only ever showed up on **down-compiled ES5** input (var hoisting, no block
scopes, inlined helpers), which is why `tests/transpiler-perf` — which measures modern source — stayed
green through all of it at bounds of 5 s.

Keep all three topologies represented — a regression in that resolution shows up on `three` first.
