# e2e-libs

Real third-party libraries taken to the polyfill floor and executed there: each is bundled, down-compiled to ES5 by Babel, polyfilled by one of the two providers this repo ships, then run - in a node pre-flight and in actual IE11. `tests/transpiler-integration` proves the plugins survive a real bundler and `tests/e2e-usage-pure` proves a syntactic form is served; this is the only suite where the stack meets code nobody wrote for it, and the only one whose verdict comes from the engine the polyfills exist for.

## Target environment

Node `^22.18.0 || >=24.11.0` under `zx`, started through `npm run zxi` - see `scripts/AGENTS.md`. The exception is what lands in a page verbatim: `harness.mjs` and the HTML it renders are never transformed, so they are hand-written ES5, and both harness targets are parsed by `assertES5` at load.

`npm run e2e-libs` chains the two runners that assert - `e2e-libs-check-exercise`, then `e2e-libs-runtime` - and is part of `npm test`; `OVERWRITE=1` in front of the latter rewrites the snapshot baselines. `e2e-libs-pipeline` and `e2e-libs-throughput` only report and stay out of the composite. Every runner narrows on positional filters, as in `npm run e2e-libs-throughput three rollup`.

This directory's `package.json` pins the libraries, and `core-js` to the workspace; the bundlers come from `tests/transpiler-integration`, which its `zxi.install` field names so the bootstrap installs that directory too. Off a machine with IE11 every gate still runs and only Karma is skipped, so the browser leg happens in the `e2e-libs` CI job, on windows, and nowhere else - a green `npm test` is not a green CI here.

## Layout

- `libraries.mjs` - the registry: one entry per library, its tiers and its exercise. `librariesIn` throws on a filter matching nothing, so a typo cannot produce a green empty report
- `exercises/<lib>.mjs` - one deterministic exercise per library, exporting `run()` -> `{ checks }`; its header states what it drives and what it deliberately avoids
- `build.mjs` - the bundling core: methods and phases, the temp-entry scaffold, `runtimeBuild`, `TS_SOURCE_PACKAGES`, and the assertions the gates are made of. Its throughput builders are the shared adapters of `tests/transpiler-integration/bundlers.mjs`
- `runtime.mjs` - the gating tier; `pipeline.mjs` and `throughput.mjs` - the reporting ones; `check-exercise.mjs` - the exercises run raw, which separates a broken fixture from a broken toolchain
- `harness.mjs`, `karma.conf.cjs` - the in-page harness, banner and QUnit over one scaffold, and the IE11 launcher
- `snapshots/` is committed; `artifacts/`, `report/` and `.tmp/` are generated and gitignored

## The matrix

`runtime.mjs` builds every (library x method x provider x phase) cell **once** and hands that build to every consumer - gates, snapshot, pre-flight, artifact page, Karma. Preserve that: the set that is snapshotted, the bytes that are measured and the bundle that runs in IE11 are then the same build by construction.

The providers are not symmetrical and the snapshots mirror it. `@core-js/babel-plugin` runs inside the Babel pass and has no phase, so its set is the **reference**, stored whole; each `@core-js/unplugin` phase is stored as a **delta** from it, and an empty delta is written rather than omitted so that "agrees" is a recorded state. `entry-global` is snapshotted for neither - it never reads the library - and its cells assert that the providers agree on the expansion instead.

Gating: the ES5 parse, the core-js payload, no externals, a non-empty injection set, the snapshots, the forked pre-flight, and Karma on `post` / `pre+post` / `entry-global`. Not gating: Karma on `pre`, a per-library diagnostic that is red on some by design, and every number in `buildMs` and the two reports.

A green cell proves the exercise executes, not that every site was detected: a global polyfill patches the prototype once, so one detected use masks a missed sibling. `usage-pure` has no such masking, but only on real IE11 - the pre-flight's realm has the native either way. Per-site detection for the global methods is the job of `tests/unplugin/unit.mjs`.

## Rules

- The library's own implementation has to reach for what the target lacks; an exercise reaching for it on the library's behalf tests Babel's helpers instead. Coverage is attributed by the immediate stack frame, which is why `from(new Set(...))` counts and `[...new Set(...)]` does not
- Checks assert version-robust invariants, never magic totals, or a dependency bump reddens the suite for no reason
- A collision between a library member and a core-js instance method is deliberate coverage: `usage-pure` rewrites those call sites and the helper has to hand back the library's member, which only real IE11 catches
- `usage-pure` cannot serve typed-array prototype methods at all, so an exercise must not route a typed array through one. Indexing is fine
- A new library needs a reason on an axis. Topology is one, because unplugin's scope resolution is superlinear within a module: keep the small-modules, mid-sized-graph and monolith profiles represented. The phase axis is the other, and it needs TypeScript sources - `isolatedModules`-clean, listed in `TS_SOURCE_PACKAGES`, out of the throughput tier. Only headless computational libraries qualify at all; core-js cannot make DOM or stream code run on IE11
- Isolation is a requirement: `mode: 'full'` patches globals permanently, so the pre-flight forks a child per bundle and Karma loads one bundle per page. Co-loading lets one cell's injection mask another cell's miss
- Never regenerate a snapshot blindly - read the diff, then rerun with `OVERWRITE=1`. A change to a reference moves every delta of that library and method with it, which is the point of pairing them
- Timings are reported, never asserted, and never quoted in prose or in a comment - they move with the machine and go stale where nothing checks them
