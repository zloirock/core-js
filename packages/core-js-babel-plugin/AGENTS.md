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

Mutates the AST in place during traversal, inside Babel's own parse. Detect and apply run as one pass in `pre()`, on the tree no sibling plugin has touched yet, and `Program:exit` only backstops what siblings insert afterwards - a deferred cross-phase apply would land on a tree they have since mutated. The other adapter, `@core-js/unplugin`, parses separately and queues text transforms; the two may differ in formatting, never in semantics.

Anything that has to be fixed in this package *and* in unplugin belongs in the provider instead.

Before writing a helper or a branch, check the canon - `npm run canon -- find "<behavior words>"` (its own `AGENTS.md` in `scripts/canon/` carries the reference): what you need may already exist in the provider or in unplugin under an unguessable name. Extend or lift the near-match, never fork a copy; implementing new means naming the checked candidates and why each does not fit.

## Tests

- `npm run test-babel-plugin` - shared fixtures from `tests/transpiler-fixtures/`, against `@babel/core@8` (the default)
- `npm run test-babel-plugin-unit` - internals
- `npm run test-babel-plugin-v7` and `npm run test-babel-plugin-unit-v7` - the same against `@babel/core@7`, whose cosmetic divergences live in `<stem>.babel-v7.<ext>` fixture siblings; `tests/babel-plugin-v7/skip.mjs` is the last resort for what a sibling cannot express

Those runners only compare text, which settles cosmetic work; a change in BEHAVIOR is verified while you work by the correctness suite nearest to it, scoped to what changed:

- `npm run test-transpiler-differential babel` - this emitter against native at runtime, on the generated corpus; add `pure` while the usage-global path is untouched (the usual loop shape for work here). The argument-less run is the gate form - both emitters, every leg
- `npm run test-e2e-usage-pure` - executes the transformed code; this plugin owns one of the four bundles, and one of the two that also run in a stripped realm
- `npm run test-transpiler-integration` - only when the change faces a real build pipeline; the matrix runs this plugin with no phase of its own
- `npm run test-transpiler-perf` - guards the complexity class

One full `npm run test-transpiling` is the finish line - a VERY heavy run that composes every suite named here including this package's own runners: run it once, right before the work is handed off, never mid-loop, and never with a member on the same invocation line.

When comparing this emitter against unplugin by hand, normalize whitespace and run each emitter in a separate process - they share provider module state, and a shared-state leak looks exactly like a desync. The same state also accumulates across sequential `transformSync` calls within one process, so an injected-set probe is only valid as one probe per process. The differential harness deliberately does the opposite, running both in one process; do not "fix" it to match this advice.
