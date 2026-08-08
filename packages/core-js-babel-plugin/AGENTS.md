# @core-js/babel-plugin

Automatic polyfill injection for Babel: the adapter between Babel's plugin API and `@core-js/polyfill-provider`, plus the emitter that renders what the provider decides. The semantics belong there, not here.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`. Works with both `@babel/core` 7 and 8.

## Layout

- `index.js` - the plugin itself: options, the Babel visitors, and the dispatch between the injection methods
- `internals/detect-entry.js` - recognizes the entry-import shapes that `entry-global` replaces
- `internals/detect-usage.js` - the Babel side of the provider's usage detection: it adapts Babel paths to what the provider expects
- `internals/import-injector.js` - inserts the imports or requires, respecting directives and the existing import block
- `internals/babel-compat.js` - the Babel-specific AST primitives: ref memoization, optional-chain deoptionalization, instance-method replacement, TS-wrapper peeling. Despite the name it knows nothing about Babel versions: the 7-versus-8 difference is bridged in `internals/import-injector.js`, where the scope bag hides `scope.references` / `scope.uids` becoming `referencesSet` / `uidsSet`
- `internals/destructure-emission-plan.js`, `internals/destructure-emitter.js` - destructure rewrites, planning separated from emission
- `internals/synth-swap-emitter.js`, `internals/synth-key-utils.js` - the receiver-targeted synth-swap and the safety gate deciding when a computed key may be mirrored into a synth literal

## Emitter model

Mutates the AST in place during traversal, inside Babel's own parse. The other adapter, `@core-js/unplugin`, parses separately and queues text transforms; the two may differ in formatting, never in semantics.

Anything that has to be fixed in this package *and* in unplugin belongs in the provider instead.

## Tests

- `npm run test-babel-plugin` - shared fixtures from `tests/transpiler-fixtures/`, against `@babel/core@8` (the default)
- `npm run test-babel-plugin-unit` - internals
- `npm run test-babel-plugin-v7` and `npm run test-babel-plugin-unit-v7` - the same against `@babel/core@7`, whose cosmetic divergences live in `<stem>.babel-v7.<ext>` fixture siblings; `tests/babel-plugin-v7/skip.mjs` is the last resort for what a sibling cannot express

Those runners only compare text. Correctness is decided by the suites `npm run test-transpiling` composes - `test-e2e-usage-pure` executes the output, `test-transpiler-differential` compares it against native and the other emitter, `test-transpiler-integration` drives the real bundlers, `test-transpiler-perf` guards the complexity class - so a change in behavior rather than formatting is verified with the composite. Of them, this plugin owns one of the four e2e bundles, and one of the two that also run in a stripped realm; in the integration matrix it takes part with no phase of its own.

When comparing this emitter against unplugin by hand, normalize whitespace and run each emitter in a separate process - they share provider module state, and a shared-state leak looks exactly like a desync. The differential harness deliberately does the opposite, running both in one process; do not "fix" it to match this advice.
