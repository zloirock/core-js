# @core-js/unplugin

Automatic polyfill injection for bundlers: the adapter between the unplugin hooks of every supported bundler and `@core-js/polyfill-provider`, plus the emitter that renders what the provider decides. The semantics belong there, not here.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`, plus Bun for the `bun` entry.

## Layout

At the package root, one `<bundler>.js` and `<bundler>.d.ts` pair per bundler - Vite, Webpack, Rspack, Rsbuild, Rollup, Rolldown, esbuild, Farm, Bun. Each is a one-line re-export of the corresponding binding from `index.js`. A pair is not the whole story though: bundlers are also named in `KNOWN_BUNDLERS`, in the hook-shape branch for Rollup and Rolldown, in the set whose `pre+post` degrades to `post`, and in `CHUNK_LOADER_BUNDLERS`. `unloader` has no entry pair on purpose and must not get one, but it *is* present in those sets because upstream can hand it to us - do not delete it there.

`index.js` builds those bindings through `createUnplugin` and decides which module ids are transformed at all: virtual modules, commonjs proxies and asset queries are filtered out there.

`internals/` holds the pipeline:

- `plugin.js` - the core: parse with oxc-parser, walk with estree-toolkit, edit through MagicString
- `ast/print.js` - the AST engine's esrap printer adapter (the staged migration off the text layer): loc synthesis, paren normalization to the minimal structural set, and the corpus-measured esrap gap overrides. The `engine` option selects the engine; `'ast'` is rejected until its first method lands. Nothing under `ast/` imports the text-transform layer - lint-enforced, so that layer can one day be deleted out from under it
- `detect-entry.js`, `detect-usage.js` - the unplugin side of detection, on top of the provider
- `polyfill-emitter.js`, `destructure-emitter.js`, `destructure-emit-utils.js` - the rewrites themselves
- `import-injector.js` - import insertion
- `transform-queue.js`, `text-scan.js`, `emit-utils.js` - the text-transform layer: queued edits, the lexer (the one tokenizer every lexer-aware walk over source or emitted text rides - the literal / comment region map, the backward significant-char scan, the gap scans; it lexes in the file's dialect, JSX and script goal included), AST helpers
- `scope-tracker.js`, `ref-canon.js` - generated refs: per-traversal scope state, then canonical print-order naming
- `estree-compat.js` - ESTree to Babel literal-type mapping, the seam between the two AST dialects
- `sfc-shapes.js` - module ids of SFC virtual modules (Vue, Svelte, Astro), whose metadata lives in query params
- `snapshot-cache.js` - the pre-to-post handoff for `phase: 'pre+post'`
- `plugin-helpers.js` - directive prologues, the ASI predicates, injection anchors, the census reducers
- `detect-entry.js` also holds the top-level statement rewriter both the entry pass and the usage sweep remove user core-js imports through: removals, `0;` placeholders and kept indirect-require prefixes in one batch, with the ASI guards of the seams decided over what survives

## Emitter model

Queues text transforms during traversal and applies them with MagicString afterwards. Two consequences:

- A region that is being dropped is skipped at the visitor entry, before it is descended into, rather than drained at emit time. The tail of a `for` initializer is the exception that proves it: there the effect-free receiver tail is deliberately *not* skipped, because its proxy-global root still has to be seen and polyfilled - a raw `globalThis` left behind would throw
- Output may differ from babel-plugin in formatting only; a semantic divergence means one of the two renderers is wrong. Formatting covers everything reprinting normalizes away, and this plugin lowers no syntax: a spelling the source already chose - a trailing comma in an argument list, layout, where a comment sits - survives a text splice while the AST renderer quietly drops it, and neither side is at fault. Text the emitter *authors* is the opposite case: it has to parse on the target, so what it writes is held to the target's syntax even when the surrounding source is not. One spelling is deliberately normalized anyway, in every method and whether or not the file is polyfilled at all: a type instantiation directly in front of `?.` (`((X)<T>)?.(a)` becomes `(X)?.<T>(a)`, two point edits so the parens and any trivia survive). It is the one shape a later lowering reads *wrong* rather than differently - babel's `isTransparentExprWrapper` does not list `TSInstantiationExpression`, so it memoizes no receiver and the call silently loses its `this`. The `post` phase cannot help there: that lowering has already run before this plugin sees the file
- Siblings never share the tree - each phase parses its own - so sibling interaction moves between the phases instead: `pre+post` hands its state across through the snapshot, and post re-scans the imports siblings inserted in between rather than trusting what pre saw

Anything that has to be fixed in this package *and* in babel-plugin belongs in the provider instead.

Before writing a helper or a branch, check the canon - `npm run canon -- find "<behavior words>"` (its own `AGENTS.md` in `scripts/canon/` carries the reference): what you need may already exist in the provider or in babel-plugin under an unguessable name. Extend or lift the near-match, never fork a copy; implementing new means naming the checked candidates and why each does not fit. Before handing the work off, `npm run canon -- delta` audits the diff the other way: it lists every added named symbol with its same-name and near-name canon candidates, and exits 1 while any remain unadjudicated.

## Tests

- `npm run test-unplugin` - shared fixtures from `tests/transpiler-fixtures/`
- `npm run test-unplugin-unit` - internals, in `tests/unplugin/unit.mjs`
- `npm run test-unplugin-roundtrip` - the AST engine's no-op print gate: every fixture input reprints through `ast/print.js` with zero mutations, and the reparse must be structurally identical, keep every comment with its directive line association, and reach a print fixed point

A divergence from babel-plugin is recorded in a sidecar `output-unplugin.mjs` next to the fixture. A sidecar is a proof obligation: show what the difference actually is before accepting it.

Those runners only compare text, which settles cosmetic work; a change in BEHAVIOR is verified while you work by the correctness suite nearest to it, scoped to what changed:

- `npm run test-transpiler-differential` - both emitters against native at runtime, on the generated corpus. Run it bare: evaluations are cached across runs, so a repeat costs what the edit changed. The `unplugin` token narrows the run to this emitter and turns the import-parity oracle off - use it to isolate a suspect, never to save time
- `npm run test-e2e-usage-pure` - executes the transformed code; this plugin gets a leg per phase, because each side of the babel sandwich is blind to the other, and only the `pre+post` one also runs in a stripped realm
- `npm run test-transpiler-integration` - when the change touches a hook, a module-id assumption or anything bundler-facing: the matrix exercises every bundler, method and phase, which is where those break instead of in a fixture
- `npm run test-transpiler-perf` - guards the complexity class

One full `npm run test-transpiling` is the finish line - a VERY heavy run that composes every suite named here including this package's own runners: run it once, right before the work is handed off, never mid-loop, and never with a member on the same invocation line.
