# @core-js/babel-plugin

Automatic polyfill injection for Babel: the adapter between Babel's plugin API and `@core-js/polyfill-provider`, plus the emitter that renders what the provider decides. The semantics belong there, not here.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`. Works with both `@babel/core` 7 and 8. `@core-js/compat` in `dependencies` is runtime-unused on purpose: `index.d.ts` type-imports `@core-js/compat/compat`, so the package must resolve for consumers' tsc - do not drop it as a leftover.

## Layout

- `index.js` - the plugin itself: options, the Babel visitors, and the dispatch between the injection methods
- `internals/detect-entry.js` - recognizes the entry-import shapes that `entry-global` replaces
- `internals/detect-usage.js` - the Babel side of the provider's usage detection: it adapts Babel paths to what the provider expects
- `internals/import-injector.js` - inserts the imports or requires, respecting directives and the existing import block; the import set itself comes from the core's render canon, converted at insertion
- `internals/estree-to-babel.js` - the converter at the insertion boundary: the core's canonical ESTree render becomes babel nodes, total over the builder vocabulary and defined on nothing else
- `internals/babel-compat.js` - the Babel-specific AST primitives: ref memoization, optional-chain deoptionalization, instance-method replacement, TS-wrapper peeling. Despite the name it knows nothing about Babel versions: the 7-versus-8 difference is bridged in `internals/import-injector.js`, where the scope bag hides `scope.references` / `scope.uids` becoming `referencesSet` / `uidsSet`
- `internals/destructure-emission-plan.js`, `internals/destructure-emitter.js` - destructure rewrites, planning separated from emission
- `internals/synth-swap-emitter.js`, `internals/synth-key-utils.js` - the receiver-targeted synth-swap and the safety gate deciding when a computed key may be mirrored into a synth literal

## Emitter model

Mutates the AST in place during traversal, inside Babel's own parse. Detect and apply run as one pass in `pre()`, on the tree no sibling plugin has touched yet, and `Program:exit` only backstops what siblings insert afterwards - a deferred cross-phase apply would land on a tree they have since mutated. What is left behind still has to survive the lowerings that run after: a `ParenthesizedExpression` exists only under `createParenthesizedExpressions` and regenerator throws on any holding an `await` or `yield`, so grouping a reprint drops is restructured into plain nodes where it can be, and spelled as that node only where the printed text is genuinely misread without it. Those two halves sit on opposite sides of the lowerings: restructuring REMOVES a node they misread, so it runs with the emitters, while the paren node they cannot walk waits for `post()` - the one hook after every sibling's `Program:exit`. The other adapter, `@core-js/unplugin`, parses separately and queues text transforms; the two may differ in formatting, never in semantics.

This package is a BINDING, not an emitter (the architecture contract is "Core and bindings" in the provider's AGENTS.md): it owes the babel host obligations - a foreign tree other plugins read after us, scope registration, requeueing, sibling-plugin etiquette - and the insertion of the provider's canonical ESTree render converted to babel nodes at the insertion boundary, holding no decisions and no render forms of its own. The render code still living here awaits collapse into the provider's core; until a given render is shared, the live smell is the old one: anything that has to be fixed in this package *and* in unplugin belongs in the provider instead.

Before writing a helper or a branch, check the canon - `npm run canon -- find "<behavior words>"` (its own `AGENTS.md` in `scripts/canon/` carries the reference): what you need may already exist in the provider or in unplugin under an unguessable name. Extend or lift the near-match, never fork a copy; implementing new means naming the checked candidates and why each does not fit. Before handing the work off, `npm run canon -- delta` audits the diff the other way: it lists every added named symbol with its same-name and near-name canon candidates, and exits 1 while any remain unadjudicated. A re-derived wrapper set (paren / chain / TS assertions spelled out instead of read from the provider's canon set) adds no symbol and stays invisible there - `npm run canon -- sets` is the enumeration that names those sites.

## Tests

- `npm run test-babel-plugin` - shared fixtures from `tests/transpiler-fixtures/`, against `@babel/core@8` (the default)
- `npm run test-babel-plugin-unit` - internals
- `npm run test-babel-plugin-v7` and `npm run test-babel-plugin-unit-v7` - the same against `@babel/core@7`, whose cosmetic divergences live in `<stem>.babel-v7.<ext>` fixture siblings; `tests/babel-plugin-v7/skip.mjs` is the last resort for what a sibling cannot express

Those runners only compare text, which settles cosmetic work; a change in BEHAVIOR is verified while you work by the correctness suite nearest to it, scoped to what changed:

- `npm run test-transpiler-differential` - both emitters against native at runtime, on the generated corpus. Run it bare: evaluations are cached across runs, so a repeat costs what the edit changed. The `babel` token narrows the run to this emitter and turns the import-parity oracle off - use it to isolate a suspect, never to save time
- `npm run test-e2e-usage-pure` - executes the transformed code; this plugin owns one of the four bundles, and one of the two that also run in a stripped realm
- `npm run test-transpiler-integration` - only when the change faces a real build pipeline; the matrix runs this plugin with no phase of its own
- `npm run test-transpiler-perf` - guards the complexity class

One full `npm run test-transpiling`, then `npm run test-transpiler-perf`, is the finish line - a VERY heavy run that composes every suite named here including this package's own runners, plus the perf gates it leaves out: run it once, right before the work is handed off, never mid-loop, and never with a member on the same invocation line.

When comparing this emitter against unplugin by hand, normalize whitespace and run each emitter in a separate process - they share provider module state, and a shared-state leak looks exactly like a desync. The same state also accumulates across sequential `transformSync` calls within one process, so an injected-set probe is only valid as one probe per process. The differential harness deliberately does the opposite, running both in one process; do not "fix" it to match this advice.
