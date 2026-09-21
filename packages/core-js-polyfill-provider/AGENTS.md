# @core-js/polyfill-provider

Shared detection, type resolution, injection decisions and ESTree rendering for `@core-js/babel-plugin` and `@core-js/unplugin`.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`.

## Core and bindings

The plugins are one transpiler with two hosts. Each question has one owner:

- **Detection:** source forms, claims, aliases, scope and type facts. Parser-dialect differences go through shared canon predicates.
- **Decisions:** inject, collapse, guard or bail; evaluation order and method biases. Decisions depend on source and targets, never on the host.
- **Render canon:** literal ESTree nodes from the closed builder vocabulary in `render.js`.
- **Bindings:** parsing, traversal, scope queries and insertion. Babel converts canonical nodes at insertion and handles scope registration, requeueing and later plugins. Unplugin inserts ESTree directly and owns printing, sourcemaps, module filtering and SFC handling.

Dependencies follow that order. Only bindings may know which host they serve. Parser, traversal, scope trackers and printing remain separate; a common end-to-end pipeline and byte parity are non-goals. Matching binding entry points are legitimate; duplicated decisions or render forms belong here. Fix shared rules once, collapse existing paths, and justify any new path in writing.

Ask a shared decision before any competing route rewrites the shape it reads. Speculative questions must not mutate analysis state or prime a later decision; separate the verdict from a stateful planner. To test this, call the question and ignore its answer. Disabling the call cannot distinguish its effects from its verdict.

A render skip-marks only claims it serves. Defaults, computed keys, call arguments and surviving subtrees with independent claims remain visitable. Fix an overbroad skip instead of making the plan bail around it.

Same input and options must produce the same semantic output. Formatting is defined by `tests/unplugin/structural.mjs`; environmental differences include targets resolution, require dialect and parser acceptance. Existing accepted structural spellings are documented in the unplugin `AGENTS.md` and remain unification debt. A sidecar must justify its actual divergence; it is not evidence of correctness. An unclassified divergence is a defect. Runtime and stripped-realm oracles are required because both bindings can share a bug.

Classify through scoped predicates and structure, not raw identifier names or named exceptions. Shadowing, aliases and mutations invalidate name-only answers. Before adding a function or branch, use `npm run canon -- find` with several descriptions, search the relevant data/node types, and `show` candidates in full. Extend, export or lift the existing helper; a new one requires naming the rejected candidates and why they do not fit. At handoff, adjudicate every `canon -- delta` addition and `canon -- sets` hit; no duplicate may remain unexplained. See `scripts/canon/AGENTS.md` for commands. Wrapper sets and peels belong to `helpers/ast-patterns.js`.

Keep local AST cases in helper contracts and regression fixtures. This file records ownership, semantic boundaries and validation requirements.

## Injection methods

- `entry-global` replaces side-effect core-js entry loads with target-specific `core-js/modules/*` imports, including require, dynamic import, sequence-joined loads and subpaths. Loads with bindings stay intact, even unused, including TypeScript `import x = require()`.
- `usage-global` detects usage and injects side-effect imports conservatively when a polyfill might be needed.
- `usage-pure` rewrites proven receivers to `@core-js/pure` imports; uncertain types use the generic fallback or bail. A type bailout must not strand a polyfillable global such as `globalThis` or `Symbol` on a target that lacks it.

Widening `mode` must not narrow the injected set. Mode-independent obligations use the stable entry layer (`isProposalEntry`), not counts of entries selected at the configured mode.

Choose one constructor entry per name per file. Namespace and `*/constructor` entries are not interchangeable: the narrow entry lacks own statics and may expose instance ponyfills as statics. Escapes, unnameable mutated members and stored constructors whose statics are later read can require the namespace. Per-position choices can split identity guards across different imports. Import choice does not authorize a residual receiver rewrite: use the destructure plan's anchor/mirror and mutation gates below.

Container walks share `CENSUS_CONTAINER_TYPES`. Escaping classes expose public static, instance and computed members, plus inherited statics; private members are excluded. A pairer unable to index a supported container or key hands it out whole instead of returning no values.

## Global proxies

The model treats `globalThis`, `self` and `window` as the same realm object. A nested `window` holding another object is outside it. Keep three questions separate: whether an entry exists (`navHasUnresolvableProxyHop`), whether the source name denotes the realm (`proxyGlobalRootName`, including shadow checks), and whether this build can spell it (`realmRootIsSpellable`). An unavailable spelling in one channel is not proof that none exists.

- Use `realmHopKeyName` for every key spelling and `foldableRealmHop` for folding. The caller supplies which span is backed by a ponyfill. Preserve computed-key effects and terminal probes whose values the source reads; do not decide from dotted versus computed syntax.
- `landRunOnDeepestBackedSpan` / `proxyRunLandingPure` include the root itself. An unspellable root does not block a backed hop above it. Replay discarded sequence prefixes, stores and key effects in their original evaluation slots. Optionality inside a replaced span may require guard lowering rather than a direct swap.
- `storedValueConsumedAbove` and `handsValueOn` distinguish dereferencing a stored realm value from merely observing it. Arguments, `typeof`, null tests and optional readers do not justify erasing its terminal environment probe. Tests carry no branch value.
- Preserve guards only where the source observes possible absence. Use `chainSealsAShortCircuit` for paren seals and `mutationGuardKeepingHop` where optionality controls a mutation. Guard tests use the shortest probe prefix. A consuming collapse preserves a discarded throwing read, except the accepted caller-default fallback slots. `delete` performs no read, but optionality deciding whether deletion happens remains live. Its claimless channel starts at the end of the all-proxy run, not above ordinary members.
- `realmSelectingHostCollapses` handles realm-selecting destructure receivers, including paired array elements and rest patterns. Apply the decision and skip the discarded branch in both bindings. `usage-global` injects without rewriting these hosts. Marking a span handled prevents duplicate rewriting; it does not prove that an instance receiver, delete target or declined claim was consumed.

Accepted prices: collapsing a `window` navigation can yield `undefined` where native throws; a bare `window` selection can take the author's fallback instead of throwing `ReferenceError`. A backed left operand of `??` / `||` denotes the realm; an unbacked probe may select the fallback. Caller-default slots may keep an always-defined literal. These are read/caller-default rules, not permission to erase mutation guards. Proxy collapses need not reach a fixed point in one pass: `pre` and `pre+post` can differ after the first pass exposes another fold.

## Destructuring and callers

Preserve receiver evaluation, computed-key effects and binding writes in source order. A sequence prefix originally preceding the pattern must precede extracted writes too; use `dropDeadSequenceElements` to discard only unobservable work. Retained captures serve hosts where splitting would reorder getters, keys or assignments. Exports keep their original public names separate from private captures. Validate ordering with runtime effect logs, not just import sets.

Object-rest on a proven constructor requires its whole index when that flavor has a constructor entry; pure reads both named properties and rest from it. Other receivers keep their source and exclusions. Proven pristine static slots may extract beside it, with one receiver evaluation and ordered binding writes before the native rest copy. Repeated exclusion reads require a built-in or immutable slot, never an effectful user getter. Instance slots and unproven receivers keep native reads. Keys and defaults retain their independent claims; global injection remains active.

A destructured parameter's polyfill normally belongs in its receiver default:

```js
function f({ Array: { from } } = { Array: { from: _Array$from } }) { /* ... */ }
```

This preserves caller-supplied objects. A body extraction requires a closed caller census proving every call leaves the parameter to its default. It also passes `qualifiesForParamBodyExtract`'s scope and parameter-read checks. Never introduce or replace leaf defaults in a parameter as a polyfill fallback: supplied undefined properties and user defaults must keep their meaning. Prefer receiver replacement, then a proven body extraction; otherwise retain the native read. `argumentOverridesSlot` owns whether an argument runs the default; `undefined` and `void` do.

A slot default is not an extraction: `{ K: v = _pony }` cannot replace a present native implementation. Do not introduce it as a convenient render on a new host. A for-x head over a literal mirrors the polyfill into the iterated element; opaque iterables and instance claims may need extraction instead. Retained capture remains preferable beside rest where the host can hold it.

An inner default belongs to its pattern level. Prove the paired slot undefined, present or unknown: mirror the default, leave it dead, or preserve both live arms respectively. Where no host value is known, mirror only the default and leave the live receiver native. Caller-side mirrors may discharge a parameter rewrite only when every caller is accounted for. Static imports make a user's leaf default dead; instance dispatch, memo and navigation reads may still need their undefined guard. Use the shared default renderers.

Nested reads use the same decisions as their flat equivalents. Splits across sibling levels must respect receiver re-read safety and statement placement; retained-pattern captures preserve user getter order. Assignments complete each target write before the next key, preserve source guards and prefix claims, and distinguish binding targets from nested/member targets. A claimed sentinel still evaluates its computed keys.

Residual anchoring is a plan decision in `detect-usage/destructure-plan.js`, not an unconditional raw/pure rule. A missing constructor can require a pure anchor even with no extracted leaf. Preserve patched constructors, disabled reads, rest sources and the plan's raw/mirror boundaries; never install a ponyfill into the realm through a residual target (`residualLeafWritesIntoRealm`). A named own static needs its own entry or mirror, not a read from the bare constructor. Do not rely on incidental instance-as-static exports or decoration of a shared constructor by unrelated imports.

Returned arguments and containers resolve through the shared invocation/value canon, regardless of parameter index or direct, named, invoker or tagged spelling. A returned parameter must not be rebound or written through; container proofs must also exclude aliases or handouts that can change its slots. `allowMutatingForwarder` is only for callers retaining the call and checking its returned value at runtime. `sameHeadElement` compares the arguments of repeated calls, not just callee identity.

Mutation records belong to declarations and their scope chains, not names. Follow aliases and returned containers through the same canon for reads, writes and escapes (`calleeYieldedContainer`). Unknown container keys keep the whole-family fallback, except proven constructor selections for named static reads; bare realm/proxy keys remain tracked positions. Reassignment, slot writes and opaque handouts invalidate narrow proofs. Local object methods are owned by receiver binding plus key: escaped owners or unaccounted reads prevent a closed caller census; absence of constructor rebinding does not close it. `argsUnknown` is acceptable when recording known arguments, never when proving a slot empty.

Follow an initializer only after it has run (`varInitDominatesUsage`); a hoisted `var` can still be undefined at an earlier read. This applies to aliases, container slots, folded keys, inline callees and defaults. Global import-only analysis may keep following where pure substitution must refuse.

## Accepted semantic boundaries

These limits are not general licenses to weaken the proofs above:

- **No output typechecking guarantee.** Typecheck source before transformation. Runtime-correct mirrors can invalidate TS assertions. Preserve a wrapper around a replaced value; a wrapper around a removed read can leave with that read.
- **`with` and direct `eval` are outside the binding/value model.** Dynamically introduced reads, writes, aliases and calls are not inferred.
- **Known builtin arguments do not alone require constructor namespaces.** Callback, array-mutator and general retained-result flow is deferred (`builtin-*-static-read` fixtures). Explicit Object/Reflect property stores record literal data values like assignments. This is an injection policy, not an escape proof. `call`, `apply`, `Reflect.apply` (including lowered pure imports), immediately invoked `bind` and tags invoke their callee through `callPairing`. Exports, unknown consumers and recorded writes still count.
- **`Symbol.iterator in x` becomes an is-iterable test.** Primitive RHS values lose the native `TypeError`; a present-but-undefined iterator answers false. See `helpers/in-expression.js`.
- **core-js wins a self-guarded patch.** `readFeedsOwnSlotWrite` distinguishes the detecting read before a write from later raw reads of the written slot. A guard can select core-js and prevent a third-party patch from installing. Existing prototype-dispatch debt: substitution persists even under destructive writes.
- **Value-flow limits can retain pure substitution over a user write.** Rest parameters, library callbacks, transitive forwarding (including `super`) and values beyond the composite-depth budget are outside the precise model; the coarse global census remains conservative. Do not reopen the rejected workaround of deopting a key across every constructor: an unrelated `opts.assign` write must not disable `Object.assign` for the file.
- **An unnamed receiver cannot prove a static.** Catch parameters and opaque/unclosed hosts can leave static reads native, hence unavailable on a stripped target. Typeless instance claims and inner defaults can still be served independently.
- **Partial assignment state after a throw can differ.** Pure collapse does not promise native sibling-write progress observable through `try/catch`.
- **Positional extraction reads the claim after iteration.** An effectful computed iterable can observe the read later than native, between different iterator steps. This accepted limit does not justify dropping the positional polyfill.

## Canon owners and dialect rules

- `index.js`, `resolver.js`, `injector-base.js`: resolution context, injection state, final-tree import liveness and slot numbering. Feature data comes from `@core-js/compat` (`built-in-definitions`, `known-built-in-return-types`).
- `detect-usage/resolve.js`: value identity, aliases, calls and proxy navigation. Type resolution uses this same answer. `detect-usage/own-output.js` recognizes prior output across emitters/configurations so re-transformation respects deliberately retained reads.
- `detect-usage/destructure.js`, `detect-usage/destructure-plan.js`, `destructure-host-shape.js`: shared destructure decisions and host classification. `planMinifierSequenceSplit` plans the pre-detection rewrite; bindings only apply it.
- `render.js`: canonical builders, imports, guards, memos and mirrors. Host-owned subtrees pass through `hostSlot`; the Babel converter is total over the builder vocabulary, not arbitrary source ASTs.
- `helpers/ast-patterns.js`: wrapper peels, hop context, invocation pairing, evaluation order and module format. Reuse the hop descriptor rather than inventing another context bag. Other `helpers/` modules own class walking, skip subsumption, import-binding indexing, require sources and path normalization.
- `resolve-node-type/`: receiver types; changes affect both usage methods. Alternative values use `foldUnionTypes`. Guards are built in `resolve-node-type/guard-shapes.js`, resolved in the test's scope, with bound builtin operands and one selected overload. A possibly unexecuted guard narrows only positively; uncertainty stays wide.
- `resolve-node-type/pattern-bindings.js`: default-parameter caller census through `callPairing` and `positionDisposition`. A function member can expose an invoker; a construction accounts for its own arguments only while its result is dropped.
- `resolve-node-type/structural-key.js`: conservative structural identity. Never key partial member lists. Key equality proves identity; inequality proves nothing. Family relations use `STRUCTURAL_SUPERTYPES`. Resolved boxes need their `identity` slot for a positive match, not shared JS object identity. Complete `argumentMembers` maps can disprove a required-field relation, not infer a receiver type or prove a new positive relation. Unions retain neither one arm's identity nor its argument proof.
- `plugin-options/`: trusted build configuration, usage-global dispatch and module injection. Generated names use `findUniqueName` under plugin-owned prefixes.

Peel before node tests, parent climbs or identity comparisons: `unwrapRuntimeExpr`, `peelTransparentExprAncestorPath`, or `stepOverChainWrappers` when both reader and operand matter. `unwrapExpressionChain` discards sequence prefixes and is unsuitable for effect checks. Babel's `extra.parenthesized` and explicit paren nodes require the same semantic answer, including seals hidden under TS wrappers.

Path climbs use `useRegionFrames` because method keys, decorators, fields and bodies evaluate in different frames, represented differently by the parsers. Native-binding region checks need only the parameter-decorator correction; both trackers already exclude a method's own key from its body scope. Positional proofs use the shared evaluation predicates and `writeOutrunsUse`. Class decorators versus heritage are deliberately unordered because native and lowered evaluation disagree. Clones retain the facts these predicates read: source offsets in Babel, evaluation-frame stamps in ESTree.

Module format has one Program-level verdict used by strictness, Annex-B, caller boundaries and import emission. `importStyle` does not change language semantics. Emitted format follows surviving ESM: binding imports, exports and top-level await, not a side-effect import the transform removes.

Disable directives suppress injection, not observation of mutations. `helpers/source-scan.js` also preserves their coverage in reprinted output so a second pass honors the same opt-outs.

## Validation

For provider behavior changes, use `npm run test-polyfill-provider` scoped to the affected suites during the edit loop, plus bare `npm run test-transpiler-differential` and `npm run test-e2e-usage-pure`. The provider affects both emitters and usage methods: `pure` or single-emitter filters omit relevant oracles. Matching fixtures/import sets alone cannot validate a shared decision. Intentional divergences from native belong in explicit e2e assertions and fixtures rather than native-equality differential rows.

Additional checks depend on the change:

- Flow arms need fixtures in both usage methods; only Babel parses Flow, and TS behavior is not their oracle.
- Syntax entry sets in `detect-syntax.js` are measured from downstream lowering with `@babel/plugin-transform-runtime`, or its helper source when the transform is unavailable. Inlined helpers can hide missing injection. JSX/TS spellings feed the same form's arm.
- New residual shapes must survive downstream lowering. Empty trailing destructure husks can lose bindings or throws there; use `arrayWrapperResidualTrailingShed`, retaining lengths needed for positional pairing. Inspect lowered bindings and behavior; our own output parity does not cover this.

At final handoff of transpiler code changes, run `npm run test-transpiling` once, then the appropriate performance gate. Do not combine the composite with its members. Routine checks use `npm run test-transpiler-perf-smoke`; performance work uses `npm run test-transpiler-perf`. Sampling/comparison rules live in `tests/transpiler-perf/AGENTS.md`; suite and fixture rules in `tests/AGENTS.md` and `tests/transpiler-fixtures/AGENTS.md`.
