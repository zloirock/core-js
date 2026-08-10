# e2e-libs

Real third-party libraries taken to the polyfill floor and executed there: each library is bundled, down-compiled to ES5 by Babel, polyfilled by one of the two providers this repo ships, then run - in a node pre-flight and in actual IE11. `tests/transpiler-integration` proves the plugins survive a real bundler and `tests/e2e-usage-pure` proves a syntactic form is served; this is the only suite where the stack meets code nobody wrote for it, and the only one whose verdict comes from the engine the polyfills exist for.

`README.md` is the full story - the reasoning behind every fixture, every measurement and every excluded path. What follows is what has to hold.

## Target environment

Two tiers in one directory, and mixing them up is the easy mistake:

- The runners, the builders and the exercises are Node `^22.18.0 || >=24.11.0`, modern syntax, on this directory's own `package.json` - four library stacks plus every bundler the throughput tier drives. The exercises are bundled and down-compiled before they ever reach the target, so they are written modern
- Anything that lands in a page verbatim is hand-written **ES5**: `harness.mjs` and the HTML it renders are never transformed, and one arrow function there is a `SyntaxError` in the only engine a real result comes from. Both harness targets are parsed by `assertES5` at load for exactly that reason

Everything runs from the repository root. `npm run e2e-libs` chains the two runners that assert - `e2e-libs-check-exercise`, then `e2e-libs-runtime`; `e2e-libs-pipeline` and `e2e-libs-throughput` only report and stay out of it. Arguments go after `--`, e.g. `npm run e2e-libs-throughput -- three rollup`. The scripts go through `scripts/zxi.mjs`, which installs this directory's dependencies for you and *imports* the runner instead of spawning it - which is why the runners read arguments through `args.mjs` and why every script body ends in `--`.

The suite is deliberately outside `npm test`, `test-raw` and `test-transpiling`: it pulls real libraries and every bundler, and a full pass takes minutes. Off a machine with IE11 every gate still runs and only Karma is skipped, so the browser leg happens in the `e2e-libs-ie11` job on `windows-2022` and nowhere else.

## Layout

- `libraries.mjs` - the registry: one entry per library, the tiers it takes part in, its exercise. `librariesIn` throws on a filter that matches nothing, so a typo cannot produce a green empty report
- `exercises/<lib>.mjs` - one deterministic exercise per library, exporting `run()` -> `{ checks }`, each check carrying its own `pass` so consumers only render it. The header of each states what the exercise drives and what it deliberately avoids
- `build.mjs` - the bundling core every runner shares: `METHODS`, `PROVIDERS`, `phasesFor`, the temp-entry scaffold, the per-bundler throughput builders, `runtimeBuild`, `TS_SOURCE_PACKAGES`, and the assertions the gates are made of - `assertES5`, `assertPayload`, `assertNoExternals`
- `runtime.mjs` - the gating tier
- `pipeline.mjs`, `throughput.mjs` - the reporting tiers; nothing gates on either
- `check-exercise.mjs` - every exercise run raw, no bundler and no polyfills, which is what separates a broken fixture from a broken toolchain
- `harness.mjs`, `karma.conf.cjs` - the in-page harness, banner and QUnit targets over one scaffold, and the IE11 launcher
- `snapshots/` - committed, 32 files, described below
- `artifacts/`, `report/`, `.tmp/` - generated and gitignored
- `package.json` - own dependencies, with `core-js` pinned to the workspace (`file:../../packages/core-js`) so injected polyfills resolve to this monorepo rather than to a hoisted published v3

## The matrix

`runtime.mjs` builds every (library x method x provider x phase) cell **once** and hands that single build to every consumer. That is the property to preserve: the set that is snapshotted, the bytes that are measured and the bundle that runs in IE11 are the same build by construction. This was three runners rebuilding the same configurations before - and a snapshot pinning one build while a different one ships is a gate describing something other than what it guards.

The two providers are not symmetrical, and the snapshots mirror that instead of pretending otherwise. `@core-js/babel-plugin` runs inside the Babel pass and has no phase - one traversal, one answer - so its set is the **reference**, stored whole in `snapshots/<lib>.babel-plugin.<method>.txt`. `@core-js/unplugin` is a bundler plugin beside Babel, so each phase is stored as a **delta** from that reference, `-spec` for what the reference has and the phase does not and `+spec` for the reverse. An empty delta file means the phase agrees exactly, and is written rather than omitted so that "agrees" is a recorded state. `entry-global` is snapshotted for neither - it never reads the library - and its cells assert that the two providers agree on the expansion instead.

| leg | verdict |
| --- | --- |
| ES5 parse, core-js payload present, nothing left external, non-empty injection set | gate |
| the injection snapshots, over the `usage-*` methods | gate |
| node pre-flight, one forked child per bundle | gate |
| real IE11 via Karma: `post`, `pre+post`, `entry-global` | gate |
| real IE11 via Karma: `pre` | per-library diagnostic, red on some by design |
| `buildMs`, `report/pipeline.*`, `report/throughput.*` | diagnostics; nothing gates |

## What green proves

A green artifact proves the exercise still executes on the target. It does not prove per-site detection: a global polyfill patches the prototype once, so one correctly-detected use masks a missed sibling use of the same feature in the same bundle, and the bundle runs regardless. `usage-pure` has no such masking - each site is rewritten to a local import, so a missed site stays a native call - but only on real IE11, since the pre-flight's realm has the native either way. Per-site detection for the global methods is therefore the job of `tests/unplugin/unit.mjs`, on the transform output directly; what this suite adds is the other half, the library's own code on the real floor.

## Rules

- The library's own implementation has to reach for what the target lacks. An exercise that reaches for it *on the library's behalf* tests Babel's helpers and says nothing about the library - attribution is by the immediate stack frame, which is why `from(new Set(...))` counts and `[...new Set(...)]` does not. Keep the modern stdlib out of the exercise's own code
- Checks assert version-robust invariants - zero parse errors, incremental equals full, ordered spans, semantic names - never magic totals, or a dependency bump reddens the suite for no reason
- Collisions between a library member and a core-js instance method (`Ray#at`, `Vector3#clamp`, `SelectionRange#flags`, a chunk's own `findIndex`) are deliberate coverage, not accidents: `usage-pure` rewrites those call sites and the helper has to hand back the library's member. On IE11 a broken fallback is fatal and the modern-realm pre-flight cannot see it
- `usage-pure` cannot serve typed-array *prototype* methods at all - a prototype method cannot be delivered without patching the prototype, which is what pure exists to avoid - so an exercise must never route a typed array through one. Indexing is fine. That hole reddens the gating `usage-pure` IE11 cells and nothing else, which is how it was found
- A new library needs a reason on an axis. Topology drives unplugin's cost, whose scope resolution is superlinear *within* a module rather than over total volume: keep the three topologies represented - many small modules, a deep graph of mid-sized ones, one monolith - because a regression there shows up on `three` first. A TypeScript-source library is on the phase axis instead, and has to ship `src/**/*.ts` in its tarball, be `isolatedModules`-clean, be listed in `TS_SOURCE_PACKAGES`, and stay out of the `throughput` tier until the other bundlers learn to resolve `.ts`
- Only headless computational libraries belong here. core-js polyfills the ECMAScript stdlib and a few web primitives; it cannot make DOM, Canvas, Worker or node-stream code run on IE11, so such a library would gate on nothing
- Isolation is a requirement, not tidiness: `mode: 'full'` patches globals permanently, so the pre-flight forks a child per bundle and Karma loads one bundle per page. Co-loading lets one cell's injection mask another cell's miss into a false green
- Never regenerate a snapshot blindly. These baselines are Babel-dependent and a `@babel/preset-env` bump may legitimately move them, so read the diff first, then rerun with `--update`. A change to a `babel-plugin` reference moves every delta of that library and method with it, and that coupling is the point of pairing them
- Timings are reported, never asserted. `buildMs` mostly says which cell started warm, `pipeline` is where timings are meant to be compared, and a `throughput` cell is a single build to be read as an order of magnitude. Quote none of those numbers in prose - they move with the machine, and every earlier attempt to keep a copy in sync went stale
