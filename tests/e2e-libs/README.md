# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers.

**Fixtures** (in `exercises/`, registered in `libraries.mjs`). Three of them cover three different
**module topologies**, which is what actually drives unplugin's cost — see the note at the end; the
fourth is the **TypeScript** fixture, which exists for the `phase` axis rather than for topology:
- **rxjs** — headless reactive pipelines. Many small modules.
  Its centrepiece is `innerFrom`, rxjs's interop hub: every branch of it is driven, so the
  well-known-symbol lookups happen **inside rxjs** — `Symbol.iterator` (a `Set`, a `Map`, a
  hand-rolled iterable), `Symbol.asyncIterator`, `Symbol.observable` — and the iteration that follows
  runs through tslib's `__values` / `__asyncValues` / `__await` / `__awaiter` in the rxjs bundle.
  Around it: `new Set` in `distinct`, `new Map` in `groupBy` and `TestScheduler`, `Array.from` in
  `Subject#next` (worthless with a single observer, so the fixture uses two), `Object.entries` in
  `pairs`, `Array#includes` in `Subscription#_hasParent` (needs a child with two parents),
  `Promise.resolve` in the `asapScheduler`'s `Immediate`, `Number.isFinite` + `Array#sort` in
  `VirtualTimeScheduler`, and `Object.create` in `createErrorClass` — whose hand-assembled prototype
  chains are what the `instanceof` assertions in the error block actually test. 29 distinct natives
  reached from `rxjs/dist/` frames against 21 before, plus the `Symbol.asyncIterator` /
  `Symbol.observable` lookups that the attribution instrument cannot see.
  The old `for (const v of new Set(…))` / `[...new Set(…)]` checks are gone on purpose: they drove the
  iterator protocol through Babel's helpers in the *exercise*. `from(new Set(…))` puts it in rxjs.
  Note `Symbol.observable` is not a core-js module at all, so on IE11 rxjs falls back to its
  `'@@observable'` string key — the fixture feeds it rxjs's own `observable` export, so the two agree
  by construction either way.
- **three** — a real headless **three.js** scene *project* (scene-graph, transforms, an "animation"
  step, raycasting, geometry, math, curves, shapes, skinning, `toJSON`/`ObjectLoader` round-trips)
  plus five official addons from the same package (`three/addons/*`). A large modern-ES codebase for
  the throughput tier, and — since it's verified by its numeric state, not pixels — a functional
  runtime check that the project **still computes correctly** after unplugin + Babel down-compile to
  ES5. One ~1.4 MB monolithic module (plus ~69 KB of addon modules).
  Its blocks are picked so that **three's own implementation** reaches for what IE11 lacks, rather
  than the exercise doing it on three's behalf — `Array.from` and `constructor.name` in
  `BufferAttribute#toJSON`, `Number.isInteger` in `ObjectLoader`, `new Map` in `ShapePath#toShapes`,
  `new Set` in `WireframeGeometry`, `Number.EPSILON` in `ExtrudeGeometry`'s bevel path, `Math.sign`
  in `AnimationMixer#update`, `Math.imul` in `seededRandom`, `Math.trunc` in `roundToZero`, `new
  URL` in `Cache`, `Number#toFixed` in the non-sRGB branch of `Color#getStyle`, the
  `*[Symbol.iterator]` generators on the math classes, the addons' recursive `yield*`, and three's
  `async parseAsync`. Attributing each native call to its immediate stack frame, the exercise
  reaches **36** distinct natives from frames inside three, against 16 for the scene-graph-only
  version it replaces — which is what the IE11 leg below can actually gate on.
  It also executes three's own members whose names **collide** with core-js instance methods —
  `Ray#at`, `Vector3#clamp`, `Texture#repeat`. `usage-pure` rewrites those call sites too, and the
  pure helper has to hand back three's own method; on IE11 a broken fallback is fatal, and the
  modern-realm pre-flight cannot see it.
  Not reachable headlessly, so deliberately not chased: `Array#includes`, `.keys()`/`.values()`,
  `Math.log2`, `self` — all `WebGLRenderer`/WebXR only. unplugin still injects them.
  Reachable but deliberately **excluded**: every typed-array *prototype* method. `usage-pure` cannot
  serve those, structurally — a prototype method cannot be delivered without patching the native
  prototype, which is what `pure` exists to avoid, so all 69 binary-data modules are stubbed out of
  `@core-js/pure` (committed `// empty` overrides in `packages/core-js-pure/override/modules/`), every
  typed-array entry in `packages/core-js-compat/src/built-in-definitions.mjs` is `{ global: … }` with
  no `pure` variant, and the instance-method dispatch has no typed-array receiver at all (its receivers
  are `array`, `string`, `number`, `regexp`, `date`, `function`, `promise`, `symbol`, `iterator`,
  `asynciterator`, `domcollection`, plus two receiver-agnostic fallbacks: `common`, which is what a
  `pure` rewrite lands on when no annotation narrows the receiver — see the htmlparser2 entry above —
  and a single `rest` catch-all on `toString`). unplugin cannot know a receiver is not an `Array`, so
  it rewrites `floats.slice(a, b)` into a helper that falls through to `floats.slice` — `undefined` on
  IE11. This is why the exercise avoids `KeyframeTrack#trim`/`#clone`, `AnimationUtils.subclip` and
  `makeClipAdditive`, `BatchedMesh`, `InstancedMesh#setColorAt`, `mergeVertices` and `radixSort` (and
  loses `Array#find` with `makeClipAdditive`, the only `.find(` call site in three). Discovered the
  hard way: these reddened the gating `usage-pure` IE11 cells while every other gate stayed green.
  See the header of `exercises/three.mjs`.
- **codemirror** — the headless half of a real **CodeMirror 6** editor: `EditorState` transactions
  with position/selection mapping, a Lezer parse, an **incremental** reparse checked against a full
  one, token highlighting, plus CSS and HTML grammars. A deep graph of mid-sized modules.
  Only the view-independent layer is used. `@codemirror/language` is deliberately NOT imported: it
  works fine headlessly (it touches the DOM only when an `EditorView` is constructed), but it drags
  in `@codemirror/view` — ~1.1 MB that no headless check ever executes. Parsing comes from Lezer
  directly instead, which is what CodeMirror delegates to anyway.
  Beyond the document/parse/highlight layers it drives the parts of the state library that only
  reach a polyfill under specific conditions: `Symbol.iterator` on `Text` and its cursors, `new Set`
  in `RangeSet.compare` (the only one in the whole graph, and it takes two range sets plus a
  `ChangeSet` to get there), three more `new Map` sites in the facet/compartment resolver,
  `JSON.stringify` in `TreeBuffer#childString`, and mixed-language parsing where one HTML parse nests
  the JS and CSS grammars through `parseMixed`. 27 distinct natives reached from `@codemirror` /
  `@lezer` frames against 24 before, plus the `Text` iterator, which the attribution instrument
  cannot see because it is the library's own method.
  Two name **collisions** ride along, both the interesting kind: `SelectionRange#flags` against
  `RegExp#flags`, and the `RangeSet` chunk's own `findIndex(pos, side, end, startAt)` against
  `Array#findIndex`. `usage-pure` rewrites both, and the pure helper has to hand back codemirror's
  member rather than the regexp/array one.
  The unicode block is a *fallback* test, not a polyfill test: `@codemirror/state` implements
  `codePointAt` / `fromCodePoint` by hand out of `charCodeAt` / `String.fromCharCode` and never
  touches the ES6 natives, and it builds its word-character regexp from `\p{Alphabetic}` inside a
  `try`/`catch` that IE11 cannot parse — so on the target the categorizer runs its manual path.
  Unreachable and not chased: `String.fromCodePoint` in `@lezer/lr` sits behind a `verbose` flag read
  off `process.env.LOG`, which no browser satisfies.
  Its checks favour version-robust invariants (zero parse errors, incremental === full, ordered
  highlight spans, semantic names) over magic node totals, so a grammar bump doesn't redden the suite.

  This fixture is what surfaced the `usage-pure` `new`-expression bug in `@core-js/unplugin`
  (`new Foo(bar.name)` had its injected getter wrapper re-wrapped as a constructor call). Fixed on
  `v4`; all three methods pass.
- **htmlparser2** — the **TypeScript** fixture: a headless HTML/XML pipeline over the whole
  htmlparser2 stack (htmlparser2 → domhandler → domutils → dom-serializer → entities → css-select →
  css-what → nth-check). Unlike the three above, the runtime tier builds these libraries **from their
  own `src/**/*.ts`** rather than from their published JS — the redirect is `TS_SOURCE_PACKAGES` in
  `build.mjs`, and `@babel/preset-typescript` strips the types for `.ts` ids only. 42 of the 48
  modules in the graph are `.ts`; domhandler, domelementtype and boolbase ship no sources and stay
  JS, so the graph is deliberately **mixed**.
  That is the whole point. `pre` runs unplugin before Babel and its documented advantage is "original
  source with full semantic context" — over a graph of published JS that claim cannot be tested at
  all, and on the other three fixtures `post` is a strict superset of `pre`. Here the phases separate
  in **both** directions, and the six snapshots pin both halves:
  `usage-global` 123 (`pre`) → 133 (`post`) → **134** (`pre+post`), because `pre` injects
  `es.error.cause` off the *type annotations* `onerror(error: Error)` / `(error: Error | null)`,
  which have no runtime existence for `post` to find; `usage-pure` 26 → 39 → **40**, where the
  pre-only `@core-js/pure/full/array/instance/includes` comes not from the annotation walk
  (`usage-pure` disables it) but from type-driven *receiver resolution* — two `Node[]`-annotated
  receivers get the array-specific pure helper at `pre` and the receiver-agnostic one at `post`.
  This is the only fixture where `pre+post` is strictly larger than `post`, and its `pre+post` cells
  gate exactly that union. Killing the TS redirect drifts 4 of the 6 snapshots, so the fixture cannot
  silently degrade into "just another JS library" (verified by mutation).
  Its blocks otherwise follow the same rule as the others — make the libraries' own code reach for
  what IE11 lacks: `new Map` / `new Set` behind htmlparser2's implied-end-tag, void-element and
  foreign-content tables, `new WeakMap` in both of css-select's result caches, `Object.hasOwn` in
  five modules across four packages, `String.fromCodePoint` and the CP1252 remap in the entity path,
  `Number.parseInt` in three packages, `String#replaceAll` in dom-serializer's raw-attribute branch.
  49 distinct natives from library frames across 32 library modules, against 29 for the obvious
  "parse, query, read the text" version.
  Typed arrays are present but only ever **indexed** (htmlparser2's `Sequences`, entities' decode
  tries), so the structural `usage-pure` typed-array hole that forced three to prune paths is never
  reached — which is why these `usage-pure` cells pass where three's would not. Deliberately excluded:
  `htmlparser2/WritableStream` and `/WebWritableStream` (node streams / WHATWG streams).
  **Not in the `throughput` tier**: only rollup has been taught to resolve `.ts` here, and that tier
  drives seven bundlers with no TS resolution and no Babel at all.

**Runners.** Four entry points, each exposed as a root npm script:

- **pipeline** — the full picture: **size AND time at each stage** of the real IE11 build, per
  (lib × method). Stages: `[A]` library bundled, no down-compile → `[B]` + Babel (ES5, no polyfills) →
  `[C]` + unplugin (polyfills = IE11). Also reports injection count, the Babel-vs-unplugin time split
  of `[C]`, and the minified + gzip **wire size** of `[C]`. `[A]` is "no transforms" only for a
  JS-source library; a TypeScript one has its types erased there and nothing else, because rollup
  cannot parse `.ts` at all. Erasure is not a down-compile, so the ES5 lowering is still wholly in the
  `[A]` → `[B]` delta — but the `source loaded` figure above it counts TypeScript, annotations
  included, and the report labels that row so the two are not read as one measurement.
  `[A]` and `[B]` depend on the library only — neither carries unplugin, and the entry is identical
  for both usage-* methods — so they are measured **once per library** and both usage-* rows show
  that one build. Identical `[A]`/`[B]` figures in those two rows are one measurement printed twice,
  not two that agree; only `[C]` is per cell.
  `npm run e2e-libs-pipeline [-- libFilter methodFilter]` → `report/pipeline.md` + `.json`
  (This is the report to read for "how big / how slow is each stage". `entry-global` shows only `[C]`.)
  - **throughput** — the cost of producing a **polyfilled build** across the bundlers (unplugin
  only, **no Babel**; cell = build-with-plugin − plugin-less baseline). Read it as build cost,
  **not** as unplugin's own processing time: most of the delta is the bundler resolving, parsing and
  rendering the core-js modules unplugin injected (485 extra modules on rollup/rxjs/usage-global,
  where unplugin's own transform was ~25% of the delta). For unplugin's isolated cost read
  `unpluginMs` in `report/pipeline.json`, which instruments the transform hook directly (it shows as
  `unplugin <n>` in `pipeline.md`'s `[C]` cell). Also **not** the IE11 build cost (that's `[C]` in
  `pipeline`, which is Babel + unplugin and slower). `npm run e2e-libs-throughput [-- libFilter
  bundlerFilter]` → `report/throughput.md` + `.json`
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
  the real IE11 build for every (library × method × unplugin phase) = **28 cells**: rollup + Babel
  (syntax → ES5) + unplugin (stdlib polyfills). Each cell is built **once**, and that single build then
  feeds every consumer:
  - **gates** — a real acorn parse at `ecmaVersion: 5` (*not* an esbuild `target: 'es5'` transform,
    which silently **lowers** arrows, `?.`, `??` and template literals instead of rejecting them); the
    chunk must actually **contain core-js bytes** (`assertPayload`) — an injection count only proves the
    specifier *text* was seen, and that survives even when rollup tree-shakes the polyfills away;
    nothing may be left **external**, since a `require(...)` in the UMD header is fine in node and fatal
    in a browser; and the injected set must be non-empty.
  - **injection snapshot** → `snapshots/<lib>.<method>.<phase>.txt`, 24 cells (the **usage-\*** methods ×
    all three phases). `entry-global` is not snapshotted: it never reads the library, it expands
    `import 'core-js'` into whatever `targets` selects, so its per-library baselines came out
    byte-identical — a fiction of a per-library gate. That set is pinned exactly (full-text compare) in
    `tests/transpiler-fixtures/entry-global`. Because the snapshot comes from the shipping build, Babel
    runs before unplugin, and *that* is what gives the phase axis meaning: with plain unplugin (no
    Babel) all three phases inject byte-identical sets, whereas here `post` also sees what Babel's own
    helpers reach for — codemirror `usage-global` 120 (`pre`) → 132 (`post`), three 159 → 175, while
    rxjs stays flat at 96 because its source already pulls the iterator machinery in. That delta used to
    be unsnapshotted, so a post-phase ordering regression (the class of bug commit `0328f910b0` fixed)
    could not redden this gate; now it can. On the three JS fixtures `post` is a strict superset of
    `pre` and `pre+post` equals `post`; on **htmlparser2**, whose sources are TypeScript, it is not —
    `pre` reads type annotations that no later phase can see, so `pre+post` is the strictly larger
    union (123/133/**134** and 26/39/**40**). Either way the `pre+post` cells gate exactly that union.
    Trade-off: these baselines are **Babel-dependent**; a `@babel/preset-env` update may legitimately
    move them — read the diff, then rerun with `--update`.
  - **node pre-flight** — the bundle executed in a **fresh child process** (isolation is required, not
    tidiness: `mode: full` permanently patches globals, so two methods in one process would let one
    method's injection mask another's miss), with every self-check passing.
  - **artifact** → `artifacts/<lib>/<method>[/<phase>]/{bundle.js,index.html}` + `manifest.json`
    (raw / minified / gzip sizes + injections + `buildMs`). The minified form is parsed as ES5 too,
    that being the byte count the manifest publishes as shippable. `buildMs` wraps the rollup call
    alone and is a **diagnostic**: nothing gates on it, and the spread across cells says more about
    which cell started warm than about which build is cheap — every cell here runs after the previous
    one's minification, pre-flight child process and file writes, and in CI on a shared runner. For a
    number meant to be compared, and for unplugin's share separated from Babel's, read `pipeline`. An unfiltered run wipes `artifacts/` first and a
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
    diagnostic**, expected to fail for some libraries, which is exactly the signal we want. **three**
    is the fixture that carries it: its sources are modern, so Babel emits the helpers over the
    *library*, and its `pre` cells redden. rxjs ships an ES5 build, so Babel emits almost nothing over
    it and its `pre` cells are green — that its old red is gone is a deliberate change, since the red
    came from spread / `for-of` in the *exercise* and said nothing about rxjs (see the header of
    `exercises/rxjs.mjs`). codemirror's sources are modern too, and Babel does emit helpers over them
    — that is exactly the 120 → 132 delta above — but nothing the exercise executes reaches one, so
    its `pre` cells are green as well; htmlparser2 is the same shape for the same reason. A green
    `pre` therefore means "nothing here reached a Babel-helper polyfill", not "the phase gap is
    closed" — the unrewritten `Array.from` is still sitting in those `pre` bundles. What htmlparser2
    adds is the other direction, and it is a **build-time** gate rather than a browser one: its `pre`
    snapshots pin injections that exist *only* at `pre`, so that half of the phase gap is guarded by
    the snapshot, not by IE11. Off a machine with IE11 (and outside CI) everything above still
    runs and only Karma is skipped; the CI job `e2e-libs-ie11` (windows-2022) is where the browser
    run happens on every push.

  One build per cell is the point. These consumers used to be three runners that each rebuilt the same
  configurations — 48 builds for 21 distinct cells — and each gated on a build of its own, so the set
  being snapshotted was not provably the set inside the bundle that shipped. Now it is, by construction.
  Sizes and injection counts are **deterministic** — they do not depend on what ran before them.
  `buildMs` is not, and is printed anyway as a diagnostic: minification, pre-flight child processes
  and file writes land between consecutive builds and move the CPU state each one starts from, so a
  cell that reads cheap is the one that started warm. **Nothing gates on it.** `pipeline` is where
  timings are meant to be compared — its own quiet process, with a warm-up, and Babel's share split
  from unplugin's.
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
`test-transpiling` — it pulls rxjs, three, codemirror, the htmlparser2 stack and seven bundlers, and a full pass takes
minutes; the IE11 leg runs as its own `e2e-libs-ie11` CI job on windows-2022.

Arguments go after `--`, e.g. `npm run e2e-libs-throughput -- three rollup`. The scripts run through
`scripts/zxi.mjs`, which installs this directory's dependencies for you (so no separate `npm install`
here) but also *imports* the runner rather than spawning it — which is why the runners read their
arguments via `args.mjs` instead of `process.argv.slice(2)`. Calling `node throughput.mjs …` directly
still works and is equivalent.

Node `^22.18.0 || >=24.11.0` (the repo-wide tooling range) required. Add libraries in `libraries.mjs`.
A library that should be built from its **TypeScript sources** goes in `TS_SOURCE_PACKAGES`
(`build.mjs`) as well, and only if the package actually ships `src/**/*.ts` in its npm tarball and
those sources are `isolatedModules`-clean — Babel strips types one file at a time and cannot tell a
type-only re-export (`export { SomeInterface }`) from a value one, which rollup then rejects. Such a
library must also stay out of `tiers: ['throughput']` until the other six bundlers learn to resolve
`.ts` too.

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

`htmlparser2` is not on that axis — it is a wide graph of small modules (48 modules across ten
packages, largest 40 KB), which is roughly where rxjs already sits. It is in the suite for the
`phase` axis, not for topology, and it is out of the throughput tier entirely.

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
green through all of it at bounds of 4 s and under.

Keep all three topologies represented — a regression in that resolution shows up on `three` first.
