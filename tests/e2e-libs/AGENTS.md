# e2e-libs

Real third-party libraries taken to the polyfill floor and executed there: each is bundled, down-compiled to ES5 by Babel, polyfilled by one of the two providers this repo ships, then run - in a node pre-flight and in actual IE11. `tests/transpiler-integration` proves the plugins survive a real bundler and `tests/e2e-usage-pure` proves a syntactic form is served; the unit suites reach IE11 too, but on core-js's own tests. What only this suite does is put all three together - third-party code, the providers, and the engine the polyfills exist for.

## Target environment

Node under `zx`, started through `npm run zxi` - the repo-wide tooling tier, stated in `scripts/AGENTS.md`. The suite declares no floor of its own, and CI exercises it on one version only, the node 26 its job pins. The exception is what lands in a page verbatim: `harness.mjs` and the HTML it renders are never transformed, so they are hand-written ES5, and both harness targets are parsed by `assertES5` at load.

`npm run test-e2e-libs` chains the two runners that assert - `test-e2e-libs-check-exercise`, then `test-e2e-libs-runtime` - and is part of `npm test`; `OVERWRITE=1` in front of the latter rewrites the snapshot baselines. `e2e-libs-pipeline` is run by no automation at all: it is an instrument you start by hand when the cost of a build is the question. It does hold the same structural gates as the runtime tier - no externals, a real core-js payload, a non-empty injection set, an ES5 parse - so a broken build reddens it too; what it never asserts is a number it reports. Every runner narrows on positional filters, as in `npm run e2e-libs-pipeline three`.

This directory's `package.json` pins the libraries, `core-js` to the workspace, and the toolchain the runners build with - rollup, Babel, esbuild, Karma. No other bundler is here: the whole suite builds with rollup, and the bundler axis belongs to `tests/transpiler-integration`. Karma starts where IE11 is expected to exist: on CI, on a machine with `iexplore.exe` on `PATH`, or wherever `IE_BIN` names the browser - which is the form to use locally, since a stock windows install keeps IE off `PATH`. Everywhere else every gate still runs and only the browser leg is skipped - which is why it happens in the `e2e-libs` CI job, on windows, and nowhere else, and why a green `npm test` is not a green CI here. On a CI runner without IE11 it would start and fail, so no other job may run this suite.

## Layout

- `libraries.mjs` - the registry: one entry per library and its exercise. `librariesMatching` throws on a filter matching nothing, so a typo cannot produce a green empty report
- `exercises/<lib>.mjs` - one deterministic exercise per library, exporting `run()` -> `{ checks }`; its header states what it drives and what it deliberately avoids. `exercises/checks.mjs` is the comparison they share, and it is bundled with them, so it lives under the same rule: it may not call the stdlib either
- `build.mjs` - the bundling core: the temp-entry scaffold, `runtimeBuild`, `TS_SOURCE_PACKAGES`, and the assertions the gates are made of. The methods and phases come from `tests/transpiler-integration/matrix.mjs`, which both bundler suites drive; this one adds `targets: { ie: 11 }` to them
- `runtime.mjs` - the gating tier; `pipeline.mjs` - the reporting one; `check-exercise.mjs` - the exercises run raw, which separates a broken fixture from a broken toolchain
- `harness.mjs`, `karma.conf.cjs` - the in-page harness, banner and QUnit over one scaffold, and the IE11 launcher
- `snapshots/` is committed; `artifacts/`, `report/` and `.tmp/` are generated and gitignored

## The matrix

`runtime.mjs` builds every (library x method x provider x phase) cell **once** and hands that build to every consumer - gates, snapshot, pre-flight, artifact page, Karma. Preserve that: the set that is snapshotted, the bytes that are measured and the bundle that runs in IE11 are then the same build by construction.

The providers are not symmetrical and the snapshots mirror it. `@core-js/babel-plugin` runs inside the Babel pass and has no phase, so its set is the **reference**, stored whole; each `@core-js/unplugin` phase is stored as a **delta** from it, and an empty delta is written rather than omitted so that "agrees" is a recorded state. `entry-global` is snapshotted for neither - it never reads the library - and its cells assert that the providers agree on the expansion instead.

Gating: the ES5 parse, the core-js payload, no externals, a non-empty injection set, the snapshots, the forked pre-flight, and Karma on every cell except one. That exception is unplugin's `pre` - a per-library diagnostic that is red on some by design - which is the whole of the not-gating list besides every number in `buildMs` and in `pipeline.md`. Note what the exception is stated against: babel-plugin's cells carry no phase, so they gate like any other.

A green cell proves the exercise executes, not that every site was detected: a global polyfill patches the prototype once, so one detected use masks a missed sibling. `usage-pure` has no such masking, but only on real IE11 - the pre-flight's realm has the native either way. Per-site detection for the global methods is the job of `tests/unplugin/unit.mjs`.

## Rules

- The library's own implementation has to reach for what the target lacks; an exercise reaching for it on the library's behalf tests Babel's helpers instead. Judge a check by which frame makes the call, not by which names appear in the file - `from(new Set(...))` counts, `[...new Set(...)]` does not
- Checks assert version-robust invariants, never magic totals, or a dependency bump reddens the suite for no reason
- No specifier may have an exercise as its ONLY origin. Such a line describes the harness rather than the library, and it stands over the library besides: if the library stops needing that polyfill, the line stays and no snapshot moves. Common methods the libraries also inject are fine; `origins` in a drift report is what answers the question
- A collision between a library member and a core-js instance method is deliberate coverage: `usage-pure` rewrites those call sites and the helper has to hand back the library's member, which only real IE11 catches
- `usage-pure` cannot serve typed-array prototype methods at all, so an exercise must not route a typed array through one. Indexing is fine
- A new library needs a reason on an axis. Topology is one, and it pulls on two costs at once: the plugin's own analysis scales with the size of a single module, which `tests/transpiler-perf` gates on a corpus much like this one, while the build around it scales with how many modules the injection adds for the bundler to resolve, parse and render - which nothing gates anywhere, and which only a real graph shows at all. Keep the small-modules, mid-sized-graph and monolith profiles represented. The phase axis is the other, and it needs TypeScript sources - `isolatedModules`-clean and listed in `TS_SOURCE_PACKAGES`. Only headless computational libraries qualify at all; core-js cannot make DOM or stream code run on IE11
- Isolation is a requirement: `mode: 'full'` patches globals permanently, so the pre-flight forks a child per bundle and Karma loads one bundle per page. Co-loading lets one cell's injection mask another cell's miss
- Never regenerate a snapshot blindly - read the diff, then rerun with `OVERWRITE=1`. Deltas are measured FROM the reference, so a movement both providers share lands in the reference alone and leaves the delta files untouched; a delta that does change is the two of them disagreeing
- Timings are reported, never asserted, and never quoted in prose or in a comment - they move with the machine and go stale where nothing checks them
