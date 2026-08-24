# @core-js/unplugin

Automatic polyfill injection for bundlers: the adapter between the unplugin hooks of every supported bundler and `@core-js/polyfill-provider`, plus the emitter that renders what the provider decides. The semantics belong there, not here.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`, plus Bun for the `bun` entry. `@core-js/compat` in `dependencies` is runtime-unused on purpose: `index.d.ts` type-imports `@core-js/compat/compat`, so the package must resolve for consumers' tsc - do not drop it as a leftover.

## Layout

At the package root, one `<bundler>.js` and `<bundler>.d.ts` pair per bundler - Vite, Webpack, Rspack, Rsbuild, Rollup, Rolldown, esbuild, Farm, Bun. Each is a one-line re-export of the corresponding binding from `index.js`. A pair is not the whole story though: bundlers are also named in `KNOWN_BUNDLERS`, in the hook-shape branch for Rollup and Rolldown, in `PRE_POST_UNSAFE_BUNDLERS` (where `pre+post` degrades to `post`), and in `CHUNK_LOADER_BUNDLERS`. `unloader` has no entry pair on purpose and must not get one, but it *is* present in `KNOWN_BUNDLERS` and `CHUNK_LOADER_BUNDLERS` because upstream can hand it to us - do not delete it there.

`index.js` builds those bindings through `createUnplugin` and decides which module ids are transformed at all: virtual modules, commonjs proxies and asset queries are filtered out there.

`internals/` holds the pipeline. The core and detection:

- `plugin.js` - the core: parse with oxc-parser, walk with estree-toolkit, apply as body surgery, print through esrap; every pass shape (`pre` / `post` / `pre+post`) runs here. Detection-convenience tree mutations (`neutralizeUnwalkedParamPatterns`) record undo thunks the print replays first
- `detect-entry.js`, `detect-usage.js` - the unplugin side of detection, on top of the provider; `entry.js` applies the entry plan as body surgery
- `print.js` - the esrap printer adapter: loc synthesis, paren normalization to the minimal structural set, the corpus-measured esrap gap overrides, the sourcemap anchors of minted spellings
- `import-injector.js` - the injector: import and generated-ref bookkeeping, name allocation, the pre-to-post snapshot shape, and the flush that sweeps, injects and retires dead memos
- `builders.js`, `emit-shared.js` - the node constructors and the shared render idioms
- `estree-compat.js` - ESTree to Babel literal-type mapping, the seam between the two AST dialects
- `sfc-shapes.js` - module ids of SFC virtual modules (Vue, Svelte, Astro), whose metadata lives in query params
- `snapshot-cache.js` - the pre-to-post handoff for `phase: 'pre+post'`
- `plugin-helpers.js` - directive prologues, the walk helpers, the injection-seam ASI predicates, the census reducers

The usage-pure emitter is layered bottom-up and acyclic; `proxy-spine`, `optional-dispatch` and `destructure-drain` are per-transform channel factories, the rest are plain modules:

- `usage-pure.js` - the visit callback itself: claim dispatch, and the wiring that instantiates the channels below
- `proxy-spine.js` - the proxy-global spine: hop collapses, static and hop claims, the kept-write and navigated-collapse canon
- `optional-dispatch.js` - optional and split dispatch: receiver splits, instance and inherited-static emission, guard composition
- `se-dispatch.js` - the side-effect lifts: bare-optional SE dispatch, SE-key reads, sealed-key consumes
- `claim-guards.js` - guard rendering over claims: probe spellings, sealed forms, guarded-hop replacement
- `nav-spine.js` - the navigation walks and shared bottom helpers: spine climbs, peels, probes, skip marking
- `destructure.js`, `destructure-drain.js`, `destructure-helpers.js` - the destructure pipeline: the visit half and facade, the drains that render at flush, and the shared helper vocabulary
- `destructure-emit-utils.js` - pure receiver-classification helpers, no file-scope state

## Emitter model

Mutates the parsed tree during traversal and reprints the whole file through esrap afterwards. Three consequences:

- Output is held STRUCTURALLY to babel-plugin's: both are AST renderers, so a difference that survives the structural comparator (`tests/unplugin/structural.mjs` - parens, literal `raw` spellings, statement-list empties and their kin are formatting) is a defect of one of the two, never a spelling preference. The reprint normalizes what the author's bytes spelled; the roundtrip gate holds the printer to a no-op on untransformed input
- One spelling is normalized in every method, polyfilled or not: a type instantiation directly in front of `?.` (`((X)<T>)?.(a)` -> `(X)?.<T>(a)`). It is the one shape a later lowering reads *wrong* rather than differently - babel's `isTransparentExprWrapper` does not list `TSInstantiationExpression`, so the lowered call silently loses its `this`, and `post` runs too late to fix it
- Siblings never share the tree - each phase parses its own - so sibling interaction moves between the phases instead: `pre+post` hands its state across through the snapshot, and post re-scans the imports siblings inserted in between rather than trusting what pre saw

Anything that has to be fixed in this package *and* in babel-plugin belongs in the provider instead.

Before writing a helper or a branch, check the canon - `npm run canon -- find "<behavior words>"` (its own `AGENTS.md` in `scripts/canon/` carries the reference): what you need may already exist in the provider or in babel-plugin under an unguessable name. Extend or lift the near-match, never fork a copy; implementing new means naming the checked candidates and why each does not fit. Before handing the work off, `npm run canon -- delta` audits the diff the other way: it lists every added named symbol with its same-name and near-name canon candidates, and exits 1 while any remain unadjudicated.

## Tests

- `npm run test-unplugin` - shared fixtures from `tests/transpiler-fixtures/`: the output must be STRUCTURALLY identical to the babel baseline (`tests/unplugin/structural.mjs` owns what counts as formatting)
- `npm run test-unplugin-unit` - internals, in `tests/unplugin/unit.mjs`
- `npm run test-unplugin-roundtrip` - the no-op print gate: every fixture input reprints through `print.js` with zero mutations, and the reparse must be structurally identical, keep every comment with its directive line association, and reach a print fixed point

A divergence from babel-plugin is recorded in a sidecar `output-unplugin.mjs` next to the fixture, byte-held; the gate's OVERWRITE mode regenerates the whole sidecar set - one exists exactly where the compare against babel differs. A sidecar is a proof obligation: show what the difference actually is before accepting it. The accepted classes: environmental divergence (targets resolution babel@8 does differently, the `require` dialect on SFC virtuals), an accepted spelling the structural compare sees (a kept alias receiver babel folds, ref-hoist placement, a TS type reprint), and parser acceptance (oxc transforms what babel@8 rejects, e.g. legacy TS `module N {}`).

Those runners only compare output, which settles cosmetic work; a change in BEHAVIOR is verified while you work by the correctness suite nearest to it, scoped to what changed:

- `npm run test-transpiler-differential` - both emitters against native at runtime, on the generated corpus. Run it bare: evaluations are cached across runs, so a repeat costs what the edit changed. The `unplugin` token narrows the run to this emitter and turns the import-parity oracle off - use it to isolate a suspect, never to save time
- `npm run test-e2e-usage-pure` - executes the transformed code; this plugin gets a leg per phase, because each side of the babel sandwich is blind to the other, and only the `pre+post` one also runs in a stripped realm
- `npm run test-transpiler-integration` - when the change touches a hook, a module-id assumption or anything bundler-facing: the matrix exercises every bundler, method and phase, which is where those break instead of in a fixture
- `npm run test-transpiler-perf` - guards the complexity class

One full `npm run test-transpiling` is the finish line - a VERY heavy run that composes every suite named here including this package's own runners: run it once, right before the work is handed off, never mid-loop, and never with a member on the same invocation line.
