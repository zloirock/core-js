# @core-js/polyfill-provider

Shared detection, type resolution, injection decisions and ESTree rendering for `@core-js/babel-plugin` and `@core-js/unplugin`.

## Target environment

Build-time only, ESM. Node `^22.18.0 || >=24.11.0`.

## Core and bindings

The plugins are one transpiler with two hosts. Each question has one owner:

- **Detection:** source forms, claims, aliases, scope and type facts. Parser-dialect differences go through shared canon predicates.
- **Decisions:** inject, collapse, guard or bail; evaluation order and method biases. Decisions depend on source and targets, never on the host.
- **Render canon:** literal ESTree nodes from the closed builder vocabulary in `render.js`.
- **Bindings:** parsing, traversal, scope queries and insertion. Babel converts canonical nodes at insertion and handles scope registration, requeueing and later plugins; unplugin inserts ESTree directly and owns printing, sourcemaps, module filtering and SFC handling.

Dependencies follow that order, and only bindings know which host they serve. Separate parsers, traversals, scope trackers and printers are by design; a common pipeline and byte parity are non-goals. Duplicated decisions or render forms belong here: fix a shared rule once, collapse the existing paths, and justify any new path in writing.

- Ask a shared decision before any competing route rewrites the shape it reads. A speculative question must not mutate analysis state or prime a later decision; test that by calling it and ignoring the answer, since disabling the call mixes its effects with its verdict.
- A render skip-marks only the claims it serves: defaults, computed keys, call arguments and surviving subtrees with claims of their own stay visitable. Fix an overbroad skip instead of making the plan bail around it.
- Same input and options give the same semantic output. Formatting is defined by `tests/unplugin/structural.mjs`, accepted structural spellings by the unplugin `AGENTS.md`. Every divergence between the legs is classified and a sidecar justifies its actual divergence; runtime and stripped-realm oracles are required because both bindings can share a bug.
- Classify through scoped predicates and structure, never raw identifier names: shadowing, aliases and mutations invalidate name-only answers. Before adding a function or branch search the canon (`npm run canon -- find` with several descriptions, `show` the candidates) and extend, export or lift an existing helper, or name the rejected candidates and why. At handoff adjudicate every `canon -- delta` addition and `canon -- sets` hit (`scripts/canon/AGENTS.md`). Wrapper sets and peels belong to `helpers/ast-patterns.js`.

A mechanism's cases, examples and edge forms live in the contract above its definition and in regression fixtures, and so does what one spelling is accepted to do. This file holds ownership, the rules and accepted boundaries that span many mechanisms, and validation.

## Injection methods

- `entry-global` replaces side-effect core-js entry loads (require, dynamic import, sequence-joined loads, subpaths) with target-specific `core-js/modules/*` imports. Loads with bindings stay, even unused, `import x = require()` included.
- `usage-global` injects side-effect imports wherever a polyfill might be needed.
- `usage-pure` rewrites proven receivers to `@core-js/pure` imports; an uncertain type takes the generic fallback or bails, and a bail must not strand a polyfillable global (`globalThis`, `Symbol`) on a target lacking it.

Widening `mode` never narrows the injected set: mode-independent obligations read the fixed entry layer (`isProposalEntry`). The one exception is a decided selection, whose dead right leaves with its modules (`globalThis.AsyncIterator || Array`).

One constructor import per name per file in pure. The narrow entry (`*/constructor`, `Reflect`'s `reflect/namespace`) carries no own statics, so a substituted value whose statics may be read takes the whole (index) entry: an escape, an unnameable mutated member, a stored constructor whose statics are read later. An escape is a value handed to code this file does not see - a callee an invoker hands it to, an exported binding's every write, a top-level declaration of a script that may run bare, a write into a realm slot, a global's own value copied back into its slot included - and the escape census (`escapedCtorReferencesReducer`) owns the routes. Usage-global patches one global slot: an opaque native static owner (`NATIVE_STATIC_OWNERS`) loads its global patch entry and own static entries, without inferring usage of unrelated prototype methods; a replacement constructor keeps its whole entry. A value handed to a standard-library method is no escape (`builtinCallee`), and a global the data defines no module for (`Array`, `String`, `Math`) has no entry to widen: only a static read the claim side does not name loads the union of its own static entries (`readsUnnamedStatic`). A value returned by a static, including its prototype or an instance, does not imply usage of that value's methods. A static read the claim side leaves raw over a receiver that may hold a substituted constructor takes that constructor's whole entry: the census counts a read as served only where the claim side serves it, on the same written-container record (`containerSlotRecordWritten`) and alias folds. A named own static needs its own entry or mirror: never rely on a narrow entry exposing an instance ponyfill as a static, or on unrelated imports decorating a shared constructor. Import choice never authorizes a residual receiver rewrite: those go through the destructure plan's anchor and mirror and the mutation gates. Container walks share `CENSUS_CONTAINER_TYPES`; a pairer unable to index a supported container or key hands it out whole.

## Statics and globals: realistic spellings only

An instance method's receiver arrives through arbitrary data flow, and inferring its type is the product. A static, a global or a global proxy is spelled where it is used: almost always directly (`Array.from`, `new Promise`), less often through an alias or a destructuring (`const P = Promise`, `const { from } = Array`), rarely through one proxy level and/or a condition that selects it or tests its presence (`globalThis.Map`, `(c ? Map : Set).groupBy`, `typeof Promise != 'undefined' && Promise.resolve()`). Writes follow the same distribution.

Detection, the census and the transforms cover that distribution in its order and stop there. A rarer route - a written container slot, a slot a binding's own write reads off (`node = node.prev`), a call result, a factory, a spread, a deeper proxy chain, a patch through a parameter or an aliased `.call` - is handled only where existing canon gives it (almost) free, never by logic of its own or at a transform-time cost: time on real code outranks precision on shapes nobody writes. Past that it takes whatever the canon answers, and existing handling that costs anything is removed. A probe that finds such a route has found no bug: estimate its runtime cost and implementation complexity, and bring both to a maintainer before implementing anything.

**Served** means the build answers for the value on every target: pure substitutes it, the data subset the build is configured for carries its entry whatever the targets and the user's filter say (`isEntryAvailable`), or it is a native static owner (`NATIVE_STATIC_OWNERS`). A slot the census may see written (`isMutatedStaticSlot`) is not served - save in pure a read running before every write of it (`slotReadPrecedesItsWrites`) and a slot written only in arms the build never takes - and neither is a read on an opted-out line. core-js wins: a served read takes the polyfill wherever its value goes, the global's own slot included, and a read detecting a patch takes it ahead of the patch (`readFeedsOwnSlotWrite`).

**Excluded** statics are methods the constructor's ponyfill lacks: every spelling reads one off the narrow constructor entry, never off the native constructor a target may lack, and an escaping constructor's namespace entry carries it too.

**Decided selections** (`decidedSelection`): a `||` / `??` whose left always yields (`deadFallbackRight`) and a presence test the build always answers (`presenceTestValue`) decide their selection. The dead part is no usage in either method and names no constructor, key or guard candidate, and neither is a default on a slot the build always fills (`defaultDroppedAsDead`); a read off the selection reads its live operand spelled alone (`decidedSelectionValue`, `decidedReceiverSpelling`); reaching values settle decided arms first (`decidedGuards`), so a write in a dead arm never runs (`writeNeverRuns`); usage-pure folds a decided expression once the claims rendered (`foldedOperandNeedsValue`), and a statement or sequence element its render leaves performing nothing leaves with it (`renderPerformsNothing`). The mutation census alone keeps every arm and every write, since the decisions read it.

An undecided selection of constructors read by a known key takes the identity guard over the captured selection for each arm that is a native static owner - in place, stored, destructured, or through a selection of containers. Read by an unknown runtime key (`C[key]`), returned by a call, held by `||=` or tested by `in`, it stays native in pure.

## Global proxies

`globalThis`, `self` and `window` are one realm object; a nested `window` holding another object is outside the model. Keep three questions apart: does an entry exist (`navHasUnresolvableProxyHop`), does the source name denote the realm (`proxyGlobalRootName`, shadowing included), and can this build spell it (`realmRootIsSpellable`). A key read off the realm names a built-in only under a known name the configured set carries (`isKnownStaticGlobal`).

Every hop key is named by `realmHopKeyName` and folded by `foldableRealmHop`, never by dotted versus computed syntax, and a run lands on its deepest backed span (`proxyRunLandingPure`, `landRunOnDeepestBackedSpan`). Replay discarded sequence prefixes, stores and key effects in their evaluation slots. Keep a guard only where the source observes possible absence (`chainSealsAShortCircuit`, `mutationGuardKeepingHop`, `storedValueConsumedAbove`); `delete` reads nothing of the run it deletes save its computed keys and call arguments (`deleteHostAboveChain`).

Accepted prices: a collapsed `window` navigation can yield `undefined` where native throws, and a bare `window` selection can take the author's fallback instead of throwing; a backed `??` / `||` left denotes the realm; caller-default slots may keep an always-defined literal; the emitters may differ on keeping a bare name read in a collapsed init's sequence prefix or a dead `0,` of a run carried through a sequence; proxy collapses need not reach a fixed point in one pass (`pre` and `pre+post` can differ). None of these licenses erasing a mutation guard.


## Destructuring and callers

- Preserve receiver evaluation, computed-key effects and binding writes in source order. A sequence prefix ahead of the pattern stays ahead of the extracted writes (`dropDeadSequenceElements` drops only unobservable work), and an init that runs code evaluates before the pattern binds anything (`residualInitRunsEffects`). Validate ordering with runtime effect logs, not import sets.
- Object rest on a proven constructor takes its whole index where that flavor has a constructor entry the build serves (`constructorRestIndex`); other receivers keep their source and exclusions, and so does a constructor whose entry the build excludes.
- A destructured parameter's static or global polyfill belongs in its receiver default (`function f({ Array: { from } } = { Array: { from: _Array$from } })`). Instance dispatch uses the actual supplied receiver where parameter timing, scope and TDZ can be preserved (`planParameterInstanceExtraction`); other body extractions need a closed caller census (`qualifiesForParamBodyExtract`). Never introduce a leaf default as a polyfill fallback: supplied undefined properties and user defaults keep their meaning.
- A mirror needs proven keys: an unknown computed key, or a repeated key under an instance claim, keeps the pattern native. A slot default is no extraction, and an inner default belongs to its own pattern level and renders through the shared default renderers. Nested reads take the decisions of their flat equivalents.
- Residual anchoring is a plan decision (`detect-usage/destructure-plan.js`). A member target takes the ponyfill like a declared binding, whatever its root stands for, and so does a binding a TS assertion wraps; both are written as spelled (`spelledWriteSlot`, `memberTargetTakesExtraction`).
- Returned arguments and containers resolve through the one invocation and value canon (`callPairing`, `calleeYieldedContainer`); a returned parameter must not be rebound or written through. A local object method and a class's own static are owned by their receiver binding plus key, through every name bound to that binding whole (`const A = K`): an escaped owner, an unaccounted read or a reference past the binding (`classReachesItselfUnnamed`) leaves its caller census open (`classStaticsHandedOut`), and a write over a class's own static refuses it.
- Mutation records belong to declarations and scope chains, not names. Reads, writes and escapes follow aliases and returned containers through the same canon, and an unfoldable key off a replaced constructor (`Map[k]`) holds its whole family. The census and the claims fold keys through separate canons; a read counts as served by its key only where both name it.
- A proof reads a value only where it has one: a pattern slot no default or spread may change (`certainPairedSlotValue`), an initializer that has run (`varInitDominatesUsage`), a reaching write resolved in its own scope (`writeReadsBlockShadow`, `writeScopeAt`). Import-only analysis in usage-global may follow further than pure substitution.

## Accepted semantic boundaries

Each is a limit of the model, not a license to weaken the proofs above; its owner's contract holds the detail.

- No output typechecking guarantee: typecheck the source. A wrapper around a replaced value stays; one around a removed read may leave with it.
- `with` and direct `eval` are outside the binding and value model.
- Known builtin arguments alone do not require constructor namespaces (`builtin-*-static-read` fixtures); `call`, `apply`, `Reflect.apply`, an immediately invoked `bind` and tags invoke through `callPairing`.
- `Symbol.iterator in x` is an is-iterable test (`helpers/in-expression.js`).
- core-js wins a self-guarded patch (`readFeedsOwnSlotWrite`, `slotReadPrecedesItsWrites`, `readDecidesWrite`): a patch the build never runs is no write (`settleCensusWrites`), and a read after a patch that may run is the user's.
- Value flow past library callbacks or the composite-depth budget can keep pure substitution or a field narrow over a user write - a `JSON.stringify` replacer runs with the holder as `this`, unseen (the registry header lists those callbacks); a parameter holds only its own default in both censuses.
- An unnamed receiver (a catch parameter, an opaque host) cannot prove a static.
- A read deferred into a function body or default is taken as initialized (`initializerMayRunBeforeUsage`).
- Partial assignment state after a throw can differ from native.
- Top-level `this` is the realm (`isTopLevelThisContext`).
- A visible replacement of `Array.prototype[Symbol.iterator]` keeps array destructuring native in pure.
- A prototype patch under an unreadable key keeps its constructor pure, so the patch lands on the prototype pure's instances carry.
- A computed exclusion before a nested binding keeps its rest pattern native in pure.
- A realm slot is filled only where the build serves its global (`realmLevelNamesCtor`).
- Positional extraction reads the claim after iteration.
- A prototype install is read where its setter is spelled, by a read it may run before (`noReassignmentReachesUsage`, `spellsMemberKey`).
- Write order is read where it is plain (`writeOutrunsUse`).
- A decided selection is decided for its claims only: usage-pure folds expressions, not statements (`decidedSelection` lists the runtime-equal leftovers).
- A realm member as a destructuring target or a for-of head (`({ Promise: globalThis.Promise } = globalThis)`) is no self-copy: its read stays native.
- A script that may run bare is bare only for what it hands out (`programTopLevelIsRealm`).
- An effectful computed key keeps a pattern's member target native, and an effectful keyed level of an assignment over a member receiver leaves the levels after it native.
- An exotic destructuring spelling - an effectful or computed key beside claims, a getter on a claimed slot, a rest or default level under a selection - can run in another order than native or keep a native read, and the emitters can differ there; each is locked by its fixture and stated at the deciding code, both read before treating one as a bug.

## Canon owners and dialect rules

- `index.js`, `resolver.js`, `injector-base.js`: resolution context, injection state, final-tree import liveness and slot numbering. Feature data comes from `@core-js/compat`.
- `detect-usage/resolve.js`: value identity, aliases, calls and proxy navigation; type resolution uses the same answer. `detect-usage/own-output.js` recognizes prior output, so a re-transformation respects deliberately retained reads.
- `detect-usage/destructure.js`, `detect-usage/destructure-plan.js`, `destructure-host-shape.js`: destructure decisions and host classification. Bindings only apply `planMinifierSequenceSplit`.
- `detect-usage/mutations.js`: the census of writes and escapes.
- `render.js`: canonical builders, imports, guards, memos and mirrors. Host-owned subtrees pass through `hostSlot`; the Babel converter is total over the builder vocabulary, not over arbitrary source.
- `helpers/ast-patterns.js`: wrapper peels, hop context, invocation pairing, evaluation order and module format; reuse the hop descriptor rather than a new context bag. Other `helpers/` modules own class walking, skip subsumption, import-binding indexing, require sources and path normalization.
- `resolve-node-type/`: receiver types for both usage methods. Alternative values fold through `foldUnionTypes`; guards come from `guard-shapes.js`, resolved in the test's scope. A guard whose false answer proves nothing - a call that may not have run, a predicate true for only part of its type (`partial` in the registry, `Number.isFinite`) - narrows only positively (`guardProves`). A type-level read takes the type its path spells - a declaration, an assertion at any step - over the value the path holds (`typeofSource`); a destructured name's declaration types its pattern, so a reader keyed by the name asks `findNameAnnotation`. The build's decisions arrive through the decision adapter. `structural-key.js`: key equality proves identity, inequality proves nothing.
- `plugin-options/`: trusted configuration, usage-global dispatch and module injection; generated names use `findUniqueName` under plugin-owned prefixes.

A question asked at every level of a selection or alias chain must not re-walk the chain at each level: per-node answers live in `canonAnswerTable`, keyed by every input the walk reads, within one read-only traversal or one synchronous question (`withCanonQuestion`), never across a pure rewrite or in a re-entrant ask. A walk that cut a cycle keeps no answer (`cycleGuardHas`), and an alias chain past the ceiling names nothing (`withinAliasWalkBudget`). A binding written past the write ceiling is not followed through its writes: an analysis that walks them for a read asks `writesPastCeiling` first. The census keeps following every write, so a question it asks at every read of a binding is answered once - per value set (`valueSetAnswers`) or per binding - and never re-walks what the binding holds per read. The nearest var-scope owner of a path is kept for a whole walk, a rewriting one too where the parser keys a path by its parent path (`withVarScopeOwners`), so a render must not swap a function or a class in under a path that exists; a subtree it moves into a new activation goes into a call.

Peel before node tests, parent climbs and identity comparisons (`unwrapRuntimeExpr`, `peelTransparentExprAncestorPath`, `stepOverChainWrappers`); `unwrapExpressionChain` drops sequence prefixes and is unfit for effect checks. Babel's `extra.parenthesized` and an explicit paren node take the same answer. Path climbs use `useRegionFrames`: keys, decorators, fields, parameters, catch parameters and bodies evaluate in different frames. Clones keep the facts these predicates read: source offsets in Babel, frame stamps in ESTree. A binding lookup answers for the scope it is asked in, climbed for from where the name is read: every adapter method takes the contract's `read` (`lookupReadPath`), and a var-hoist fallback goes through `hoistedDeclarationInScope` or `hoistedBindingVisibleInScope`, which drop a declaration below that scope.

Module format is one Program-level verdict (`resolveModuleFormat`) for strictness, Annex B, caller boundaries, import emission and the escape census. `importStyle` does not change language semantics, and the emitted format follows surviving ESM. Disable directives suppress injection, not the observation of mutations; `helpers/source-scan.js` keeps their coverage in reprinted output.

## Validation

For provider behavior changes run `npm run test-polyfill-provider` scoped to the affected suites during the edit loop, plus bare `npm run test-transpiler-differential` and `npm run test-e2e-usage-pure`. The provider feeds both emitters and both usage methods, so `pure` or single-emitter filters omit oracles, and matching fixtures or import sets alone cannot validate a shared decision. An intentional divergence from native belongs in explicit e2e assertions and fixtures, not in native-equality differential rows.

- Flow arms need fixtures in both usage methods; only Babel parses Flow.
- Syntax entry sets in `detect-syntax.js` are measured from downstream lowering with `@babel/plugin-transform-runtime`, or its helper source; inlined helpers can hide a missing injection.
- New residual shapes must survive downstream lowering: an empty trailing destructure husk can lose bindings or throws there (`arrayWrapperResidualTrailingShed`). Inspect the lowered output; our own parity does not cover it.

At final handoff of transpiler code changes run `npm run test-transpiling` once, then the performance gate: `npm run test-transpiler-perf-smoke` routinely, `npm run test-transpiler-perf` for performance work. Do not combine the composite with its members. Sampling rules live in `tests/transpiler-perf/AGENTS.md`; suite and fixture rules in `tests/AGENTS.md` and `tests/transpiler-fixtures/AGENTS.md`.
