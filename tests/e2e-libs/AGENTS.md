# e2e-libs

Real third-party libraries taken to the polyfill floor and executed there: each is bundled, down-compiled to ES5 by Babel, polyfilled by one of the two providers this repo ships, then run - in a node pre-flight and in actual IE11. `tests/transpiler-integration` proves the plugins survive a real bundler and `tests/e2e-usage-pure` proves a syntactic form is served; the unit suites reach IE11 too, but on core-js's own tests. What only this suite does is put all three together - third-party code, the providers, and the engine the polyfills exist for.

## Target environment

Node under `zx`, started through `npm run zxi` - the repo-wide tooling tier, stated in `scripts/AGENTS.md`. The suite declares no floor of its own, and CI exercises it on one version only, the node 26 its job pins. The exception is what lands in a page verbatim: `harness.mjs` and the HTML it renders are never transformed, so they are hand-written ES5, and both harness targets are parsed by `assertES5` at load.

`npm run test-e2e-libs` chains the two runners that assert - `test-e2e-libs-check-exercise`, then `test-e2e-libs-runtime` - and is part of `npm test`; `OVERWRITE=1` in front of the latter rewrites the snapshot baselines. `e2e-libs-pipeline` asserts nothing and is run by no automation at all: it is an instrument you start by hand when the cost of a build is the question. Every runner narrows on positional filters, as in `npm run e2e-libs-pipeline three`.

This directory's `package.json` pins the libraries, `core-js` to the workspace, and the toolchain the runners build with - rollup, Babel, esbuild, Karma. No other bundler is here: the whole suite builds with rollup, and the bundler axis belongs to `tests/transpiler-integration`. Off a machine with IE11 every gate still runs and only Karma is skipped, so the browser leg happens in the `e2e-libs` CI job, on windows, and nowhere else - a green `npm test` is not a green CI here.

## Layout

- `libraries.mjs` - the registry: one entry per library and its exercise. `librariesMatching` throws on a filter matching nothing, so a typo cannot produce a green empty report
- `exercises/<lib>.mjs` - one deterministic exercise per library, exporting `run()` -> `{ checks }`; its header states what it drives and what it deliberately avoids
- `build.mjs` - the bundling core: methods and phases, the temp-entry scaffold, `runtimeBuild`, `TS_SOURCE_PACKAGES`, and the assertions the gates are made of
- `runtime.mjs` - the gating tier; `pipeline.mjs` - the reporting one; `check-exercise.mjs` - the exercises run raw, which separates a broken fixture from a broken toolchain
- `harness.mjs`, `karma.conf.cjs` - the in-page harness, banner and QUnit over one scaffold, and the IE11 launcher
- `snapshots/` is committed; `artifacts/`, `report/` and `.tmp/` are generated and gitignored

## The matrix

`runtime.mjs` builds every (library x method x provider x phase) cell **once** and hands that build to every consumer - gates, snapshot, pre-flight, artifact page, Karma. Preserve that: the set that is snapshotted, the bytes that are measured and the bundle that runs in IE11 are then the same build by construction.

The providers are not symmetrical and the snapshots mirror it. `@core-js/babel-plugin` runs inside the Babel pass and has no phase, so its set is the **reference**, stored whole; each `@core-js/unplugin` phase is stored as a **delta** from it, and an empty delta is written rather than omitted so that "agrees" is a recorded state. `entry-global` is snapshotted for neither - it never reads the library - and its cells assert that the providers agree on the expansion instead.

Gating: the ES5 parse, the core-js payload, no externals, a non-empty injection set, the snapshots, the forked pre-flight, and Karma on `post` / `pre+post` / `entry-global`. Not gating: Karma on `pre`, a per-library diagnostic that is red on some by design, and every number in `buildMs` and in `pipeline.md`.

A green cell proves the exercise executes, not that every site was detected: a global polyfill patches the prototype once, so one detected use masks a missed sibling. `usage-pure` has no such masking, but only on real IE11 - the pre-flight's realm has the native either way. Per-site detection for the global methods is the job of `tests/unplugin/unit.mjs`.

## Rules

- The library's own implementation has to reach for what the target lacks; an exercise reaching for it on the library's behalf tests Babel's helpers instead. Judge a check by which frame makes the call, not by which names appear in the file - `from(new Set(...))` counts, `[...new Set(...)]` does not
- Checks assert version-robust invariants, never magic totals, or a dependency bump reddens the suite for no reason
- A collision between a library member and a core-js instance method is deliberate coverage: `usage-pure` rewrites those call sites and the helper has to hand back the library's member, which only real IE11 catches
- `usage-pure` cannot serve typed-array prototype methods at all, so an exercise must not route a typed array through one. Indexing is fine
- A new library needs a reason on an axis. Topology is one, and it pulls on two costs at once: the plugin's own analysis scales with the size of a single module, which `tests/transpiler-perf` gates on a corpus much like this one, while the build around it scales with how many modules the injection adds for the bundler to resolve, parse and render - which nothing gates anywhere, and which only a real graph shows at all. Keep the small-modules, mid-sized-graph and monolith profiles represented. The phase axis is the other, and it needs TypeScript sources - `isolatedModules`-clean and listed in `TS_SOURCE_PACKAGES`. Only headless computational libraries qualify at all; core-js cannot make DOM or stream code run on IE11
- Isolation is a requirement: `mode: 'full'` patches globals permanently, so the pre-flight forks a child per bundle and Karma loads one bundle per page. Co-loading lets one cell's injection mask another cell's miss
- Never regenerate a snapshot blindly - read the diff, then rerun with `OVERWRITE=1`. Deltas are measured FROM the reference, so a movement both providers share lands in the reference alone and leaves the delta files untouched; a delta that does change is the two of them disagreeing
- Timings are reported, never asserted, and never quoted in prose or in a comment - they move with the machine and go stale where nothing checks them
