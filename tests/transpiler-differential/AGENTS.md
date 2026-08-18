# transpiler-differential

A differential oracle over generated inputs. A snippet passes when the two emitters agree on the injected import set and when native, babel and unplugin all produce the same runtime result - and, for grammar snippets, when the polyfilled output still reproduces native in a realm without the built-in.

Body shape is deliberately not compared: an AST codegen and a text rewrite differ there by construction, and that difference is what the fixture sidecars record.

## Target environment

Node `^22.18.0 || >=24.11.0`, on the root dependencies - unlike most suites this directory has no `package.json` of its own. It runs both emitters in-process, and forks a worker per stripped evaluation: realms are never reclaimed, so a realm per snippet exhausts the shard's memory, and reusing one would be vacuous anyway - the first correct install masks every later miss.

Run it with `npm run test-transpiler-differential`. The corpus is large and every snippet is executed three times, so the work is split across processes, as many at once as half the core count. Evaluations are cached across runs (below), so only a first run pays for the whole corpus: a repeat costs what the edit changed, which is usually a minute or less. **Run it bare.** The positional tokens `pure` (skip the usage-global leg) and `babel` / `unplugin` (one emitter, import-parity oracle off) exist for narrowing what is UNDER TEST, not for speed - the cache already removed that reason - and a scoped run labels itself as not a full verification.

## Layout

- `generate.mjs` - the corpus, deterministic rather than random: families expand as a cross-product of syntactic contexts, receivers and methods, which reaches combinations nobody would write by hand. Snippets are grouped into families and each exports the observed value plus a side-effect log, so a duplicated receiver evaluation shows up as a duplicated entry rather than as a passing test
- `harness.mjs` - runs one snippet through the three legs and compares them
- `strip-manifest.mjs` - what may be removed from a realm, and the pairing rules that make a strip meaningful
- `strip-builtins.mjs`, `stripped-worker.mjs`, `global-leg.mjs`, `global-leg-worker.mjs` - the leg implementations
- `index.mjs`, `shard.mjs` - the coordinator and one chunk of work
- `cache-store.mjs` - the evaluation cache, below; `cache.mjs` is its test (`npm run test-transpiler-differential-cache`), cheap enough for the edit loop
- `tmp/` - generated, gitignored

## The evaluation cache

An evaluation is a pure function of the code bytes, the realm they run in and the core-js runtime they import, so unchanged ones are memoized across runs under `~/.cache/core-js-differential/`. This is what makes the bare run cheap: a repeat re-executes only what the edit moved.

The file is grouped per snippet (`cases[name] = { src, <type>: cell }`), one cell per (snippet, type), so nothing accumulates - a changed result rewrites its cell in place. Invalidation is layered, each level as local as it can be:

- the name left the corpus - the group goes with it
- `src` moved (the generator rewrote that case) - the whole group is void
- a cell's own `h` moved - only that cell, which is the usual case after a plugin edit
- a `runtime` stamp moved - only the cells under that tree; `native` / `arming` read the raw source and depend on no runtime, the usage-pure cells on `@core-js/pure`, the usage-global ones on `core-js/modules`
- the machinery hash in the FILE NAME changed (both legs, their workers, the manifest, serializer, harness, shard, alias rig, the babel packages doing the TS strip, the node binary) - branches and machinery edits get their own file rather than poisoning each other

Two things are never cached: a failing snippet (an `ERR` from a dying worker is indistinguishable from a real one, and cached it would pin the case red forever) and a result the audit proved unreproducible.

The cache never decides a verdict on its own, and the AUDIT is what keeps that true: a rotating sample of the hits is re-evaluated and compared. A reproducible disagreement fails the run loudly - a key lost a dimension, so every other hit that run is suspect. An unreproducible one means the snippet is not a function of its code alone; it is evicted instead of reported. Hit / evaluated / audited counts print in the summary, and `cache.mjs` is the suite for all of this (`npm run test-transpiler-differential-cache`, seconds).

`INVALIDATE_CACHE=1` discards the stored contents by hand. **A last resort, not a habit** - the layers above already cover every ordinary reason, so reach for it only when a run is suspect in a way none of them can express, and say why. A routine run does not need it.

## Rules

- The corpus mutates globals, so snippets cannot share a realm. Work is split into chunks, each a separate process running its subset sequentially; adding in-process concurrency reintroduces the interleaving that produced false failures before
- A snippet has to run natively without throwing for an uninteresting reason, or the three-way comparison says nothing
- Extend by adding a family to the generator, not by adding one-off snippets: a family covers a class of shapes, and a single case only proves itself
- An axis belongs in a cross-product only if the code under test branches on it; one carried as pass-through data - which static method, say - multiplies cases without adding a path. To collapse a suspect axis, re-seed the regression the family exists to catch: still red means the axis was redundant
- Before stripping a built-in, check the manifest's pairing rules - removing half of a paired feature leaves a state no real engine has, and the result is noise rather than a finding
- The stripped legs fire on the generator's `strip` expectation, never on whether the output injected anything. A missed injection emits no import, so an import-gated run would skip exactly the bug class the leg exists to catch: both emitters missing the same injection agree with each other and with the full-environment native, and nothing else notices
- A wrong substitution of the global root itself is invisible to two of the three oracles: the shared prelude already pulls `global-this`, so the import sets stay equal, and the full environment still has the native, so the runtimes agree. A family whose failure mode is a mis-substituted proxy-global root must set `strip: true` - the stripped realm is the only leg that sees it
- A narrowing regression that DEGRADES is invisible to all three oracles at once, the stripped realm included: the generic polyfill it falls back to still installs and behaves like the specific one, which is the injection bias the provider declares rather than a gap here. Only a WRONG narrow surfaces, because usage-pure then hands a type-specific helper to a receiver of another type - so a family about type resolution needs the right answer and the plausible wrong ones to be DIFFERENT types, and rows that all resolve to the same one pass whatever the resolver does
- A new finding is locked as a fixture, and, when it is a runtime defect, in `tests/e2e-usage-pure/` as well. This suite generates its inputs, so nothing here is a permanent regression guard
