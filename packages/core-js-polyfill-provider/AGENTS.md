# @core-js/polyfill-provider

The shared core behind `@core-js/babel-plugin` and `@core-js/unplugin`: it detects what the source uses, resolves the types of the receivers it finds, decides what has to be injected, and hands the result to whichever emitter is rendering.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`.

## Core and bindings

The two plugins are one transpiler with two faces: the same input under the same options produces one semantic output on either host, and an output divergence is legal only as formatting-class or environmental (taxonomy below) - anything else is a defect. Both legs render ASTs, so the render is semantics too and also lives once. The organizing rule: **every question has exactly one home, decided by the question, not by where a symptom showed** - "what does the source spell" is detection, "what does the transpiler owe" is a decision, "which nodes spell it" is the render canon, "how do nodes land in the host tree" is the binding; a rule answering two of these is split along that ladder.

The core is this package, three layers with one-way dependencies: **detection** (claims, metas, alias and scope facts, the type ladder; parser-dialect questions are answered once by canon predicates - both paren spellings, both optional-chain spellings - no adapter layer exists for detection), **decisions** (inject/collapse/guard/bail, side-effect order, the per-method biases, deopt verdicts - conditioned on source and targets, never on the host), and the **render canon** (the guard ternary, memo, collapse and import shapes), which builds literal ESTree nodes from the closed builder vocabulary.

A **binding** is everything host-shaped in a plugin: parser, traversal with its re-visit semantics, scope queries, host obligations (babel: a foreign tree, scope registration, requeueing; unplugin: print, sourcemaps, id filtering, SFC), the per-leg detection adapter, and the insertion of canonical nodes - unplugin inserts ESTree as is, the babel binding converts the subtree at the insertion boundary (a converter total over the builder vocabulary and defined on nothing else). A binding holds no decisions and no render forms, and it is the only place allowed to know which leg it is - a host branch inside the core is a defect. Parser, traversal and print stay per-leg forever; that IS the product: unplugin is one fast oxc pass with its own print, babel is a citizen of a foreign pipeline whose output tree is read by later plugins. Bytes are dialect, structure is canon.

A name living in BOTH legs is not by itself a duplicate: the binding surface twins by construction - visitor factories, injection and resolver entry points, the per-leg emitters performing a host surgery. What must never twin is the ANSWER inside them: two same-named functions differing only in the surgery around identical plan and render calls are correct as they are; two that re-derive one rule - a wrapper peel, an entry choice, a guard spelling - are one edit, and the rule belongs here. Judge such a pair by what it decides, never by how alike the bodies read.

Divergence taxonomy (closed): (1) formatting-class - the structural comparator owns the definition; (2) environmental - host targets resolution, the require dialect, parser acceptance - registered by the sidecars and nothing else; (3) everything else is a binding defect, and an unclassifiable divergence is a bug by construction. Runtime holds the semantic oracle (native three-way, stripped realm, e2e) - leg parity is blind to a shared root by construction, and the other leg's baseline is never the truth, only the other leg's output.

The costs to check every change by: a new rule = one core edit; a new spelling = one render-canon edit; a new dialect fact = one edit (converter or canon predicate); a new host = one binding, zero core edits - a paired edit in two bindings is the symptom of a wrong home. Non-goals: no end-to-end single path, no traversal framework, no merging of the two scope trackers, no byte parity between legs.

This is the rule, not the current state: both plugins still carry render code awaiting collapse into the core, and today's sidecars still include accepted spelling divergences - debt this rule retires. While a render is unshared, the live smell is a fix written in both legs (its root is here); once shared, it inverts - an edit to one leg outside its binding is either a dialect fact (belongs in the binding) or semantics (belongs here). Move by collapsing existing paths, never by adding new ones: a new code path needs a written justification; the default fix deletes code.

The mechanical half of that rule: before writing a function or a branch, search for the existing canonical with `npm run canon` (command reference: `scripts/canon/AGENTS.md`) - `find` by the entities the code must touch plus the operation on them, in more than one phrasing, plus a grep by the data or node type, then `show` to read a candidate whole; the helper usually exists under a name you would not guess and may solve the task by a different mechanism. Extend or export the near-match - lift it out if it is nested - never fork a copy; implementing new means naming the checked candidates and why each does not fit. Before handing off, `canon -- delta` must come back clean: every added named symbol is an obligation to adjudicate against the canon. The wrapper sets (`TS_EXPR_WRAPPERS`, `TRANSPARENT_EXPR_WRAPPER_TYPES`, `SKIPPABLE_WRAPPER_TYPES`) and the peels over them live in `helpers/ast-patterns.js` and are owned there: a site spelling such a set by hand is a fork `delta` cannot see - `canon -- sets` enumerates those.

## Injection methods

- `entry-global` - replaces a core-js entry import with the individual `core-js/modules/*` imports its targets need. All the shapes count, not just the bare `import`: `require`, dynamic `import()`, TypeScript's `import x = require(...)`, and any entry subpath
- `usage-global` - detects API usage and injects side-effect imports for the polyfills it needs
- `usage-pure` - detects API usage and rewrites it into imports from `@core-js/pure`

The injection bias differs by method, deliberately: `usage-global` injects when a polyfill *might* be needed, because over-injection is harmless; `usage-pure` rewrites only when the receiver type is *certain*, because over-resolving it throws at runtime while under-resolving only degrades to the generic polyfill.

The symmetry stops at globals. Declining to resolve a receiver *type* is safe, but declining to rewrite a polyfillable *global* is not: what stays behind is a raw `globalThis` or `Symbol`, which is exactly what the target engine may not have.

## The global proxies

`globalThis`, `self` and `window` are ONE object here, and navigation through them collapses on purpose. A hop is judged by whether a pure ENTRY EXISTS for it, never by whether this target asked for one: `self` has one and stays erasable anywhere; `window` has none (there is no `_window`) and is the environment PROBE. The same gate decides a defensive `??` / `||` over a bare proxy name (`guaranteedRealmObjectName`): an entry-backed left operand - `globalThis` by the language, `self` by its ponyfill - is always the realm object, so the right side is dead and claims through the carrier collapse; a probe name keeps the logical live. The accepted price: a plain hop through `window` answers `undefined` where an engine throws. `navHasUnresolvableProxyHop` owns "does this nav carry an unresolvable hop" - do not grow a second predicate.

WHICH hop the probe verdict reaches is positional, and `foldableRealmHop` owns it. Off the source root the probe's `?.` is load-bearing and keeps its guard. Standing over a ponyfill - a backed hop below it, or the leaf a collapse already landed - the same hop is a read THROUGH the ponyfill and FOLDS onto it, `?.` and all (`globalThis.self.window` is `_self`). A COMPUTED key and a slot the source itself WROTE keep their place. A hop reading a KEPT STORE folds onto the value the store hands on, whichever spelling roots the probe: its own `?.` slides one member up (a void store still short-circuits there), a PLAIN hop instead erases the `?.` above (a void store then throws on that member exactly where the source threw on the hop), the chain end keeps its shape, and a store whose value ends on an unbacked hop hands on the raw host read - nothing over it folds. The nav plan applies the verdict to the hops it owns; both emitters' tail walks ask the same predicate for the rest.

A guard is load-bearing only over a READ of a value that can be absent - every rule here is that one sentence, asked of its owning predicate, never of a node type. A rendered guard TEST may read at most the probe hop itself (`null == _globalThis.window`), and only where the source's own `?.` asked for the branch - a test that dereferences the probe reads a member of `undefined` inside the very realm the ponyfill serves. A CONSUMING position (a full-consume extraction included) re-emits the read it discards as a THROW probe riding the collapse - the native throw kept, the collapse kept. The caller-correct FALLBACK SLOTS - a parameter default, an IIFE argument, an inner destructure default - keep the always-defined literal instead (accepted divergence: the slot fires only when nothing was passed), except a SEALED receiver read in the flat synth-swap, which probes like any seal. A seal is load-bearing only when it hides a SHORT-CIRCUIT (`chainSealsAShortCircuit`): over a plain navigation it hides nothing and the nav collapses like its unsealed twin, and a load-bearing seal whose key is the claim's own ctor still answers the ponyfill - the read rides as a throw probe. A `delete` performs no read, so its navigation collapses whole (`deleteHostAboveChain`) - except a live `?.` whose OWN key is the unresolvable hop: that guard decides whether the delete HAPPENS and stays on every emitter, the deleted member outside the ternary behind a `?.` of its own.

Marking a proxy global handled says "no second rewrite inside my span", never "my render consumed it"; the two coincide only for a receiver-LESS claim. An instance claim's receiver, a `delete` target and a declined claim are still live reads owing their own substitution - ask that question of the RENDER, not of the claim's resolvability. And the transform is not a fixed point over these collapses: a second pass may fold one hop further once the first normalized the root (an IIFE become `_self`), and an already-lowered input carries no `?.` for the rules to reach - a `pre` and a `pre+post` leg may legally differ on such forms, and neither is wrong.

## Accepted semantic boundaries

Beyond the proxy-realm divergences above, these are design decisions with an accepted price:

- **Plugin output is not typechecked.** The transformed source does not have to pass `tsc`, and does not, for several independent reasons - for one, a synth-swap builds an object literal while the TS assertion stays outside it: `function g({ at } = x as string)` becomes `function g({ at } = { at: _atMaybeString(x) } as string)`, a `TS2352`. Runtime is identical, the `as` erases. Typecheck the source before the plugin, not after it.
- **`with` and direct `eval` are not modelled.** An identifier inside either resolves as a global - in `usage-pure` that swaps the user's value for the polyfill. Deliberate, with no bail planned: both constructs are unavailable in modules and strict mode, so the responsibility stays with the caller.
- **`Symbol.iterator in x` is a value test.** `usage-pure` rewrites it to an is-iterable check (`helpers/in-expression.js`). The price: a primitive RHS loses the native `TypeError`, and a present-but-`undefined` `Symbol.iterator` answers `false`.
- **Partial assignment state on throw.** The pure destructure collapse reorders assignments, so a throwing pattern may leave different siblings assigned than native - observable only via `try/catch`. Source-order fidelity is not promised.

## Caller-correct emission

The polyfill for a destructured parameter belongs in the parameter's own default slot, mirrored to the pattern:

```js
function f({ Array: { from } } = { Array: { from: _Array$from } }) { /* ... */ }
```

Only that slot fires exactly when no argument is passed, leaving a caller's own object to destructure natively. A leaf default (`{ from = _Array$from }`) cannot tell "no argument" from "an argument without that key" - `f({ Array: {} })` would get the polyfill where the source gives `undefined` - and a body extract ignores the caller outright. Those two are allowed only for a local function whose every call provably passes nothing, as decided by the resolver's existing call scan. Otherwise: replace the whole receiver, then extract, then the leaf default; an ambiguous receiver bails.

## Predicates read through wrappers

The two legs' parsers disagree about what reaches the tree: oxc keeps `ParenthesizedExpression`, babel drops it, and a TS assertion arrives only down the path that parsed as TS. So a predicate here answers differently about the SAME program depending on which leg asked whenever it tests a RAW node's `type`, navigates a fixed number of parents, or compares a peeled side against an unpeeled one. That is a divergence, not a spelling difference, and no fixture sees it - both legs print valid code and only their import sets differ. Peel first: `unwrapRuntimeExpr` for a node, `peelTransparentExprAncestorPath` for a climb. Never `unwrapExpressionChain` in a predicate weighing EFFECTS - it elides a sequence prefix along with the wrappers.

Both paren spellings are real on ONE leg too: babel's default parser hides source parens in an `extra.parenthesized` flag, `createParenthesizedExpressions` and every estree parser keep a node, and a user may configure either - so a predicate owes both the same answer, asked through the canon (`sealedLayerBetween`, `chainReadsThroughSeal`, the own-chain walks), including for the node a walk ENDS on, where the flag dialect hangs its parens under a TS wrapper (`(nav)!.X`). What the two spellings may differ in is cosmetic only: redundant printer parens, a vestigial `?.` over an always-defined alternate, a residual dead read in a sequence tail.

## Order, not only presence

An effect the source ran before the pattern bound anything keeps that place. The class is a destructuring receiver spelled behind a sequence (`(eff(), globalThis)`): the extraction an emitter inserts is a WRITE, so leaving the sequence with the residual hands that effect the polyfilled binding instead of the value it had. The prefix lifts to where the source ran it and the residual reads the bare tail, each host reaching that place its own way - a statement, a braced slot, a split, or the first extraction's value in a loop header that hosts no statement at all; what the lift keeps is only what can be observed (`dropDeadSequenceElements`). Order changes neither the import set nor the returned value, so the oracle is a runtime effect LOG against native - the fixture gate locks either order just as happily.

## Output the next tool can lower

The emitted code is not the end of the chain: a downgrade pass runs after it, and a shape that pass lowers wrong is a defect of ours even when the fault is upstream. The known class is a destructuring target binding NOTHING - a trailing husk beside one that binds, or a sole husk against a longer literal - which the standard destructuring transform miscompiles silently, losing a binding or a throw. So a residual this pipeline empties sheds its trailing husks, unless the whole residual is husk and its length is what pairs it positionally; `arrayWrapperResidualTrailingShed` is that canon. Neither the fixture gate nor the differential sees this class - they compare our output, never what the next tool makes of it - so a new residual shape is checked by lowering it and looking for a reference the output bound and the lowering left dangling.

## Layout

- `index.js` - the package entry: the polyfill context and the `resolve` that turns a usage site into a meta from the built-in definitions
- `detect-usage/`, `detect-syntax.js` - what the source uses; `detect-usage/own-output.js` is the census family recognizing the plugins' OWN prior output (any emitter, any config) so a re-transform never claims a spelling a pass deliberately left - both plugins' dispatchers gate on it ahead of every claim route, and pass-2 idempotence on the generated corpus is the property it exists to hold
- `resolve-node-type/`, `resolve-node-type.js` - receiver type resolution. It gates the pure path most visibly, but the global path narrows through it too, so a change here moves both import sets
- `resolver.js`, `injector-base.js` - the shared injection machinery: the injector state both plugins subclass, the flush census over the final tree, pure-import liveness and the canonical slot renumber
- `render.js` - the render canon's node factory (canonical-ESTree builders, the closed vocabulary the babel converter is total over), the injected-import render both bindings insert, and the shapes they share: the short-circuit guard with its two null-test spellings, the ctor-identity narrow, the default guards, the synth key and slot read, the proxy-receiver collapse, the nav-guard test base, the alias-held probe read, the `in`-expression plan. A render carrying a BINDING's own subtree takes it through `hostSlot` - identity where the host dialect is canonical, a wrapper the babel converter passes through unconverted
- `destructure-host-shape.js` - classifies destructure hosts into the parser-agnostic booleans both emitters consume
- `plugin-options/` - option parsing and validation, plus - despite the name - the `usage-global` dispatcher and the module injectors both plugin entry points call. Plugin options are trusted build configuration, not attacker-controlled input, and generated identifiers all flow through `findUniqueName` under plugin-owned prefixes - the source being transformed cannot steer an emitted name
- `helpers/` - the cross-emitter canon that must not be forked: AST patterns, class walking, the skip-set subsumption rules, `key in obj` handling, path normalization

The feature definitions themselves are not here - they come from `@core-js/compat` (`built-in-definitions`, `known-built-in-return-types`).

## Tests

The edit loop, in order, scoped to what the change touches:

- `npm run test-polyfill-provider` - every suite in `tests/polyfill-provider/`: the resolvers, the detectors, the helpers, the option layer, cross-parser equivalence and the escape-analysis domains
- `npm run test-transpiler-differential` - a generated corpus through native and both emitters, comparing runtime results and import sets. Run it bare, always: evaluations are cached across runs, so a repeat costs what the edit changed, and this package decides usage-global detection and injection too - the `pure` token would skip exactly that leg, and a provider change shifts BOTH emitters, which a single-emitter run cannot see
- `npm run test-e2e-usage-pure` - executes the transformed code, in both emitters' bundles and in realms with the native built-ins stripped, so a polyfill that was never injected fails instead of silently passing on a native

The provider suite alone is not enough, and neither are the plugin fixtures: babel-vs-unplugin parity is blind to a regression that sits here and shifts both emitters the same way, and fixtures happily lock a wrong decision as long as both renderers agree on it - the differential and e2e above are the oracles without that blind spot. Where a rule's whole point is a DIVERGENCE from native - the `delete` collapse, the guard-test base - the differential cannot hold the row at all: those live in `tests/e2e-usage-pure` and in the fixtures. The finish line, once, right before handoff and never mid-loop: `npm run test-transpiling` (a VERY heavy composite of every suite named here plus every plugin runner), then `npm run test-transpiler-perf` - never with a member on the same invocation line.
