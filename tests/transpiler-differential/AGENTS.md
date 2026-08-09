# transpiler-differential

A differential oracle over generated inputs. A snippet passes when the two emitters agree on the injected import set and when native, babel and unplugin all produce the same runtime result - and, for grammar snippets, when the polyfilled output still reproduces native in a realm without the built-in.

Body shape is deliberately not compared: an AST codegen and a text rewrite differ there by construction, and that difference is what the fixture sidecars record.

## Target environment

Node `^22.18.0 || >=24.11.0`, on the root dependencies - unlike most suites this directory has no `package.json` of its own. It runs both emitters in-process, and forks a worker per stripped evaluation: realms are never reclaimed, so a realm per snippet exhausts the shard's memory, and reusing one would be vacuous anyway - the first correct install masks every later miss.

Run it with `npm run test-transpiler-differential`. It is slow - the corpus is large and every snippet is executed three times - so it is split across processes, as many of them running at once as half the core count.

## Layout

- `generate.mjs` - the corpus, deterministic rather than random: families expand as a cross-product of syntactic contexts, receivers and methods, which reaches combinations nobody would write by hand. Snippets are grouped into families and each exports the observed value plus a side-effect log, so a duplicated receiver evaluation shows up as a duplicated entry rather than as a passing test
- `harness.mjs` - runs one snippet through the three legs and compares them
- `strip-manifest.mjs` - what may be removed from a realm, and the pairing rules that make a strip meaningful
- `strip-builtins.mjs`, `stripped-worker.mjs`, `global-leg.mjs`, `global-leg-worker.mjs` - the leg implementations
- `index.mjs`, `shard.mjs` - the coordinator and one chunk of work
- `tmp/` - generated, gitignored

## Rules

- The corpus mutates globals, so snippets cannot share a realm. Work is split into chunks, each a separate process running its subset sequentially; adding in-process concurrency reintroduces the interleaving that produced false failures before
- A snippet has to run natively without throwing for an uninteresting reason, or the three-way comparison says nothing
- Extend by adding a family to the generator, not by adding one-off snippets: a family covers a class of shapes, and a single case only proves itself
- Before stripping a built-in, check the manifest's pairing rules - removing half of a paired feature leaves a state no real engine has, and the result is noise rather than a finding
- A new finding is locked as a fixture, and, when it is a runtime defect, in `tests/e2e-usage-pure/` as well. This suite generates its inputs, so nothing here is a permanent regression guard
