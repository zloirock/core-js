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

Marking a proxy global handled says "no second rewrite inside my span", never "my render consumed it". The two coincide only for a receiver-LESS claim - a static collapsing to one import, or a chain whose constructor hop is itself pure-resolvable. An instance claim hands its receiver to the helper as an argument, a `delete` target renders nothing at all, and a declined claim renders nothing either: there the global is still a live read that owes its own substitution, and a marking that outran the render ships a raw `globalThis` to an engine that has none. Whatever asks that question must ask it of the RENDER, not of the claim's resolvability.

## Accepted semantic boundaries

Beyond the proxy collapse above, these divergences are design decisions with an accepted price:

- **Plugin output is not typechecked.** The transformed source does not have to pass `tsc`, and does not, for several independent reasons - for one, a synth-swap builds an object literal while the TS assertion stays outside it: `function g({ at } = x as string)` becomes `function g({ at } = { at: _atMaybeString(x) } as string)`, a `TS2352`. Runtime is identical, the `as` erases. Typecheck the source before the plugin, not after it.
- **`with` and direct `eval` are not modelled.** An identifier inside either resolves as a global - in `usage-pure` that swaps the user's value for the polyfill. Deliberate, with no bail planned: both constructs are unavailable in modules and strict mode, so the responsibility stays with the caller.
- **`Symbol.iterator in x` is a value test.** `usage-pure` rewrites it to an is-iterable check (`helpers/in-expression.js`). The price: a primitive RHS loses the native `TypeError`, and a present-but-`undefined` `Symbol.iterator` answers `false`.
- **What makes a guard load-bearing: a READ of a value that can be absent.** Everything below is that one rule, and each part names the predicate that owns it - ask it, never a node type.
  - **The host is judged by whether a pure ENTRY EXISTS for it, never by whether this target asked for one.** A hop pure cannot back at all (`window` - there is no `_window`) is the genuine environment probe and keeps its guard on every target; a hop pure can spell (`self`) stays erasable and the guard goes with the collapse. A rendered guard TEST may read at most the probe hop itself off a ponyfill (`null == _globalThis.window`), and only where the source's own `?.` asked for the branch - a test that dereferences the probe (`_globalThis.window.self`) reads a member of `undefined` off-window, inside the very realm the ponyfill serves. A CONSUMING position - a full-consume extraction included (`const { trunc } = globalThis.window?.self.Math`) - discards the read the source performs, so it re-emits that read as a THROW probe off the guard value (`((null == _globalThis.window ? void 0 : Math).trunc, _Math$trunc)`): neither bailing on the form nor unwinding the collapse, the probe rides the collapse and keeps the native throw. The probe rule stops at the caller-correct FALLBACK SLOTS - a parameter default, an IIFE argument, an inner destructure default, whether the receiver synth-swap or the nested mirror renders them: a PLAIN undefinable receiver keeps the always-defined literal, and the ponyfill resolves where native would throw on the absent host. Accepted divergence: the slot only fires when nothing was passed, and reproducing the absent-host throw there is not worth the output complexity. One read still probes there: a SEALED receiver read in the flat synth-swap (`{ of } = (globalThis.window?.self).Array`) rides the seal rule above - the source itself spells the read the swap would erase; the nested mirror keeps the plain literal on every spelling.
  - **A `delete` consumer performs no read, so nothing over its navigation is load-bearing** (`deleteHostAboveChain`): the nav collapses whole and the slot is reached off the ponyfill on either host. Asked once in the erase verdict and once in each hop-collapse drive; the text leg additionally routes the nav through its plain chain collapse, because standing its guarded render down would leave the nav raw. **The exception is a live `?.` whose OWN key is the unresolvable hop** - there the guard is not over a read, it is over whether the delete HAPPENS, and folding it removes a slot off the ponyfill the source never touches (`delete ut()?.window?.self?.chrome` must leave `globalThis.chrome` alone on a realm with no `window`). That shape keeps the guard on every emitter, with the deleted member outside the ternary behind a `?.` of its own - pulled into the alternate the ternary evaluates and deletes nothing, and left outside bare it reads off the guard's `void 0`. A `?.` over a hop pure CAN spell reads an always-defined ponyfill and folds with the rest, sealed short-circuits included.
  - **A seal is load-bearing only when it hides a SHORT-CIRCUIT** (`chainSealsAShortCircuit`). Source parens end a chain, so what a seal makes observable is the read above them - but only a live `?.` under it can turn that read into one off `undefined`. Over a PLAIN navigation the seal hides nothing the value canon does not already answer: the nav IS the proxy global it navigates and collapses like its unsealed twin, because keeping the probe there would emit a `window` read off the ponyfill. A read through a load-bearing seal whose key is the claim's own ctor is not a source either - testing it would ask whether the HOST has that ctor, which answers `void 0` on the engines the ponyfill exists for; the read rides as a throw probe and the claim still answers its ponyfill.
  - **Both paren spellings are real, and only the SHAPE of the output may differ between them.** Babel's default parser hides source parens in an `extra.parenthesized` flag; `createParenthesizedExpressions` and every estree parser make them a node. A user can configure either, so the predicates above owe both the same answer - ask through the canon (`sealedLayerBetween`, `chainReadsThroughSeal`, the own-chain walks), including for the node the walk ENDS on, which is where the flag dialect hangs its parens under a TS wrapper (`(nav)!.X`). What the two may differ in is cosmetic only: redundant printer parens, a vestigial `?.` over an always-defined alternate, a residual dead read left in a sequence tail.
- **A second pass may collapse one hop further, and both answers are accepted.** The transform is not a fixed point over its own output where the FIRST pass normalizes a root: `(() => globalThis.window)().self.window.X` keeps its `.window` read while the IIFE stands, and once that root has become `_self` the text IS the plain `self.window.X` shape, which the collapse simplifies exactly as it does in source. A `pre` and a `pre+post` leg can therefore answer differently on such a form - value where the other threw - without either being wrong. An ALREADY-LOWERED input is the same class from the other side: it carries no `?.` for the rules above to reach, so a `post` leg keeps the source's own `== null ||` short-circuit.
- **Partial assignment state on throw.** The pure destructure collapse reorders assignments, so a throwing pattern may leave different siblings assigned than native - observable only via `try/catch`. Source-order fidelity is not promised.

## Caller-correct emission

The polyfill for a destructured parameter belongs in the parameter's own default slot, mirrored to the pattern:

```js
function f({ Array: { from } } = { Array: { from: _Array$from } }) { /* ... */ }
```

Only that slot fires exactly when no argument is passed, leaving a caller's own object to destructure natively. A leaf default (`{ from = _Array$from }`) cannot tell "no argument" from "an argument without that key" - `f({ Array: {} })` would get the polyfill where the source gives `undefined` - and a body extract ignores the caller outright. Those two are allowed only for a local function whose every call provably passes nothing, as decided by the resolver's existing call scan. Otherwise: replace the whole receiver, then extract, then the leaf default; an ambiguous receiver bails.

## Layout

- `index.js` - the package entry: the polyfill context and the `resolve` that turns a usage site into a meta from the built-in definitions
- `detect-usage/`, `detect-syntax.js` - what the source uses; `detect-usage/own-output.js` is the census family recognizing the plugins' OWN prior output (any emitter, any config) so a re-transform never claims a spelling a pass deliberately left - both plugins' dispatchers gate on it ahead of every claim route, and pass-2 idempotence on the generated corpus is its north star
- `resolve-node-type/`, `resolve-node-type.js` - receiver type resolution. It gates the pure path most visibly, but the global path narrows through it too, so a change here moves both import sets
- `resolver.js`, `injector-base.js` - the shared injection machinery; `destructure-host-shape.js` classifies destructure hosts into the parser-agnostic booleans both emitters consume
- `plugin-options/` - more than its name suggests: alongside option parsing and validation it holds the `usage-global` dispatcher and the module injectors both plugin entry points call. Plugin options are trusted build configuration, not attacker-controlled input, and generated identifiers all flow through `findUniqueName` under plugin-owned prefixes - the source being transformed cannot steer an emitted name
- `helpers/` - the cross-emitter canon that must not be forked: AST patterns, class walking, the skip-set subsumption rules, `key in obj` handling, path normalization

The feature definitions themselves are not here - they come from `@core-js/compat` (`built-in-definitions`, `known-built-in-return-types`).

## Tests

The edit loop, in order, scoped to what the change touches:

- `npm run test-polyfill-provider` - every suite in `tests/polyfill-provider/`: the resolvers, the detectors, the helpers, the option layer, cross-parser equivalence and the escape-analysis domains
- `npm run test-transpiler-differential` - a generated corpus through native and both emitters, comparing runtime results and import sets. Run it bare, always: evaluations are cached across runs, so a repeat costs what the edit changed, and this package decides usage-global detection and injection too - the `pure` token would skip exactly that leg. The single-emitter tokens fit emitter-local work, not this package: a provider change shifts BOTH emitters, which is what a single-emitter run cannot see
- `npm run test-e2e-usage-pure` - executes the transformed code, in both emitters' bundles and in realms with the native built-ins stripped, so a polyfill that was never injected fails instead of silently passing on a native

The provider suite alone is not enough, and neither are the plugin fixtures covering what the emitters print: babel-vs-unplugin parity is blind to a regression that sits here and shifts both emitters the same way, and fixtures happily lock a wrong decision as long as both renderers agree on it - the differential and e2e above are the oracles without that blind spot. One full `npm run test-transpiling` is the finish line - a VERY heavy run that composes every suite named here plus every plugin runner: run it once, right before the work is handed off, never mid-loop, and never with a member on the same invocation line. Where a rule's whole point is a DIVERGENCE from native - the `delete` collapse, the guard-test base - the differential cannot hold the row at all: it compares against native, so those live in `tests/e2e-usage-pure` and in the fixtures instead.
