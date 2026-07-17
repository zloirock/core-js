# e2e-libs: transpile + throughput suite for @core-js/unplugin

- **Date:** 2026-07-16
- **Status:** Design approved, spec under review
- **Branch:** `v4` (the earlier `e2e-d3` experiment stays untouched on branch `e2e-d3-unplugin`)
- **Location:** `tests/e2e-libs/`

## 1. Context & motivation

We want to exercise `@core-js/unplugin` against real-world libraries, combining polyfill
injection with an actual syntax down-compile to a legacy target (IE11), then (a) measure how
fast unplugin processes large/diverse ASTs and (b) confirm the produced bundle actually runs on
an old engine.

This extends, but does not replace, the two existing e2e efforts:

- `tests/transpiler-integration` — real bundlers, functional smoke.
- `tests/transpiler-differential` — stripped-realm differential correctness of polyfills.
- (experimental) `tests/e2e-d3` on branch `e2e-d3-unplugin` — d3 through unplugin across
  methods/phases/bundlers with injection snapshots. Left as-is; d3 is treated here as a *later*
  registry entry, not the seed.

## 2. Two hard constraints that shape everything

1. **core-js polyfills ECMAScript stdlib**, plus a handful of web primitives (`URL`,
   `structuredClone`, `queueMicrotask`, `DOMException`, `atob`…). It does **not** provide
   Canvas / WebGL / SVG rendering / Web Workers / Node streams / `worker_threads` / most of
   `Intl`. Libraries whose legacy-incompatibility comes from those (PDF.js, Monaco, CodeMirror,
   pino) can never be *made to run* on IE11 by core-js — they are only useful as **throughput**
   stress, never as **runtime** verification.

2. **unplugin does not transpile syntax.** ES5 output (arrows, classes, `for-of`, spread,
   generators → ES5) is Babel's job. The pipeline is therefore **Babel for syntax +
   unplugin for stdlib**, never one doing both.

These two constraints produce the tiering in §4 and the plugin ordering in §6.

## 3. Goals / non-goals

**Goals**

- Registry-driven suite that runs a library through unplugin across `method` × `phase` ×
  `bundler`, seeded with **RxJS**.
- **Throughput tier:** measure parse / inject / total-bundle time, output size, injection count,
  against a no-plugin baseline.
- **Runtime tier:** emit an ES5 bundle + a self-checking `index.html` per (lib × method) for
  **manual** upload to BrowserStack/SauceLabs; plus a node pre-flight that the bundle at least
  executes and its checks pass.
- Injection snapshots per (lib × method), like e2e-d3.

**Non-goals (first pass)**

- No monster libraries yet (typescript / Monaco / PDF.js) — the `tier: 'throughput'` field is
  reserved but unused.
- No d3 (stays on its own branch).
- No BrowserStack **automation** (no creds, no Karma/WebDriver, no paid CI).
- No CI wiring.
- No commits until explicitly requested.

## 4. Tiering

Each registry entry declares a `tiers` array (an entry can belong to both):

- **`throughput`** — huge / diverse AST; run to measure processing cost. Whether it runs on IE11
  is irrelevant. Future-only monsters: typescript, Monaco, PDF.js.
- **`runtime`** — headless, deterministic, computationally verifiable; its legacy barrier is
  *only* syntax + stdlib. We build ES5 artifacts and verify execution. Future: mathjs, zod.

Seed entry **RxJS** declares `tiers: ['throughput', 'runtime']` — it is both measured for
throughput and emitted as an ES5 artifact. The monsters, when added, are `tiers: ['throughput']`.

## 5. Suite layout

```
tests/e2e-libs/
  libraries.mjs      # registry: [{ name, tiers, exercise, methods, notes }]
  exercises/
    rxjs.mjs         # monstrous headless exercise: exports { results, checks }
  build.mjs          # core: (lib, method, phase, bundler) -> bundle (unplugin [+ Babel for runtime tier])
  throughput.mjs     # tier-1 runner: bundlers x methods x phases, measure, write report/
  artifacts.mjs      # tier-2 runner: rollup+babel / webpack+babel-loader -> ES5 bundle + index.html + manifest.json
  snapshot.mjs       # injection snapshot per (lib x method); --update to rewrite
  report/            # generated: throughput.md + throughput.json
  artifacts/         # generated: <lib>/<method>/{bundle.js,index.html} + manifest.json
  snapshots/         # generated: <lib>.<method>.txt
  package.json
```

Runner / snapshot / strip patterns are re-authored from the e2e-d3 experiment by concept (not
imported across branches).

## 6. Pipeline per cell (lib × method × phase × bundler)

**Entry module per method**

- `entry-global`: `import 'core-js'; export { results, checks } from <exercise>`
- `usage-global` / `usage-pure`: `export { results, checks } from <exercise>`

**Throughput tier** — plugins: `[ unplugin({ method, version, mode, targets: { ie: 11 }, phase }) ]`
(+ `@rollup/plugin-node-resolve` + `@rollup/plugin-commonjs` where the bundler needs them, since
core-js modules are CommonJS). Nothing down-compiles syntax here; we are measuring unplugin, not
producing runnable ES5.

**Runtime tier (the crux)** — plugins ordered so Babel transforms first and unplugin injects
after:

```
[ babel({ presets: [['@babel/preset-env', {
            targets: { ie: 11 }, useBuiltIns: false, corejs: false }]],
          babelHelpers: 'inline' }),           // syntax only, no builtins
  unplugin({ method, targets: { ie: 11 }, phase: 'post' }) ]   // stdlib only
```

- `useBuiltIns:false, corejs:false` — Babel must **not** inject core-js, or we double-polyfill.
- `phase:'post'` — unplugin runs after Babel per module, so the stdlib that Babel's *helpers*
  introduce (spread / `for-of` / generators reach for `Symbol.iterator`, `Array.from`, etc.) is
  visible and gets polyfilled. In `pre` those helper-introduced usages are missed. This is the
  practical case for the pre/post phase distinction.
- `babelHelpers:'inline'` — helpers are inlined per module (no `@babel/runtime` indirection), so
  usage-global sees them where they are used.
- Bundlers in this tier are limited to those that actually emit ES5: **rollup +
  `@rollup/plugin-babel`** and **webpack + `babel-loader`**. esbuild/rolldown/bun do not
  down-compile below ES2015 and are excluded from the runtime tier (they remain in throughput).

## 7. RxJS exercise (`exercises/rxjs.mjs`)

Deterministic and headless. Time-based operators run under `TestScheduler` (virtual time),
asserted at the value level. Imports operators/creation from `rxjs` and `TestScheduler` from
`rxjs/testing` (nodeResolve picks rxjs's modern build, giving Babel + unplugin syntax/stdlib to
work on).

Operator coverage (a confidently hand-verifiable subset — enough to exercise the target stdlib;
**narrowed from the original broad wishlist** during implementation):

- creation: `of`, `from`, `range`, `throwError`
- transform: `map`, `scan`, `mergeMap`, `switchMap`, `concatMap`, `groupBy`, `bufferCount`, `pairwise`
- filter: `filter`, `distinctUntilChanged`, `debounceTime`, `throttleTime`
- combine: `merge`, `concat`, `combineLatest`, `zip`, `forkJoin`
- subjects: `BehaviorSubject`, `ReplaySubject`
- errors: `catchError`
- aggregate: `reduce`, `toArray`
- promise interop: `firstValueFrom`, `lastValueFrom` (exercises the `Promise` polyfill)

Exports a single `run()` returning `Promise<{ results, checks }>` (a `Promise.then` chain, no
async/await — so the ES5 down-compile needs no regenerator runtime):

- `results` — JSON-serializable object of collected outputs.
- `checks` — array of `{ label, actual, expected, pass }` (`pass` computed by the exercise via a
  JSON deep-equal) consumed by the node pre-flight and the generated HTML harness.

Expected stdlib footprint core-js injects at `ie:11`: `Promise`, `Symbol`
(`observable`/`iterator`), internal `Map`/`Set`, `Array.from`, plus Babel-helper-driven
iterator-protocol usage.

## 8. Throughput measurement (`throughput.mjs`)

Per cell (bundler × method × phase), median of **N=5** runs, measured externally (wall-clock
around the whole bundle call — an internal parse-vs-inject split would need to instrument
unplugin's transform hook and is deferred):

- total bundle ms **with** the plugin
- total bundle ms **baseline** (same bundle, plugin omitted)
- overhead ms = with − baseline (approximates unplugin cost: detect + inject + the extra core-js
  modules pulled in)
- output size (bytes)
- injection count (from the snapshot recorder plugin)

Output: `report/throughput.md` (human table) + `report/throughput.json` (machine). Filterable by
`libFilter` / `bundlerFilter` via argv.

## 9. IE11 artifacts (`artifacts.mjs`)

For each (lib × method) in the runtime tier:

1. Build the ES5 bundle (rollup+babel path by default; webpack+babel-loader optional).
2. Emit `artifacts/<lib>/<method>/bundle.js`.
3. Emit `artifacts/<lib>/<method>/index.html`: loads `bundle.js`, runs `checks`, renders a
   green/red banner with a per-check breakdown. No external assets (BrowserStack-friendly).
4. **Node pre-flight:** execute the ES5 bundle in node and assert `checks` pass. This is *not* a
   stripped realm — just "does it execute and compute correctly at all" — to catch gross breakage
   before a manual IE11 run.
5. Write `artifacts/manifest.json` listing every (lib, method, path) for manual upload.

The actual IE11 pass/fail is a manual step in BrowserStack/SauceLabs; a green banner there
confirms **syntax + stdlib** only (core-js cannot rescue any DOM/Worker path — irrelevant for the
headless runtime tier).

## 10. Commands

- `node throughput.mjs [libFilter] [bundlerFilter]` → `report/`
- `node artifacts.mjs [libFilter]` → `artifacts/` + `manifest.json` + node pre-flight
- `node snapshot.mjs [--update]` → `snapshots/`

(Node is used via the repo's toolchain; nvm path in this environment:
`~/.nvm/versions/node/v22.20.0/bin/node`.)

## 11. Phasing / YAGNI

**First pass:** RxJS only, both tiers, on `v4`. No monsters, no d3, no BrowserStack automation, no
CI. Commit only on request.

**Later (separate passes, not designed here):** add throughput monsters (typescript / Monaco /
PDF.js) as `tier:'throughput'` registry entries; add mathjs / zod to the runtime tier; optional
BrowserStack Automate; CI wiring.

## 12. Open questions

- Webpack in the runtime tier: include from the start, or rollup+babel only for the first pass?
  (Default: build rollup+babel first, wire webpack+babel-loader second.)
- rxjs import path: confirm the ES2015 `dist/esm` entry resolves cleanly through
  nodeResolve+commonjs under each method; fall back to the package `module` field if not.

## 13. Post-implementation resolution notes

- **core-js version:** `core-js` is pinned to the workspace v4 via a `file:../../packages/core-js`
  dependency, so `entry-global`/`usage-global` bundle this monorepo's v4 polyfills rather than a
  transitively-hoisted published v3 (which `@farmfe` pulls in). Without the pin, node's node_modules
  walk found the nested v3 first. Injected specifiers (and thus the snapshots) are unchanged — they
  come from v4 `@core-js/compat`, not from the installed package.
- **farm on v4:** farm's native compiler hard-crashes on the v4 core-js modules and, being
  uncaught, kills the whole throughput run — so farm is excluded from the active throughput bundler
  set (7 remain). It's throughput-only; the runtime tier uses rollup and is unaffected. The builder
  stays in `build.mjs` for easy re-enable. (Root cause: farm's resolver mishandles v4 core-js's
  `"./modules/*.js"` exports subpath for extensionless `*json*` specifiers, e.g.
  `core-js/modules/es.json.stringify`.)
- **dual Babel (7 + 8):** the runtime tier builds every (method) under both Babel 7 (the suite's own
  `@babel/core`/`@babel/preset-env`) and Babel 8 (isolated in `babel8/`, since two `@babel/core`
  majors can't share a `node_modules`) — matching the repo's `test-transpiling` convention of testing
  the babel-facing behaviour against both. `@rollup/plugin-babel@6` only supports `@babel/core@7`, so
  a small custom transform plugin runs the chosen Babel core (via `transformAsync`) instead. Note:
  Babel 7.29 and 8.0 emit **byte-identical** ES5 — verified empirically across the seed exercise and
  standalone `for-of`/spread/generator/async/private-method snippets (Babel 8's differences from 7 are
  config/defaults/dropped-options, not codegen). So the two runs are a parity/regression guard rather
  than two distinct outputs; a real delta would surface only from a future Babel that changes a helper
  or preset-env's transform selection. (The exercise's `for_of_set`/`spread_set` checks still add
  value: they drive Babel's `_createForOfIteratorHelper`/`_toConsumableArray` → `Symbol.iterator`, so
  the post-phase helper injection the runtime tier exists to test is actually exercised at runtime.)
- **install (`.npmrc`):** the v4-alpha `core-js` pin is a prerelease that doesn't satisfy
  `@rsbuild/core`'s `peerOptional core-js ">= 3.0.0"`, so strict peer resolution errors. `.npmrc`
  sets `legacy-peer-deps=true` so `npm install` succeeds.
- **`pipeline.mjs` (size + time per stage):** the definitive report for "how big / how slow is each
  stage" of the real IE11 build. Per (lib × method) it measures three cumulative rollup builds —
  `[A]` library only (no transforms), `[B]` + Babel (ES5, no polyfills), `[C]` + unplugin (= IE11) —
  capturing bytes and wall-clock at each, the raw source loaded (pre-tree-shaking), the injection
  count, `[C]`'s Babel-vs-unplugin time split (instrumented transform hooks), and `[C]`'s minified +
  gzip wire size. `throughput.mjs` stays a separate, unplugin-only diagnostic — its overhead number
  is NOT the IE11 build cost (that's `[C]`, Babel + unplugin, which is larger; e.g. three/usage-global
  is ~30 s total, of which unplugin ~22 s / 73 %, Babel ~5.7 s / 19 %). `build.mjs` exports
  `makeBabelPlugin(babelVersion)` so `pipeline.mjs` and `runtimeBuild` share the exact Babel config.
- **wire size:** raw bundles are unminified/uncompressed (the suite builds with `minify:false` to
  measure processing). Real delivery is minify (~28 % of raw) + gzip (~8–11 % of raw); e.g.
  three/usage-global 1.15 MB raw → ~97 KB gzip, rxjs/usage-global 446 KB → ~47 KB gzip.
  `artifacts.mjs`'s `manifest.json` and `pipeline.mjs` both report raw / min / gzip.
- **three.js fixture (`tiers: ['throughput', 'runtime']`):** a real headless three.js scene project
  — scene-graph + world transforms, an "animation" step, raycasting, geometry bounds, curve, and
  vector/matrix/quaternion math — asserted by 16 deterministic numeric checks (no WebGL/DOM, so it
  runs in node). It is both a large modern-ES **throughput** target (usage-global injects 154
  polyfills vs rxjs's 95) and a **runtime** functional check: all 16 checks still pass after the ES5
  down-compile + polyfill, under both Babel 7 and 8, proving the project stays functional after the
  run — the requested "does the project still work after unplugin processes it" verification.
