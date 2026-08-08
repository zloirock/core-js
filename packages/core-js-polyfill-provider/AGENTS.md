# @core-js/polyfill-provider

The shared core behind `@core-js/babel-plugin` and `@core-js/unplugin`: it detects what the source uses, resolves the types of the receivers it finds, decides what has to be injected, and hands the result to whichever emitter is rendering.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`.

## Architectural invariant

Semantics belong here. The two plugins are adapters to their host - they speak Babel's or the bundler's API, feed the source in, and render what comes back. A fix that has to be written twice, once per plugin, is a smell: push it into the provider instead.

That is the rule, not a description of the current state. Plenty of decisions are still duplicated in the emitters - the `usage-pure` dispatcher exists in both, while its `usage-global` counterpart is centralized here - and some are plugin-local on purpose, which the files in question say so explicitly.

The target shape is: one parse, one normalized plan built here, emitters that only render it. Move toward that shape by collapsing existing paths, not by adding new ones. A new code path needs a written justification; the default fix deletes code.

## Injection methods

- `entry-global` - replaces a core-js entry import with the individual `core-js/modules/*` imports its targets need. All the shapes count, not just the bare `import`: `require`, dynamic `import()`, TypeScript's `import x = require(...)`, and any entry subpath
- `usage-global` - detects API usage and injects side-effect imports for the polyfills it needs
- `usage-pure` - detects API usage and rewrites it into imports from `@core-js/pure`

The injection bias differs by method, deliberately: `usage-global` injects when a polyfill *might* be needed, because over-injection is harmless; `usage-pure` rewrites only when the receiver type is *certain*, because over-resolving it throws at runtime while under-resolving only degrades to the generic polyfill.

The symmetry stops at globals. Declining to resolve a receiver *type* is safe, but declining to rewrite a polyfillable *global* is not: what stays behind is a raw `globalThis` or `Symbol`, which is exactly what the target engine may not have.

## Layout

- `index.js` - the package entry: the polyfill context and the `resolve` that turns a usage site into a meta from the built-in definitions
- `detect-usage/`, `detect-syntax.js` - what the source uses
- `resolve-node-type/`, `resolve-node-type.js` - receiver type resolution. It gates the pure path most visibly, but the global path narrows through it too, so a change here moves both import sets
- `resolver.js`, `injector-base.js` - the shared injection machinery; `destructure-host-shape.js` classifies destructure hosts into the parser-agnostic booleans both emitters consume
- `plugin-options/` - more than its name suggests: alongside option parsing and validation it holds the `usage-global` dispatcher and the module injectors both plugin entry points call. Plugin options are trusted build configuration, not attacker-controlled input
- `helpers/` - the cross-emitter canon that must not be forked: AST patterns, class walking, the skip-set subsumption rules, `key in obj` handling, path normalization

The feature definitions themselves are not here - they come from `@core-js/compat` (`built-in-definitions`, `known-built-in-return-types`).

## Tests

`npm run test-polyfill-provider` runs every suite in `tests/polyfill-provider/` - the resolvers, the detectors, the helpers, the option layer, cross-parser equivalence and the escape-analysis domains - and the plugin fixtures cover what the emitters print. Neither is enough on its own: babel-vs-unplugin parity is blind to a regression that sits here and shifts both emitters the same way, and fixtures happily lock a wrong decision as long as both renderers agree on it.

The oracles that do not share that blind spot:

- `npm run test-e2e-usage-pure` executes the transformed code, in both emitters' bundles and in realms with the native built-ins stripped, so a polyfill that was never injected fails instead of silently passing on a native
- `npm run test-transpiler-differential` runs a generated corpus through native and both emitters, comparing runtime results and import sets

A change to the provider contract is verified with the composite `npm run test-transpiling`, which runs those together with every plugin runner.
