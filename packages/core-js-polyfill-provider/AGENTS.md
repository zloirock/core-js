# @core-js/polyfill-provider

The shared core behind `@core-js/babel-plugin` and `@core-js/unplugin`: it detects what the source uses, resolves the types of the receivers it finds, decides what has to be injected, and hands the result to whichever emitter is rendering.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`.

## Architectural invariant

Semantics belong here. The two plugins are adapters to their host - they speak Babel's or the bundler's API, feed the source in, and render what comes back. A fix that has to be written twice, once per plugin, is a smell: push it into the provider instead.

That is the rule, not a description of the current state. Plenty of decisions are still duplicated in the emitters - the `usage-pure` dispatcher exists in both, while its `usage-global` counterpart is centralized here - and some are plugin-local on purpose, which the files in question say so explicitly.

The target shape is: one parse, one normalized plan built here, emitters that only render it. Move toward that shape by collapsing existing paths, not by adding new ones. A new code path needs a written justification; the default fix deletes code.

The mechanical half of that rule: before writing a function or a branch, search for the existing canonical - `npm run canon -- find "<behavior words>"` plus a grep by the data or node type the logic touches, then `npm run canon -- show <file:line>` to read a candidate whole. The helper usually exists under a name you would not guess - and may solve your task by a different mechanism, so query by the entities the code must touch plus the operation on them, and try more than one phrasing. Extend or export the near-match - lift it out if it is nested - never fork a copy; implementing new means naming the checked candidates and why each does not fit. `npm run canon -- dupes` lists the names already defined in several files. Before handing the work off, `npm run canon -- delta` audits the diff the other way: it lists every added named symbol with its same-name and near-name canon candidates, and exits 1 while any remain unadjudicated.

## Injection methods

- `entry-global` - replaces a core-js entry import with the individual `core-js/modules/*` imports its targets need. All the shapes count, not just the bare `import`: `require`, dynamic `import()`, TypeScript's `import x = require(...)`, and any entry subpath
- `usage-global` - detects API usage and injects side-effect imports for the polyfills it needs
- `usage-pure` - detects API usage and rewrites it into imports from `@core-js/pure`

The injection bias differs by method, deliberately: `usage-global` injects when a polyfill *might* be needed, because over-injection is harmless; `usage-pure` rewrites only when the receiver type is *certain*, because over-resolving it throws at runtime while under-resolving only degrades to the generic polyfill.

The symmetry stops at globals. Declining to resolve a receiver *type* is safe, but declining to rewrite a polyfillable *global* is not: what stays behind is a raw `globalThis` or `Symbol`, which is exactly what the target engine may not have.

Navigation through the global proxies collapses on purpose - `globalThis`, `self` and `window` are one object here, `self` a realm-local self-reference erasable anywhere - so a plain hop through `window` answers `undefined` where an engine throws. The divergence is accepted, not a defect, and `navHasUnresolvableProxyHop` owns the question; do not grow a second predicate.

## Accepted semantic boundaries

Beyond the proxy collapse above, these divergences are design decisions with an accepted price:

- **Plugin output is not typechecked.** The transformed source does not have to pass `tsc`, and does not, for several independent reasons - for one, a synth-swap builds an object literal while the TS assertion stays outside it: `function g({ at } = x as string)` becomes `function g({ at } = { at: _atMaybeString(x) } as string)`, a `TS2352`. Runtime is identical, the `as` erases. Typecheck the source before the plugin, not after it.
- **`with` and direct `eval` are not modelled.** An identifier inside either resolves as a global - in `usage-pure` that swaps the user's value for the polyfill. Deliberate, with no bail planned: both constructs are unavailable in modules and strict mode, so the responsibility stays with the caller.
- **`Symbol.iterator in x` is a value test.** `usage-pure` rewrites it to an is-iterable check (`helpers/in-expression.js`). The price: a primitive RHS loses the native `TypeError`, and a present-but-`undefined` `Symbol.iterator` answers `false`.
- **A `?.` over the host of a proxy-global navigation is not load-bearing.** `globalThis.window?.self.Math` NAMES a global; the host is assumed present, so a collapse that replaces the whole navigation with the polyfill may drop the guard with it. The price is a position-dependent one: extracting a single property (`const { trunc } = globalThis.window?.self.Math` -> `const trunc = _Math$trunc`) drops it, while a member read, an object read and an array pattern keep it (`null == _globalThis.window ? void 0 : ...`). Where the host really is absent, native throws on the extraction and the output does not. Neither bailing on the form nor unwinding the collapse is worth it for how rare it is - do not re-open either.
- **Partial assignment state on throw.** The pure destructure collapse reorders assignments, so a throwing pattern may leave different siblings assigned than native - observable only via `try/catch`. Source-order fidelity is not promised.

## Caller-correct emission

The polyfill for a destructured parameter belongs in the parameter's own default slot, mirrored to the pattern:

```js
function f({ Array: { from } } = { Array: { from: _Array$from } }) { /* ... */ }
```

Only that slot fires exactly when no argument is passed, leaving a caller's own object to destructure natively. A leaf default (`{ from = _Array$from }`) cannot tell "no argument" from "an argument without that key" - `f({ Array: {} })` would get the polyfill where the source gives `undefined` - and a body extract ignores the caller outright. Those two are allowed only for a local function whose every call provably passes nothing, as decided by the resolver's existing call scan. Otherwise: replace the whole receiver, then extract, then the leaf default; an ambiguous receiver bails.

## Layout

- `index.js` - the package entry: the polyfill context and the `resolve` that turns a usage site into a meta from the built-in definitions
- `detect-usage/`, `detect-syntax.js` - what the source uses
- `resolve-node-type/`, `resolve-node-type.js` - receiver type resolution. It gates the pure path most visibly, but the global path narrows through it too, so a change here moves both import sets
- `resolver.js`, `injector-base.js` - the shared injection machinery; `destructure-host-shape.js` classifies destructure hosts into the parser-agnostic booleans both emitters consume
- `plugin-options/` - more than its name suggests: alongside option parsing and validation it holds the `usage-global` dispatcher and the module injectors both plugin entry points call. Plugin options are trusted build configuration, not attacker-controlled input, and generated identifiers all flow through `findUniqueName` under plugin-owned prefixes - the source being transformed cannot steer an emitted name
- `helpers/` - the cross-emitter canon that must not be forked: AST patterns, class walking, the skip-set subsumption rules, `key in obj` handling, path normalization

The feature definitions themselves are not here - they come from `@core-js/compat` (`built-in-definitions`, `known-built-in-return-types`).

## Tests

The edit loop, in order, scoped to what the change touches:

- `npm run test-polyfill-provider` - every suite in `tests/polyfill-provider/`: the resolvers, the detectors, the helpers, the option layer, cross-parser equivalence and the escape-analysis domains
- `npm run test-transpiler-differential pure` - a generated corpus through native and both emitters, comparing runtime results and import sets; `pure` skips the slow usage-global leg and fits while that path is untouched. Once the change reaches it - common here, usage-global detection and injection are decided in this package - the loop needs the argument-less run, every leg on. The single-emitter arguments (`babel` / `unplugin`) fit emitter-local work, not this package: a provider change shifts BOTH emitters, which is exactly what a single-emitter run cannot see
- `npm run test-e2e-usage-pure` - executes the transformed code, in both emitters' bundles and in realms with the native built-ins stripped, so a polyfill that was never injected fails instead of silently passing on a native

The provider suite alone is not enough, and neither are the plugin fixtures covering what the emitters print: babel-vs-unplugin parity is blind to a regression that sits here and shifts both emitters the same way, and fixtures happily lock a wrong decision as long as both renderers agree on it - the differential and e2e above are the oracles without that blind spot. One full `npm run test-transpiling` is the finish line - a VERY heavy run that composes every suite named here plus every plugin runner: run it once, right before the work is handed off, never mid-loop, and never with a member on the same invocation line.
