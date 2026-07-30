# Iterator-helper injection for own data fields: platform-unstable on this branch's plugin, unified on current v4

## The short version

`@core-js/unplugin`, given plain own data fields whose names collide with iterator-helper methods
(`this.filter = null`, `this.chunks = []` — assigned and used in the same class, never called),
answers differently depending on the **version of the plugin**, and on the old version, on the
**platform**:

| plugin code | platform | babel-plugin | unplugin, direct | unplugin, via bundler adapters |
|---|---|---|---|---|
| this branch's base (~`e88bd77c61`) | linux/x64 (node 22/24, repeated runs) | `es.array.push` only | none | none |
| this branch's base | win32/x64 (node 26, CI) | — | — | **5 iterator polyfills** |
| current v4 (`2953b35f34`) | linux/x64 | **3** (`es.iterator.{constructor,filter}`, `esnext.iterator.chunks`) | **5** | **5** — all seven adapters, `pre` AND `post` |

The five: `es.iterator.constructor`, `es.iterator.filter`, `esnext.async-iterator.constructor`,
`esnext.async-iterator.filter`, `esnext.iterator.chunks`.

Reduced from real sites: `three/build/three.core.js:50806` (`this.filter`, an audio node) and
`@codemirror/state/dist/index.js:3451` (`this.chunks`, a plain array). Surfaced as a 2-cell snapshot
drift in the e2e-libs `usage-global/pre` cells on the windows CI runner.

## What the version axis resolves

Between this branch's base and v4 HEAD sit ten plugin commits, including "improve and **unify**
property type resolving" and "improve some cases of props type resolving". Swapping ONLY
`packages/core-js-{unplugin,polyfill-provider,babel-plugin}` to v4 HEAD in an otherwise unchanged
checkout flips linux from `none` to the same five the old code produced on windows — uniformly across
every invocation path this repro can drive (direct, rollup, rolldown, esbuild, vite, webpack, rspack)
and both phases.

So the platform instability this investigation chased appears to be **resolved upstream** by making
the conservative answer uniform: current v4 injects for the NAME on every platform and path, rather
than proving the receiver's type on some and falling back on others. The old windows answer was not
windows being broken — it was the fallback the new code now takes everywhere.

What remains for upstream is a **cross-plugin** delta, no longer a platform one: on identical v4-HEAD
code, babel-plugin injects three (the sync family + `chunks`) where unplugin injects five (adding the
`async-iterator` pair). If that is worth pinning, a transpiler fixture with an `output-unplugin.mjs`
sidecar records it exactly.

## A false lead, kept here so nobody re-follows it

An intermediate attempt to express this as a `tests/transpiler-fixtures` fixture ran on a branch cut
from **current v4**, while this repro and the CI evidence ran on **this branch's older plugin** — and
comparing the two produced a convincing but wrong conclusion ("the answer depends on the path of
invocation"). It does not, on either version alone: the old code answers `none` on linux through every
path including direct invocation; the new code answers the same five through every path. What varied
was the plugin, not the path. The tell that unraveled it: babel-plugin on THIS branch injects only
`es.array.push` for the minimal fixture, while the fixture branch's babel output carried the three
iterator modules.

Two smaller facts from that detour, still true and occasionally useful:

- `phase` is an unplugin-only option and is rejected by the shared option validation
  ("Unknown plugin option: phase"), both by babel-plugin and by a direct `createPlugin` call — so no
  transpiler fixture (and no direct invocation) can carry it. It only orders the plugin among bundler
  siblings; `'pre'` is the default.
- The e2e-libs windows evidence was produced on single-module builds, so cross-module transform
  ordering never explained anything: the decision under test is made while transforming one module.

## Reproduction

```text
node repro.mjs [--verbose]
```

Runs the fields fixture through every invocation path — `direct` (a raw `createPlugin().transform()`,
the way transpiler fixtures drive the plugin) plus the rollup, rolldown, esbuild, vite, webpack and
rspack adapters — and prints the iterator-helper polyfills each one injects, plus a rollup run at
`post`. Bundler legs mark `core-js/*` external so the injected specifiers survive bundling and are
read off the output text; that cannot influence the decision under test, which is taken while
transforming `fixture.mjs`, before the injected imports are resolved. farm is excluded (its resolver
breaks on the injected specifiers — see e2e-libs/build.mjs); rsbuild wraps the same rspack adapter
under an app-config layer and would isolate nothing new.

- `fixture.mjs` — the two field shapes and nothing else, so any iterator-helper polyfill injected for
  it is name-keyed, not type-proven.
- `control.mjs` — a genuine `unknownIterator.filter(x => …)` that MUST inject; a detector that had
  silently stopped running cannot pass as correct.

Exit codes: `2` — the control failed (verdict meaningless). `1` — the rollup-adapter leg injected
iterator helpers for the fields; on THIS branch's plugin that is the windows-only signature the CI
probe watches for. `0` — that leg is clean. NOTE: on v4-HEAD plugin code the answer is five on every
platform, so once this branch rebases onto current v4 the probe will exit 1 everywhere — at that point
its job is done: retire it (and this directory) or re-purpose the matrix as a legs-agreement check,
and re-baseline the e2e-libs `pre` snapshots (`--update`), which will legitimately move.
