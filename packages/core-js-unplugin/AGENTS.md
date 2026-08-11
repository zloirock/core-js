# @core-js/unplugin

Automatic polyfill injection for bundlers: the adapter between the unplugin hooks of every supported bundler and `@core-js/polyfill-provider`, plus the emitter that renders what the provider decides. The semantics belong there, not here.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`, plus Bun for the `bun` entry.

## Layout

At the package root, one `<bundler>.js` and `<bundler>.d.ts` pair per bundler - Vite, Webpack, Rspack, Rsbuild, Rollup, Rolldown, esbuild, Farm, Bun. Each is a one-line re-export of the corresponding binding from `index.js`. A pair is not the whole story though: bundlers are also named in `KNOWN_BUNDLERS`, in the hook-shape branch for Rollup and Rolldown, in the set whose `pre+post` degrades to `post`, and in `CHUNK_LOADER_BUNDLERS`. `unloader` has no entry pair on purpose and must not get one, but it *is* present in those sets because upstream can hand it to us - do not delete it there.

`index.js` builds those bindings through `createUnplugin` and decides which module ids are transformed at all: virtual modules, commonjs proxies and asset queries are filtered out there.

`internals/` holds the pipeline:

- `plugin.js` - the core: parse with oxc-parser, walk with estree-toolkit, edit through MagicString
- `detect-entry.js`, `detect-usage.js` - the unplugin side of detection, on top of the provider
- `polyfill-emitter.js`, `destructure-emitter.js`, `destructure-emit-utils.js` - the rewrites themselves
- `import-injector.js` - import insertion
- `transform-queue.js`, `text-scan.js`, `emit-utils.js` - the text-transform layer: queued edits, lexical primitives, AST helpers
- `scope-tracker.js`, `ref-canon.js` - generated refs: per-traversal scope state, then canonical print-order naming
- `estree-compat.js` - ESTree to Babel literal-type mapping, the seam between the two AST dialects
- `sfc-shapes.js` - module ids of SFC virtual modules (Vue, Svelte, Astro), whose metadata lives in query params
- `snapshot-cache.js` - the pre-to-post handoff for `phase: 'pre+post'`
- `plugin-helpers.js` - directive prologues, ASI hazards, injection anchors

## Emitter model

Queues text transforms during traversal and applies them with MagicString afterwards. Two consequences:

- A region that is being dropped is skipped at the visitor entry, before it is descended into, rather than drained at emit time. The tail of a `for` initializer is the exception that proves it: there the effect-free receiver tail is deliberately *not* skipped, because its proxy-global root still has to be seen and polyfilled - a raw `globalThis` left behind would throw
- Output may differ from babel-plugin in formatting only; a semantic divergence means one of the two renderers is wrong

Anything that has to be fixed in this package *and* in babel-plugin belongs in the provider instead.

Before writing a helper or a branch, check the canon: `npm run canon -- find "<behavior words>"` searches the plugin packages and the `@core-js/compat` sources by names, contracts and comment text - what you are about to write may already exist in the provider or in babel-plugin under a name you would not guess, solved by a different mechanism - so query by the entities the code must touch plus the operation on them, and try more than one phrasing; `npm run canon -- show <file:line>` reads a candidate whole. Extend or lift the near-match, never fork a copy; implementing new means naming the checked candidates and why each does not fit.

## Tests

- `npm run test-unplugin` - shared fixtures from `tests/transpiler-fixtures/`
- `npm run test-unplugin-unit` - internals, in `tests/unplugin/unit.mjs`

A divergence from babel-plugin is recorded in a sidecar `output-unplugin.mjs` next to the fixture. A sidecar is a proof obligation: show what the difference actually is before accepting it.

Those runners only compare text. Correctness is decided by the suites `npm run test-transpiling` composes - `test-e2e-usage-pure` executes the output, `test-transpiler-differential` compares it against native and the other emitter, `test-transpiler-integration` drives the real bundlers, `test-transpiler-perf` guards the complexity class - so a change in behavior rather than formatting is verified with the composite. Two things are specific to this plugin: e2e gives it a leg per phase, because each side of the babel sandwich is blind to the other, and only the `pre+post` one is also run in a stripped realm; and the integration matrix exercises it across every bundler, method and phase, which is where a hook or module-id assumption breaks instead of in a fixture.
