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
- `index.mjs`, `shard.mjs` - the coordinator and one chunk of work (`DIFF_SHARD="k/N"` selects a chunk by hand)
- `rig-aliases.mjs` - live `self` / `window` slots for the proxy-hop corpora, installed from OUTSIDE the snippet: an
  in-module `globalThis.self = ...` is a slot mutation under the mutated-statics canon and would switch off the very
  substitutions those corpora compare
- `serialize.mjs` - the runtime comparison's serializer, apart from `harness.mjs` on purpose: the stripped worker
  imports it and must NOT pull in `@babel/core`, which uses the builtins that worker strips
- `cache-store.mjs` - the evaluation cache, below; `cache.mjs` is its test (`npm run test-transpiler-differential-cache`), cheap enough for the edit loop
- `tmp/` - generated, gitignored

## The evaluation cache

Results are remembered under `~/.cache/core-js-differential/`, one entry per (snippet, evaluation) -
up to eight per snippet, kept together in a group under its name. A changed result overwrites its own
entry, so nothing accumulates.

An entry may only answer a question identical to the one it answered before, so its address names
everything the answer depends on:

- **its own code**, hashed per entry - an emitter edit voids exactly the entries whose output changed,
  which is what makes a run cost what the edit cost. The plugins are deliberately absent: they act
  through the output, and the output is already here
- **what ran before it in the chunk**, as a running hash. Snippets share a realm and the corpus writes
  onto globals on purpose, so a snippet can observe its predecessors. A plugin edit leaves this alone
  and the cache stays warm; a corpus edit re-runs what follows it
- **the core-js under it** - an output is a list of imports, so a polyfill edit moves the result
  without moving a byte of the output. The header stamps both runtime trees; `native` and `arming`
  read the raw source and depend on neither
- **the harness**, hashed into the FILE NAME, so a different harness or branch gets its own file

Never stored: a failed snippet (a worker that died mid-import is indistinguishable from a snippet
that threw, and storing it would pin the case red forever), and a result the audit could not
reproduce.

The cache decides no verdict - it skips work whose answer is known, and the AUDIT keeps that honest
by re-computing a rotating slice each run and comparing. A silent audit is the normal case; a
`CACHE AUDIT` line is a bug in the ADDRESS, not the data - a value moved while everything the address
names held still, so one of the four items above is missing something. Usually the snippet observes
the realm rather than itself (a key count over a shared object, a builtin a neighbour rewrote) and the
fix belongs in the corpus. To re-check one result, re-run its chunk (`DIFF_SHARD="k/N"`) or the run
itself - both re-compute what you doubt.

`INVALIDATE_CACHE=1` throws everything away and re-executes the corpus. **A last resort, not a
habit**: it makes the audit's message disappear and leaves the hole for the next person. Use it only
when a run is suspect in a way none of the four items can express, and say which way.

## Rules

- The corpus mutates globals, so snippets cannot share a realm. Work is split into chunks, each a separate process running its subset sequentially; adding in-process concurrency reintroduces the interleaving that produced false failures before
- A snippet has to run natively without throwing for an uninteresting reason, or the three-way comparison says nothing
- An observable must be a function of the SNIPPET, not of the realm - the rule the `CACHE AUDIT` line above enforces. Snippets share a realm with the corpus cases that write onto globals on purpose, so a key COUNT over a shared receiver - `globalThis`, a constructor - reports which snippets ran before this one rather than what the emitter did: it drifts with the chunk order and compares values the three legs observed at different moments. Observe shape (`typeof r`, a named key, a value) instead of size; a literal built inside the snippet is a safe receiver for counting, a shared one never is. The pure legs have one of these built in: the ponyfill constructor is ONE object per realm and importing a static module installs the static ON it, so a snippet whose output reads `_Map.groupBy` answers by whether a NEIGHBOUR imported `map/group-by`. Reading a static off a substituted constructor obliges the snippet to touch that static itself (`void Map.groupBy;` in its setup), which makes its own output import the module and pins what it reads
- Extend by adding a family to the generator, not by adding one-off snippets: a family covers a class of shapes, and a single case only proves itself
- An axis belongs in a cross-product only if the code under test branches on it; one carried as pass-through data - which static method, say - multiplies cases without adding a path. To collapse a suspect axis, re-seed the regression the family exists to catch: still red means the axis was redundant
- **Pick the leg by what it can SEE**, and set the family's flags from that, never from what looks thorough:
  - the STRIPPED realm is the only leg that sees a missed injection or a mis-substituted global ROOT - both emitters missing the same import agree with each other, and the full environment still has the native, so import parity and the three-way runtime both stay green. It fires on the generator's `strip` expectation, never on whether the output injected anything, or it would skip exactly that class. A family whose failure mode is the proxy-global root must set `strip: true`
  - before stripping, check the manifest's pairing rules - half a paired feature is a state no real engine has, and the result is noise rather than a finding
  - a narrowing regression that DEGRADES is invisible to ALL three, the stripped realm included: the generic polyfill still installs and behaves, which is the injection bias the provider declares rather than a gap here. Only a WRONG narrow surfaces, so a type-resolution family needs the right answer and the plausible wrong ones to be DIFFERENT types - rows that all resolve to the same type pass whatever the resolver does
- A new finding is locked as a fixture, and, when it is a runtime defect, in `tests/e2e-usage-pure/` as well. This suite generates its inputs, so nothing here is a permanent regression guard
