// AST-pattern resolvers shared across detect-usage submodules. covers the core walk
// primitives (`unwrapTransparentSeq`, `unwrapParensCollectingEffects`, `isStaticPlacement`),
// binding-to-global resolution (`resolveBindingToGlobal` and friends), and the high-level
// resolvers used by callers (`resolveKey`, `resolveObjectName`, `patternBindingName`,
// `findProxyGlobal`). also hosts Symbol-ref helpers
// (`resolvesToGlobalSymbol`, `asSymbolRef`) consumed by the members submodule, and the
// proxy-global recogniser (`proxyGlobalRootName` and its member twin) - asking which realm
// name a binding stands for is asking this module what the binding holds and keeping the
// realm names off the answer, so the narrow lives with the canon instead of forking it
import { entryToGlobalHint, resolve as resolveBuiltInMeta } from '../index.js';
import {
  argumentOverridesSlot,
  ALWAYS_TRUTHY_OBJECT_NODES,
  computedKeyHasSideEffects,
  isIdentifierPropValue,
  aliasDeclScope,
  aliasReadGuardedAgainstNullish,
  aliasSpanDominatesUse,
  allProxySelectingInit,
  asProxyGlobalName,
  assignmentAliasHintSoundAtRead,
  bindingDeclarationPath,
  bindingDeclaratorNode,
  bindingHoldsNoGlobal,
  bindingLoopAnchor,
  bindingNodeType,
  bindingPolyfillHint,
  bindsModuleDefault,
  boundModuleDefaultSource,
  calleeYieldedContainer,
  prototypeChainMayLend,
  callPairing,
  canonAnswerTable,
  canonContextPath,
  chainValueCarrier,
  collectFoldedReceiverSideEffects,
  collectParamBindingNames,
  definedBranchOfGuardConditional,
  deleteHostAboveChain,
  firstProxyBranch,
  flattenBranchingValueNodes,
  followConstIdentifierInit,
  foldedPropertyKeyName,
  globalProxyNameFromImportSource,
  identifierDeclaratorInit,
  identifierReferencedInSubtree,
  initializerMayRunBeforeUsage,
  initializerReachesRead,
  IMPORT_SPECIFIER_TYPES,
  importBindingIsTypeOnly,
  importedGlobalProxyName,
  importSourceMatchesUserPackage,
  inCallerCorrectFallbackSlot,
  installedWriteValue,
  invocationNode,
  isAliasProxyRoot,
  isAmbientBindingShape,
  isDestructurePattern,
  isDirectiveStatement,
  isMemberAccessNode,
  memberKeepsReceiverThrow,
  isMemberWriteHost,
  isMutatedGlobalSlot,
  isNullLiteralNode,
  receiverCarriesLiveOptional,
  isPristineProxyGlobal,
  isRestProperty,
  isReassignedBeyondDeclarator,
  isRenderedStoredValue,
  isTopLevelThisContext,
  isTransparentWrapper,
  isUndefinedNode,
  isValidIdentifierName,
  kebabToCamel,
  mayHaveSideEffects,
  LOCAL_MEMBER_CALLEES,
  memberChainEndPath,
  memberKeyName,
  memberProxyHopName,
  mutatedStaticKey,
  navComputedKeyEffects,
  nodeCarriesSourceSpan,
  noReassignmentReachesUsage,
  pathOfNode,
  patternLiteralKeyPath,
  findObjectKeyBeforeSpread,
  followConstLiteralAlias,
  bodyWritesThroughParameter,
  CENSUS_CONTAINER_TYPES,
  paramListRunsWork,
  paramReboundInBody,
  paramReturnsTheValue,
  patternBoundAliasSlotInit,
  patternSlotValueAmbiguous,
  patternSlotTarget,
  spelledWriteSlot,
  patternSlotValues,
  patternSlotWritten,
  peelChainAssignment,
  peelChainAssignmentDeep,
  peelMemoizeWrappers,
  peelProxyGlobalObject,
  peelTransparentExpr,
  peelSequenceTail,
  peelZeroArgIifeReturn,
  plainSynthKeyName,
  POSSIBLE_GLOBAL_OBJECTS,
  pureCtorNameFromImportSource,
  pureImportEntryOf,
  pureImportSourceEntry,
  reachingReassignmentValueNode,
  reassignBailApplies,
  reassignmentReachesUsage,
  runtimeChainRoot,
  reassignmentBlocksGlobalResolve,
  reassignmentValueEnumeration,
  bindingWrittenBeforeUsage,
  reassignmentValueNodes,
  readsOffBindingItself,
  requireCallSource,
  resolveCallArgument,
  PARAMETER_STATIC_SOURCES,
  parameterStaticSource,
  runStandsInLoweredGuardTest,
  sequencePrefixWithSideEffects,
  singleQuasiString,
  singleReturnBodyExpression,
  SELECTION_TEST_FIELDS,
  SKIPPABLE_WRAPPER_TYPES,
  soleChainToProp,
  spelledSlotName,
  staticMemberFromEntrySegment,
  staticMemberKeyName,
  stepOverChainWrappers,
  synthSwapPropKey,
  trustedIdentifierAliasWrite,
  TS_EXPR_WRAPPERS,
  tsImportEqualsProxyName,
  tsImportEqualsRequireSource,
  unwrapParens,
  forOfHeadDeclarationOf,
  forOfHeadIterableElements,
  forXHeadLoopPath,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
  subtreeContainsNode,
  unwrapTransparentSeq,
  varInitDominatesUsage,
  violationNode,
  writeIsInOppositeBranch,
  writtenPatternSlotValues,
  provablyPrecedes,
  zeroArgIifeSideEffectFree,
  ESCAPED_CONTAINER_NAMES,
  rootProgramOf,
  anyWriteOutrunsUse,
  extractStaticString,
  cycleGuardCuts,
  cycleGuardHas,
  cutDeepWalk,
  guardSettlingInFlight,
  withCanonQuestion,
  withPresenceReadQuestion,
  withReentrantQuestion,
  refuseReentry,
  writeScopeAt,
  peelTransparentWrapperPath,
  writesPastCeiling,
} from '../helpers/ast-patterns.js';
import {
  KNOWN_FUNCTION_GLOBALS,
  NATIVE_STATIC_OWNERS,
  SYMBOL_STATIC_KEYS,
  implementsPrototypeMethod,
  isKnownGlobalName,
  staticMethodType,
  symbolKeyToEntry,
} from './globals.js';
import { argIndexForParam, dropLeadingThisParam, nodeRangeContains } from '../resolve-node-type/base.js';

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains. the bound
// every alias-chain walk of this file shares: the key walks (`isSymbolSourcedKey` among them) and the
// object-name and binding walks (`withinAliasWalkBudget`)
const MAX_KEY_DEPTH = 64;

// the most hop sources one union of alias values follows (`reachableAliasValues`): a ring of aliases copying one
// another holds a source per copy, and every claim on the ring walks them all, so a source past the ceiling is not
// followed - the values the sources before it named stand. a ring of a few names has every name expanded long
// before it; a text layout's copies, or a few aliases copied a handful of times each, stay far below it
const MAX_UNION_SOURCES = 64;

// SequenceExpression collect mode: push side-effect preceding elements into `effects` for
// the caller to re-attach via a SequenceExpression wrap around the polyfill replacement.
// the deliberate counterpart of the plain `unwrapParens` (helpers/ast-patterns.js), which peels
// parens only: merging the two would hand peeled effects to callers with nowhere to re-attach them
export function unwrapParensCollectingEffects(node, effects, keeps = null) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      for (const e of node.expressions.slice(0, -1)) if (mayHaveSideEffects(e) || keeps?.(e)) effects.push(e);
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

// instance-dispatch receiver peel: when the polyfill emit memoizes `path.node.object`
// into `_ref = X` AND prepends sideEffects (collected upstream by `unwrapParensCollectingEffects`),
// the SE preceding-elements would otherwise run TWICE - once in the assign, once in the
// prepended SE. peeling the AST receiver to the SE tail aligns it with what `obj` was at
// meta-build time so memoize captures only the unwrapped tail. shared between babel-compat's
// `replaceInstanceLike` (mutates path.node.object before extractCheck) and the unplugin's
// instance channel (peeled node into its receiver resolution). idempotent for non-
// SE / non-wrapped receivers
export function peelReceiverSequenceTail(node) {
  while (node && (isTransparentWrapper(node)
    || (node.type === 'SequenceExpression' && node.expressions?.length))) {
    node = node.type === 'SequenceExpression' ? node.expressions.at(-1) : node.expression;
  }
  return node;
}

// the same peel, reported as the KEYS it walked: a caller that RENDERS over the peeled value has to
// land in the slot the peel ended in, or the wrappers and sequence prefixes standing above it are
// replaced along with the tail (a dropped `eff()`, a dropped cast the source wrote). empty list =
// nothing was peeled, and the whole value slot is the landing. the two walks must not drift, which
// is why this reports the SAME loop rather than re-deriving the wrapper set
export function receiverSequenceTailKeys(node) {
  const keys = [];
  for (let cur = node; cur && (isTransparentWrapper(cur)
    || (cur.type === 'SequenceExpression' && cur.expressions?.length));) {
    if (cur.type === 'SequenceExpression') {
      keys.push('expressions', cur.expressions.length - 1);
      cur = cur.expressions.at(-1);
    } else {
      keys.push('expression');
      cur = cur.expression;
    }
  }
  return keys;
}

// the spelling a receiver runs as where the tail of that peel is a `||` / `??` the build decides for its
// left (`left`, which the member and destructure metas record as `decidedReceiver`): the same spine
// re-spelled shallowly with that tail replaced by the left, so wrappers and effect prefixes stand where
// the source has them and every question over the spelling answers as for the left spelled alone. the
// receiver itself where no left is handed or the tail is no such selection
export function decidedReceiverSpelling(node, left) {
  if (!left) return node;
  function respelled(current) {
    if (isTransparentWrapper(current)) {
      const inner = respelled(current.expression);
      return inner && { ...current, expression: inner };
    }
    if (current?.type === 'SequenceExpression' && current.expressions?.length) {
      const tail = respelled(current.expressions.at(-1));
      return tail && { ...current, expressions: [...current.expressions.slice(0, -1), tail] };
    }
    return current?.type === 'LogicalExpression' && current.operator !== '&&' ? left : null;
  }
  return respelled(node) ?? node;
}

// Collect the effectful sequence prefixes of the navigation's source objects. The shared
// decision owns retained-source filtering; no rendered spans or emitter-specific peel enter
// this walk. Nested sequences stay with their source expression and are replayed only once.
function navHopSequencePrefixes(inner, ctx) {
  const all = [];
  for (let cur = unwrapRuntimeExpr(inner); cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object))) {
    const obj = unwrapRuntimeExpr(cur.object);
    if (obj?.type === 'SequenceExpression') all.push(...sequencePrefixWithSideEffects(obj, ctx) ?? []);
  }
  return all;
}

// meta `sideEffects` carry the receiver-SE first then the computed-key SE (source order); the split
// point is `meta.receiverEffectCount`, RECORDED at build time (the resolver's full receiver collection -
// parens/sequence + chain-collapse + inline-call root). a recompute off the receiver node undercounted
// member-chain / inline-call receivers to 0, dropping the leading receiver-SE in the swaps below

// `suppress` mode (optional receiver) keeps the whole receiver in the null-guard memoize
// (`_ref = recv`), where its side effects already run, and folds only the trailing computed-key SE
// into the guard's alternate - so drop the leading receiver-SE slice (returns the whole list when
// the receiver contributed none, i.e. every effect is key-SE)
export function keySideEffectsOnly(receiverEffectCount, sideEffects) {
  if (!sideEffects?.length) return sideEffects;
  return sideEffects.slice(receiverEffectCount ?? 0);
}

// inverse of keySideEffectsOnly: keep ONLY the leading receiver-SE, drop the trailing computed-key
// SE. a static-FALLBACK receiver-only swap (member name not a known static) replaces just the object
// slot and leaves the computed `[key]` property in place, so the key-SE re-runs there - prepending
// it to the receiver replacement too would double-evaluate it. returns [] when the receiver had none,
// INCLUDING when the producer left the split point unrecorded: an absent count means "no receiver-SE",
// and a bare `slice(0, undefined)` would instead hand back the whole list (every key-SE double-run)
export function receiverSideEffectsOnly(receiverEffectCount, sideEffects) {
  if (!sideEffects?.length) return sideEffects;
  return sideEffects.slice(0, receiverEffectCount ?? 0);
}

// the effects a memo does NOT own: those starting at or after `offset`, the end of the span the
// guard already ran once. the two consumers ask it of different lists - one of the receiver slice,
// one of the whole meta list - so the slicing stays with them and only the boundary question is
// shared. written out at both sites, it was the one SE decision with no name and no single place
function sideEffectsPastOffset(offset, sideEffects) {
  if (!sideEffects?.length || typeof offset !== 'number') return [];
  return sideEffects.filter(effect => effect.start >= offset);
}

// fixpoint of the chain-root peel pair - transparent wrappers + sequence tails
// (`peelReceiverSequenceTail`) alternated with chain-assignments (`peelChainAssignmentDeep`) - so a
// root buried under interleaved layers (`(a = (c++, globalThis))` as well as `(c++, a = globalThis)`)
// resolves regardless of nesting order. needed because `peelChainAssignmentDeep`'s own RHS walk uses
// the SE-BAILING sequence peel (its detection callers may drop the peeled wrapper, so a buried effect
// must stop them), while the chain-root walk only CLASSIFIES - the source text stays in place and the
// emit side keeps or harvests the assignment whole, effects included. a single alternation is NOT
// enough: the assign peel stops at a SE-bearing sequence inside its RHS, so the sequence peel must
// re-run after every assign peel until the node stops changing
export function peelChainRootValue(node) {
  let cur = peelReceiverSequenceTail(node);
  for (;;) {
    const next = peelReceiverSequenceTail(peelChainAssignmentDeep(cur));
    if (next === cur) return cur;
    cur = next;
  }
}

// walk a receiver MemberExpression chain peeling chain-assigns at each `.object` hop.
// returns array of outermost AssignmentExpression nodes encountered, in source order.
// shared between top-level (`(a = Array).from(x)`) and mid-chain (`((a = globalThis)
// .Array).from(x)`) cases - top-level walks one iteration; mid-chain walks down through
// the .object levels until a non-member root surfaces. SE-prefix wrapping the chain-assign
// (`(prefix(), (a = Array)).from(x)`) is peeled to the tail at each hop - prefix effects
// are captured separately upstream by `unwrapParensCollectingEffects` in `buildMemberMeta`.
// A root drive that cannot consume an effectful sequence asks only inside that boundary.
export function collectChainAssignsThroughMemberChain(receiverNode, { throughEffects = true } = {}) {
  const collected = [];
  const peel = throughEffects ? peelReceiverSequenceTail : unwrapRuntimeExpr;
  let cur = peel(receiverNode);
  while (cur) {
    const { outer } = peelChainAssignment(cur);
    if (outer) {
      // outer AE's runtime evaluation covers any nested chain-assigns in its RHS, so
      // returning here keeps each AE in the emitted prelude exactly once - descending
      // through `.object` after collecting `outer` would re-surface the inner AE and
      // double-evaluate its side-effecting initializer
      collected.push(outer);
      return collected;
    }
    if (cur?.type !== 'MemberExpression' && cur?.type !== 'OptionalMemberExpression') break;
    cur = peel(cur.object);
  }
  return collected;
}

// splice chain-assignment receivers into the side-effect prelude for static-method dispatch:
// `(a = Array).from(x)` -> emit `(a = Array, _Array$from)(x)`. mid-chain shapes like
// `((a = globalThis).Array).from(x)` also surface their assignments to the SE channel.
// the chain-assign IS a receiver effect, so per ECMA receiver-before-key it must land at the
// receiver/key boundary `insertAt` (`meta.receiverEffectCount`), AFTER any receiver-sequence
// prefix but BEFORE the computed-key SE: `(prefix(), (a = Array))[(eff(), 'from')](x)` ->
// `(prefix(), a = Array, eff(), _Array$from)(x)`. `insertAt` omitted appends (callers whose
// `baseEffects` are receiver-only). returns `baseEffects` unchanged when no chain-assign found
export function prependChainAssignmentEffect(receiverNode, baseEffects, insertAt) {
  const collected = collectChainAssignsThroughMemberChain(receiverNode);
  if (!collected.length) return baseEffects;
  if (!baseEffects?.length) return collected;
  const at = insertAt ?? baseEffects.length;
  return [...baseEffects.slice(0, at), ...collected, ...baseEffects.slice(at)];
}

// the objects guarded by the node's OWN live `?.` hops (seal-aware, the
// `ownChainOptionalCount` walk): a `?.` inside a PARENTHESIZED sub-chain guards only the
// sealed value - a plain read above the seal observes it (throw semantics), so those
// optionals are not the outer chain's to count
export function ownChainOptionalObjects(node) {
  const objects = [];
  // the START node's own parens are the value's own skin, not a seal it hides behind - the flag
  // spelling says so with the `cur !== node` exemption below, and the NODE spelling has to peel
  // them to say the same. left unpeeled, `(nav?.hop)` reported no optionals at all and its
  // consumers read the value as never short-circuiting
  // `ChainExpression` comes off with them: estree marks the chain with a node babel does not
  // spell at all, and it is the very short-circuit being counted, so entering it is the point
  const start = peelMemoizeWrappers(node);
  for (let cur = start, depth = 0; cur && depth++ <= MAX_KEY_DEPTH;) {
    if (cur !== start && cur.extra?.parenthesized) break;
    if (cur.type === 'TSNonNullExpression') {
      cur = cur.expression;
      continue;
    }
    if (cur.type !== 'MemberExpression' && cur.type !== 'OptionalMemberExpression'
      && cur.type !== 'CallExpression' && cur.type !== 'OptionalCallExpression') break;
    if (cur.optional) objects.push(cur.object ?? cur.callee);
    cur = cur.object ?? cur.callee;
  }
  return objects;
}

// guarding a value that navigates an unponyfilled proxy hop (`globalThis.window`) is NOT erasable:
// the guard rides on that navigation, so dropping it runs the static where the source short-circuits.
// returns what the emit needs:
//   { kind: 'erase' }         - no `?.` guards an undefinable value; the navigation only names the
//                               global the substituted import already is, so drop it
//   { kind: 'guard', object } - exactly one `?.` guards an undefinable value; re-hang the claim
//                               inside `null == object ? void 0 : <claim>`, short-circuit intact
//   { kind: 'standdown' }     - two or more; a single test cannot express the union of short-circuit
//                               points, so keep the raw chain (exactly what the source meant)
// `object` is that hop's OBJECT (`globalThis.window?.self.X` -> `globalThis.window`), NOT the descended
// root - a mid-chain `?.` guards a hop the always-defined root does not, and checking only the root let
// the swap eat the guard. callers pass the CONSUMING member itself (not its `.object`) so the full
// descent sees a leaf-hop's own `?.`
// hop walk for the guard-source count: collect each member hop's resolved key name down to
// the chain root. a COMPUTED hop resolves through the canonical key resolver - a const-bound
// string names its hop like the dotted spelling; an SE-prefixed key still RESOLVES for the
// count (the effect rides the kept test text; only a genuinely opaque key is a source of its
// own). value-transparent wrapper layers peel between hops (`nav!.x` - erasure keeps the
// chain); a SEALED (parenthesized) layer ends the walk - the sealed value is its own chain
// and stays with the unproven arm, exactly as an opaque root does
// the deepest hop a value's own walk calls a source of undefined - its NAME (the dedupe key) and its
// NODE (the value a guard tests), or null when the walk proves nothing (an opaque root, another seal).
// the sealed-source arm reads both: an optional over a sealed value keys by the same probe the sealed
// value keys by, and TESTS that probe rather than the sealed read - a test on the sealed read spells a
// REALM lookup (`_self.Promise`), which answers `void 0` in a stripped realm where the ponyfill is the
// whole point
function deepestUnresolvableHopSource(value, aliasCtx, resolvePure) {
  const { hopsInfo, root, sealedAt } = walkGuardSourceHops(value, aliasCtx, resolvePure);
  if (sealedAt || root?.type !== 'Identifier') return null;
  const rootName = bareProxyGlobalAliasName(root, aliasCtx);
  if (!rootName) return null;
  let found = null;
  for (const hop of hopsInfo) {
    if (!hop.name || (POSSIBLE_GLOBAL_OBJECTS.has(hop.name) && !resolvePure({ kind: 'global', name: hop.name }))) {
      found = { name: hop.name ?? '<opaque>', node: hop.node };
    }
  }
  // the ROOT answers the same entry-existence gate as every hop, and it is the deepest point of
  // all: an entry-less probe name (`window` / `global`) - bare or held through an alias
  // (`const { window: W } = globalThis`) - is a source of undefined ITSELF. proving such a root
  // "a bare proxy global" and judging only the hops above it erased the guard the source's own
  // `?.` asked for, while the nav spelling of the same value kept it
  // (`navHasUnresolvableProxyHop` is the canon both spellings follow)
  if (POSSIBLE_GLOBAL_OBJECTS.has(rootName) && !resolvePure({ kind: 'global', name: rootName })) {
    found = { name: rootName, node: root };
  }
  return found;
}

function walkGuardSourceHops(value, aliasCtx, resolvePure) {
  const hopsInfo = [];
  // the SE-prefix a sequence carries is not part of the value, so the walk steps through it exactly
  // as the value canons do - else a sequence-rooted nav reaches the end unproven, and every `?.` over
  // it counts as its own source of undefined (two of them stand the claim down and leave it native)
  let root = peelReceiverSequenceTail(value);
  let depth = 0;
  let sealedAt = null;
  let crossedAssign = null;
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    depth++;
    const name = root.computed
      ? resolveKey({
        node: root.property, computed: true, scope: aliasCtx.scope, adapter: aliasCtx.adapter,
        seen: new Set(), path: aliasCtx.path,
      })
      : memberKeyName(root);
    hopsInfo.push({ node: root, name });
    const rawNext = root.object;
    const next = unwrapRuntimeExpr(rawNext);
    // a SEAL over a SHORT-CIRCUIT stops the descent: what lies under it is the sealed value's own
    // business. asked of the shared predicate ALONE - gating it on `next !== rawNext` first answered
    // only for the spelling that makes parens a NODE, so babel's default parser (which records them
    // as a flag on the node itself) walked past the seal and named a deeper hop as the guarded
    // object. one source, two guard shapes, and the two emitters disagreed on whether the read still
    // throws. a seal over a PLAIN nav stops nothing: the value canon says such a nav IS the proxy
    // global, so the walk continues into it and the chain erases like its unsealed twin
    if (sealedLayerBetween(rawNext, next) && navValueCanShortCircuit(next, resolvePure, aliasCtx)) {
      // the source is the sealed VALUE as the source spells it - this member INCLUDING the read it
      // performs off the sealed object. naming the sealed object alone drops that read, and a guard
      // built on it answers where the source throws
      sealedAt = root;
      root = rawNext;
      break;
    }
    root = peelReceiverSequenceTail(next);
    // Walk the stored value through all carriers, retaining the write's position. A
    // probe inside the write tests the whole store; one above it keeps its own source.
    // A backed stored surface is still the root of the environment probe above it.
    const stored = peelChainAssignment(root);
    if (stored.outer) {
      crossedAssign ??= { node: stored.outer, hopsAbove: hopsInfo.length };
      root = peelChainRootValue(stored.value);
    }
  }
  return { hopsInfo, root, depth, sealedAt, crossedAssign };
}

// does the PLAIN read through a seal name a polyfillable global - the claim's own ctor? then it is
// no source of undefined for the guard above it: testing that read asks whether the HOST has the
// ctor, which answers `void 0` on exactly the engines the ponyfill exists for
function sealedReadIsClaimCtor(sealedAt, resolvePure) {
  return !sealedAt.optional && !!resolvePure({ kind: 'global', name: staticMemberKeyName(sealedAt) });
}

// does the SE-key fold have a surviving KEY to migrate the dropped hop's effect into? the harvest
// canon retains ordinary static-leaf effects (`X?.[(c++, 'Array')].from`) in the reached branch,
// which is what lets the own `?.` ride the fold. with a CALL consumer there is no next key: the
// flattened emit then ran the effect and the call on the very branch native short-circuits past
function seKeyFoldHasSurvivingKey(memberNode, aliasCtx) {
  let step = aliasCtx?.path;
  while (step?.node && unwrapRuntimeExpr(step.node) !== memberNode) step = step.parentPath;
  for (let cursor = step, up = step?.parentPath; up?.node; cursor = up, up = up.parentPath) {
    const { node } = up;
    if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') return true;
    // a transparent wrapper is not the consumer - keep climbing through it
    if (unwrapRuntimeExpr(node) !== node && unwrapRuntimeExpr(node) === cursor.node) continue;
    return false;
  }
  return false;
}

// A LIVE `?.` that decides whether a delete happens stays on every emitter: the deleted
// member remains outside the ternary behind its own `?.`. The value under the probe must
// actually be able to short-circuit; a plain read off an absent-able base throws instead,
// so its later optional is dead-by-throw. Seals keep their own throw through the seal canon.
// This asks every root, including names, calls, aliases and kept writes. A proven name root
// never proves the probe hop above it: `delete globalThis.window?.self.chrome` still needs
// the guard that decides whether the delete happens.
export function deleteGuardKeepingHop(node, resolvePure, aliasCtx) {
  // nullish-WITHOUT-throw, composed: the below-value short-circuits, or its LEAF is an
  // unbacked probe read over a proven-defined base (reached, and absent exactly off-env) -
  // a plain read off an absent-able base THROWS instead and its `?.` is dead-by-throw
  function belowCanBeNullish(below) {
    if (navValueCanShortCircuit(below, resolvePure, aliasCtx)) return true;
    // a proven inline call yields what its body navigates, absent exactly when that is the
    // environment probe (`() => globalThis.window`): the `?.` over such a call decides between the
    // delete and a throw the same way one over a probe read does - the call canon's yield question
    if (isCallShape(below)) return !!aliasCtx && callYieldCanBeUndefined(below, aliasCtx, resolvePure);
    // ... and an alias reads what it holds without throwing, so one holding the probe's value
    // (`const w = globalThis.window; delete w?.self.k`) is absent exactly where that probe is
    if (below?.type === 'Identifier') return proxyReceiverValueCanBeUndefined(below, resolvePure, aliasCtx);
    if (below?.type !== 'MemberExpression' && below?.type !== 'OptionalMemberExpression') return false;
    const leaf = memberProxyHopName(below);
    if (!leaf || resolvePure({ kind: 'global', name: leaf })) return false;
    return !proxyReceiverValueCanBeUndefined(unwrapRuntimeExpr(peelReceiverSequenceTail(below.object)),
      resolvePure, aliasCtx);
  }
  for (let cur = unwrapRuntimeExpr(node);
    cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object))) {
    // the below-value is read THROUGH a store standing under the `?.`: a chain-assign hands on what
    // its value navigates (`(d = globalThis.window?.self)?.X` stores the short-circuit's own
    // `undefined`), the same peel the hop walk and the guard count already take. read raw, the
    // question met an AssignmentExpression where it wanted a nav and answered `false` for every store
    const below = peelChainRootValue(cur.object);
    if (cur.optional
      && !chainSealsAShortCircuit(cur.object, resolvePure, aliasCtx)
      && belowCanBeNullish(below)) return cur;
  }
  return null;
}

// A delete folds only the navigation it actually consumes. Native provenance can
// identify a rebuilt span; a lowered test is a read even if it carries that span.
// `mutationPath` names an unplanned run whose pristine hops still need checking.
// `guardNode` is the exact erased extent: the claim, or the consumer's whole run.
// Omitting it asks only ownership; it does not authorize erasing an optional guard.
// A previously proven nav plan supplies pristine hops and needs only its guard.
export function canCollapseDeletedNavigation({
  hosted, loweredGuardTest = false, mutationPath = null, guardNode = null, aliasCtx, resolvePure,
}) {
  return !!hosted && !loweredGuardTest
    && !(mutationPath && deletedRunCarriesMutatedRealmHop(mutationPath,
      { adapter: aliasCtx.adapter, unwrap: unwrapRuntimeExpr }))
    && !(guardNode && deleteGuardKeepingHop(guardNode, resolvePure, aliasCtx));
}

// The delete-guard exception also serves every host that MUTATES through the run. `delete` was its
// first consumer and is one slot of the write-host enumeration; an assignment target, an update, a
// destructuring slot and a for-x head fold the same `?.` for the same reason, and there the fold
// answers no value at all - it performs the write on the ponyfill global in exactly the realms
// where the source throws, where a READ only answers `undefined` (the accepted price). the hop
// comes back so the guard channel can spell the test it owes, and every emitter asks this one
// verdict rather than pairing the write question with the delete canon itself
export function mutationGuardKeepingHop(node, resolvePure, aliasCtx) {
  // the chain END above the run - the canon walk, which steps over a value CARRIER standing at its
  // start, so a store holding the run still reaches the act its value leads to (`delete (w = nav).slot`)
  if (!aliasCtx?.path
    || !isMemberWriteHost(memberChainEndPath({ path: aliasCtx.path, unwrap: unwrapRuntimeExpr }))) return null;
  const hop = deleteGuardKeepingHop(node, resolvePure, aliasCtx);
  // ... and only where the VALUE canon does not already see that branch: a probe it calls
  // absent-able earns its guard through the ordinary channels, which keep the read the source wrote
  // around it. what is left is exactly the fork between the two - a probe read off a span pure
  // lands ALWAYS-DEFINED (`globalThis.self.window`), where only a READ can take `undefined` for an
  // answer the source throws on. asked of the value the `?.` TESTS, a store below it peeled the way
  // the exception's own walk peels it - read raw, an opaque write answered "defined" for both
  if (!hop) return null;
  const below = unwrapRuntimeExpr(peelChainAssignment(peelReceiverSequenceTail(hop.object)).value ?? hop.object);
  // the value under the `?.` has to BE a realm span this build can name, hop for hop: a user slot
  // in it holds the user's own object, and the value canon - which models realm hops alone - answers
  // "defined" for it by saying nothing at all
  // This proof keeps the guarded run rather than dropping its keys, so effectful spellings
  // name the same realm hops here. Their effects remain with the original guarded read.
  if (maximalProxyGlobalPrefix(below, aliasCtx, { throughChainAssign: true, allowSideEffectKeys: true }) !== below) return null;
  return proxyReceiverValueCanBeUndefined(below, resolvePure, aliasCtx) ? null : hop;
}

// eslint-disable-next-line max-statements -- sequential guard-verdict steps of one chain
export function undefinableOptionalGuard(memberNode, resolvePure, aliasCtx = null) {
  if (!memberNode || !resolvePure) return { kind: 'erase' };
  // the deleted member is never READ, so nothing over the navigation below it is load-bearing and the
  // whole thing erases. asked HERE because every channel that builds a guard asks this verdict - spelled
  // at the call sites instead, the two emitters answered the same source differently per claim kind. an
  // ALREADY-LOWERED input carries no `?.` for this to reach, and the pre / post legs then answer
  // differently - the second-pass class the area's AGENTS.md records
  // ... except the delete-DECIDING guard itself (`deleteGuardKeepingHop`): that `?.` stays,
  // so the verdict falls through to the guard flavors below
  if (aliasCtx?.path && canCollapseDeletedNavigation({
    hosted: deleteHostAboveChain(aliasCtx.path, memberNode, unwrapRuntimeExpr),
    guardNode: memberNode, resolvePure, aliasCtx,
  })) return { kind: 'erase' };
  const objects = ownChainOptionalObjects(memberNode);
  // the member's OWN live `?.` counts only when its key is SE-free: an SE-computed key rides the
  // fold's harvest canon (the key-SE migration IS the locked emit), while an SE-free leaf claim has
  // no compensating canon - eating its guard loses the short-circuit. exclude its guarded object
  const ownSEKeyOptional = (memberNode.type === 'MemberExpression' || memberNode.type === 'OptionalMemberExpression')
    && memberNode.optional && memberNode.computed && memberKeyName(memberNode) === null
    // a binding-resolvable SE-free key (`const k = 'self'; chain?.[k]`) is the dotted form in
    // disguise - only a genuinely SE-carrying / opaque key rides the harvest canon
    && !(aliasCtx && resolveKey({
      node: memberNode.property, computed: true, scope: aliasCtx.scope, adapter: aliasCtx.adapter,
      seen: new Set(), path: aliasCtx.path, bailOnSideEffectKey: true,
    }))
    && seKeyFoldHasSurvivingKey(memberNode, aliasCtx);
  const undefinable = [];
  const provenSources = new Map();
  // the same per-SOURCE dedupe for the objects the hop walk proves nothing about: an alias of a
  // nav is no realm root, so its chain reaches the value canon below instead of the counted arm
  const valueSources = new Map();
  // objects of one chain share the root - prove the inline call once per verdict
  const provenRootCache = new Map();
  for (const obj of objects) {
    // the own SE-key `?.` guard is the FOLD's to re-emit (harvest canon), so its object stays
    // out of the count - EXCEPT when its undefinedness flows from a live OPTIONAL hop of a
    // proven-call chain (`f()?.window?.[(se, 'self')]`): dropping that object collapsed the
    // chain to the bare ponyfill, running the key SE and the branch where native short-circuits
    const ownKey = ownSEKeyOptional && obj === memberNode.object;
    // dig through an SE-bearing sequence around the assignment first (the assign-only peel
    // refuses the wrapper): the wrapped twin holds the same undefinable value as the bare
    // spelling, and the verdict must not flip on the wrapper
    const { value, outer: objAssign } = peelChainAssignment(peelReceiverSequenceTail(obj));
    // a chain rooted in an opaque CALL that provably yields a proxy-global (the inline canon
    // admits only effect-transparent returns) is undefinable ONLY through its own unresolvable
    // hops - the call is always defined and contributes no source of undefined. objects sharing
    // the same outermost unresolvable hop dedupe onto the SHORTEST of them, so both hop orders
    // of `dw()?.window?.self` guard as ONE test on the window hop (the rendered shape)
    if (aliasCtx) {
      const { hopsInfo, root: walkedRoot, depth, sealedAt, crossedAssign } = walkGuardSourceHops(value, aliasCtx, resolvePure);
      let root = walkedRoot;
      // a chain-assign wrapper at the bottom peels for the proof - the write is an emit concern, and
      // so is the sequence PREFIX the store holds inside its value: what the store hands on is that
      // sequence's tail (`(w = (e++, globalThis)).self` proves exactly like its prefix-less twin).
      // read raw, the proof found a SequenceExpression where it wanted a root, called a proven realm
      // run undefinable, and the guard it kept then spelled that run RAW off the ponyfill
      if (root) root = peelReceiverSequenceTail(peelChainAssignment(root).value);
      let proven = provenRootCache.get(root);
      if (proven === undefined && (root?.type === 'CallExpression' || root?.type === 'OptionalCallExpression')) {
        proven = inlineCallProxyGlobalRoot({ callNode: root, ...aliasCtx }) ? 'call' : false;
        provenRootCache.set(root, proven);
      } else if (proven === undefined && root?.type === 'Identifier') {
        // an identifier chain root proves DIRECTLY as a proxy-global - literal (`globalThis
        // .window?.self.window`) or an alias of the BARE global (`const g = globalThis;
        // g.window?...`). an alias of a NAVIGATION (`const w2 = globalThis.window`) stays
        // unproven - its value is exactly the undefinable thing the guard exists for
        proven = bareProxyGlobalAliasName(root, aliasCtx) ? 'ident' : false;
        provenRootCache.set(root, proven);
      }
      // a walk that stopped at a SEAL has no provable root - what lies under the seal is the sealed
      // value's own business - but the sealed VALUE is itself one source of undefined, and every
      // optional above it takes its undefinedness from THAT. counted per source like the named hops,
      // they dedupe onto the shortest instead of each standing the whole claim down (two `?.` over
      // one sealed nav kept a polyfillable claim raw, which is never the safe answer)
      // a CHAIN-ASSIGN under the seal used to be excluded here: the throw probe owned the test for
      // it. that probe now fires only for a PLAIN consumer - the read it reproduces - so an OPTIONAL
      // one has no other channel, and excluding it erased the guard the source wrote (`((w = gw)?.self)
      // ?.Promise.resolve(1)` answered a Promise where native short-circuits to undefined)
      // a PLAIN read through the seal whose key IS a polyfillable global contributes NO source:
      // `(gw.window?.self).Symbol?.iterator` reads the ctor the polyfill replaces, and a guard keyed
      // on that read tests whether the HOST has `Symbol` - answering `void 0` on exactly the engines
      // the ponyfill exists for, where the unsealed twin answers the ponyfill. the `?.` above it is
      // the claim's (its leaf is always defined), and the read rides as the throw probe - the shape
      // the PLAIN-claim twin of the same source already spells
      if (sealedAt && !objAssign && sealedReadIsClaimCtor(sealedAt, resolvePure)) continue;
      const sealedSource = sealedAt && !objAssign ? sealedAt : null;
      if (proven || sealedSource) {
        // the hop-level source criterion depends on the ROOT proof: an opaque-but-proven CALL
        // may yield a global whose non-POSSIBLE members are still target-dependent (`f()?.
        // chrome`), so ANY unresolvable name counts. a proxy-global IDENTIFIER root keeps the
        // prior nav canon - only a POSSIBLE forwarder without a ponyfill is a source
        // (`globalThis?.Array` stays erasable; `globalThis.window` guards)
        let source = sealedSource;
        // the seal does not CREATE undefinedness - it only makes the read above it observable. so a
        // sealed source keys by the source its own value has (`(globalThis.window?.self)?.Array?.of`
        // - both optionals take their undefinedness from the same `window` probe): keyed by the seal
        // NODE instead, the two counted as separate sources, stood the claim down and shipped a
        // native static, which is the one answer usage-pure may never give
        // ... and only for an OPTIONAL consumer of the sealed value, which performs no read. a PLAIN
        // one reads it (`(gw.window?.self).Symbol?.iterator` throws off-window), so the read ITSELF is
        // what the guard above must test - re-keyed onto the inner probe the test answered `void 0`
        // where the source throws, and the same source spelled with a static CALL tail kept the throw
        const sealedInner = sealedSource && sealedAt.optional
          ? deepestUnresolvableHopSource(unwrapRuntimeExpr(sealedAt.object), aliasCtx, resolvePure) : null;
        if (sealedInner) source = sealedInner.node;
        const sourceNames = new Set(sealedSource ? [sealedInner?.name ?? sealedSource] : []);
        for (const hop of hopsInfo) {
          const { name } = hop;
          // the strict criterion (ANY unresolvable name) belongs to an opaque CALL root, whose
          // members are target-dependent. a nav under a SEAL is a proxy navigation like the ident
          // case - only a POSSIBLE forwarder without a ponyfill is a source there, or a claim's own
          // constructor name (`?.Array`) reads as a second source and stands the whole claim down
          const unresolvable = proven === 'ident' || sealedSource
            ? !name || (POSSIBLE_GLOBAL_OBJECTS.has(name) && !resolvePure({ kind: 'global', name }))
            : !name || !resolvePure({ kind: 'global', name });
          if (unresolvable) {
            // keep the DEEPEST unresolvable hop (hopsInfo runs leaf -> root): its prefix is
            // the shortest expression carrying the source of undefined - the guard tests THAT
            // value (`null == _globalThis.window`), not the whole navigation above it
            source = hop.node;
            sourceNames.add(name ?? '<opaque>');
          }
        }
        // the ROOT answers the same entry-existence gate as every hop (the deepest-source canon's
        // own rule): a bare probe name proves WHICH realm the run reads, not that the read is
        // defined - `window?.self.X` takes its undefinedness from `window` itself, and the guard
        // tests that root. without it the proven root counted as no source, the `?.` over it
        // erased, and the collapse read the ponyfill where the source short-circuits
        if (proven === 'ident' && proxyHopLacksPureEntry(bareProxyGlobalAliasName(root, aliasCtx), resolvePure)) {
          source ??= root;
          sourceNames.add(bareProxyGlobalAliasName(root, aliasCtx));
        }
        // a PROVEN call has no hops of its own for the walk to name, so when its VALUE can still be
        // absent (`() => globalThis.window` yields the probe) the call itself is the source - the
        // `?.` above it is the only guard, and erasing it read the collapse off `undefined`.
        // it keys by WHAT makes it undefinable, not by the call: the hop above it usually reads the
        // same probe (`(() => globalThis.window?.self)()?.window`), and two names there stand the
        // whole claim down - raw output with a bare `globalThis` in it
        // a PROVEN-defined OPTIONAL call link is not this source: its `?.` is a chain link the
        // guard renders together with the hops above it (one test on the whole prefix covers
        // both), and counting it separately stood the claim down and left the nav raw off the
        // ponyfill. but a link whose YIELD can be absent - a conditionally-proven callee, an
        // undefinable returned nav - is exactly the source the `?.` above it guards, so the arm
        // asks the yield question, not the optional-link print rule
        // ... and only while nothing READS the call value plainly on the way up: `(call).self.X?.y`
        // throws at `.self` off-window before the `?.` is reached, so that guard is not this source
        if (!source && proven === 'call'
          && (hopsInfo.length === 0 || hopsInfo.at(-1).node.optional)
          && callYieldCanBeUndefined(root, aliasCtx, resolvePure)) {
          source = root;
          sourceNames.add(callSourceName(root, aliasCtx, resolvePure));
        }
        // the object's VALUE must genuinely be undefinable (the shared canon): a dead `?.`
        // over a declared all-plain nav / a pony-backed read is not a source, however its
        // hop names look (babel reaches the same verdict on its post-deopt tree).
        // a CHAIN-ASSIGN object observes the stored VALUE, just as an alias does: a terminal
        // probe stays absent-able, while a plain middle hop collapses onto its backed leaf.
        // a CALL object answers the call
        // canon's yield question (the nav canon owns only nav/Identifier cores) - a
        // conditionally-proven callee's yield is absent-able even though the alias walk keeps
        // its stricter proof for the deopt renders
        if (!(source && (!ownKey || source.optional)
          && (sealedSource || objAssign ? undefinableProxyRootValue(value, resolvePure, aliasCtx)
            : isCallShape(value) ? callYieldCanBeUndefined(value, aliasCtx, resolvePure)
            : proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx, { throughChainAssign: !!crossedAssign })))) {
          continue;
        }
        // objects sharing ONE unresolvable NAME dedupe onto the structurally SHORTEST of them
        // (depth, not text span - destructure claims arrive on position-less clones): under the
        // realm-self-reference assumption a repeated hop name reads the same value, so one test
        // covers both (`globalThis.window?.self.window`). a SECOND distinct name (`?.chrome`
        // past the ponyfillable hop) is its own source and keeps the stand-down count
        if (sourceNames.size > 1) {
          undefinable.push(obj);
          continue;
        }
        const [key] = sourceNames;
        const prior = provenSources.get(key);
        // the GUARD OBJECT is the source prefix itself (the deepest undefinable value), not
        // the whole navigation - one test on it covers every object sharing the name. a
        // CHAIN-ASSIGN object keeps its wrapper whole: the write is observable and rides the
        // kept test (`_ref = w = _globalThis.window` - the locked kept-swap canon)
        // a source reached THROUGH a write is guarded by the write itself: it evaluates to the same
        // value and keeps the store the source performs (`null == (w = _globalThis.window)`)
        // the write guards what it WRAPS: a source found below it is spelled through the write, so the
        // test keeps the store (`null == (w = _globalThis.window)`); one above keeps its own node
        // An unsubstituted root leaves the probe raw: its whole read, including key effects,
        // must stay in the test instead of being shortened to the symbolic source below it.
        const guardObj = objAssign || !realmRootIsSpellable(value, resolvePure) ? obj
          : crossedAssign && hopsInfo.findIndex(hop => hop.node === source) >= crossedAssign.hopsAbove
            ? crossedAssign.node : source;
        if (!prior || depth < prior.depth) provenSources.set(key, { obj: guardObj, depth });
        continue;
      }
    }
    if (ownKey) continue;
    // the object's OWN value, or - where the optional census stopped at a seal, a store or a
    // sequence - the read a live `?.` behind that stop short-circuits on. the census walks no
    // further than the stop, so such a `?.` is a source it never counted and the guard erased over
    // a value that vanishes (`(a?.Array)?.from` ran the static where the source short-circuits).
    // keyed per SOURCE like the counted arm: a nav and the chain link above it are one guard, not
    // a stand-down pair, and a write guards what it wraps
    // A live chain and its root share one source even when the value canon already knows
    // the whole chain can vanish. Key it by that source before the opaque-value fallback;
    // counting both nodes would stand down a claim guarded by only one environment probe.
    const shortCircuit = navShortCircuitSource(value, resolvePure, aliasCtx);
    if (shortCircuit) {
      valueSources.set(objAssign ?? shortCircuit, objAssign ?? shortCircuit);
    } else if (undefinableProxyRootValue(value, resolvePure, aliasCtx)) {
      valueSources.set(obj, obj);
    }
  }
  for (const object of valueSources.values()) undefinable.push(object);
  // a guard for any DEEPER source spells the whole prefix - the root call's own `?.()` link
  // included - so the call's undefinedness rides that same test: the opaque call key stands as
  // a source only while nothing deeper guards the chain
  if (provenSources.size > 1) provenSources.delete('<call>');
  for (const entry of provenSources.values()) undefinable.push(entry.obj);
  if (undefinable.length === 0) {
    // ... and where every flavor above answered ERASE, the DECIDING hop of a mutating consumer still
    // stands: those flavors weigh a VALUE, and the accepted answer for a probe there is `undefined`
    // where the source throws - an answer only a READ can take, while a write or a delete performs
    // its act on the ponyfill global instead of taking the branch the source wrote
    const decidingHop = mutationGuardKeepingHop(memberNode, resolvePure, aliasCtx);
    return decidingHop ? { kind: 'guard', object: decidingHop.object } : { kind: 'erase' };
  }
  if (undefinable.length > 1) return { kind: 'standdown' };
  return { kind: 'guard', object: undefinable[0] };
}

// may a STATIC substitution ERASE its receiver navigation? the INSTANCE / optional-chain callers
// pass the SPECIFIC `?.` node and re-hang the guard on its own object, so the root-descended check
// here is exactly what they need; the static-call sites instead route through `undefinableOptionalGuard`
// which resolves WHICH `?.` guards the undefinable value (a multi-hop chain has more than one). the
// two must not be merged: changing this verdict would break the instance path's own guard emit
export function staticMayEraseReceiver(memberNode, resolvePure, aliasCtx = null) {
  if (!memberNode || !resolvePure) return true;
  const { root, optionalCount } = descendToChainRoot(memberNode);
  // the member's OWN live `?.` joins the count only when its key is SE-free: an SE-computed
  // key rides the fold's harvest canon (the key-SE migration IS the locked emit), while an
  // SE-free leaf claim has no compensating canon - eating its guard loses the short-circuit
  let effectiveCount = optionalCount;
  if ((memberNode.type === 'MemberExpression' || memberNode.type === 'OptionalMemberExpression')
    && memberNode.optional && memberNode.computed
    && memberKeyName(memberNode) === null) effectiveCount -= 1;
  if (!effectiveCount) return true;
  // the SE-keeping chain-root peel: an SE-bearing sequence around the assignment (`((se(),
  // g = nav))?.X`) holds the same undefinable value as the bare spelling - the assign-only
  // peel refused the wrapper and the verdict flipped to erase on the wrapped twin
  return !undefinableProxyRootValue(peelChainRootValue(root), resolvePure, aliasCtx);
}

// evaluation of a claim RECEIVER may itself throw: its own member get reads off a
// nullish-able base (an undefinable probe nav, a guard-shaped alias). a migrated
// computed-key SE must then ride BEHIND a receiver memo - ECMA receiver-before-key: native
// evaluates the receiver, and its throw, before the key. a bare identifier / call /
// conditional VALUE evaluates without a get (native runs the key SE before ITS get throws),
// and an optional base short-circuits instead of throwing - both keep the plain SE prepend
export function claimReceiverEvaluationMayThrow(receiverObj, resolvePure, aliasCtx = null) {
  const core = unwrapRuntimeExpr(peelReceiverSequenceTail(receiverObj));
  if (core?.type !== 'MemberExpression' && core?.type !== 'OptionalMemberExpression') return false;
  if (core.optional) return false;
  // a chain-assign object holds what it STORES, and that value is what the read dereferences
  // (`(w = globalThis.window).self` throws off-window): asked of the assignment NODE the value
  // canon calls an undefinable probe root defined, which is the answer for the VALUE, not the read
  const object = unwrapRuntimeExpr(core.object);
  return proxyReceiverValueCanBeUndefined(unwrapRuntimeExpr(peelChainAssignment(object).value ?? object),
    resolvePure, aliasCtx);
}

// the one question every guard-keep decision asks about a chain root's VALUE: can it
// genuinely be undefined on-target? true for a nav through an unponyfilled proxy hop
// (`globalThis.window`) and for an ALIAS of one (`const w = globalThis.window` - the binding
// hides the same navigation; the POSSIBLE gate keeps non-proxy resolutions - a follow that
// lands on a plain local - out of the refusal); false for resolvable navs and other values
export function undefinableProxyRootValue(value, resolvePure, aliasCtx = null) {
  while (true) {
    // the stored VALUE owns this answer: a terminal probe can be absent, a plain middle
    // hop collapses with its backed leaf, and only a source optional can short-circuit it.
    // following an alias reaches the same nav here as spelling it inside an assignment.
    value = unwrapRuntimeExpr(peelReceiverSequenceTail(value));
    if (isMemberAccessNode(value)) {
      return proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx, { observableRead: true });
    }
    // a PROVEN inline call yields what its body navigates, and that is not the same as yielding a
    // DEFINED value: a body reaching the environment probe (`() => globalThis.window`) is undefined
    // off-window, so a `?.` over the call is load-bearing - erased, the collapse read the ponyfill
    // where the source short-circuits. the proof stays STRICT here: the deopt renders key their
    // routing on this walk, and widening it to conditional proofs re-rooted their guards (the
    // guard-source arm asks the conditional-yield question itself, through the call canon).
    // an OPAQUE call keeps the older answer (its own canon owns it)
    if (aliasCtx && resolvePure && (value?.type === 'CallExpression' || value?.type === 'OptionalCallExpression')
      && inlineCallProxyGlobalRoot({ callNode: value, ...aliasCtx, rejectConditional: true })
      && callValueCanBeUndefined(value, aliasCtx, resolvePure)) return true;
    // a GUARD-shaped conditional (`test == null ? void 0 : X` - the probe render, or any
    // ternary with a void/undefined arm): the held value can be undefined on the guard branch
    if (value?.type === 'ConditionalExpression'
      && (isUndefinedNode(value.consequent) || isUndefinedNode(value.alternate))) return true;
    if (!aliasCtx || value?.type !== 'Identifier') return false;
    // a realm root the build does not serve can be absent; one it serves is the realm it names, whether pure
    // substitutes it or leaves it raw - excluded, or carried natively by every target with no pure entry
    const aliasName = proxyGlobalRootName({ node: value, ...aliasCtx });
    if (aliasName && POSSIBLE_GLOBAL_OBJECTS.has(aliasName) && !resolvePure({ kind: 'global', name: aliasName })
      && !aliasCtx.adapter?.served?.({ kind: 'global', name: aliasName }, aliasCtx.path)) return true;
    // an alias HOLDING an undefinable nav (`let n; n = globalThis.window?.self.window;
    // n?.X...`) is as undefinable as the nav itself: follow the init or the single write and
    // keep walking. the prefix walks see through the binding to the always-defined global, but
    // the VALUE read at runtime is the nav's - eating the alias guard ran the branch where
    // native short-circuits
    const step = aliasHeldValueStep(value, aliasCtx);
    if (!step) return false;
    ({ value, aliasCtx } = step);
  }
}

// the PROBED value of a flat destructure init, dead `||` / `??` fallbacks dropped: a left
// that can never hand nullish on (a SEALED read THROWS instead of short-circuiting; a defined
// value selects itself) keeps its fallback dead, so the probe question descends to it. a
// genuinely nullish-able left reaches its fallback - the fallback machinery owns that init,
// no probe here. null when the final value cannot be undefined (nothing to probe). `&&` and
// the other init shapes stay with their own channels.
// every question here weighs the VALUE, so a chain-assignment store is transparent: `(v = nav)?.X`
// hands the nav's own value on, and reading the write as opaque called an absent-able init defined
// and dropped the probe the source's `?.` asked for
export function probedDestructureInitValue(initNode, resolvePure, aliasCtx) {
  let value = initNode;
  for (let guard = 0; guard < 8; guard++) {
    const core = unwrapRuntimeExpr(peelReceiverSequenceTail(value));
    if (core?.type !== 'LogicalExpression' || core.operator === '&&') break;
    if (proxyReceiverValueCanBeUndefined(core.left, resolvePure, aliasCtx)
      && !chainSealsAShortCircuit(core.left, resolvePure, aliasCtx)) return null;
    value = core.left;
  }
  return proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx, { throughChainAssign: true }) ? value : null;
}

// the DECISION half of the alias-held claim probe, shared by both emitters' probe channels:
// a PLAIN member read off an ALIAS holding an absent-able value (`const a = globalThis
// .window?.Array; a.of(1)` - native throws reading the key where the erase just runs) is
// re-emitted verbatim as a throw probe. an SE-bearing sequence around the alias peels to the
// tail (the prefix rides the claim's own SE channel; `navStart` at the tail keeps it AHEAD of
// the probe, native order), an optional spelling keeps its guard channel, an SE computed key
// keeps its migration canon. returns `{ object, key, computed, navStart }` for the emitters'
// renders, or null
export function aliasHeldClaimProbe(member, resolvePure, aliasCtx, { allowStoreHolder = false } = {}) {
  // through the wrapper canon: a paren or TS skin on the read is value-transparent, and a seal
  // over a plain run is not load-bearing - the probe answers both spellings like the bare one.
  // a SEQUENCE around the read hands its TAIL on, and that tail is the read: the prefix rides the
  // caller's own effect channel, which `navStart` (at the tail) keeps AHEAD of the probe
  member = unwrapRuntimeExpr(peelReceiverSequenceTail(member));
  if (member?.type !== 'MemberExpression' && member?.type !== 'OptionalMemberExpression') return null;
  if (member.optional) return null;
  const objectRaw = peelReceiverSequenceTail(member.object);
  let object = unwrapRuntimeExpr(objectRaw);
  // dotted PLAIN links may stand between the claim and the alias (`a.Array.of` off
  // `a = globalThis.window`): they are part of the read the swap erases - the first of them
  // dereferences the held value, throwing exactly where the source throws - so the probe
  // respells the whole run. a computed or `?.` link keeps the decline: its key effects and
  // its guard are owned by other routes
  const innerKeys = [];
  while (object?.type === 'MemberExpression' && !object.optional && !object.computed) {
    const innerKey = memberKeyName(object);
    if (innerKey === null) break;
    innerKeys.unshift(innerKey);
    object = unwrapRuntimeExpr(peelReceiverSequenceTail(object.object));
  }
  // an inline kept STORE holds a value the same way a named binding does - the source reads off
  // what it just stored, and off-realm THAT read throws. asked only where the caller DISCARDS the
  // holder (`allowStoreHolder`): a named binding re-reads for free, where re-emitting a store
  // beside a render that already carries it runs the write twice
  // ... and only where the stored VALUE is a plain navigation: the probe re-emits the holder as a
  // CLONE, and a leg whose inserts are not re-visited leaves every claim inside that clone raw - a
  // polyfill silently missing from the output. an effect there is the effect channel's anyway
  const store = allowStoreHolder && object?.type === 'AssignmentExpression' && object.operator === '='
    && !mayHaveSideEffects(object.right) ? object : null;
  if (!store && object?.type !== 'Identifier') return null;
  const key = memberKeyName(member);
  if (key === null) return null;
  if (store ? !proxyReceiverValueCanBeUndefined(store.right, resolvePure, aliasCtx)
    : !aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx)) return null;
  // a read the source already guards against the nullish branch (an enclosing null-test or a
  // truthy `if` on the binding) cannot see the void - no probe is owed there, and the plain
  // erase keeps the guarded branch byte-clean
  if (!store && aliasCtx?.path && aliasReadGuardedAgainstNullish(aliasCtx.path, object.name)) return null;
  return { object, key, computed: member.computed, innerKeys, navStart: objectRaw.start ?? member.object.start ?? null };
}

// the OWE half of the alias-held probe: does the run a swap erases (or re-bases) root at an alias
// BINDING whose held value can be absent? the binding makes the reads observable - native throws
// where an always-defined spelling reads on - so a swap that cannot ride a throw probe
// (`aliasHeldClaimProbe` answers null there: an SE computed key, a bare alias receiver) stands
// down instead, the pure bias: declining only degrades, erasing loses the throw. a `?.` anywhere
// in the run hands the question to the guard routes and answers false
export function aliasRootedReadMayThrow(node, resolvePure, aliasCtx) {
  let cur = unwrapRuntimeExpr(peelReceiverSequenceTail(node));
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    if (cur.optional) return false;
    cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object));
  }
  if (cur?.type !== 'Identifier') return false;
  if (!aliasHeldValueCanBeUndefined(cur, resolvePure, aliasCtx)) return false;
  // the same guarded-read refinement the probe decision takes: a branch the source already
  // gates on the binding cannot see the void, so nothing is owed there
  return !(aliasCtx?.path && aliasReadGuardedAgainstNullish(aliasCtx.path, cur.name));
}

// OUR OWN render, read back: a claim whose probe fired leaves the source's read as a NON-FINAL element
// of a sequence whose tail is the ponyfill binding it resolved to (`(held.of, _Array$of)`). both
// emitters recognise a render inside one pass by its missing source span, but a RE-PARSE gives it a
// real one - and the emitters run over each other's output in the sandwich, so without a shape-level
// check the claim fires again on every pass. the `in` fold spells the same self-recognition for its
// kept test, and declines a hand-written twin the same way: the shape already IS the answer
export function claimAlreadyRendered(node, { scope, adapter, path }) {
  if (!path || path.node !== node) return false;
  const parent = path.parentPath?.node;
  if (parent?.type !== 'SequenceExpression') return false;
  const parts = parent.expressions ?? [];
  const index = parts.indexOf(node);
  if (index === -1 || index === parts.length - 1) return false;
  const tail = parts.at(-1);
  return tail?.type === 'Identifier' && !!adapter?.getBinding?.({ scope, name: tail.name, path, read: tail })?.polyfillHint;
}

// the RECEIVER-position twin: a receiver spelled as our probe sequence (`(held.X, _Ponyfill)
// .member`) already hands the ponyfill on, and a second pass's receiver swap over it would eat
// the throw probe the first pass kept. recognized the way the claim twin above is - the tail is
// a plugin-managed import binding - so the verdict survives a re-parse, and a hand-written twin
// declines the same way: the shape already IS the answer
export function probeRenderedReceiver(objectNode, { scope, adapter, path }) {
  const receiver = unwrapRuntimeExpr(objectNode);
  if (receiver?.type !== 'SequenceExpression') return false;
  const tail = unwrapRuntimeExpr(receiver.expressions.at(-1));
  return tail?.type === 'Identifier' && !!adapter?.getBinding?.({ scope, name: tail.name, path })?.polyfillHint;
}

// the VALUE canon asked THROUGH an Identifier alias: follow the binding to what it holds and
// ask `proxyReceiverValueCanBeUndefined` of THAT. distinct from the hop-based alias walk
// (`undefinableProxyRootValue`): an all-plain held nav stays the declared environment under
// the proxy-collapse assumption, so only a held value the VALUE canon calls absent-able
// counts - the wider hop-based answer belongs to the alias's own `?.`, not to its value
function aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx) {
  if (!aliasCtx) return false;
  let cur = object;
  let ctx = aliasCtx;
  while (cur?.type === 'Identifier') {
    const step = aliasHeldValueStep(cur, ctx);
    if (!step) return false;
    ({ value: cur, aliasCtx: ctx } = step);
  }
  return cur !== object && proxyReceiverValueCanBeUndefined(cur, resolvePure, ctx);
}

// one alias-follow step shared by the undefinability walks: the declarator init or the
// binding's single `=` write, transparently unwrapped, plus the scope the held value's own
// identifiers resolve in (same per-hop advance as the key/global alias walks). null for an
// opaque binding - a param, multiple writes, no init - and for a value the walk already entered:
// one defined through its own binding (`const v = v?.at`, `let v; v = v?.at`) comes back here
// through a fresh `proxyReceiverValueCanBeUndefined` walk, so the entered values ride on the ctx
function aliasHeldValueStep(node, aliasCtx) {
  const binding = aliasCtx.adapter?.getBinding?.({ scope: aliasCtx.scope, name: node.name, path: aliasCtx.path, read: node });
  // pattern-gated: a destructure declarator binds the name to a SLOT, not the init it follows
  let held = binding ? identifierDeclaratorInit(binding) : null;
  if (!held && binding?.constantViolations?.length === 1) {
    const write = unwrapTransparentSeq(binding.constantViolations[0]?.node ?? binding.constantViolations[0]);
    if (write?.type === 'AssignmentExpression' && write.operator === '='
      && write.left?.type === 'Identifier' && write.left.name === node.name) held = write.right;
  }
  if (!held || aliasCtx.enteredValues?.has(held)) return null;
  return {
    value: unwrapTransparentSeq(held),
    aliasCtx: { ...aliasCtx, scope: binding.scope ?? aliasCtx.scope, enteredValues: new Set(aliasCtx.enteredValues).add(held) },
  };
}

// callers pass either a receiver identifier or a FOLDED property key, and a key folds to any
// string at all - `Symbol.iterator`, `'App-Key'`, `` `A.b` ``. an answer here licenses the name
// to be SPELLED as a member tail, so the capitalisation convention must be paired with the
// identifier-validity canon: without it babel aborts the build on `t.identifier`, and unplugin
// splices unparsable text or silently reads a different property
export function isStaticPlacement(name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return 'static';
  if (name[0] >= 'A' && name[0] <= 'Z' && isValidIdentifierName(name)) return 'static';
  return null;
}

// ... and a KEY read off the realm names a built-in only where the realm is known to carry one:
// the convention says nothing about a slot the realm may leave empty, so a user global
// (`{ Deno: { env } = {} } = globalThis`) stays an unknown slot whose default is live - and so does
// a built-in the configured mode does not define (the adapter's `defined`: `AsyncIterator` below
// `full`). neither the targets nor the user's `exclude` are part of it: excluding a constructor only
// stops injecting it
export function isKnownStaticGlobal(name, adapter = null) {
  return isKnownGlobalName(name) && !!isStaticPlacement(name) && adapter?.defined?.({ kind: 'global', name }) !== false;
}

// ... and a realm-key LEVEL (`{ <name>: <inner> }` read off the realm) names that constructor. a static read off it is
// decided by its own entry, never by the constructor's: one the build serves takes its polyfill whatever the
// constructor's entry says and whatever fallback stands beside it (`||`, `??`, a level default), an excluded one reads
// off the constructor's ponyfill as a method it lacks, an unimplemented one stays native with the user's fallback as
// written, and excluding a constructor only stops injecting the constructor itself. a DEFAULT on the level (`= D`) is
// dead text only where the realm SLOT is FILLED wherever this build runs: a global with a pure flavor the data subset
// carries at the mode (`defined`, whatever the targets and the user's filter say - a slot a filter empties is the
// user's to answer for), or one core-js extends in place on every engine's own (`NATIVE_STATIC_OWNERS`), and replaced
// by no write the census sees. a known name core-js implements nothing of (`WeakRef`, `BigInt`, `Float16Array`, whose
// definition lists methods alone) may be missing on a target: the default stays live there for the statics the
// build does not serve (`liveSlotStaticMeta` decides the ones it does). pure still leaves two such defaults native,
// usage-global loading their modules: beside a sibling the build claims (`{ Float16Array: { from } = Array, Map: M }
// = globalThis` - the leaf is classified after the render spelled the realm read into a literal, and a second pass
// mirrors it), and in a selection default whose realm-read left has a same-named static without a pure entry
// (`({ from } = globalThis.Float16Array ?? Array)`)
export function realmLevelNamesCtor(name, levelValue, adapter) {
  return isKnownStaticGlobal(name, adapter) && (levelValue?.type !== 'AssignmentPattern'
    || !adapter?.isMutatedStaticSlot?.('globalThis', name) && (NATIVE_STATIC_OWNERS.has(name)
      || !!resolveBuiltInMeta({ kind: 'global', name })?.desc?.pure && adapter?.defined?.({ kind: 'global', name }) !== false));
}

// capitalised-identifier probe for polyfillHint values like `Symbol`/`Map`/`Promise`
export const CAPITALISED_IDENT = /^[A-Z]\w*$/;
// `import _Foo from 'core-js/pure/symbol/iterator'` - extract Symbol key from polyfill path.
// `.js` suffix is tolerated (explicit-extension import style) - `.js` ONLY: the packages ship
// no `.cjs` / `.mjs` files, so those spellings can never resolve and must not be recognized.
// path must EITHER start with a known core-js package prefix OR with an internal core-js
// namespace (`actual/`, `es/`, etc.). babel's injector stores importSource without the
// package prefix (`actual/symbol/iterator`); unplug stores the full path. without this
// constraint, `my-lib/symbol/iterator` would be misclassified as Symbol.iterator
const CORE_JS_SOURCE_PREFIX = /^(?:core-js(?:-pure)?\/|@core-js\/pure\/|(?:actual|es|features|full|proposals|stable|stage)\/)/;
const SYMBOL_IMPORT_SOURCE = /(?:^|\/)symbol\/(?<name>[\w-]+)(?:\/index)?(?:\.js)?$/;

// shared Identifier-binding gate for key-resolution walks: cycle guard via the hop's `seen`, fork
// before recurse, reject reassigned bindings. takes the hop standing on the identifier and returns
// the hop standing on its binding's `VariableDeclarator` init (`node` null when the binding has
// none to follow) with the `binding` beside it and `seen` advanced, so callsites converge on
// `entry.node ? recurse : fallback`; null on miss
function enterIdentifierBindingFollow(hop) {
  const { node, readNode: usageNode = null, seen } = hop;
  const { scope, adapter, path = null } = hop.ctx;
  if (cycleGuardHas(seen, node.name)) return null;
  const binding = adapter.getBinding({ scope, name: node.name, path, read: node });
  // method-aware reassignment bail: usage-global keeps following a reassigned key/value alias when the
  // reassignment does not dominate the use; pure / narrowing keep the flat bail. `usageNode` anchors the
  // dominance at THIS hop's read site so a multi-hop key alias (`let k='from'; const j=k; k='of';
  // Array[j]`) sees `k='of'` as after the `const j=k` read, not dominating - `j` keeps 'from'
  // the assignment-form Symbol alias's ONLY write IS the aliasing destructure: its write set
  // was already judged clean by the shadow-safe predicate that surfaced `aliasSymbolSource`, and
  // blocking on that same write would refuse the alias its one write makes
  // ... and a binding whose every reachable value NAMES THE REALM is no alias risk at all: the writes
  // spell one object under several names, so the read answers the same whichever reached the use
  if (!binding || (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode })
    && !binding.aliasSymbolSource
    && !everyReachableValueNamesRealm({
      binding, path, name: node.name, ctx: { scope, adapter, path }, usageNode,
    }))) return null;
  const nextSeen = new Set(seen);
  nextSeen.add(node.name);
  // a destructure declarator binds `name` to a SLOT of the init, not the init itself: following
  // the whole init would resolve the receiver and lose the slot (`{ iterator: it } = S` holds
  // S.iterator, and when S is itself a well-known-symbol VALUE the slot is undefined - resolving
  // `it` to the receiver's symbol key is a wrong-value fold). REGISTERED pattern slots resolve
  // through the aliasKey path callers run BEFORE the init branch; unregistered ones bail here
  // binding shape differs per channel: estree adapters carry `.node`, babel's scope Binding
  // only `.path` (the same duality the inline-callee resolver covers)
  const bindingNode = binding.node ?? binding.path?.node;
  const init = bindingNode?.type === 'VariableDeclarator' && bindingNode.id?.type === 'Identifier'
    ? bindingNode.init : null;
  // the returned `ctx.scope` anchors the NEXT hop: the init's identifiers resolve in the alias's OWN
  // declaration scope, not the use scope - a use-site shadow of an init name (`const k = j;
  // function f(j) { obj[k] }`) must not swallow the module-level value the alias actually holds
  return { ...hop, node: init, seen: nextSeen, binding, ctx: { ...hop.ctx, scope: aliasDeclScope(binding, scope) } };
}

// Resolve a binding to its Symbol.X key through registered/imported provenance, or,
// with a usage context, a retained destructure from the global or a full Symbol index. Markers:
// `polyfillHint` (in-place AST mutation leaves this on the binding) and `importSource`
// (real `import X from '.../symbol/iterator'` that the plugin emitted). an entry for a `Symbol.X`
// static exports that static as its default - only default bindings count as Symbol.X refs, and
// only for the leaves SYMBOL_STATIC_KEYS lists (the plugin's OWN `symbol/constructor` import binds
// the constructor, not a `Symbol.constructor` value).
// CORE_JS_SOURCE_PREFIX filter rejects unrelated user imports like `my-lib/symbol/iterator`
// whose `*/symbol/X` suffix would otherwise match the regex and route through Symbol.X polyfill.
// optional `packages` array extends the prefix check to user-aliased polyfill packages
// (`additionalPackages` config) so monorepo / vendor-fork imports are recognised
export function bindingSymbolKey(binding, packages = null, ctx = null) {
  if (binding.polyfillHint?.startsWith('Symbol.')) return binding.polyfillHint;
  // a registered destructure alias whose import source is a Symbol.X module (`const { iterator } =
  // Symbol` / `= globalThis.Symbol`): the binding is a pattern, not a module default, so the
  // `importSource` path below can't claim it (`bindsModuleDefault` fails). the adapter's
  // shadow-safe `aliasSymbolSource` (surfaced only when `isPolyfillAliasBinding` holds) carries the
  // module source directly, so both substrates fold uniformly regardless of the pattern's mutated init
  const aliasKey = symbolKeyFromSource(binding.aliasSymbolSource, packages);
  if (aliasKey) return aliasKey;
  // ... and the module-default forms through the shared three-form rule: the ES default specifier,
  // the TS require-import, the bare-CJS require declarator the require import style leaves behind
  const importedKey = symbolKeyFromSource(boundModuleDefaultSource(binding), packages);
  if (importedKey || !ctx) return importedKey;
  // A retained global or full Symbol index supplies its static key before alias registration.
  // The retained destructure still supplies a protocol key to later instance dispatch.
  const declarator = bindingDeclaratorNode(binding);
  if (declarator?.id?.type !== 'ObjectPattern' || !declarator.init
    || isReassignedBeyondDeclarator(binding)
    || !varInitDominatesUsage({ declaratorNode: declarator, usagePath: ctx.path,
      usageNode: ctx.usageNode, kind: binding.kind })) return null;
  const keys = patternLiteralKeyPath(declarator.id, ctx.name);
  if (keys?.length !== 1 || !SYMBOL_STATIC_KEYS.has(keys[0])
    || ctx.adapter.isMutatedStatic?.('Symbol', keys[0], ctx.path && { node: declarator, path: ctx.path })) return null;
  const source = moduleDefaultSource({ node: declarator.init, adapter: ctx.adapter,
    scope: aliasDeclScope(binding, ctx.scope), path: binding.declarationPath ?? binding.path ?? ctx.path });
  if (!source) return asSymbolRef({
    node: declarator.init,
    adapter: ctx.adapter,
    scope: aliasDeclScope(binding, ctx.scope),
    path: binding.declarationPath ?? binding.path ?? ctx.path,
  }) ? `Symbol.${ keys[0] }` : null;
  if (!CORE_JS_SOURCE_PREFIX.test(source) && !importSourceMatchesUserPackage(source, packages)) return null;
  const entry = pureImportSourceEntry(source)?.replace(/\/index(?:\.js)?$|\.js$/u, '');
  return entry === 'symbol' ? `Symbol.${ keys[0] }` : null;
}

// `<pkg>/.../symbol/<name>` module source -> `Symbol.<name>`, or null when the source is absent /
// unrelated. CORE_JS_SOURCE_PREFIX (+ user `packages`) rejects a coincidental `my-lib/symbol/X`;
// SYMBOL_STATIC_KEYS then rejects the `symbol/` leaves that are NOT a `Symbol.<name>` value
// (`constructor` exports the constructor itself, `description` nothing, `index` the namespace)
export function symbolKeyFromSource(source, packages) {
  if (!source) return null;
  if (!CORE_JS_SOURCE_PREFIX.test(source) && !importSourceMatchesUserPackage(source, packages)) return null;
  const match = SYMBOL_IMPORT_SOURCE.exec(source);
  if (!match) return null;
  const key = kebabToCamel(match.groups.name);
  return SYMBOL_STATIC_KEYS.has(key) ? `Symbol.${ key }` : null;
}

// the CJS-interop helper names (numeric suffix on collision): babel's `_interopRequireDefault`
// / `_interopRequireWildcard` (the namespace shape babel merges ALL of a module's imports into
// when any of them is `import * as`; for a CJS module its result hangs `module.exports` on
// `.default` exactly like the default helper) and swc's inline `_interop_require_default` /
// `_interop_require_wildcard` snake spellings
const INTEROP_DEFAULT_CALLEE = /^_+interop_?[Rr]equire_?(?:[Dd]efault|[Ww]ildcard)\d*$/;

// the helper RUNTIME packages: `@babel/plugin-transform-runtime` imports the helper instead of
// inlining it (`var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")`),
// swc does the same via `@swc/helpers`. recognized by SOURCE so an ALIASED local name still
// matches; extensions beyond `.js` are real files in these packages (unlike core-js entries)
const INTEROP_HELPER_SOURCE = new RegExp(
  '^@(?:babel\\/runtime(?:-corejs\\d+)?\\/helpers\\/(?:esm\\/)?interopRequire(?:Default|Wildcard)'
  + '|swc\\/helpers\\/(?:_\\/|cjs\\/|esm\\/|lib\\/|src\\/)?_interop_require_(?:default|wildcard))(?:\\.[cm]?js)?$');

// is `callee` one of the CJS-interop default/wildcard helpers? three provenances:
// inline definition (NAME convention), an imported/required helper binding (SOURCE match,
// alias-proof), and the external-helpers global (`babelHelpers.interopRequireDefault`).
// the swc namespace-member call spelling (`_interop_require_default._(...)`) stays
// unrecognized - see TASKS
function isInteropDefaultCallee(callee, scope, adapter, path) {
  if (callee?.type === 'MemberExpression' && !callee.computed
    && callee.object?.type === 'Identifier' && callee.object.name === 'babelHelpers'
    // a LOCAL `babelHelpers` binding shadows the external-helpers global - same shadow
    // discipline as `requireCallSource`'s require check
    && !adapter.hasBinding({ scope, name: 'babelHelpers', path })
    && callee.property?.type === 'Identifier' && /^interopRequire(?:Default|Wildcard)$/.test(callee.property.name)) {
    return true;
  }
  if (callee?.type !== 'Identifier') return false;
  if (INTEROP_DEFAULT_CALLEE.test(callee.name)) return true;
  const binding = adapter.getBinding({ scope, name: callee.name, path });
  // no binding OBJECT: estree surfaces TSImportEquals only through the dedicated lookup
  if (!binding) {
    const tsNode = adapter.getTSImportEqualsNode?.({ scope, name: callee.name, path });
    const tsSource = tsImportEqualsRequireSource(tsNode, adapter);
    return typeof tsSource === 'string' && INTEROP_HELPER_SOURCE.test(tsSource);
  }
  if (isReassignedBeyondDeclarator(binding)) return false;
  const source = binding.importSource
    ?? (binding.node?.type === 'VariableDeclarator'
      ? requireCallSource(binding.node.init, { adapter, scope: aliasDeclScope(binding, scope), path }) : null)
    ?? tsImportEqualsRequireSource(binding.node, adapter);
  return typeof source === 'string' && INTEROP_HELPER_SOURCE.test(source);
}

// The module source carried by a recognized interop call's default slot, or null.
function interopCallSource({ callNode, scope, adapter, path = null }) {
  if (callNode?.type !== 'CallExpression' || callNode.arguments?.length !== 1
    || !isInteropDefaultCallee(callNode.callee, scope, adapter, path)) return null;
  return requireCallSource(callNode.arguments[0], { adapter, scope, path });
}

// ... the same slot read by the helper's NAME convention alone: the half a census holding no
// bindings can ask, for the interop wrapper module lowering leaves ahead of it
export function inlineInteropCallSource(node) {
  const call = unwrapRuntimeExpr(node);
  if (call?.type !== 'CallExpression' || call.arguments?.length !== 1) return null;
  const callee = unwrapRuntimeExpr(call.callee);
  return callee?.type === 'Identifier' && INTEROP_DEFAULT_CALLEE.test(callee.name) ? requireCallSource(call.arguments[0]) : null;
}

// The module source whose default value a node carries, through write-free aliases.
// A namespace/wrapper needs a default-member hop; a default binding already holds the value.
// The same source walk serves proxy-global reads and pure invoker pairing.
// A caller may share its binding lookup without copying the adapter's other facts.
// Committed deferred extractions carry the same source before their initializer is inserted.
export function moduleDefaultSource({ node, scope, adapter, path, namespace = false, getBinding = null }) {
  const seen = new Set();
  const followed = [];
  let source = null;
  while (node) {
    node = peelReceiverSequenceTail(node);
    if (!node) return null;
    if (!namespace) {
      source = requireCallSource(node, { scope, adapter, path });
      if (source) break;
      if (isMemberAccessNode(node) && memberKeyName(node) === 'default') {
        node = node.object;
        namespace = true;
        continue;
      }
    }
    if (node.type === 'CallExpression') {
      source = namespace ? interopCallSource({ callNode: node, scope, adapter, path }) : null;
      break;
    }
    if (node.type !== 'Identifier' || seen.has(node.name)) return null;
    seen.add(node.name);
    const binding = getBinding ? getBinding({
      scope,
      name: node.name,
      path,
      read: node,
    }) : adapter.getBinding({ scope, name: node.name, path, read: node });
    if (!binding) return null;
    followed.push({ binding, node, path });
    if (namespace && binding.node?.type === 'ImportNamespaceSpecifier') {
      source = importBindingIsTypeOnly(binding) ? null : binding.importSource;
      break;
    }
    source = !namespace && (boundModuleDefaultSource(binding, adapter)
      ?? adapter.emittedBindingSources?.get(bindingDeclaratorNode(binding))?.get(node.name));
    if (source) break;
    node = identifierDeclaratorInit(binding);
    // Each alias captures its initializer at its declaration point and in its own scope.
    scope = aliasDeclScope(binding, scope);
    path = bindingDeclarationPath(binding) ?? path;
  }
  if (!source) return null;
  // Only a module-valued chain owes availability and write proofs. Ordinary local
  // callees reach this speculative query too; their bodies cannot name a module.
  for (const followedBinding of followed) {
    const { binding } = followedBinding;
    if (isReassignedBeyondDeclarator(binding)) return null;
    const declaratorNode = bindingDeclaratorNode(binding);
    if (declaratorNode?.type === 'VariableDeclarator'
      && !initializerMayRunBeforeUsage({ declaratorNode, usagePath: followedBinding.path, usageNode: followedBinding.node })) return null;
  }
  return source;
}

// The default slot of a pure global-proxy module holds the realm, not its interop wrapper.
export function interopDefaultProxyName({ objectNode, ...ctx }) {
  return globalProxyNameFromImportSource(moduleDefaultSource({ node: objectNode, ...ctx, namespace: true }), ctx.adapter.packages);
}

// the proxy name a binding bound to a bare `require('<pkg>/<mode>/global-this')` carries: for the
// unwrapped CJS shape `module.exports` IS the global object, with no `.default` hop between
export function requireBoundProxyGlobalName({ node, scope, adapter, path }) {
  if (node?.type !== 'Identifier') return null;
  const binding = adapter.getBinding?.({ scope, name: node.name, path });
  if (!binding || isReassignedBeyondDeclarator(binding)) return null;
  const init = binding.node?.type === 'VariableDeclarator' && binding.node.id?.type === 'Identifier'
    ? unwrapTransparentSeq(binding.node.init) : null;
  const required = init && requireCallSource(init, { adapter, scope: aliasDeclScope(binding, scope), path });
  return required ? globalProxyNameFromImportSource(required, adapter.packages) : null;
}

// the names whose binding question is in flight, per owner object - `withBindingLookupGuard`'s registry;
// a question with no owner (a lookup the adapter answers from the path alone) files under one shared key
const inFlightBindingLookups = new WeakMap();
const OWNERLESS = {};

// run `question` about `name` under `owner` unless the same question is already IN FLIGHT, which then
// answers undefined: no binding, no slot value. the owner is the scope a name is looked up in, or the
// declarator whose slot a pattern-bound callee pairs. both are re-entered from walks that carry no
// `seen` across the boundary - the adapters' alias pre-passes run the value walks from inside
// `getBinding` (the ctor alias one: `isPolyfillAliasBinding` -> `declaratorInitResolvesForName` ->
// `aliasInitResolvesToGlobal` -> `isProxyGlobalIdentifierNode`; the Symbol.X alias one:
// `isSymbolDestructureAliasBinding` -> `userAliasBindingResolvesToSymbol`), and a slot pairing
// evaluates its init through callee proofs that start their own - so a walk's own guard never fires
// there, and a self-referential init (`var Map = Map`, `const { at } = at`, `const { at } = at()`)
// recursed until the stack blew. keyed by NAME within the owner because what the name holds is
// exactly what the in-flight question has yet to produce. a WeakMap keyed by the owner object keeps
// concurrent transforms apart and leaks nothing; entry and exit are synchronous around the one
// question, so a released name is free again
export function withBindingLookupGuard(owner, name, question) {
  const key = owner ?? OWNERLESS;
  let names = inFlightBindingLookups.get(key);
  if (!names) inFlightBindingLookups.set(key, names = new Set());
  if (names.has(name)) {
    refuseReentry();
    return undefined;
  }
  names.add(name);
  try {
    return withReentrantQuestion(question, 'lookup');
  } finally {
    names.delete(name);
  }
}

// direct proxy-global (`globalThis`), top-level this, or a managed alias (`_globalThis` via polyfillHint).
// scope+adapter optional. shadow check (`function f(globalThis) {}`) bails unless polyfillHint
// is set. `path` anchors TS-runtime shadow detection (`enum globalThis {}`).
// const aliases (`const g = globalThis`) pass through via init-peel. BOTH cycle guards below - the
// refused in-flight lookup and the binding-keyed `seen` - answer with the shared narrow: on a cycle
// nothing is resolvable through the binding, so the node NAME is all that is left - a
// self-referential PROXY name (`var self = self`) stays a proxy, matching the node-only natural-global
// rewrite that already turns it into `_self` so the hop collapse fires consistently in both emitters
// (unplugin has no AST re-visit to recover it otherwise); a non-proxy self-cycle (`var Map = Map`)
// stays false
export function proxyGlobalRootName({ node, scope, adapter, path, seen, binding = null, usageNode = null, readNode = null }) {
  if (node?.type === 'ThisExpression') return isTopLevelThisContext(path) ? 'globalThis' : null;
  if (node?.type !== 'Identifier') return null;
  // the identifier being classified IS the read: anchor the order proofs (the trusted write's span
  // gate, the reaching-definition cut) at its own span when the caller brought no anchor. the PATH
  // node the gates otherwise fall back to is the consumer above the read, whose span STARTS before
  // a write inside it - a same-sequence read (`(g = globalThis, v = g.self)?.X`) then resolved only
  // when an EARLIER statement happened to write the alias, so two identical sources in one file
  // rendered differently. a rebuilt node carries no span and keeps declining, as the gates intend
  if (readNode === null && typeof node.start === 'number') readNode = node;
  // a ctx with no binding lookup answers by NAME, like the one with no adapter at all: the alias
  // arms below all read the binding, and a caller that cannot supply one (the unit harnesses, a
  // node-only predicate call) asks the same question the name alone can answer
  if (!scope || !adapter?.getBinding) return asProxyGlobalName(node.name);
  // the default parameter already normalizes an absent argument to `null`, so this is exactly
  // "the caller brought no binding" - the one case that has to consult the adapter
  if (binding === null) {
    // `undefined` (never `null`) marks the re-entrant lookup the guard refused - a resolved-but-absent
    // binding is `null` and must keep flowing into the binding-less arms below
    binding = withBindingLookupGuard(scope, node.name, () => adapter.getBinding({ scope, name: node.name, path }) ?? null);
    // the re-entrancy and cycle fallbacks name the proxy global like every other arm here, so they
    // owe the SAME second half: a name whose slot the user overwrote holds the replacement, and
    // answering it pristine only because the walk had to stop is the one shape where a cycle
    // changes a VALUE verdict
    if (binding === undefined) return isPristineProxyGlobal(adapter, node.name, path && { node, path }) ? node.name : null;
  }
  // hint side-channel runs FIRST and independently of scope binding presence: post-rewrite
  // aliases like `_globalThis` are tracked by the injector's global-alias map but may have
  // no entry in babel's scope chain, so the init-follow path never observes them
  const hint = bindingPolyfillHint({ binding, scope, name: node.name, adapter });
  // a mutated proxy SLOT (`window = fake`) is the user's replacement, not the global surface -
  // neither the direct name nor a hint/alias resolving to it recognises as a proxy root (what
  // an alias holds depends on capture order, which no span model covers). an assignment-form
  // hint additionally needs its write to END before the read anchor - an alias hop captured
  // pre-write holds undefined, and a hint narrow there would un-throw the native failure
  if (hint) {
    // `readNode` carries an alias hop's declarator NODE (babel bindings surface no path for it)
    if (!assignmentAliasHintSoundAtRead({ binding, adapter, readNode: readNode ?? (usageNode ?? path)?.node ?? null })) return null;
    return hintedRealmIsPristine(adapter, hint, binding) ? hint : null;
  }
  // cycle guard keyed by the binding's DECLARATION node: a const-alias cycle (`const a = b; const
  // b = a`) or a self-referential init (`var Map = Map`) would otherwise recurse forever through
  // the value canon below. keying by `binding` directly fails for the detect-usage adapter,
  // which returns a FRESH binding wrapper object per `getBinding` call - identity never matches; the
  // declaration node is stable across calls. virtual (hint) bindings never reach here (handled above).
  // this is the guard for the route that CARRIES `seen`; the adapter hop above guards the route that
  // cannot, and both answer with `proxyRootNameOnly` so a cycle classifies the same on either route
  // an IMPORT of a global-proxy entry binds the global object exactly like `const g = globalThis`.
  // the read-side name resolver follows it; without the same step here a WRITE through that binding
  // (`g.Object.create = shim`) never reaches the proxy-root check, so the slot stays untainted and
  // the ponyfill is substituted over the user's patch
  const imported = binding && importedGlobalProxyName(binding, adapter.packages, adapter);
  if (imported) return isPristineProxyGlobal(adapter, imported) ? imported : null;
  // estree-toolkit registers no binding for TSImportEquals - the dedicated adapter lookup
  // surfaces the declaration node instead, mirroring the name-resolution canon's fallback
  if (!binding && adapter.getTSImportEqualsNode) {
    const tsImportNode = adapter.getTSImportEqualsNode({ scope, name: node.name, path });
    const viaTsImport = tsImportNode && tsImportEqualsProxyName(tsImportNode, adapter, adapter.packages);
    if (viaTsImport) return isPristineProxyGlobal(adapter, viaTsImport) ? viaTsImport : null;
  }
  // what a local binding HOLDS is the value canon's question, and the proxy surface is the only
  // narrow this adds. the copy that used to answer it here walked the init itself and bottomed out
  // on two terminals (a bare Identifier, a proxy member chain), so five init spellings the canon
  // resolves - an inline CALL, a `require` entry, a CJS interop `.default`, a chain-assign store,
  // a top-level-`this` member - read as "no proxy" HERE while the read-side resolver called the
  // same binding the realm: the global read then substituted a pure ctor binding under a static
  // the static channel had declined, and no `*/constructor` entry carries statics
  if (binding) {
    // the NAME guard alongside the binding-node one: the canon's own walk keys its cycle set by
    // name, and this route enters it below its owner (`resolveBindingToGlobal`) - the binding is
    // already in hand, and looking it up a second time re-enters the adapters' alias pre-pass
    // outside the in-flight guard above, which is an unbounded recursion, not a cycle
    if (cycleGuardHas(seen, binding.node ?? binding) || cycleGuardHas(seen, node.name)) {
      return isPristineProxyGlobal(adapter, node.name) ? node.name : null;
    }
    const nextSeen = new Set(seen).add(node.name);
    const held = resolveVariableBindingToGlobal({ name: node.name, binding, scope, adapter, seen: nextSeen, path, usageNode, readNode });
    if (held) return hintedRealmIsPristine(adapter, held, binding) ? held : null;
    // the REALM narrow the value canon cannot make: the proxy globals are ONE object, so a
    // reassignment the canon bails on still leaves the binding naming that surface when the value
    // it reaches is itself a proxy global (`let A = globalThis; A = self; A.Array.from` collapses).
    // for an ordinary alias the reaching value IS a different object - which is why the canon bails,
    // and why this narrow lives with the proxy question instead of inside it
    const reaching = isReassignedBeyondDeclarator(binding)
      && reachingReassignmentValueNode({ binding, usagePath: usageNode ?? path, usageNode: readNode });
    const reached = reaching && resolveAliasValueNode({
      value: reaching, name: node.name, binding, scope, adapter, seen: nextSeen, path,
    });
    return isPristineProxyGlobal(adapter, reached) ? reached : null;
  }
  if (adapter.hasBinding?.({ scope, name: node.name, path })) return null;
  return isPristineProxyGlobal(adapter, node.name, path && { node, path }) ? node.name : null;
}

// a for-x HEAD's element binding holds what the loop ITERATES, which no init can carry: where the
// iterable is an array literal whose EVERY element names the same proxy global, the element IS that
// global on every pass (`for (const e of [globalThis])`). That is what tells a runtime ctor guard it
// is dead - without it the hop under such a head reads as a user object and every claim below it
// keeps the source's own read, losing the ponyfill the same shape gets on any other host. A single
// element that is anything else takes the whole answer away: the loop then really does see two
// different objects, and the guard is the right render. the head is the declaration a read in its loop's
// body resolves to and the binding's only write (`forOfHeadDeclarationOf`); a pattern head holds a slot of
// each element instead
function forXElementProxyGlobal({ name, scope, adapter, path, seen }) {
  const head = forOfHeadDeclarationOf(name, { scope, adapter, path });
  if (head?.declaration.node.id?.type !== 'Identifier') return null;
  let held = null;
  for (const element of head.elements) {
    const realm = element
      && proxyGlobalRootName({ node: unwrapRuntimeExpr(element), scope, adapter, path: head.loop, seen });
    if (!realm || (held !== null && held !== realm)) return null;
    held = realm;
  }
  return held;
}

// boolean view for the call sites that only ask "is it a proxy root", not "which one"
export function isProxyGlobalIdentifierNode(args) {
  return proxyGlobalRootName(args) !== null;
}

// `globalThis.X` / `globalThis?.X` / `globalThis['X']` / `globalThis[(e++, 'X')]` / `globalThis.self.X`
// -> 'X', else null. `staticMemberKeyName` folds a side-effecting computed key to its static tail so an
// effectful static leaf resolves with its effects. Pure realm hops require a quiet key;
// global detection can name an effectful hop while preserving the source read.
// walks intermediate proxy-global links so deeper chains resolve to the leaf key; peels a
// zero-arg IIFE-return at each hop so `(()=>globalThis)().Array` resolves like `globalThis.Array`.
// empty-string key returns null - no real global has empty name; keeps callers' `!== null` sound
export function globalProxyMemberName({ node, scope, adapter, path, seen, resolveStaticKey = null }) {
  // a link / leaf whose key the STRUCTURAL fold cannot name (a TS enum member spells one) is named
  // by the same claim-safe resolver the key canon uses - without it the chain declined and the
  // claim above an enum-spelled hop was lost while every other spelling of that key kept it
  function keyOf(member) {
    const key = staticMemberKeyName(member)
      ?? (member.computed && resolveStaticKey
        ? resolveKey({ node: member.property, computed: true, scope, adapter, path, resolveStaticKey }) : null);
    return adapter?.method === 'usage-pure' && member.computed && POSSIBLE_GLOBAL_OBJECTS.has(key)
      ? resolveKey({ node: member.property, computed: true, scope, adapter, path, resolveStaticKey,
        bailOnSideEffectKey: true }) : key;
  }
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  let object = peelProxyGlobalObject(node.object, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  while (object?.type === 'MemberExpression' || object?.type === 'OptionalMemberExpression') {
    const linkName = keyOf(object);
    // a mutated hop slot holds the user's replacement - the chain no longer re-enters the
    // global-object surface, so it must not resolve to the leaf global
    if (!linkName || !POSSIBLE_GLOBAL_OBJECTS.has(linkName)
      || isMutatedGlobalSlot(adapter, linkName, path && { node: object, path })) return null;
    object = peelProxyGlobalObject(object.object, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  }
  if (!isProxyGlobalIdentifierNode({ node: object, scope, adapter, path, seen })) return null;
  // a mutated proxy ROOT (`window = fake; window.Promise`) reads through the user's
  // replacement, same as a mutated intermediate hop - the chain must not resolve. aliases
  // decline through the recognizers' own gates (capture order decides what an alias holds,
  // which no span model covers)
  if (object?.type === 'Identifier'
    && isMutatedGlobalSlot(adapter, object.name, path && { node: object, path })) return null;
  const leaf = keyOf(node) || null;
  // a SLOT-mutated leaf (`globalThis.Map = Shim`) holds the user's replacement - the chain
  // does not name the pristine global, so every READ consumer (pure-ctor swaps, deopts,
  // typing) must fall back to its raw / generic path - save a read the write does not reach
  return isMutatedGlobalSlot(adapter, leaf, path && { node, path }) ? null : leaf;
}

// does a hinted alias still name the pristine realm `hint`? the alias CAPTURES the realm where its declaration
// stands, so one captured ahead of every write of the realm's slot holds the served realm, while one captured
// after a write reads the user's slot. a hint with no declaration behind it is a minted import or memo - this
// build's own value, which no write of the slot reaches
function hintedRealmIsPristine(adapter, hint, binding) {
  if (!binding?.node) return POSSIBLE_GLOBAL_OBJECTS.has(hint);
  const path = bindingDeclarationPath(binding);
  const node = path?.node;
  return isPristineProxyGlobal(adapter, hint, typeof node?.start === 'number' ? { node, path } : null);
}

// the global a name stands for when NO scope binding backs it. a plugin-MINTED alias carries the
// original through the injector's hint hook - `_globalThis` has no scope entry of its own after the
// in-place rewrite, and reading the raw spelling called it no global at all - otherwise the spelling
// itself must pass the direct read's admission (capitalised, or a known proxy). a mutated proxy SLOT
// is the user's replacement whichever route reached the name - save a spelled read (`read`: `{ node,
// path }`) that runs before every write of it
function bindingLessGlobalName(name, { scope, adapter, read = null }) {
  // only a PROXY hint is taken: the same hook also carries a `*/constructor` stub, whose hint is the
  // constructor NAME (`_Map` hints `Map`) - and that binding serves no statics, so reading it as the
  // global puts a static read back on the entry that cannot answer it
  const held = asProxyGlobalName(bindingPolyfillHint({ binding: null, scope, name, adapter })) ?? name;
  // a proxy name whose SLOT the file overwrote is the user's replacement - that pair is the pristine
  // predicate's own question, asked here rather than re-spelled
  if (asProxyGlobalName(held) && !isPristineProxyGlobal(adapter, held, held === name ? read : null)) return null;
  return isStaticPlacement(held) ? held : null;
}

// `path` (optional) - an AST path inside the lookup site so the adapter can anchor TS-runtime
// shadow detection at a deeper scope than `scope.path`. estree-toolkit's scope tracker doesn't
// register StaticBlock as its own scope owner, so a member visit `Map.Foo` inside
// `static { enum Map {} ... }` lands at the enclosing ClassDeclaration scope; without path,
// `findTSRuntimeBindingInPath` walks UP from ClassDeclaration and never enters the StaticBlock
// to find the enum. babel's scope tracker does anchor at StaticBlock so the legacy `scope.path`
// fallback works for it; estree-toolkit needs the explicit path
function resolveBindingToGlobal({ name, scope, adapter, seen, path, usageNode = null, readNode = null, read = null }) {
  seen ??= new Set();
  if (cycleGuardHas(seen, name)) return null;
  // `seen` is a recursion STACK, not a visited set: only names on the CURRENT descent stay
  // guarded (cycle guard intact), and a COMPLETED resolution backtracks so it cannot poison a
  // SIBLING resolution of the same name later in the walk - an array-wrap init like
  // `[_globalThis, _globalThis]` (babel's in-place substitution binds the name) resolves each
  // element independently; a visited-set left every later element unresolvable
  seen.add(name);
  try {
    return withinAliasWalkBudget(resolveGuardedBindingToGlobal, { name, scope, adapter, seen, path, usageNode, readNode, read });
  } finally {
    seen.delete(name);
  }
}

function resolveGuardedBindingToGlobal({ name, scope, adapter, seen, path, usageNode = null, readNode = null, read = null }) {
  // single binding lookup - reused by polyfillHint, type gate, and VariableDeclarator init walk.
  // pass `path` so the adapter's var-hoist fallback can surface a nested-block `var` alias
  // (`var g = globalThis` inside an `if`) that estree-toolkit's name-only scope index misses, and
  // the node the name is read at (`read`) where that is not the use - an alias's initializer
  const binding = adapter.getBinding({ scope, name, path, read });
  // plugin-managed pure-import mutation (`globalThis` -> `_globalThis` / `Symbol` -> `_Symbol`)
  // leaves a real import binding; adapter's `polyfillHint` carries the source global name so
  // downstream proxy-global / constructor recognition survives the rewrite
  // the hint through its canonical JOINER: it lives in two spellings that are one channel - on the
  // binding record where a scope tracker owns it, and behind the adapter hook where an
  // injector-managed alias has no scope entry at all. reading the record alone left the type
  // resolver's adapter (which only implements the hook) blind to every minted alias
  let hint = bindingPolyfillHint({ binding, scope, name, adapter });
  // a PRE-EXISTING pure default import (a pass over an emitter's own output): the census
  // prepasses run before any injector registry exists, so the hint derives from the import
  // source itself - `_Iterator` bound by '.../actual/iterator/constructor' reads as Iterator
  if (!hint && binding?.importKind !== 'type' && (binding?.kind === 'module'
    // ... or the require-style pure binding: THIS binding's own declarator holds the
    // require call (a shadowed local of the same name has a different node and stays out)
    || (binding?.node?.type === 'VariableDeclarator' && requireCallSource(binding.node.init) !== null))) {
    const entry = pureImportEntryOf(path, name);
    if (entry) hint = entryToGlobalHint(entry) ?? null;
  }
  // the pristine gate the twin recogniser (`proxyGlobalRootName`) applies: a hint naming a proxy
  // slot the file itself overwrote no longer stands for the pristine global. registration does not
  // mint hints for mutated slots today, so this only pins the invariant against the fork drifting
  if (hint && (CAPITALISED_IDENT.test(hint) || POSSIBLE_GLOBAL_OBJECTS.has(hint))
    && (!POSSIBLE_GLOBAL_OBJECTS.has(hint) || hintedRealmIsPristine(adapter, hint, binding))) {
    // pure only - the hint drives a receiver-dropping rewrite, so it must be flow-sound at THIS use;
    // global / entry modes inject side-effect imports and stay sound regardless (over-inject-safe).
    // an `aliasWrite` hint was verified clean at REGISTRATION (single write, unconditional same-scope
    // placement) - but placement says nothing about ORDER: the write must also END before the read
    // ANCHOR begins (`usageNode` - an alias-hop reads its source at the hop declarator, so a source
    // written after that capture must not narrow it: `const S = T; ({ Symbol: T } = g)` captures
    // undefined). unknown positions bail - pure resolves on proof. a hoisted-var alias declarator
    // must additionally DOMINATE the use (`if (c) { var { Map: M } = globalThis } M.groupBy`
    // binds everywhere but assigns on one path)
    // a MINTED alias is written by the render that emits its reads, ahead of them: its init-less
    // declarator can sit in an outer scope and still be written first
    const hintFlowSound = assignmentAliasHintSoundAtRead({ binding, adapter, readNode: usageNode ?? path?.node })
      && (adapter.method !== 'usage-pure' || binding.aliasWrite || !binding.node || binding.mintedAlias
        || initializerReachesRead({ adapter, binding, declaratorNode: binding.node, usagePath: path, usageNode }));
    if (hintFlowSound) return hint;
  }
  const bindingType = bindingNodeType(binding);
  // an import binding maps to a known global ONLY through a pure GLOBAL-PROXY entry source
  // (`import g from '<pkg>/<mode>/global-this'`) - any other imported value stays opaque;
  // catch / class names fall through to the final null; parameters need their own proof below.
  // import bindings are hoisted
  // and immutable, so no flow-soundness gate applies; type-only imports erase before runtime
  // and must stay unresolvable
  if (IMPORT_SPECIFIER_TYPES.has(bindingType)) {
    // type-only gates at BOTH levels (specifier and declaration) - the erased binding must not
    // resolve to a runtime global, matching the shared erasure canon
    return bindsModuleDefault(binding?.node) && !importBindingIsTypeOnly(binding)
      ? globalProxyNameFromImportSource(binding?.importSource, adapter.packages)
        ?? pureCtorNameFromImportSource(binding?.importSource, adapter.packages, entryToGlobalHint)
      : null;
  }
  // the TS require-import twin (`import g = require('.../global-this')`) binds the module
  // default the same way - babel's binding node IS the declaration
  if (bindingType === 'TSImportEqualsDeclaration') {
    return tsImportEqualsProxyName(binding?.node, adapter, adapter.packages);
  }
  // estree-toolkit registers no binding for TSImportEquals at all - the adapter surfaces the
  // declaration node through a dedicated lookup instead (adapters with native bindings
  // resolve through the branch above and don't implement it)
  if (!bindingType && adapter.getTSImportEqualsNode) {
    const tsImportNode = adapter.getTSImportEqualsNode({ scope, name, path, read });
    if (tsImportNode) return tsImportEqualsProxyName(tsImportNode, adapter, adapter.packages);
  }
  if (bindingType === 'VariableDeclarator') {
    return resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path, usageNode, readNode });
  }
  if (binding?.kind === 'param' && bindingType === 'Identifier' && !binding.constantViolations?.length) {
    const parameter = binding.path ?? binding.declarationPath;
    const candidate = PARAMETER_STATIC_SOURCES.get(parameter?.node);
    if (typeof candidate !== 'string') {
      const source = adapter.parameterStaticSources?.get(parameter?.node);
      return typeof source === 'string' ? source : null;
    }
    // The closed-source proof describes the original parameter, like the file census. Own
    // rewrites only replace its proven reads; a new parse/relocated parameter has a new node.
    // Cache refusals too: an opaque receiver must not rescan the body at every member read.
    const cache = adapter.parameterStaticSources;
    if (cache?.has(parameter.node)) {
      const source = cache.get(parameter.node);
      return typeof source === 'string' ? source : null;
    }
    cache?.set(parameter.node, null);
    const sites = adapter.parameterCallSites?.(parameter, { staticIsMutated: adapter.isMutatedStatic });
    if (!sites?.length) return null;
    const source = parameterStaticSource(sites, null, (value, { callPath }) => {
      const sourceBinding = value.type === 'Identifier' && adapter.getBinding({ scope: callPath.scope, name: value.name, path: callPath });
      if (adapter.method !== 'usage-global' && sourceBinding
        && !bindingPolyfillHint({ binding: sourceBinding, scope: callPath.scope, name: value.name, adapter })) return null;
      const object = resolveObjectName({ objectNode: value, scope: callPath.scope, adapter, path: callPath, seen: new Set() });
      return object && (typeof candidate === 'string' ? object === candidate : isKnownGlobalName(object)) ? object : null;
    });
    cache?.set(parameter.node, source);
    return source;
  }
  return null;
}

// the ONE value a reassigned KEY binding holds at the read, with the scope it is spelled in: the
// reaching write's value (usage-pure: the single observable one), in the scope that write stands in - a
// block around it may rebind a name it reads, one around the read rebinds nothing the write saw - or,
// where that write is a pattern over a CALL (`({ K } = f())`), the one value the site pairs through the
// call canon, in the scope the callee spelled it. null where the value is flow-dependent
function reachingKeyValue({ binding, name, scope, adapter, path, usageNode, seen }) {
  const callSites = [];
  const writeScopes = [];
  const reaching = reachingReassignmentValueNode({
    binding,
    usagePath: path,
    ctx: { scope, adapter, path, resolveKey },
    usageNode,
    requireSingleObservation: adapter.method === 'usage-pure',
    callSites,
    writeScopes,
  });
  if (reaching) return { node: reaching, scope: writeScopes[0] ?? aliasDeclScope(binding, scope) };
  return callSites.length === 1 ? certainPairedSlotValue({
    pattern: callSites[0].pattern,
    init: callSites[0].value,
    name,
    seen,
    ctx: { scope: aliasDeclScope(binding, scope), adapter, path, resolveKey },
  }) : null;
}

// usage-global: when following a reassigned alias's declarator init, an unconditional reassignment can
// kill that init before the use - including across a closure boundary, where it runs before the
// capturing closure is defined (`let K = 'of'; K = 'from'; () => Array[K]` / `let M = Object; M =
// Array; () => M.assign()`). returns the reaching value NODE to resolve instead of the dead init, or
// null to keep following the init (no reassignment / init still live / value indeterminable - over-
// inject-safe). shared by the key (resolveKey) and receiver (resolveVariableBindingToGlobal) follows
// usage-pure takes the reaching value on the container walk's terms (`reachingContainerValueNode`):
// only when that write is the ONLY value the read can observe - the bare canon and the walk lifted
// from it answer one reassigned binding alike (`var g = globalThis; g = plain; g = self; g.Map`).
// a `writeScopes` sink takes the value in the scope its write stands in (the key follow), see
// `reachingReassignmentValueNode`
function reachingValueOverDeadInit({ binding, adapter, path, scope, usageNode = null, writeScopes = null }) {
  const { method } = adapter;
  if ((method !== 'usage-global' && method !== 'usage-pure') || !isReassignedBeyondDeclarator(binding)) return null;
  return reachingReassignmentValueNode({
    binding,
    usagePath: path,
    ctx: { scope, adapter, path, resolveKey },
    usageNode,
    requireSingleObservation: method === 'usage-pure',
    writeScopes,
  });
}

function resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path, usageNode = null, readNode = null }) {
  // the declarator through the canonical view: the proxy-root recogniser hands this the raw babel
  // scope Binding of the type-resolution adapter, whose `.node` is not the declarator
  const declarator = bindingDeclaratorNode(binding);
  // ... and a binding no value of which stands for a global names none, whichever of its writes reaches the
  // read: asking which do settles the guards of every write, and a guard testing the binding asks this again
  // ... and one written past the ceiling names none: no read follows its writes (`writesPastCeiling`)
  if (!declarator || writesPastCeiling(binding.constantViolations) || bindingHoldsNoGlobal(binding)) return null;
  // a real reassignment (a constantViolation beyond a loop-reinit declarator-self) makes the alias
  // flow-dependent. usage-pure resolves ONLY a provable value: the live init when no reassignment
  // reaches the use, else the ONE plain write the read can observe (the container walk's rule,
  // `reachingValueOverDeadInit` below) - anything ambiguous bails, its receiver-dropping rewrite
  // being unsound over a guess; usage-global bails ONLY when a reassignment DOMINATES the use (init
  // provably dead) - a conditional / after-use reassignment leaves the init live, and
  // inject-if-maybe-needed keeps resolving it. `usageNode` anchors the dominance at THIS hop's read site for a multi-hop alias
  // (`let a = Array; const b = a; a = Map; b.from()` - `a = Map` is after `const b = a`, so it does not
  // kill the value `b` captured). the bail returns early, before the `.node.init/.id` deref below
  // assignment-form ctor alias (`let M; ({ Map: M } = globalThis); M.groupBy`): the binding's single
  // TRUSTED write (adapter-verified: clean, unconditionally placed in the binding's own scope) carries
  // the destructured global - resolve `name` through the write's own pattern, symmetric to the
  // declarator-init branches below. runs BEFORE the reassignment bail: the sole trusted write IS the
  // value source, not a flow hazard. works pre-registration too (a closure body visited before the
  // write's statement still resolves, matching the decl canon's static pattern walk)
  if (!declarator.init && declarator.id?.type === 'Identifier' && adapter.findTrustedAliasWrite) {
    // strict (placement-checked) write serves the POSITIONAL destructure arms. pure only +
    // the READ must RUN after the write: a hoisted-var read, an earlier-defined closure body, an
    // alias hop CAPTURED before the write (`const S = T; ({ Map: T } = globalThis)` - the hop reads
    // T at the S declarator) and a read in a slot its container evaluates EARLY all run
    // pre-assignment, and a static narrow there would un-throw it. the registration-table gate owns
    // that question (`usageNode` is the hop's read anchor, the plain use keeps its own position)
    const write = adapter.findTrustedAliasWrite(scope, name);
    if (write && (adapter.method !== 'usage-pure'
      || aliasSpanDominatesUse({ span: write, useStart: (usageNode ?? path?.node)?.start ?? 0, usagePath: path }))) {
      // the write's RHS receiver resolves where the write stands - `scope` (the use site) only located
      // the write; resolving the RHS in it would rebind an outer receiver to an inner shadow (same
      // missed-sibling gap as the declarator-init delegations)
      const writeScope = writeScopeAt(path, write, aliasDeclScope(binding, scope));
      const alias = write.left?.type === 'ObjectPattern'
        ? resolveProxyGlobalDestructureAlias({ pattern: write.left, init: write.right, name, scope: writeScope, adapter, seen, path })
        : write.left?.type === 'ArrayPattern'
          ? resolveArrayWrappedProxyGlobalAlias({ pattern: write.left, init: write.right, name, scope: writeScope, adapter, seen, path })
          : null;
      if (alias) return alias;
    }
    // plain-Identifier trusted write (`var _g; (_g = g = globalThis) == null ? ... : _g.self.X`
    // - the shape `?.`-lowering transpilers emit ahead of this plugin): the write's RHS is the
    // binding's sole value, so it resolves through the SAME value canon a declarator init uses;
    // a chain-assign RHS peels to the stored value first (the kept assignment stays verbatim).
    // the trust/shape/structural-proof gates live in the shared `trustedIdentifierAliasWrite`
    const idWrite = trustedIdentifierAliasWrite({ scope, name, adapter, path, readNode: readNode ?? usageNode ?? path?.node });
    if (idWrite) {
      // the chain-ROOT peel, not the assign peel alone: a write storing an effect-bearing sequence
      // (`_ref = (g = _globalThis, v = nav)` - the memo an instance dispatch mints over such a root)
      // stops the assign peel's own SE-bailing sequence walk, and the binding then resolved to
      // nothing - every claim read off it stayed raw off the ponyfill
      const alias = resolveAliasValueNode({
        value: peelChainRootValue(idWrite.right), name, binding, scope, adapter, seen, path, valueScope: writeScopeAt(path, idWrite),
      });
      if (alias) return alias;
    }
    // ... and a declarator the HEAD of a for-x owns carries no init because its value is what the
    // loop ITERATES: the one value no init can spell, and the reason a hop under such a head read as
    // a user object on one binding while the other folded it onto the constructor
    const iterated = forXElementProxyGlobal({
      name, scope, adapter, seen, path: path ?? binding.declarationPath ?? null,
    });
    if (iterated) return iterated;
  }
  // ... unless every value the binding can hold NAMES THE REALM: the writes spell one object under
  // several names, so a read through it answers the same whichever reached the use - there is no
  // flow hazard for the bail to protect (`let g = globalThis; g = self; g.Map`)
  // ... or holds ONE value the read can observe: the reaching write resolves below in the init's place
  // the evaluation-order half of the same question: a write in a slot that runs ahead of the use's
  // own - a class computed key or decorator, a case test a `default` body is reached through, a
  // destructuring right-hand side - sits PAST the use by span, so neither the dominance gate below
  // nor the reaching walk sees it, and the declarator init is not what the read observes
  if (anyWriteOutrunsUse((binding.constantViolations ?? []).map(violationNode), path)) return null;
  const reaching = reachingValueOverDeadInit({ binding, adapter, path, scope, usageNode });
  if (isReassignedBeyondDeclarator(binding) && reassignBailApplies({ binding, adapter, path, usageNode })
    && !reaching
    && !everyReachableValueNamesRealm({
      binding, path, name, ctx: { scope, adapter, path }, usageNode,
    })) return null;
  // a function-scoped `var` whose assignment is conditional (`if (c) { var M = globalThis }`)
  // holds the global only on paths through that branch. usage-pure rewrites `M.Array.from` to a
  // receiver-less helper, DROPPING the guard - so a non-dominating assignment would mask the
  // native undefined-access on the skipped-branch path. global / entry modes keep the call site
  // (side-effect import only) and stay sound regardless, so the gate is pure-only
  if (adapter.method === 'usage-pure'
    && !initializerReachesRead({ adapter, binding, declaratorNode: declarator, usagePath: path, usageNode })) return null;
  // dead-init across a closure: resolve the reaching value as the receiver instead of the dead init
  // (`let M = Object; M = Array; () => M.assign()` resolves to Array, not the unreachable Object).
  // the write's RHS was spelled where the binding lives, not at the use - resolve it in the
  // binding's own declaration scope so a use-site shadow of an RHS name cannot capture it
  if (reaching) return resolveObjectName({
    objectNode: reaching, scope: aliasDeclScope(binding, scope), adapter, seen: new Set(seen).add(name), path, usageNode: reaching,
  });
  // Even the global union excludes an initializer from the opposite arm when no
  // earlier iteration or invocation can carry its value into this read.
  if (writeIsInOppositeBranch(declarator, path, readNode ?? usageNode ?? path?.node) && noReassignmentReachesUsage({
    reassignmentNodes: [declarator], usagePath: path, usageNode: readNode ?? usageNode,
    bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node,
    bindingAnchor: bindingLoopAnchor(binding),
  })) return null;
  const { init } = declarator;
  const pattern = declarator.id;
  // the init/destructure RHS was written in the alias's OWN declaration scope, so its proxy-global
  // receiver resolves there, not at the use site - an inner shadow of the receiver name must not
  // capture it (mirror of the identifier-hop rule in `resolveAliasValueNode`; passing raw `scope`
  // was the missed-sibling gap that dropped injection for `const { Map: M } = a` / `const [A] =
  // [a.Map]` used under a shadowing param)
  const initScope = aliasDeclScope(binding, scope);
  // `{ from, ...rest } = Array` - rest !=== init
  const props = pattern?.properties ?? pattern?.elements;
  if (props?.some(p => p?.type === 'RestElement' && p.argument?.name === name)) return null;
  // destructures bind `name` to a property of init, not init itself. proxy-global shorthand
  // (`{ Symbol } = globalThis`) is the only exception - aliases to the property key
  if (pattern?.type === 'ObjectPattern' && init) {
    const alias = resolveProxyGlobalDestructureAlias({ pattern, init, name, scope: initScope, adapter, seen, path });
    if (alias) return alias;
  }
  // an array-wrapped proxy-global alias (`const [{ Array: A }] = [globalThis]`) nests the alias
  // ObjectPattern inside an ArrayPattern, paired positionally to a proxy-global init element. peel
  // the wrapper to that (ObjectPattern, init) pair and resolve like the flat ObjectPattern form -
  // else the member off the alias (`A.from`) never resolves, so pure keeps the native static
  if (pattern?.type === 'ArrayPattern' && init) {
    const alias = resolveArrayWrappedProxyGlobalAlias({ pattern, init, name, scope: initScope, adapter, seen, path });
    if (alias) return alias;
  }
  // a destructure that binds `name` to an element / value which is ITSELF a global
  // (`const [A] = [Map]`, `const { x: A } = { x: Map }`) aliases that global - resolve through the
  // paired literal slot, the same value-union walk the reassignment path uses. member-extraction
  // (`const { from } = Array`) pairs to a property, not a literal slot value, so it surfaces nothing
  // here and falls through to null (resolved by the destructure detection instead). diverging slot
  // values (a default that disagrees with the paired value) stay unresolved - bail-safe both modes
  if (isDestructurePattern(pattern) && init) {
    // a CALL init pairs through the call canon's returned literal, each value in the scope its
    // identifiers resolve in; an inline literal pairs where the declaration stands
    const called = callInitSlotValues({ pattern, init, name, scope: initScope, adapter, path, seen, resolveKey });
    const pairingCtx = called ? called.ctx : { scope, adapter, path, resolveKey };
    // a slot default makes the value default-or-runtime, and this union sees only the values
    // `patternSlotValues` could pair (its contract is over-approximation - a dynamic / spread-
    // shifted / foreign pair contributes nothing), so a lone resolved default wrongly reads as
    // certain. pure's receiver-dropping fold needs certainty - bail on the ambiguity (the
    // default-aware extraction channels keep their runtime-guarded handling); usage-global
    // keeps the maybe-union (inject-if-might is sound and desirable there)
    if (adapter?.method === 'usage-pure'
      && patternSlotValueAmbiguous(pattern, called ? called.literal : init, name, pairingCtx)) return null;
    // a slot the file REPLACED no longer holds what the container's literal spells (`const w = { k:
    // Object }; w.k = Map; const { k } = w` binds Map) - the same rule the static receiver walk
    // applies to the `w.k` spelling, owed here because this route reads the pairing directly and
    // would otherwise resolve a DIFFERENT constructor's static: a wrong value, not a missed one.
    // usage-global keeps resolving - the union injects for the written values beside it
    if (adapter?.method === 'usage-pure' && patternSlotWritten({
      pattern, init, name, ctx: { scope: initScope, adapter, path: bindingDeclarationPath(binding) ?? path, resolveKey },
    })) return null;
    // a NAME answers only where every possible value agrees (a realm-selecting value collapses
    // inside the receiver resolver). a disagreeing set is not this resolver's to collapse - the
    // usage-global union (`reachableAliasValues`) reads the same slot values arm by arm and
    // injects for each
    const globals = new Set();
    const slotValues = called ? called.complete ? called.values : []
      : patternSlotValues(pattern, init, name, pairingCtx).map(value => ({ node: value, scope: initScope }));
    for (const { node: value, scope: valueScope } of slotValues) {
      const global = resolveObjectName({
        objectNode: value, scope: valueScope, adapter, seen: new Set(seen).add(name), path, usageNode: value,
      });
      if (global) globals.add(global);
    }
    return globals.size === 1 ? [...globals][0] : null;
  }
  if (pattern && pattern.type !== 'Identifier') return null;
  if (!init) return null;
  return resolveAliasValueNode({ value: init, name, binding, scope, adapter, seen, path });
}

// resolve the VALUE an Identifier-pattern alias stores - the declarator init, or a trusted
// assignment-form write's RHS (both feed the same canon so the two spellings cannot drift), in the
// alias's declaration scope or, for a write, where it stands (`valueScope`). every
// level of an alias chain asks the levels below it, so the answer is kept per value node
// (`canonAnswerTable`) under every other input the walk reads. the cycle guard is one of them - it
// holds the alias's own name beside whatever the walks above it hold: an answer is kept only from a
// walk that met no cut (`cycleGuardCuts`), which is the answer of a walk handed the alias's name alone, and
// only an ask handed that alone reads it
function resolveAliasValueNode(options) {
  const { value, name, binding, scope, adapter, seen, path, valueScope = null } = options;
  const answers = canonAnswerTable(resolveAliasValueNode, [valueScope ?? aliasDeclScope(binding, scope), adapter, path, name]);
  if (seen?.size === 1 && answers?.has(value)) return answers.get(value);
  const cuts = cycleGuardCuts();
  const held = walkAliasValueNode(options);
  if (answers && cycleGuardCuts() === cuts) answers.set(value, held);
  return held;
}

function walkAliasValueNode({ value, name, binding, scope, adapter, seen, path, valueScope = null }) {
  // parens/chain/TS wrappers vanish; SequenceExpression pulls the effective value off its tail.
  // the binding's init declaration stays verbatim (only USES of the binding are rewritten / import-
  // injected), so preceding SE effects are preserved in place - resolution peels to the tail value
  const unwrapped = peelReceiverSequenceTail(value);
  // resolve the init in the alias's OWN declaration scope, not the receiver-use scope - the init
  // expression (`a.Map`, `(() => a.Map)()`, `require(...)`) was written where the alias was declared,
  // so a later hop reading an outer-declared receiver must not bind to an inner shadow of it. EVERY
  // init-shape delegation below threads `initScope`; passing the raw use `scope` was the missed-
  // sibling gap that dropped injection under an inner-shadowed alias hop (`var g = a.Map` used where
  // `a` is a shadowing param). a write's RHS was written where the write stands
  const initScope = valueScope ?? aliasDeclScope(binding, scope);
  // Lexical this is classified where the alias captured it, before a later use can bind its own.
  if (unwrapped?.type === 'ThisExpression') return proxyGlobalRootName({
    node: unwrapped, scope: initScope, adapter, path: pathOfNode(bindingDeclarationPath(binding) ?? path, unwrapped),
  });
  // a guard-shaped conditional value (the stored kept-nav render - `null == _globalThis.window
  // ? void 0 : _self.window` - or any user ternary of the same shape) stores either undefined
  // or the defined branch: classification follows that branch, and the undefinable verdict
  // (which reads the same shape) keeps the alias guard live at every claim site. without this
  // arm an in-place collapse (and the sandwich's second pass over collapsed
  // output) hides the nav from the alias reads, and their claims silently die. only a GUARDED
  // read classifies: the void-0 arm is a real runtime value, and an unguarded read observes
  // it natively (`probeHeld.Object` throws there) - the throw must survive
  const definedBranch = definedBranchOfGuardConditional(unwrapped);
  if (definedBranch) {
    return isRenderedStoredValue(unwrapped) || aliasReadGuardedAgainstNullish(path, name)
      ? resolveAliasValueNode({ value: definedBranch, name, binding, scope, adapter, seen, path, valueScope })
      : null;
  }
  if (unwrapped?.type === 'Identifier') {
    // a SELF-REFERENCE (`var Map = Map`) holds no global: the declaration binds afresh in every
    // host we emit for - a module's top level, a CommonJS wrapper's, any function body - so the
    // initializer reads the name's own hoisted `undefined`. answering it here would rewrite the
    // shim's later reads while the identifier lane leaves the declaration alone, which is one
    // source read as two hosts.
    // unbound -> global; bound -> follow chain (recursion hits the top-level polyfillHint
    // translation for plugin-managed imports).
    // a MUTATED proxy slot is the user's replacement whatever route reaches it: an ALIAS of
    // that name (`globalThis.self = X; const g = self`) holds the replacement too, so it
    // resolves to no global - the same verdict the direct read gets.
    // the binding-less name passes the SAME admission the direct spelling gets
    // (`resolveObjectName`: capitalised or a known proxy) - without it an alias of any free
    // lowercase name reported a "global" receiver the direct read would never claim
    if (unwrapped.name === name) return null;
    if (!adapter.hasBinding({ scope: initScope, name: unwrapped.name, path, read: unwrapped })) {
      return bindingLessGlobalName(unwrapped.name, { scope: initScope, adapter, read: path && { node: unwrapped, path } });
    }
    return resolveBindingToGlobal({ name: unwrapped.name, scope: initScope, adapter, seen, path, usageNode: unwrapped, read: unwrapped });
  }
  // identity / param-free / SE-prefix IIFE peel applied ONLY in the binding-init walk,
  // not in `resolveObjectName`'s generic CallExpression branch: the const intermediate
  // (`const X = (arg => arg)(Array)`) keeps the IIFE detached from the eventual usage
  // site, so polyfill emit operates on the binding name (`X`) not the IIFE expression.
  // direct member-receiver IIFE (`((arg) => arg)(WeakMap).has(1)`) doesn't reach here
  // and preserves its AST shape -- the identifier-visitor's inner-arg rewrite stays
  // unrivalled, no double-rewrite overlap with a wide polyfill substitution
  const iifePeeled = peelZeroArgIifeReturn(unwrapped, { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic });
  if (iifePeeled) return resolveObjectName({ objectNode: iifePeeled, scope: initScope, adapter, seen, path, usageNode: iifePeeled });
  // `var g = require('<pkg>/<mode>/global-this')` - the require-style twin of the proxy-entry
  // import branch in resolveGuardedBindingToGlobal: same source canon, so the CJS import style
  // taints writes / resolves reads identically. an in-file `require` binding (bundler shim /
  // user function) keeps the name opaque - checked in the alias's own declaration scope
  if (unwrapped?.type === 'CallExpression' || unwrapped?.type === 'OptionalCallExpression') {
    const required = requireCallSource(unwrapped, { adapter, scope: initScope, path });
    const requiredProxy = required ? globalProxyNameFromImportSource(required, adapter.packages) : null;
    if (requiredProxy) return requiredProxy;
  }
  // MemberExpression / OptionalMemberExpression / CallExpression / OptionalCallExpression all
  // delegate to resolveObjectName - it handles each shape (proxy-global walk, call-inline).
  // unhandled shapes (NewExpression, BinaryExpression, etc.) safely return null
  return unwrapped ? resolveObjectName({ objectNode: unwrapped, scope: initScope, adapter, seen, path, usageNode: unwrapped }) : null;
}

// `const { X } = globalThis` (or `self` / `window` / ...) -> X resolves to globalThis.X.
// returns the property key or null when init isn't a proxy-global or `name` isn't matched.
// nested patterns (`const { window: { Array } }`) follow the chain when every intermediate
// key is itself a proxy-global name (`window`/`self`/...) - matches the runtime where the
// chain re-enters the same global-object identity (`globalThis.window === globalThis` on
// browsers). conservative: only descends through proxy-global keys, so user-shape
// `const { foo: { Array } } = globalThis` (foo is non-global) bails. only known-global-
// shaped leaf keys (capitalised / `POSSIBLE_GLOBAL_OBJECTS`) returned - `const { foo } =
// globalThis` should not push `'foo'` into downstream global lookups
function resolveProxyGlobalDestructureAlias({ pattern, init, name, scope, adapter, seen, path }) {
  // the pattern's computed keys EVALUATE at the destructure site: a use-site anchor would
  // resolve a key reassigned AFTER the capture to its post-capture value - a wrong-value
  // alias (`let k = "Array"; const { [k]: S } = globalThis; k = "Symbol";` must resolve S
  // as Array, not Symbol). anchor on the PATTERN, not the init: babel may have substituted
  // the init already (`_globalThis`, a synthetic positionless node the position math
  // cannot order against), while the pattern keeps its source positions on both parsers.
  // asked ahead of the receiver, which it does not read: a key naming no global leaves the init
  // unresolved, and a binding a pattern takes off the one before it walks no chain below it here
  const key = walkProxyDestructurePattern({ pattern, name, scope, adapter, seen, path, usageNode: pattern });
  if (!key) return null;
  const receiver = resolveObjectName({ objectNode: init, scope, adapter, seen, path, usageNode: init });
  // a mutated proxy RECEIVER (`window = fake; const { Promise: P } = window`) destructures the
  // user's replacement - the pattern keys no longer name pristine globals (the key-level gate
  // in the walk covers mutated LEAF keys; this covers the replaced container itself)
  return receiver && isPristineProxyGlobal(adapter, receiver) ? key : null;
}

// descend array-wrapper layers pairing each pattern element to its init element positionally: an
// ObjectPattern slot resolves via the flat proxy-global alias path, a nested ArrayPattern recurses.
// `const [{ Array: A }] = [globalThis]` (and deeper `[[{ Array: A }]] = [[globalThis]]`) resolve `A`
// to its property key just like the un-wrapped `{ Array: A } = globalThis`. the slot is the positional
// read (an inline-array spread expanded); one no static position survives is skipped
function resolveArrayWrappedProxyGlobalAlias({ pattern, init, name, scope, adapter, seen, path }) {
  if (pattern?.type !== 'ArrayPattern' || init?.type !== 'ArrayExpression') return null;
  for (let i = 0; i < pattern.elements.length; i++) {
    const raw = pattern.elements[i];
    const slot = patternSlotTarget(raw);
    const paired = slot ? resolveCallArgument(init.elements, i, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic) : null;
    if (!paired) continue;
    if (slot.type === 'ObjectPattern') {
      const alias = resolveProxyGlobalDestructureAlias({ pattern: slot, init: paired, name, scope, adapter, seen, path });
      if (alias) return alias;
    } else if (slot.type === 'ArrayPattern') {
      const alias = resolveArrayWrappedProxyGlobalAlias({ pattern: slot, init: paired, name, scope, adapter, seen, path });
      if (alias) return alias;
    }
  }
  return null;
}

function walkProxyDestructurePattern({ pattern, name, scope, adapter, seen, path, usageNode = null }) {
  for (const p of pattern.properties) {
    if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
    // propagate `seen` so computed keys backed by chained aliases (`const k = A; const A = k;`
    // -> { [k]: x }) reuse the outer cycle guard instead of starting a fresh walk
    const key = resolveKey({ node: p.key, computed: p.computed, scope, adapter, seen, path, usageNode });
    if (!key || !isStaticPlacement(key)) continue;
    // a mutated slot (`globalThis.Array = Fake`) leaves the binding holding the replacement,
    // so neither the leaf alias nor a hop descent may resolve it as the pristine global - save a
    // realm key the pattern reads ahead of every write of its slot (`realmCaptureRead`'s rule)
    if (isMutatedGlobalSlot(adapter, key, POSSIBLE_GLOBAL_OBJECTS.has(key) && path ? { node: p, path } : null)) continue;
    if (patternBindingName(p.value) === name) return key;
    // nested ObjectPattern through a proxy-global intermediate key (`window`, `self`, ...)
    // re-enters the same global-object surface at runtime - recurse so `const {window:
    // {Array}} = globalThis` resolves Array as a global just like the flat form
    const nested = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
    if (nested?.type === 'ObjectPattern' && POSSIBLE_GLOBAL_OBJECTS.has(key)) {
      const inner = walkProxyDestructurePattern({ pattern: nested, name, scope, adapter, seen, path, usageNode });
      if (inner) return inner;
    }
  }
  return null;
}

// top-level binding name of a destructuring element, skipping `=default` wrappers. nested
// patterns (`[a, b]`, `{x, y}`) don't produce a single name and return null
export function patternBindingName(node) {
  while (node?.type === 'AssignmentPattern') node = node.left;
  return node?.type === 'Identifier' ? node.name : null;
}

// does every value this binding can hold NAME THE REALM? `let g = globalThis; g = self` holds ONE
// object under two names, so a read through it - a constructor, a static - answers the same whichever
// write reached the use, and the alias bail has nothing to protect. the declaration's own init counts
// as one of those values, and an enumeration that cannot see them all answers false - as does a binding
// declared without one: whether every path writes it before the read is not asked
function everyReachableValueNamesRealm({ binding, path, name, ctx = null, usageNode = null }) {
  const bindingNode = binding?.node ?? binding?.path?.node;
  const init = bindingNode?.type === 'VariableDeclarator' && bindingNode.id?.type === 'Identifier'
    ? unwrapRuntimeExpr(bindingNode.init) : null;
  function namesRealm(value) {
    // a decided selection is the operand it always yields (`decidedSelectionValue`)
    const named = peelRealmLogicalDefault(unwrapRuntimeExpr(ctx ? decidedSelectionValue(value, ctx) : value));
    if (named?.type !== 'Identifier') return false;
    // ... and only while the slot still stands: a name the file REPLACES holds the user's object,
    // not the realm, so the values are no longer one object under several names
    if (ctx?.adapter && isMutatedGlobalSlot(ctx.adapter, named.name)) return false;
    if (guaranteedRealmObjectName(named.name)) return true;
    // ... read through the MINTED spelling too: by the time this resolution runs, the walk may have
    // swapped the source name for the ponyfill binding it stands for (`globalThis` -> `_globalThis`),
    // and the hint is what names the realm behind it
    const hint = ctx?.adapter?.getBindingPolyfillHint?.(ctx.scope, named.name)
      ?? bindingPolyfillHint({
        binding: ctx?.adapter?.getBinding?.({ scope: ctx.scope, name: named.name, path: ctx.path, read: named }),
        scope: ctx?.scope,
        name: named.name,
        adapter: ctx?.adapter,
      });
    return !!hint && guaranteedRealmObjectName(hint);
  }
  // the init is one of the values, so an init naming no realm answers before the writes are enumerated:
  // the enumeration settles the guards of every write, and a guard testing the binding asks this again
  if (!init || !namesRealm(init)) return false;
  const enumeration = reassignmentValueEnumeration({ binding, usagePath: path, name, ctx, usageNode });
  // a value set the enumerator could not close - a site it could not read, a pattern write whose
  // value is a call, a head it cannot enumerate - names nothing for certain, whatever its listed
  // values name
  if (!enumeration.complete) return false;
  return enumeration.nodes.length > 0 && enumeration.nodes.every(namesRealm);
}

// a bare proxy-global NAME whose read is guaranteed to yield the realm object, making the right
// side of a defensive `??` / `||` over it dead code: the language guarantees the `globalThis`
// binding in every realm, and a name with a pure ENTRY (`self`) is guaranteed by the transform
// itself - the very read the logical guards resolves through the ponyfill, which always answers
// the realm object. `window` / `global` have no entry and stay the environment probes a
// defensive default genuinely tests. entry existence is the same target-independent question
// `proxyHopLacksPureEntry` asks of a hop; a SHADOWED or mutated-slot spelling still declines
// downstream, at the identifier checks the peel hands the name to
export function guaranteedRealmObjectName(name) {
  return !!name && POSSIBLE_GLOBAL_OBJECTS.has(name) && !!resolveBuiltInMeta({ kind: 'global', name });
}

// the (global, member) a pure entry names - `array/of` -> Array + `of`, a family entry
// (`map`, `map/constructor`) naming the global with no member of its own. the segment split
// is the injector's, so a member whose spelling the kebab head cannot carry reads the same
export function pureEntryTarget(entry) {
  const family = entryToGlobalHint(entry);
  if (family !== null) return { global: family, member: null };
  const segments = typeof entry === 'string' ? entry.split('/') : [];
  const global = segments.length < 2 ? null : entryToGlobalHint(segments.at(-2));
  return global === null ? null : { global, member: staticMemberFromEntrySegment(global, segments.at(-1)) };
}

// the name this build mints for a pure import of a static (`_Array$from`, `_Array$from2`)
export const MINTED_STATIC_NAME = /^_+(?<global>[A-Z]\w*)\$(?<member>\w+)$/u;

// the static a minted pure import carries (`_Array$from` from `actual/array/from`) - `{ global, member }` -
// or null. the binding's own source answers, so a user binding wearing the shape decides nothing, and only
// a name of that shape is looked up: every identifier a selection reads asks this, a const alias chain
// at each of its levels
function pureImportedStatic(node, ctx) {
  const source = node?.type === 'Identifier' && MINTED_STATIC_NAME.test(node.name)
    ? ctx.adapter?.getBinding?.({ scope: ctx.scope, name: node.name, path: ctx.path })?.importSource
    : null;
  const target = source ? pureEntryTarget(pureImportSourceEntry(source)) : null;
  return target?.member ? target : null;
}

// is the binding `name` declared through a pattern slot whose value is not ONE certain node: what
// the certain-init canon declines - several values, a default, a slot the runtime may fill from a
// spread the pairing cannot enumerate (`const [, O] = [...xs, Array]`, `{ 1: O } = [...xs,
// Array]`), a slot of a container the file wrote (`patternSlotWritten`) - or a lone value
// whose arms branch (`[A] = [c ? Array : Map]`)? such a declarator
// resolves its primary only as a MAYBE, or not at all, and every consumer that would read it as
// certain (the instance-free proof, the constructor candidates of an unresolved receiver, a decided
// selection's left) asks this one question
export function patternBoundSlotOpen({ binding, name, scope, adapter, path }) {
  const declarator = bindingDeclaratorNode(binding);
  if (declarator?.type !== 'VariableDeclarator' || declarator.id?.type === 'Identifier' || !declarator.init) return false;
  const declScope = aliasDeclScope(binding, scope);
  const ctx = { scope: declScope, adapter, path, resolveKey };
  // a CALL init pairs through the call canon's literal, which is then the init the certainty canon reads
  const called = callInitSlotValues({
    pattern: declarator.id, init: declarator.init, name, scope: declScope, adapter, path, resolveKey,
  });
  if (called && !called.complete) return true;
  if (patternSlotWritten({ pattern: declarator.id, init: declarator.init, name, ctx })) return true;
  const certain = patternBoundAliasSlotInit(binding, name, called ? called.ctx : ctx, called ? { init: called.literal } : {});
  return !certain || flattenBranchingValueNodes([certain]).length > 1;
}

// does a read through `node` go through a name written beyond its declarator where the write may reach the
// read - the name itself, or one a const alias of it holds (`reassignmentReachesUsage`) - or through a name a
// pattern binds to a slot holding no one certain value (`patternBoundSlotOpen`: `o.C = null; const { C: M } =
// o`), or through a hoisted `var` whose initializer may not have run by the read, which holds `undefined` there
// (`varInitDominatesUsage`, the gate a reader dropping the read asks)? such a name holds no one value there,
// whatever usage-global resolves it may hold for its injection. each name is looked up where the one before it
// was declared, and a pattern hands on the container it reads
export function readsReachedAlias(node, ctx) {
  let usageNode = node;
  let { scope } = ctx;
  for (let root = runtimeChainRoot(node), seen = new Set(); root?.type === 'Identifier' && !seen.has(root.name);) {
    seen.add(root.name);
    const binding = ctx.adapter?.getBinding?.({ scope, name: root.name, path: ctx.path, read: root });
    if (!binding) return false;
    if (isReassignedBeyondDeclarator(binding)
      && reassignmentReachesUsage({ binding, adapter: ctx.adapter, path: ctx.path, usageNode })) return true;
    if (patternBoundSlotOpen({ binding, name: root.name, scope, adapter: ctx.adapter, path: ctx.path })) return true;
    const declarator = bindingDeclaratorNode(binding);
    if (binding.kind === 'var' && declarator?.type === 'VariableDeclarator' && declarator.init && !varInitDominatesUsage({
      declaratorNode: declarator, usagePath: ctx.path, usageNode, kind: 'var', adapter: ctx.adapter,
    })) return true;
    usageNode = declarator?.type === 'VariableDeclarator' ? declarator.init : null;
    scope = aliasDeclScope(binding, scope);
    root = usageNode && runtimeChainRoot(unwrapRuntimeExpr(usageNode));
  }
  return false;
}

// a read of a global or of a static off one that is a DEFINED value wherever this build runs: one
// core-js implements that the build backs (the adapter's `served`, given the read's meta: `{ substituted }`
// or null) or a global it extends in place on every engine's own, and replaced by no write the census
// sees - in either method: usage-global asks the cheap shape census (`isMutatedStaticSlot`), which may
// name a slot the scoped pass would clear and then decides nothing. `{ global, type, substituted }` - the
// global's name for a global read (the root resolver names constructors, namespaces and the realm alone),
// and the `typeof` the read answers where it is known (`staticMethodType` for a static) - or null
export function servedRead(node, ctx) {
  // a read the user opted out of is not rewritten, so nothing of this build serves it
  if (ctx.adapter?.isOptedOut?.(node)) return null;
  const value = peelChainRootValue(peelSequenceTail(unwrapRuntimeExpr(node), { step: unwrapRuntimeExpr }));
  // the read is the use an alias it goes through must reach, wherever `ctx.path` anchors the ask (a guard
  // settled in its owner's scope: `decidedGuards`)
  const readCtx = ctx.usageNode ? ctx : { ...ctx, usageNode: value };
  const name = resolveObjectName({ objectNode: value, ...readCtx });
  // Serving the defined branch does not fill an alias's stored void branch. A
  // presence test still reads that binding, including after its guard was lowered.
  if (name && value?.type === 'Identifier'
    && aliasHeldValueCanBeUndefined(value, resolveBuiltInMeta, readCtx)) return null;
  // ... a read before every write of the slot excepted, which still sees what this build serves, and a read
  // of this build's own import, which no write of the global reaches. an alias read the global where it
  // captured it, so that read is the one asked - its use only re-reads the binding - and the alias is
  // followed only over a slot a write may replace at all, which the answer without a read bounds
  if (name && ctx.adapter?.isMutatedStaticSlot?.('globalThis', name)) {
    const captured = value?.type === 'Identifier' && ctx.adapter.hasBinding?.({ scope: ctx.scope, name: value.name, path: ctx.path })
      ? followConstIdentifierInit({ node: value, readNode: null, ctx }) : { node: value, ctx };
    const read = captured.node;
    if (ctx.adapter.isMutatedStaticSlot('globalThis', name, ctx.path && { node: read, path: ctx.path })
      && !(read?.type === 'Identifier' && ctx.adapter.getBinding?.({
        scope: captured.ctx.scope,
        name: read.name,
        path: ctx.path,
      })?.polyfillHint)) return null;
  }
  // ... and a static read off its global, the read before every write of either slot excepted, or through
  // this build's pure import of it (`_Array$from`), which no write of the slot reaches either
  const imported = name ? null : pureImportedStatic(value, ctx);
  const object = imported?.global
    ?? (!name && isMemberAccessNode(value) ? resolveObjectName({ objectNode: value.object, ...readCtx }) : null);
  const key = imported?.member ?? (object && staticMemberKeyName(value));
  if (!name && !key) return null;
  const backing = name ? servedBacking({ kind: 'global', name }, ctx, ctx.path && { node: value, path: ctx.path })
    : servedStaticBacking({ object, key, read: value, ctx, imported: !!imported });
  // ... and only what the read always holds: usage-global resolves an alias by what it may hold
  if (!backing || (ctx.adapter?.method === 'usage-global' && readsReachedAlias(value, ctx))) return null;
  const type = name ? KNOWN_FUNCTION_GLOBALS.has(name) ? 'function' : 'object' : staticMethodType(object, key);
  return { global: name, type, substituted: backing.substituted };
}

// what backs the static `key` of the global `object` a `read` (a node) reads, the read before every write of
// either slot excepted - `{ substituted }` or null. `imported`: the read is this build's own pure import of
// it, which no write reaches
export function servedStaticBacking({ object, key, read, ctx, imported = false }) {
  const staticRead = ctx.path && { node: read, path: ctx.path };
  if (!imported && (ctx.adapter?.isMutatedStaticSlot?.('globalThis', object, staticRead)
    || ctx.adapter?.isMutatedStaticSlot?.(object, key, staticRead))) return null;
  return servedBacking({ kind: 'property', object, key, placement: 'static' }, ctx, staticRead);
}

// what backs a global or static `meta` in this build - `{ substituted }` or null. only the read's own
// definition backs it, and only a pure one: `resolve` answers a static with none from the instance
// methods of its key (`Map.keys`), which back no static, and a definition of the global flavor alone may
// list only what a use of it needs (`Float16Array` - the typed-array methods). a global with no pure
// flavor - no definition at all, or a global module patching the engine's own (`Number`) - is backed by
// the engine where core-js extends it in place (`NATIVE_STATIC_OWNERS`). the adapter is asked with the
// `read` (`{ node, path }`) itself, wherever `path` anchors the ask: a guard settled in its owner's scope reads
// its test where the test stands
function servedBacking(meta, { adapter, path }, read) {
  const definition = resolveBuiltInMeta(meta);
  return definition?.desc?.pure ? definition.kind !== 'instance' && adapter?.served?.(meta, path, read)
    : meta.kind === 'global' && NATIVE_STATIC_OWNERS.has(meta.name) && !!adapter?.served && { substituted: false };
}

// ... and a prototype method read off a served constructor (`Promise.prototype.finally`), a function wherever this
// build runs where core-js implements it the way pure serves it (`implementsPrototypeMethod`): carried on the
// prototype of the constructor pure substitutes, or dispatched off a native one - and where no write the census
// sees replaces the method or the prototype. `{ global: null, type: 'function', substituted: true }` or null
function servedPrototypeRead(node, ctx) {
  const value = unwrapRuntimeExpr(node);
  const prototype = isMemberAccessNode(value) && !value.optional ? unwrapRuntimeExpr(value.object) : null;
  const key = prototype && staticMemberKeyName(value);
  if (!key || !isPrototypeRead(prototype)) return null;
  return servedPrototypeMethod({ constructorNode: prototype.object, key, read: value, ctx });
}

// is `node` a plain `<constructor>.prototype` read
function isPrototypeRead(node) {
  return isMemberAccessNode(node) && !node.optional && staticMemberKeyName(node) === 'prototype';
}

// the prototype method `key` of the constructor `constructorNode` reads, as a `read` (a node) at its position reads it
function servedPrototypeMethod({ constructorNode, key, read, ctx }) {
  const owner = servedRead(constructorNode, ctx);
  if (!owner?.global || !implementsPrototypeMethod(owner.global, key, owner.substituted ? 'carried' : 'dispatched')) return null;
  const at = ctx.path && { node: read, path: ctx.path };
  if (ctx.adapter?.isMutatedStaticSlot?.(`${ owner.global }.prototype`, key, at)
    || ctx.adapter?.isMutatedStaticSlot?.(owner.global, 'prototype', at)) return null;
  return { global: null, type: 'function', substituted: true };
}

const EQUALITY_OPERATORS = new Set(['==', '===', '!=', '!==']);

// a read a presence test can be dropped with: a name, or a plain member chain off one - no call, no
// `?.` that may yield nothing, and no hop through an environment probe (`window`, `global`) a host may
// lack, save one pure respells away with the read (`droppableServedRead`)
function droppablePresenceRead(node) {
  let current = unwrapRuntimeExpr(node);
  let probes = false;
  while (isMemberAccessNode(current)) {
    const key = staticMemberKeyName(current);
    if (current.optional || key === null) return false;
    probes ||= POSSIBLE_GLOBAL_OBJECTS.has(key) && !guaranteedRealmObjectName(key);
    current = unwrapRuntimeExpr(current.object);
  }
  if (current?.type !== 'Identifier') return false;
  return probes || (POSSIBLE_GLOBAL_OBJECTS.has(current.name) && !guaranteedRealmObjectName(current.name)) ? 'probe' : true;
}

// ... the served read of such a test, or null where the fold may not drop it: an environment probe stays
// only where pure respells the whole read to its import (`substituted`), which runs no probe either way. a
// prototype method of a served constructor reads as one (`servedPrototypeRead`)
function droppableServedRead(node, ctx) {
  const droppable = droppablePresenceRead(node);
  const read = droppable ? presenceReadServed(node, ctx) ?? servedPrototypeRead(node, ctx) : null;
  return read && (droppable !== 'probe' || read.substituted) ? read : null;
}

// a presence test's own read resolves with no selection decided or walked below it (`presenceDecision`,
// the realm-selection walk of `resolveObjectName`): an alias testing the one before it (`const b = typeof
// a !== 'undefined' ? a : 0`) would otherwise resolve each level twice - in its test and through its live
// operand - doubling the walk per level of the chain
let presenceTestDepth = 0;
// ... save the receiver of a STATIC an outermost test reads (`presenceReadServed`): the alias it reads off
// may stand on a selection the build decides (`var r = typeof Symbol == 'function' ? Symbol : {};
// r.iterator || '@@iterator'`), named through that alias's live operand - one level, never relieved again
// below it, so a chain of aliases still resolves each level once
let staticReceiverRelief = false;

// what a PRESENCE test always answers in this build - `typeof X === 'function'` / `!== 'undefined'`
// over a global, a static method or a prototype method (either operand order, loose or strict), a global, a
// static or a prototype method read as a truth value, an `in` test of a key one of them serves, `!` of any, and
// a `||` / `&&` / `??` of such tests - `{ value, substituted, boolean }`, or null where it may answer both ways.
// `boolean`: the test evaluates to `value` itself; a read is only truthy, its value the object it reads. the
// read is one the fold may drop (`droppableServedRead`); a static's typeof is asked of the catalogue
// (`staticMethodType`): a constant may be a symbol an engine core-js polyfills answers apart
function presenceTestValue(test, ctx) {
  // asked from the root of the selection spine the test stands on (`canonContextPath`), and an outermost test
  // keeps the answers of its `||` / `&&` / `??` levels where a question scope is open, none while a guard is
  // being settled (`guardSettlingInFlight`)
  const spineCtx = { ...ctx, path: canonContextPath(ctx.path) };
  const answers = presenceTestDepth || guardSettlingInFlight() ? null
    : canonAnswerTable(presenceTestAnswer, [spineCtx.scope, spineCtx.adapter, spineCtx.path]);
  presenceTestDepth++;
  try {
    return withPresenceReadQuestion(() => presenceTestAnswer(test, spineCtx, answers));
  } finally {
    presenceTestDepth--;
  }
}

// the answer itself, asked through `presenceTestValue`, which bounds the walk below it. the node's type is read
// once: a level of a long selection is asked again from each level above it
function presenceTestAnswer(test, ctx, answers = null) {
  const node = unwrapRuntimeExpr(test);
  if (answers?.has(node)) return answers.get(node);
  const type = node?.type;
  if (type === 'LogicalExpression') return logicalPresenceAnswer(node, ctx, answers);
  if (type === 'UnaryExpression' && node.operator === '!') {
    const inner = presenceTestAnswer(node.argument, ctx, answers);
    return inner && { value: !inner.value, substituted: inner.substituted, boolean: true };
  }
  if (type === 'BinaryExpression') {
    if (node.operator === 'in') return presenceInAnswer(node, ctx);
    return EQUALITY_OPERATORS.has(node.operator) ? presenceTypeofAnswer(node, ctx) : null;
  }
  const read = droppableServedRead(node, ctx);
  return read && { value: true, substituted: read.substituted, boolean: false };
}

// ... a `typeof` of a served read against the string it always answers, either operand order
function presenceTypeofAnswer(node, ctx) {
  const left = unwrapRuntimeExpr(node.left);
  const typeofLeft = left?.type === 'UnaryExpression' && left.operator === 'typeof';
  const probe = typeofLeft ? left : unwrapRuntimeExpr(node.right);
  if (probe?.type !== 'UnaryExpression' || probe.operator !== 'typeof') return null;
  const expected = extractStaticString(typeofLeft ? node.right : node.left, null);
  const read = typeof expected === 'string' ? droppableServedRead(probe.argument, ctx) : null;
  if (!read?.type) return null;
  const equal = read.type === expected;
  return { value: node.operator.startsWith('=') ? equal : !equal, substituted: read.substituted, boolean: true };
}

// ... a `||` / `&&` / `??` answers by its operands: the left where it settles the operator, the right where the
// left lets it run - no answer is nullish, so a `??` never runs its right. kept per level (`answers`) from a walk
// that cut nothing (`cycleGuardCuts`): each level of a long chain is asked the levels below it
function logicalPresenceAnswer(node, ctx, answers) {
  const cuts = cycleGuardCuts();
  const left = presenceTestAnswer(node.left, ctx, answers);
  const truthy = left && (!left.boolean || left.value);
  const settled = left && (node.operator === '&&' ? !truthy : node.operator !== '||' || truthy);
  const right = left && !settled ? presenceTestAnswer(node.right, ctx, answers) : null;
  const answer = settled ? left : right && { ...right, substituted: left.substituted || right.substituted };
  if (answers && cycleGuardCuts() === cuts) answers.set(node, answer);
  return answer;
}

// ... an `in` test of a static key on a served global (`'allSettled' in Promise`), true where the build serves the
// static - pure reads it off the namespace a constructor tested by key resolves to - or of a method key on its
// prototype, true where a read of the method would be (`'finally' in Promise.prototype`)
function presenceInAnswer(node, ctx) {
  const key = extractStaticString(node.left, null);
  const receiver = unwrapRuntimeExpr(node.right);
  if (typeof key !== 'string' || !droppablePresenceRead(receiver)) return null;
  const owner = presenceReadServed(receiver, ctx);
  if (owner?.global) {
    const backing = servedStaticBacking({ object: owner.global, key, read: receiver, ctx });
    return backing && { value: true, substituted: owner.substituted || backing.substituted, boolean: true };
  }
  const method = isPrototypeRead(receiver)
    && servedPrototypeMethod({ constructorNode: unwrapRuntimeExpr(receiver.object), key, read: receiver, ctx });
  return method ? { value: true, substituted: method.substituted, boolean: true } : null;
}

// a presence test's read as this build serves it (`servedRead`) - a static read of an outermost test with its
// receiver resolved as outside the test (`staticReceiverRelief`)
function presenceReadServed(node, ctx) {
  if (staticReceiverRelief || presenceTestDepth !== 1 || !isMemberAccessNode(unwrapRuntimeExpr(node))) return servedRead(node, ctx);
  staticReceiverRelief = true;
  presenceTestDepth--;
  try {
    return servedRead(node, ctx);
  } finally {
    presenceTestDepth++;
    staticReceiverRelief = false;
  }
}

// ... and a question asked afresh from inside such a read: a guard's settling (`decidedGuards`) decides its host
// as an outermost test of its own, so the test whose read reached the settling neither refuses that host nor
// lends it its relief - whoever asks, a guard takes one arm
export function withFreshPresenceQuestion(question) {
  const depth = presenceTestDepth;
  const relief = staticReceiverRelief;
  presenceTestDepth = 0;
  staticReceiverRelief = false;
  try {
    return question();
  } finally {
    presenceTestDepth = depth;
    staticReceiverRelief = relief;
  }
}

// what a PRESENCE test decides of the selection it guards - a conditional or an `if` over it, an `&&` /
// `||` / `??` with it on the left (`presenceTestValue`): `{ skip, fold, substituted }` - the operand key that
// never runs, what the selection yields, and whether pure respells the read deciding it - or null where
// the test may answer both ways. `decidedSelection` adds the decided `||` / `??` left to it
export function presenceDecision(node, ctx) {
  if (presenceTestDepth) return null;
  const testField = SELECTION_TEST_FIELDS[node?.type];
  if (!testField) return null;
  const answer = presenceTestValue(node[testField], ctx);
  if (!answer) return null;
  const { value, substituted, boolean } = answer;
  if (node.type !== 'LogicalExpression') {
    return { skip: value ? 'alternate' : 'consequent', fold: value ? 'consequent' : 'alternate', substituted };
  }
  // the operand an `&&` / `||` / `??` yields: its right where the test lets it run, else the test itself -
  // the literal a `typeof` or `!` test always is, the object a read is (`Array.from || shim`); no answer
  // is nullish, so a `??` never runs its right
  const runsRight = node.operator === '&&' ? value : node.operator === '||' && !value;
  return { skip: runsRight ? null : 'right', fold: runsRight ? 'right' : boolean ? value : 'left', substituted };
}

// the decision the value canon reads off a user selection: the build's own (the adapter's
// `decidedSelection`), the presence test alone where no adapter carries it, and none below a presence
// test's own read (`presenceTestDepth`)
function valueCanonDecision(node, ctx) {
  return presenceTestDepth ? null : (ctx.adapter?.decidedSelection ?? presenceDecision)(node, ctx);
}

// the value a selection IS in this build where the build decides it, level after level: the part of
// each decided level that runs (`decidedLiveOperand`), the node itself where nothing is decided - a level
// yielding its test's own answer is that test, never the operand it skips. the value identity of an alias,
// a receiver and a realm selection reads a decided selection as that operand alone
export function decidedSelectionValue(node, ctx) {
  let current = node;
  for (let operand = decidedLiveOperand(current, ctx); operand; operand = decidedLiveOperand(current, ctx)) {
    current = peelChainRootValue(operand);
  }
  return current;
}

// ... one level of it: the part of a decided selection that ever runs, for a walk over its arms: the
// operand it yields, or its test where it yields the test's own answer (`typeof X === 'undefined' && 'a'`
// is `false`, its right never runs) - null where the build decides nothing. a computed-key walk steps
// through it like an alias hop and normalizes the operand itself
export function decidedLiveOperand(node, ctx) {
  const key = decidedLiveOperandKey(node, ctx);
  return key ? node[key] : null;
}

// ... and the one a computed key's `||` / `??` always yields where only the key walk sees why: a left the
// walk proves the well-known symbol the build serves - always truthy - through what it alone follows (an
// alias of a decided selection, `REAL || '@@iterator'`; a static read off a decided realm selection,
// `$Symbol.iterator || '@@iterator'`; a static this file already substituted). the left as written, or null.
// an undecided ternary whose arms name one key, provenance included, yields it whichever runs
// (`c ? 'at' : 'at'`) - the key twin of `agreeingTernaryArm`
function decidedKeyOperand(node, { scope, adapter, path, seen, depth }) {
  const operand = decidedLiveOperand(node, { scope, adapter, path });
  if (!operand && node?.type === 'ConditionalExpression') return agreeingKeyArm(node, { scope, adapter, path, seen, depth });
  if (operand || node?.type !== 'LogicalExpression' || node.operator === '&&') return operand;
  const key = resolveKey({ node: node.left, computed: true, scope, adapter, seen, path, depth: depth + 1 });
  const member = typeof key === 'string' && key.startsWith('Symbol.') ? key.slice('Symbol.'.length) : null;
  return member && !adapter.isMutatedStaticSlot?.('Symbol', member)
    && servedBacking({ kind: 'property', object: 'Symbol', key: member, placement: 'static' }, { adapter, path })
    && isSymbolSourcedKey({ node: node.left, scope, adapter, seen, path, depth: depth + 1 }) ? node.left : null;
}

// ... the agreeing arm itself: the consequent where both arms fold to one key and agree on whether it is
// a well-known symbol's, or null
function agreeingKeyArm(node, { scope, adapter, path, seen, depth }) {
  const ctx = { computed: true, scope, adapter, path, seen, depth: depth + 1 };
  const key = resolveKey({ node: node.consequent, ...ctx });
  if (key === null || key !== resolveKey({ node: node.alternate, ...ctx })) return null;
  const symbolCtx = { scope, adapter, seen, path, depth: depth + 1 };
  return isSymbolSourcedKey({ node: node.consequent, ...symbolCtx }) === isSymbolSourcedKey({ node: node.alternate, ...symbolCtx })
    ? node.consequent : null;
}

// the key the part of a decided selection that ever runs stands at (`decidedLiveOperand` reads through it), for
// a walker holding a path to the selection rather than its node - null where the build decides nothing
export function decidedLiveOperandKey(node, ctx) {
  const decided = valueCanonDecision(node, ctx);
  if (typeof decided?.fold === 'string') return decided.fold;
  return decided?.skip === 'right' ? 'left' : null;
}

// the part of a value that runs, through every ternary and `&&` the build decides, as written: what a discard
// of the value owes is that part's - a decided test is a plain read, and the rest never runs. a `||` / `??` its
// left decides answers through its own rescue (`decidingFallbackLeft`), which follows the left's harvest
// rather than its spelling
export function decidedRunningPart(node, ctx) {
  for (let core = unwrapRuntimeExpr(node); core?.type === 'ConditionalExpression'
    || (core?.type === 'LogicalExpression' && core.operator === '&&'); core = unwrapRuntimeExpr(node)) {
    const live = decidedLiveOperand(core, ctx);
    if (!live) break;
    node = live;
  }
  return node;
}

// ... and the path of that part, transparent wrappers stepped through, for a walker holding a path to the
// value (both legs' path API): what a render replacing the value replaces
export function decidedRunningPath(path, adapter) {
  let current = peelTransparentWrapperPath(path);
  while (current?.node?.type === 'ConditionalExpression'
    || (current?.node?.type === 'LogicalExpression' && current.node.operator === '&&')) {
    const key = decidedLiveOperandKey(current.node, { scope: current.scope, adapter, path: current });
    if (!key) break;
    current = peelTransparentWrapperPath(current.get(key));
  }
  return current;
}

// how a realm SELECTION leaf reads the realm: `surface` where its value is the realm object on every
// host - `globalThis` by the language, `self` by its own ponyfill, and a hop of either read off one
// of them - `probe` where the leaf names that same realm but only WHERE THE HOST SPELLS IT: a proxy
// hop pure cannot back (`globalThis.window`) and the BARE name of one (`window`, `global`) alike.
// the two spellings answer alike because the proxy globals ARE one object: where `window` resolves
// it IS the realm, so a selection over it names the realm and the polyfill belongs on both of its
// arms. Accepted price, and the only one: a bare name the realm does not spell reads as absent here
// where the language throws a ReferenceError, so the selection the author wrote as a fallback takes
// that fallback instead of throwing - the divergence a READ takes, the same one a `window` HOP
// already takes. A SHADOWED name is not this question at all: `function f(self)` and `const window =
// {}` bind the user's own object, which the root resolver answers through the binding, so a caller
// that brings its scope gets the user's value left alone. null for everything else. `adapter` adds
// the pristine-slot half for a caller that DECIDES on the answer; the peel below leaves it off by
// its own convention, handing a mutated spelling to the identifier checks downstream. a MINTED root
// (`_globalThis`, after the walk swapped the name for its ponyfill) names its realm through the
// injector hint, so a caller asking after the rewrite reads the same answer as one asking before.
// a deeper chain answers null - the multihop canon speaks for those
export function realmSelectionLeafKind(node, { adapter = null, injectorState = null, scope = null, path = null } = {}) {
  // a prefix READ an accessor answers is no dead comma: the leaf is then the sequence, which names no realm
  const core = unwrapTransparentSeq(node, { scope, adapter, path });
  const member = core?.type === 'MemberExpression' || core?.type === 'OptionalMemberExpression';
  const hop = member && !core.optional ? realmHopKeyName(core) : null;
  if (member && !hop) return null;
  const root = unwrapTransparentSeq(member ? core.object : core, { scope, adapter, path });
  if (root?.type !== 'Identifier') return null;
  const rootName = proxyGlobalRootName({ node: root, scope, adapter, path })
    ?? injectorState?.getPureImport?.(root.name)?.hint;
  if (!POSSIBLE_GLOBAL_OBJECTS.has(rootName)
    || (adapter && !isPristineProxyGlobal(adapter, rootName))) return null;
  if (!member) return guaranteedRealmObjectName(rootName) ? 'surface' : 'probe';
  if (!POSSIBLE_GLOBAL_OBJECTS.has(hop) || (adapter && !isPristineProxyGlobal(adapter, hop))) return null;
  return guaranteedRealmObjectName(hop) ? 'surface' : 'probe';
}

// the operand a value-SELECTING receiver always yields the REALM through, or null where some value it
// can yield is not the realm. one answer for both legs' mirror-or-flatten decision: a selection every
// value of which IS the realm has no branch worth swapping, so the flatten binds the polyfill to that
// operand and the whole selection drops. a `??` / `||` LEFT that names the realm decides it and kills
// the right (the bare-name half `peelRealmLogicalDefault` walks below); a left that can only VANISH
// hands on to the RIGHT instead, and a right proving the realm proves the selection whichever host
// runs it. a ternary keeps both arms and owes a pure test; `&&` keeps its FALSY left, which no realm
// name can be, so its guarded path stays exactly as the source wrote it
export function realmSelectionCollapseOperand(node, ctx) {
  return withCanonQuestion(() => {
    let core = unwrapTransparentSeq(node, ctx);
    // a level the build decides is the operand it always takes (`valueCanonDecision`); the operand stays
    // as written, its own effects included, since the collapse puts it where the selection stood
    for (let decided = valueCanonDecision(core, ctx); typeof decided?.fold === 'string'; decided = valueCanonDecision(core, ctx)) {
      core = unwrapTransparentSeq(core[decided.fold], ctx);
    }
    if (core?.type === 'ConditionalExpression') {
      if (mayHaveSideEffects(core.test, ctx)) return null;
      const consequent = realmSelectionCollapseOperand(core.consequent, ctx);
      return consequent && realmSelectionCollapseOperand(core.alternate, ctx) ? consequent : null;
    }
    if (core?.type === 'LogicalExpression') {
      if (core.operator === '&&') return null;
      return realmSelectionCollapseOperand(core.left, ctx)
        ?? (realmSelectionLeafKind(core.left, ctx) === 'probe'
          ? realmSelectionCollapseOperand(core.right, ctx) : null);
    }
    return realmSelectionLeafKind(core, ctx) === 'surface' ? core : null;
  });
}

// does this selection put a realm PROBE on the arm its own test decides? that arm yields the realm
// wherever the host spells the probe's name, so the mirror owes it a literal - and the shared plan is
// the only route that renders one, re-spelling the selection as a null test on the probe's own read.
// both bindings ask it in the same words, ahead of their own per-branch swap: left to their bespoke
// mirrors the arm stays raw on whichever leg happens to own the shape, and a browser reads the realm
export function realmProbeArmSelection(node, ctx) {
  const core = unwrapTransparentSeq(node);
  // a TEST-selected arm answers the same: what decides the arm is the test, so the probe rides the
  // null test on its own read and the literal takes the branch it leaves. asked of BOTH arms - the
  // one a browser takes is the probe's, and left raw there the pattern reads the realm's own member.
  // only where the arms DISAGREE about definability: arms that agree have one value whichever branch
  // runs, so the whole selection collapses onto it and spells the probe read it owes there
  if (core?.type === 'ConditionalExpression') {
    const arms = [core.consequent, core.alternate]
      .map(arm => realmSelectionLeafKind(unwrapTransparentSeq(arm), ctx));
    return arms.includes('probe') && arms.some(kind => kind !== 'probe');
  }
  if (core?.type !== 'LogicalExpression' || core.operator === '&&') return false;
  return realmSelectionLeafKind(core.left, ctx) === 'probe';
}

// the SITES a destructure host offers the collapse above, as `{ container, key, init, operand }`:
// the host's own init slot and, where that init is an array WRAPPER, each element paired with a
// pattern element. empty where the host is not a destructure, gathers a rest, or the method only
// reads. both bindings walk the list and do their own swap - the answer is one, the surgery theirs
export function realmSelectingHostCollapses(hostNode, ctx) {
  const slot = hostNode?.type === 'VariableDeclarator' ? 'init'
    : hostNode?.type === 'AssignmentExpression' && hostNode.operator === '=' ? 'right' : null;
  if (!slot) return [];
  // a DESTRUCTURE host only - the pattern is what reads the selection's value member by member, and
  // what every route below needs a plain receiver for. a plain binding holds the selection's value
  // whole, where nothing has to name it
  const target = hostNode.type === 'VariableDeclarator' ? hostNode.id : hostNode.left;
  if (target?.type !== 'ObjectPattern' && target?.type !== 'ArrayPattern') return [];
  // ... and not one gathering a REST: that is where pure stops extracting at the level, so the
  // collapse enables nothing, and only a leg walking every host rather than every claim would
  // perform it - the two would then spell one host two ways for no gain
  if (target.type === 'ObjectPattern' && target.properties.some(isRestProperty)) return [];
  // the REWRITING method only: `usage-global` prints the source verbatim and answers with imports
  // alone, so a host rewrite there would edit code that method promises not to touch
  if (ctx?.adapter?.method !== 'usage-pure') return [];
  const sites = [];
  function consider(container, key) {
    const init = container[key];
    if (init?.type !== 'LogicalExpression' && init?.type !== 'ConditionalExpression') return;
    const operand = realmSelectionCollapseOperand(init, ctx);
    if (operand && operand !== init) sites.push({ container, key, init, operand });
  }
  consider(hostNode, slot);
  // an ARRAY WRAPPER pairs each of its elements with the pattern's own, so a selection standing in
  // one IS that element's receiver and reads exactly as a bare host init would
  const value = hostNode[slot];
  if (value?.type === 'ArrayExpression') {
    value.elements.forEach((element, at) => { if (element) consider(value.elements, at); });
  }
  return sites;
}

// the chain-root peel plus one more carrier only this walk may read through: a `??` / `||` over
// a guaranteed realm name ITSELF yields that left operand - the binding is guaranteed (by the
// language for `globalThis`, by the ponyfill entry for `self`) and an object is neither nullish
// nor falsy, so the defensive right side is dead code
// (`(globalThis ?? {}).Number.MAX_SAFE_INTEGER` reads the realm's static and owes its polyfill).
// the NAME is the gate: `window` / `global` are the environment probes this codebase guards, and a
// navigation that can short-circuit makes the right side live. the walk descends nested defaults
// (`((self ?? {}) ?? {})`) - the same guarantee kills the right side at every level - and hands
// back the UNTOUCHED core when the innermost left proves nothing
// `discarding`: the caller DROPS what it peels (a consume that reads the answer in place of the
// slot), so a prefix or a write buried under the default would go with it - that mode reads through
// transparent wrappers only, and a left that hides a sequence or an assignment stays unpeeled. the
// default mode classifies: the source text stays, and the emit side harvests those effects itself
export function peelRealmLogicalDefault(node, { discarding = false } = {}) {
  const peelRoot = discarding ? unwrapRuntimeExpr : peelChainRootValue;
  const core = peelRoot(node);
  let current = core;
  while (current?.type === 'LogicalExpression' && (current.operator === '??' || current.operator === '||')) {
    const left = peelRoot(current.left);
    if (left?.type === 'Identifier' && guaranteedRealmObjectName(left.name)) return left;
    // ... and a left that can only VANISH - the ENVIRONMENT PROBE, a proxy hop pure cannot back read
    // off a realm name - hands the selection on to its RIGHT, so a right naming the realm names the
    // whole selection (`globalThis.window ?? globalThis` IS the realm off-window and on it alike)
    if (realmSelectionLeafKind(left) === 'probe') {
      const fallback = peelRealmLogicalDefault(current.right, { discarding });
      if (fallback?.type === 'Identifier' && guaranteedRealmObjectName(fallback.name)) return fallback;
    }
    current = left;
  }
  return core;
}

// Global detection keeps member trees intact. Cache only their dotted proxy segments, never
// a scope-, read- or mutation-dependent verdict. Each prefix shares its terminal node and a
// bounded set of hop names; computed keys and value wrappers stay with the ordinary resolver.
// The usage handler owns this per-traversal weak index. Like other source-shape indexes, it
// assumes sibling plugins do not mutate an already indexed subtree during the same traversal.
// Pure detection rewrites these trees and must not use the index: it walks the run below every member
// again, which costs only at a run depth no source spells.
function plainProxySegment(node, cache) {
  const pending = [];
  let segment;
  while (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
    segment = cache.get(node);
    if (segment) break;
    if (node.computed) break;
    const name = memberKeyName(node);
    if (!POSSIBLE_GLOBAL_OBJECTS.has(name)) break;
    pending.push({ node, name });
    node = node.object;
  }
  if (!pending.length) return segment;
  segment ??= { tail: node, names: [] };
  for (let i = pending.length - 1; i >= 0; i--) {
    const { node: member, name } = pending[i];
    if (!segment.names.includes(name)) segment = { tail: segment.tail, names: [...segment.names, name] };
    cache.set(member, segment);
  }
  return segment;
}

function resolveProxyGlobalRoot({ receiver, scope, adapter, seen, path, usageNode = null, resolveStaticKey = null,
  proxySegments = null }) {
  while (true) {
    // peel chain-assign AND SE-tail to fixpoint at every step: `((a = globalThis).Array).from(x)`
    // buries the assignment inside .object's .object, and `(eff(), globalThis).Map.groupBy` buries the
    // proxy root behind a sequence tail - a flat unwrapTransparentSeq loses both. this is pure shape
    // classification: the SE prefix stays in the source and is collected by the emit side
    let obj = peelRealmLogicalDefault(receiver);
    while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
      const segment = proxySegments && plainProxySegment(obj, proxySegments);
      if (segment) {
        if (segment.names.some(name => !isPristineProxyGlobal(adapter, name))) return false;
        obj = peelRealmLogicalDefault(segment.tail);
        continue;
      }
      // carry `seen` into computed-key resolution so a shared alias chain across the
      // proxy-global walk and its intermediate member keys can't exceed the cycle guard
      const memberKey = obj.computed
        ? resolveKey({ node: obj.property, computed: true, scope, adapter, seen, path, usageNode, resolveStaticKey,
          keepsKeyNode: true, bailOnSideEffectKey: adapter?.method === 'usage-pure' })
        : memberKeyName(obj);
      // a mutated hop slot (`window.self = fake`) is the user's replacement, not the global -
      // the chain no longer re-enters the pristine global-object surface.
      // a `.default` hop off a CJS-interop-wrapped pure global-proxy require re-enters it
      // (`X.default.Map.groupBy()`) exactly like the top-level interop read the sibling
      // resolver recognizes - the wrapper below the hop IS the chain's global root then
      if (!memberKey || !isPristineProxyGlobal(adapter, memberKey, path && { node: obj, path })) {
        return memberKey === 'default'
          && !!interopDefaultProxyName({ objectNode: obj.object, scope, adapter, path });
      }
      obj = peelRealmLogicalDefault(obj.object);
    }
    if (obj.type === 'CallExpression' || obj.type === 'OptionalCallExpression') {
      // the callee follow anchors its dominance at the hop's read site, like `resolveObjectName`'s
      // own inline arm: a callee reassigned AFTER an alias captured its yield (`const G = mk().Array;
      // mk = ...`) does not stand the capture down - anchored at the later use it did, and the
      // static went uninjected on both legs
      const inlined = inlineCallReturnExpression({ node: obj, readNode: usageNode, seen, ctx: { scope, adapter, path } });
      if (inlined) {
        // the inlined body re-anchors at the callee's own scope (and the advanced cycle set) -
        // resolving it at the use site let a use-scope shadow capture the body's identifiers
        receiver = inlined.node;
        scope = inlined.ctx.scope;
        seen = inlined.seen;
        continue;
      }
    // top-level `this` roots the chain as the global proxy (pragmatic assumption shared with
    // the type resolver via the same canon)
    } else if (obj.type === 'ThisExpression') return isTopLevelThisContext(path);
    // A constructor reached through a selecting realm receiver still owns statics above it.
    // Ask the same selection proof as the direct receiver so a constructor-only claim cannot
    // strand a later static read on an entry that does not install that method.
    if (obj.type === 'ConditionalExpression' || obj.type === 'LogicalExpression') {
      return isPristineProxyGlobal(adapter, resolveObjectName({
        objectNode: obj, scope, adapter, seen, path, usageNode, resolveStaticKey,
      }), path && { node: obj, path });
    }
    // mutated-root gating (direct name AND alias-resolved) lives inside the recognizer.
    // a binding bound to a bare `require('<pkg>/<mode>/global-this')` holds the global object
    // like the `.default` interop hop above - the injector's own `importStyle: 'require'`
    // output re-parsed by a later pass (the pre+post sandwich) spells its roots exactly so,
    // and an unrecognized root left the mid-chain proxy hops live to re-claim on that pass
    // the READ anchor is the ROOT identifier itself, not the node the caller was classifying: the
    // alias proofs (assignment-hint soundness, the trusted write's span) ask "did the write run
    // before THIS read", and an outer member starts at the `(` - before the write it contains
    // (`(g = globalThis, v = g.window.self).Number`) - so an alias written in the very sequence
    // that reads it stayed unproven, the receiver named nothing, and the claim above it shipped RAW
    return obj.type === 'Identifier'
      && (isProxyGlobalIdentifier({ node: obj, scope, adapter, seen, path, usageNode, readNode: obj })
      || !!requireBoundProxyGlobalName({ node: obj, scope, adapter, path }));
  }
}

// may an extraction WRITE into this destructure target? a target the source spells as a MEMBER is the
// author's own slot, and the ponyfill belongs in it exactly as it belongs in a binding the author
// declares, whatever its root stands for - a served read takes the polyfill wherever its value goes,
// the realm included. an optional link is refused, and so is a root that is neither a plain name nor
// `this` (a call, a sequence) - a paren or a TS assertion, around the target or an object of its chain,
// spells the same slot, and a binding a TS assertion wraps is written as spelled too (`spelledWriteSlot`).
// a COMPUTED link is refused where the extraction would move the write and the key's evaluation with it,
// which a host holding the prop as its sole chain (`hostPattern`, past the props
// an earlier claim took out - `gone`) rules out: the extraction then replaces the whole statement in the
// order the source evaluates it
export function memberTargetTakesExtraction(valueNode, { hostPattern = null, prop = null, gone = null } = {}) {
  // a leaf DEFAULT over a static is dead text either way - the extraction writes the import, which is
  // never undefined - so the slot answers the same peeled as a binding leaf's does
  const target = spelledWriteSlot(valueNode);
  if (!target) return null;
  let root = unwrapRuntimeExpr(target);
  if (root.type === 'Identifier') return target;
  let computed = false;
  while (isMemberAccessNode(root)) {
    if (root.optional) return null;
    computed ||= root.computed;
    root = unwrapRuntimeExpr(root.object);
  }
  if (computed && !(hostPattern && soleChainToProp(hostPattern, prop, gone))) return null;
  return root?.type === 'Identifier' || root?.type === 'ThisExpression' ? target : null;
}

// the slot a static claim's ponyfill may be written into where a literal replays the pattern: a binding,
// or a member target the extraction canon admits. an effectful key keeps its slot in place, and a
// write beside it would split the key from the write it leads
export function staticSlotTakesPonyfill(propNode, ctx) {
  return isIdentifierPropValue(propNode?.value)
    || (!computedKeyHasSideEffects(propNode, ctx) && !!memberTargetTakesExtraction(propNode?.value));
}

// A ternary's arms naming one receiver can share its extraction. A consumer keeping the
// complete selection may retain an effectful test; a consumer dropping it must refuse. A test the
// build always answers (`valueCanonDecision`) leaves its live arm the receiver alone.
export function agreeingTernaryArm(selecting, path, adapter, { preservesEffects = false } = {}) {
  const ctx = { scope: path?.scope, adapter, path };
  if (selecting?.type !== 'ConditionalExpression' || !preservesEffects && mayHaveSideEffects(selecting.test, ctx)) return null;
  const decided = valueCanonDecision(selecting, ctx);
  if (decided) return selecting[decided.fold];
  const left = peelReceiverSequenceTail(selecting.consequent);
  const right = peelReceiverSequenceTail(selecting.alternate);
  const name = resolveObjectName({ objectNode: left, ...ctx });
  return name && name === resolveObjectName({ objectNode: right, ...ctx }) ? selecting.consequent : null;
}

// ... and the `||` / `??` twin: the one global every operand of the chain names, where its LAST operand is
// never nullish - a bare global name, which throws where the engine lacks it, or a read the build serves -
// so whichever operand runs, the value is that global (`globalThis.Int8Array ?? Int8Array`); null otherwise.
// each operand must be a DIRECT read - an unbound name or a member - since an alias or a call walks its own
// chain, and asked at every level of a chain of aliases over each other that walk was exponential; the last
// operand is asked first, so a chain ending in anything else names nothing without a walk of the rest
function agreeingOperandsName(node, ctx) {
  function indirect(read) {
    return read?.type === 'Identifier' ? ctx.adapter.hasBinding({
      scope: ctx.scope,
      name: read.name,
      path: ctx.path,
      read,
    }) : !isMemberAccessNode(read);
  }
  const last = unwrapRuntimeExpr(peelReceiverSequenceTail(node.right));
  if (indirect(last) || (!(last.type === 'Identifier' && isKnownGlobalName(last.name))
    && !servedRead(last, { scope: ctx.scope, adapter: ctx.adapter, path: ctx.path })?.global)) return null;
  const reads = [last];
  let current = unwrapRuntimeExpr(node.left);
  while (current?.type === 'LogicalExpression' && current.operator !== '&&') {
    reads.push(unwrapRuntimeExpr(peelReceiverSequenceTail(current.right)));
    current = unwrapRuntimeExpr(current.left);
  }
  reads.push(unwrapRuntimeExpr(peelReceiverSequenceTail(current)));
  if (reads.some(indirect)) return null;
  let name = null;
  for (const read of reads) {
    const readName = resolveObjectName({ ...ctx, objectNode: read, seen: new Set(ctx.seen) });
    if (!readName || (name && readName !== name)) return null;
    name = readName;
  }
  return name;
}

// the alias walks open now - the object-name walk (`resolveObjectName`), the binding walk
// (`resolveBindingToGlobal`), a hop of the reachable-value union (`reachableAliasValues`) and of the branch
// flatten (`flattenFallbackBranches`), one per link of an alias chain (`var a2 = a1.x`, `var a1 = a0`) - so a
// chain past the alias-chain ceiling (`MAX_KEY_DEPTH`) names nothing more (`cutDeepWalk`) and its reads stay
// raw, instead of exhausting the stack
let aliasWalks = 0;
export function withinAliasWalkBudget(walk, ask) {
  if (aliasWalks >= MAX_KEY_DEPTH) return cutDeepWalk();
  aliasWalks++;
  try {
    return walk(ask);
  } finally {
    aliasWalks--;
  }
}

// the global a receiver node names (`Array` for `globalThis.Array`, an alias of one, a selection the build decides),
// or null: the walk (`objectNameAt`) under the alias-chain budget (`withinAliasWalkBudget`)
export function resolveObjectName(ask) {
  return withinAliasWalkBudget(objectNameAt, ask);
}

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow.
// initialize at entry so the cycle guard accumulates across recursion regardless of whether
// the caller passed one - matches resolveBindingToGlobal's convention
function objectNameAt({
  objectNode, scope, adapter, seen, path, usageNode = null, readNode = null, resolveStaticKey = null,
  proxySegments = null,
}) {
  seen ??= new Set();
  // peel chain-assign rhs + parens to a fixpoint (`(a = Array)`, `(a = b = Array)`,
  // `(a = (b = Array))`, `((a = Array))` all resolve to Array). closes binding-init walks
  // (`const X = (a = Array); X.from(...)`) and IIFE-return walks
  // (`(() => (a = Array))().from(...)`) symmetrically. SE preservation is downstream's
  // problem - resolveObjectName only classifies receiver shape - so a stored value spelled with
  // its own effect prefix classifies by its tail (`(a = (eff(), Array))` names Array: the write
  // is rescued whole where it is discarded, and the prefix rides with it)
  const stored = peelChainAssignment(objectNode);
  objectNode = stored.outer ? peelReceiverSequenceTail(stored.value) : stored.value;
  // the receiver ITSELF spelled as a logical default over the realm: the same rule the proxy-root
  // walk reads for a receiver BELOW it (`peelRealmLogicalDefault`) - a guaranteed realm name is
  // an object, so the defensive right side is dead and `(globalThis ?? {}).Map` names the realm's
  // constructor, at every nesting level (`((self ?? {}) ?? {}).Map` too). without it a ctor claim
  // through this carrier stayed a native read
  for (let left = objectNode; left?.type === 'LogicalExpression'
    && (left.operator === '??' || left.operator === '||');) {
    left = peelChainAssignmentDeep(left.left);
    if (left?.type === 'Identifier' && guaranteedRealmObjectName(left.name)
      && !adapter.hasBinding({ scope, name: left.name, path, read: left })) {
      objectNode = left;
      break;
    }
  }
  // ... and a selection the build decides is the operand its presence test always takes
  // (`decidedSelectionValue`): the dead one never runs, so it names nothing here
  objectNode = decidedSelectionValue(objectNode, { scope, adapter, path, seen });
  // ... and the SELECTING spelling of that same surface (`c ? globalThis : self`): every live branch
  // lands on ONE pristine proxy global, so the receiver names that global whichever branch runs. an
  // effect-bearing TEST or BRANCH prefix is admitted here where the destructure lane refuses it: this
  // render carries the selection on as a harvested effect ahead of the collapsed root, and nothing of
  // it dies. the destructure lane already reads this canon; a member claim asked nothing and left a
  // mutated static's WRITE on the native object while every READ of it went to the ponyfill. a presence
  // test's own read names no selection (`presenceTestDepth`): walked there, every level of a chain of
  // aliases testing the one before walked the rest of the chain again
  if (!presenceTestDepth) {
    while ((objectNode.type === 'ConditionalExpression' || objectNode.type === 'LogicalExpression')
      && allProxySelectingInit(objectNode, {
        adapter,
        injectorState: null,
        allowEffectfulTest: true,
        throughRealmHop: guaranteedRealmObjectName,
        // the selection's own read: a realm name read ahead of every write of its slot is the realm still.
        // no scope - the binding question stays the node-only one this family asks
        path,
        readSurface: value => {
          const leaf = peelChainRootValue(value);
          return proxyRunValueIsProven(leaf, resolveBuiltInMeta, { scope, adapter, seen, path })
            && isPristineProxyGlobal(adapter, resolveObjectName({
              objectNode: leaf, scope, adapter, seen, path, usageNode, readNode, resolveStaticKey,
            }), path && { node: leaf, path });
        },
      })) {
      const selected = firstProxyBranch(objectNode, { truthyAnd: true });
      if (!selected || selected === objectNode) break;
      objectNode = peelChainRootValue(selected);
    }
    // ... and a `||` / `??` whose every operand names one global, its last never nullish: whichever runs,
    // the value is that global, which the selection names without the build deciding its left
    if (objectNode.type === 'LogicalExpression' && objectNode.operator !== '&&') {
      const agreed = agreeingOperandsName(objectNode, { scope, adapter, seen, path, usageNode, readNode, resolveStaticKey });
      if (agreed) return agreed;
    }
  }
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding({ scope, name: objectNode.name, path, read: objectNode })) {
      return resolveBindingToGlobal({ name: objectNode.name, scope, adapter, seen, path, usageNode, readNode, read: objectNode });
    }
    // no binding - global only if starts with uppercase or is a known global proxy.
    // a mutated proxy SLOT (`globalThis.self = fake`) is the user's replacement, not the
    // global - the bare name no longer roots a global surface (the recognizer and the
    // member-tail hop already decline it; this is the binding-less name's own spelling)
    return bindingLessGlobalName(objectNode.name, { scope, adapter, read: path && { node: objectNode, path } });
  }
  // Every invocation the value walks follow (`realmYieldingCallView`) shares the scoped return proof,
  // including returned arguments. This classifies the value only; emitters preserve its effects.
  const call = realmYieldingCallView(objectNode, { scope, adapter, path });
  if (call) {
    const inlined = inlineCallReturnExpression({ node: call, readNode: usageNode, seen, ctx: { scope, adapter, path } });
    // an SE-arrow body inlines to a SEQUENCE (`() => (r++, globalThis)`) - classify through its
    // tail value like the proxy-root walk does; SE preservation stays the emit side's concern
    // (`inlineCallHasObservableEffects`), this is pure shape classification.
    // the recursion re-anchors at the callee's scope with the advanced cycle set
    return inlined ? resolveObjectName({
      objectNode: peelReceiverSequenceTail(inlined.node), scope: inlined.ctx.scope, adapter, seen: inlined.seen, path, usageNode,
    }) : null;
  }
  if (objectNode.type !== 'MemberExpression' && objectNode.type !== 'OptionalMemberExpression') return null;
  // computed: globalThis[`Array`] resolves the bracket expression; non-computed reads the
  // identifier name directly. either way the receiver chain must bottom out on a proxy global
  const propertyName = objectNode.computed
    // `seen` shared with the receiver walk, matching the chain-root walker's convention (a shared
    // alias chain across the walk and its member keys must not restart the cycle guard)
    ? resolveKey({ node: objectNode.property, computed: true, scope, adapter, seen, path, usageNode, resolveStaticKey, keepsKeyNode: true })
    : memberKeyName(objectNode);
  if (!propertyName) return null;
  // Pure navigation keeps effectful realm keys in their source slots. Global detection can
  // still name the slot without rewriting it; ordinary static and instance keys are unchanged.
  if (adapter?.method === 'usage-pure' && objectNode.computed && POSSIBLE_GLOBAL_OBJECTS.has(propertyName)
    && !resolveKey({ node: objectNode.property, computed: true, scope, adapter, path, resolveStaticKey,
      bailOnSideEffectKey: true })) return null;
  // `X.default` of a CJS-interop-wrapped pure GLOBAL-PROXY require resolves to the proxy
  // itself (the wrapper is not the global, its `.default` is) - the receiver shape babel's
  // module lowering leaves for a pure global-this import, and the host of slot writes like
  // `X.default.Map = shim` that must keep tainting after the lowering
  if (propertyName === 'default') {
    const interopProxy = interopDefaultProxyName({ objectNode: objectNode.object, scope, adapter, path });
    if (interopProxy) return interopProxy;
  }
  if (!resolveProxyGlobalRoot({
    receiver: objectNode.object, scope, adapter, seen, path, usageNode, resolveStaticKey, proxySegments,
  })) return null;
  // a mutated ctor slot read THROUGH the global (`globalThis.Map = Shim; globalThis.Map.<...>`)
  // holds the user's replacement - the member chain no longer names the pristine built-in, so
  // property reads behind it must stay raw instead of resolving to pure statics - save a read before
  // every write of the slot, as its bare twin is (`isMutatedStatic`)
  return isMutatedGlobalSlot(adapter, propertyName, path && { node: objectNode, path }) ? null : propertyName;
}

// the values a reassigned alias's reachable writes install, each with the scope and path its
// identifiers resolve at: the enumerator's paired values, spelled at their WRITE - a loop body or a
// nested block the write stands in sees names the declaration's scope does not (`for (const h of
// xs) h0 = h`), and a use-site shadow cannot swallow them either - and every pattern write whose
// value is a CALL, paired through the call canon - the enumerator hands such a site back unpaired,
// and the callee's literal resolves in the callee's scope. the alias name activates pattern-LHS
// pairing (`[A] = [Iterator]`) in the enumerator: adapter binding wrappers do not all surface the
// bound identifier. a value read off the binding itself (`node = node.prev`, `readsOffBindingItself`)
// is left out: it names a global only through a slot of another of these values, a route the readers
// of this union do not take, and following it reads the binding again - once per such write, at
// every level of a walk standing on the binding
export function reassignedAliasValues({ binding, name, scope, declScope, adapter, path, usageNode, seen }) {
  const enumeration = reassignmentValueEnumeration({
    binding, usagePath: path, name, ctx: { scope, adapter, path, resolveKey }, usageNode,
  });
  const called = enumeration.callSites.flatMap(({ pattern, value: init }) => callInitSlotValues({
    pattern, init, name, scope: declScope, adapter, path, seen, resolveKey,
  })?.values ?? []);
  return [...enumeration.nodes.filter(node => !readsOffBindingItself(node, name)).map(node => {
    const site = pathOfNode(path, node);
    return { node, scope: site?.scope ?? declScope, path: site };
  }), ...called];
}

// ... and each such value is READ where the write evaluates it: every reader of the union keeps that
// read (an identity guard's candidate, a global import), so the init-order gates ask it as one
// (`initializerReachesRead`) - the view every reader that keeps its read resolves through. a view
// delegating to the adapter, never a copy: an emitter swaps per-transform members in and out of it and
// its getters answer per transform (`createDetectionAdapter`), so a copy kept per adapter would serve
// the first transform's members to every later file and keep that file's tree alive
const READ_KEEPING_ADAPTERS = new WeakMap();
export function readKeepingAdapter(adapter) {
  let view = READ_KEEPING_ADAPTERS.get(adapter);
  if (!view) READ_KEEPING_ADAPTERS.set(adapter, view = Object.create(adapter, { keepsReads: { value: true } }));
  return view;
}

// Collect distinct receiver/key candidates from an identifier alias or named-call receiver:
// the supplied primary, literal loop elements, reachable writes, the arms of a pattern-bound
// declarator's slot and alias hops in their source scope. Other shapes contribute only the
// primary. Each hop carries its capture position.
// `includeDeclaredCandidates` also admits initializers for a preserved runtime identity guard;
// a proven overwrite, later initializer or opposite branch in the same execution excludes them.
// the hops form a graph and are walked as one: a source two hops spell is expanded once (`reached`, by the node
// spelling it and whether it is followed as a call), on an explicit stack, in the order a recursion would meet
// it - an alias yields its values and hops in turn (`entriesOf`), and a hop's entries run before the rest of its
// alias's - and a hop past the alias-chain ceiling reaches nothing more (`MAX_KEY_DEPTH`, counted from the
// walks already in flight). a walk cut at a name on its own path instead enumerated every simple path of a ring
// of aliases copying one another, a power of the copies, and left out what a name on the path held at the copy's
// own site; `seen` cuts the names in flight outside this walk alone, and reaches the slot and call canons with the
// names of the aliases a hop was reached through, as before. a union follows at most `MAX_UNION_SOURCES` hop sources
// and keeps what it named before the one past them: it is partial as it is wherever a source names nothing
// (`{ value: null }`), and its readers add guard arms and imports per value, deciding nothing by their count
export function reachableAliasValues({
  aliasNode: rootAlias,
  primary,
  resolve,
  scope: rootScope,
  adapter,
  path: rootPath,
  seen,
  usageNode: rootRead = null,
  includeDeclaredCandidates = false,
}) {
  const values = primary ? [primary] : [];
  const reached = { value: new Set(), call: new Set() };
  const ceiling = MAX_KEY_DEPTH - aliasWalks;
  // the values of one alias and the hops its sources spell, in the order the walk meets them: `{ value }` a
  // candidate (null where a source names none), `{ hop }` a source to follow - an Identifier alias SOURCE (a
  // declarator init OR a reassignment value) reaches the aliased binding's own reachable values, so `const/let
  // M = M0`, `M = M0` and `[M] = [M0]` all reach M0's transitive reassignments (`let M0 = Object; if (c) M0 =
  // Array; ...; M.from()`). ADDITIVE to the reassigned-arm: a reassigned alias whose source aliases another
  // reassigned binding still reaches the source's targets on the no-own-write path. anchored at the alias read
  // site (a later write to the source does not enter the union); `asCall` re-enters the factory branch for an
  // `f()` receiver. `sourceScope` is where the source expression lives - the hop's own binding resolves there.
  // `pathSeen` holds the names of the aliases this one was reached through, for the slot and call canons
  function * entriesOf({ aliasNode, scope, path, usageNode, pathSeen }) {
    function hop(source, currentName, asCall, sourceScope, sourcePath = path) {
      return { hop: { source, currentName, asCall, sourceScope, sourcePath, pathSeen } };
    }
    if (aliasNode?.type === 'Identifier') {
      const binding = adapter.getBinding({ scope, name: aliasNode.name, path, read: aliasNode });
      const declScope = binding ? aliasDeclScope(binding, scope) : scope;
      // A loop declaration has no initializer. Its finite elements are candidates just like
      // written values, even when no single one proves the receiver's identity. a PATTERN head pairs
      // each element as a declarator pairs its init - a call element through the call canon
      const declaration = bindingDeclarationPath(binding);
      // ... where the declaration still binds this name: a relocation re-spells a pattern head in place
      const id = declaration?.node?.id;
      if (declaration?.node?.type === 'VariableDeclarator' && !declaration.node.init
        && (id?.type !== 'Identifier' || id.name === aliasNode.name)) {
        const ctx = { scope: declScope, adapter, path: declaration, resolveKey };
        for (const element of forOfHeadIterableElements(declaration) ?? []) {
          const read = { pattern: declaration.node.id, init: element, name: aliasNode.name, ctx, seen: pathSeen };
          // ... beside every value the file wrote into that slot of the element's container
          const slotValues = declaration.node.id.type === 'Identifier' ? [{ node: installedWriteValue(element), scope: declScope }]
            : [...pairedSlotValues(read), ...writtenPatternSlotValues(read).map(node => ({ node, scope: declScope }))];
          for (const { node, scope: valueScope } of slotValues) {
            yield { value: resolve({ node, readNode: node, ctx: { ...ctx, scope: valueScope } }) };
            yield hop(node, aliasNode.name, false, valueScope);
          }
        }
      }
      if (binding && isReassignedBeyondDeclarator(binding)) {
        for (const { node: rhs, scope: valueScope, path: valuePath } of reassignedAliasValues({
          binding, name: aliasNode.name, scope, declScope, adapter, path, usageNode, seen: pathSeen,
        })) {
          // the written value was READ at its write site - anchor its own resolution there, so a
          // cross-write (`a = b; b = x`) resolves b's value as captured BEFORE `b = x` overwrote it,
          // and in the write's own scope, so a use-site shadow cannot swallow the RHS name
          yield { value: resolve({
            node: rhs, readNode: rhs, ctx: { scope: valueScope, adapter: readKeepingAdapter(adapter), path: valuePath ?? path },
          }) };
          yield hop(rhs, aliasNode.name, false, valueScope, valuePath ?? path);
        }
      }
      // pattern-gated init follow: a destructure declarator binds the name to a SLOT of the init -
      // following the whole init smuggled the CONTAINER into the union (`const { M } = src` fanned
      // src's reachable values as M's)
      if (binding && (!includeDeclaredCandidates || !reassignmentBlocksGlobalResolve({
        binding, adapter: { method: 'usage-global' }, path, usageNode,
      }))) {
        const init = identifierDeclaratorInit(binding);
        const declarator = bindingDeclaratorNode(binding);
        if (includeDeclaredCandidates && init && declarator
          && (writeIsInOppositeBranch(declarator, path, usageNode ?? path?.node)
            || provablyPrecedes(usageNode ?? path?.node, declarator))
          && noReassignmentReachesUsage({
            reassignmentNodes: [declarator],
            usagePath: path,
            usageNode,
            bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node,
            bindingAnchor: bindingLoopAnchor(binding),
          })) return;
        if (includeDeclaredCandidates && init) {
          yield { value: resolve({ node: init, readNode: init, ctx: { scope: declScope, adapter, path } }) };
        }
        yield hop(init, aliasNode.name, false, declScope);
        // a PATTERN declarator binds the name to a slot of its init, and that slot's possible values
        // are the declared candidates: the same pairing the reassignment walk reads for a pattern
        // write, each branching value unfolded to its arms (`const { a: A } = { a: c ? Array : Map }`
        // reaches both). the primary names the slot only where every arm agrees, so a disagreeing
        // slot reaches the union through these arms alone; a lone agreeing arm just repeats it
        if (!init && declarator?.type === 'VariableDeclarator' && declarator.init) {
          const ctx = { scope: declScope, adapter, path: declaration, resolveKey, liveArmsOnly: true };
          const slotValues = pairedSlotValues({ pattern: declarator.id, init: declarator.init, name: aliasNode.name, ctx, seen: pathSeen });
          // ... and the values the file WROTE into that slot: the read lands on one of them where the
          // write reached the container, so each joins the union beside the literal's own
          const written = writtenPatternSlotValues({ pattern: declarator.id, init: declarator.init, name: aliasNode.name, ctx })
            .map(node => ({ node, scope: declScope }));
          const arms = [...slotValues, ...written]
            .flatMap(({ node, scope: valueScope }) => flattenBranchingValueNodes([node], { ctx: { ...ctx, scope: valueScope } })
              .map(arm => [arm, valueScope]));
          for (const [arm, valueScope] of arms) {
            yield { value: resolve({ node: arm, readNode: arm, ctx: { ...ctx, scope: valueScope } }) };
            yield hop(arm, aliasNode.name, false, valueScope);
          }
        }
      }
    } else if (aliasNode?.type === 'CallExpression' || aliasNode?.type === 'OptionalCallExpression') {
      // IIFE-callee receiver `f()` whose factory `f` is a reassigned alias: each reachable `() => X`
      // value returns X. recover each so a dominating reassignment to a polyfillable global (`let f =
      // () => Object; f = () => Array; f().from()`) still injects the reaching value's polyfill - the
      // direct-Identifier-receiver union path could not, since `f()` is not an Identifier alias
      const callee = unwrapTransparentSeq(aliasNode.callee);
      const binding = callee.type === 'Identifier' ? adapter.getBinding({ scope, name: callee.name, path, read: callee }) : null;
      const declScope = binding ? aliasDeclScope(binding, scope) : scope;
      if (binding && isReassignedBeyondDeclarator(binding)) {
        // pass the factory name so pattern-LHS reassignments (`[f] = [() => Array]`) pair via
        // patternSlotValues - the Identifier-receiver branch above passes it for the same reason
        for (const rhs of reassignmentValueNodes({
          binding, usagePath: path, name: callee.name, ctx: { scope, adapter, path, resolveKey }, usageNode,
        })) {
          const fn = unwrapTransparentSeq(rhs);
          if ((fn.type === 'ArrowFunctionExpression' || fn.type === 'FunctionExpression')
            && !fn.params?.length && !fn.async && !fn.generator) {
            const ret = singleReturnBodyExpression(fn.body);
            yield { value: ret && resolve({ node: ret, ctx: { scope: declScope, adapter, path } }) };
          } else yield hop(rhs, callee.name, true, declScope); // a factory bound through an Identifier alias
        }
      }
      if (binding) yield hop(identifierDeclaratorInit(binding), callee.name, true, declScope);
    }
  }
  const root = entriesOf({ aliasNode: rootAlias, scope: rootScope, path: rootPath, usageNode: rootRead, pathSeen: seen });
  const stack = [{ depth: 0, entries: root }];
  while (stack.length) {
    const frame = stack.at(-1);
    const { done, value: entry } = frame.entries.next();
    if (done) {
      stack.pop();
      continue;
    }
    if (!entry.hop) {
      if (entry.value) values.push(entry.value);
      continue;
    }
    const { source, currentName, asCall, sourceScope, sourcePath, pathSeen } = entry.hop;
    let node = source && unwrapTransparentSeq(source);
    // a source wrapped in zero-arg IIFEs (`const f = (() => f0)()`, nested `(() => (() => f0)())()`)
    // aliases the IIFEs' return, so peel to a fixpoint to reach the underlying binding - the same
    // wrapper the container / global resolvers peel
    while (node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression') {
      const ret = peelZeroArgIifeReturn(node, { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic });
      if (!ret) break;
      node = unwrapTransparentSeq(ret);
    }
    if (node?.type !== 'Identifier' || node.name === currentName || cycleGuardHas(seen, node.name)) continue;
    const sources = asCall ? reached.call : reached.value;
    if (sources.has(node)) continue;
    // a hop past the alias-chain ceiling reaches nothing more, and is not reached: a shorter chain may still expand it
    if (frame.depth >= ceiling) continue;
    // at the ceiling on the sources one union follows the walk stops with what it named: finishing the open frames
    // would resolve every value they still hold, the very cost the ceiling cuts
    if (reached.value.size + reached.call.size >= MAX_UNION_SOURCES) break;
    sources.add(node);
    const recursed = asCall ? { type: 'CallExpression', callee: node, arguments: [] } : node;
    // a root `f()` receiver has no primary from the consumer: `f` is reassigned, so `resolveObjectName` names
    // nothing for the call. the hop into its factory resolves the DECLARED return itself, beside the
    // reassignments `entriesOf` yields: `const f = f0` with `let f0 = () => Object; if (c) f0 = () => Map` reaches
    // BOTH Object and Map. `node` anchors the dominance check at the alias-read, excluding a dead factory init.
    // an Identifier source's own value was yielded beside its hop already, so resolving it here would count it
    // twice (and mis-anchor a dead init) - the hop adds none
    const hopPrimary = asCall ? resolve({ node: recursed, readNode: node, ctx: { scope: sourceScope, adapter, path: sourcePath } }) : null;
    if (hopPrimary) values.push(hopPrimary);
    stack.push({
      depth: frame.depth + 1,
      entries: entriesOf({
        aliasNode: recursed, scope: sourceScope, path: sourcePath, usageNode: node, pathSeen: new Set(pathSeen).add(currentName),
      }),
    });
  }
  return [...new Set(values)];
}

// the invocation a call-like node spells, as the CALL the inline canon walks: a receiver invoker
// (`f.call`, `f.apply`, `Reflect.apply`, a `bind` invoked on the spot, the pure `reflect/apply`
// entry under whatever binding a prior pass or the author left it) and a tagged template all invoke
// the function the pairing names, with the arguments it pairs. null where the node spells its call
// plainly - the source node answers for itself there, SE-bail included - and where it is no call at
// all. the view is LOCAL to the proof: every emitter keeps re-emitting the source's own node
function pairedCallView(node, { scope, adapter, path }, getBinding = null) {
  if (invocationNode(node) !== node) return null;
  const pairing = callPairing(node, null, {
    nameIsShadowed: (name, read) => adapter.hasBinding({ scope, name, path, read }),
    staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic ?? null,
    getCalleeEntry: callee => pureImportSourceEntry(moduleDefaultSource({ node: callee, scope, adapter, path, getBinding })),
  });
  if (!pairing?.callee) return null;
  if (!pairing.argsUnknown && node.type !== 'TaggedTemplateExpression' && pairing.args === node.arguments) return null;
  return { ...node, type: 'CallExpression', callee: pairing.callee, arguments: pairing.args, argsUnknown: pairing.argsUnknown };
}

// Resolve a call's returned literal and its parameter-filled slots through the shared callee proof.
// Return the canonical argument list alongside slot indices; consumers use `resolveCallArgument`
// to read a runtime position through any remaining inline-array spreads. the callee itself rides
// along with the scope its literal's identifiers resolve in and the advanced cycle set, for a
// consumer pairing the literal's OTHER slots
export function callYieldedContainer(hop, options = {}) {
  if (!isPairedCallShape(hop.node)) return null;
  const resolved = resolveInlineCalleeFunction(hop, { allowIdentityParam: true, ...options });
  // the return is read for its VALUE: an effect prefix in a sequence return stays in the callee,
  // which every reader of the yielded container keeps running in place
  const yielded = resolved && calleeYieldedContainer(resolved.node, { unwrap: unwrapExpressionChain });
  return yielded ? {
    ...yielded, args: resolved.args, argsUnknown: resolved.argsUnknown,
    callee: resolved.node, scope: resolved.ctx.scope, seen: resolved.seen,
  } : null;
}

// ... the same container as a VALUE reader pairs it: `paramArgs` holds the literal, the argument each
// CONFINED parameter holds where this call spells one (`args`), and every other parameter's name
// (`unproven`) - its argument may have been handed on to a writer, or this call leaves it unknown
// (missing, behind an opaque spread). a reader takes each slot through `yieldedSlotValue`; a patch
// census pairs the raw container instead, since any slot argument may be patched
export function pairedYieldedContainer(hop, options = {}) {
  const yielded = callYieldedContainer(hop, options);
  if (!yielded) return null;
  const args = new Map();
  const unproven = new Set();
  for (const [at, param] of dropLeadingThisParam(yielded.callee.params).entries()) {
    const argument = !yielded.argsUnknown && yielded.confined.has(at) ? resolveCallArgument(
      yielded.args,
      at,
      hop.ctx.adapter.isMutatedStaticSlot ?? hop.ctx.adapter.isMutatedStatic,
    ) : null;
    if (argument) args.set(param.name, argument);
    else unproven.add(param.name);
  }
  return { ...yielded, paramArgs: { literal: yielded.literal, args, unproven } };
}

// the values a PATTERN binding takes from an init that is an INVOCATION the value walks follow
// (`realmYieldingCallView`: a call, a tag, a `new` over a constructible callee, an `await`): the call
// canon's returned literal pairs exactly as an inline one does, so a destructure off a factory
// (`const { a: A } = f()`, an IIFE, a method) reads the slot the literal spells. a slot the callee fills from a PARAMETER holds
// the call's argument at that index, spelled at the call site; every other value is spelled in the
// callee's declaration scope - each value carries the scope its identifiers resolve in, since a
// namesake at the call site must not capture a callee-spelled name. ONE proven literal - a
// parameter-filled one, or the single agreeing return - pairs COMPLETELY: `literal` and `ctx` are
// then the pairing's rhs and its context for the gates that ask the literal itself (a default, a
// spread-shifted slot) - `ctx.held` where an ALIAS holds the call's result, which the file may have
// written the literal through since. disagreeing free returns pair as the UNION of what each spells, which is all
// the return sink promises (a path it cannot see may yield anything): `complete` is false, and a
// consumer needing certainty reads nothing from such values, and so is a slot reading a parameter the
// pairing cannot prove (`yieldedSlotValue`: no value). null where the init is no call the inline
// canon reaches, or no return spells a literal
// `nested` - the level hooks a consumer pairing every level asks (`pairedSlotValues`) - reaches the
// literal's own levels too.
function callInitSlotValues({
  pattern, init, name, scope, adapter, path, seen = new Set(), resolveKey: keyResolver = null, nested = null,
}) {
  const paired = callPairingSources({ init, scope, adapter, path, seen });
  if (!paired) return null;
  const values = [];
  let ctx = null;
  let open = false;
  for (const source of paired.sources) {
    const sourceCtx = { scope: source.scope, adapter, path, resolveKey: keyResolver, seen: source.seen, held: paired.held, ...nested };
    ctx ??= sourceCtx;
    for (const value of patternSlotValues(pattern, source.literal, name, sourceCtx)) {
      const read = yieldedSlotValue(paired.paramArgs, value);
      if (value && !read) open = true;
      else values.push({ node: read, scope: nested?.valueScopes.get(read) ?? (read === value ? source.scope : paired.argumentScope) });
    }
  }
  return { literal: paired.sources[0].literal, ctx, values, complete: !!paired.proven && !open };
}

// the containers an INVOCATION init pairs against through the call canon, with where each resolves:
// `{ sources, paramArgs, argumentScope, proven, held }` - `sources` the ONE proven literal (a
// parameter-filled one, or the single agreeing return) or every literal the free returns spell, each
// `{ literal, scope, seen }`; `paramArgs` the slots a parameter fills (`yieldedSlotValue`), spelled at
// `argumentScope`; `held` where an ALIAS holds the call's result. null where the init is no call the
// value walks follow (`realmYieldingCallView`) or no return spells a literal
function callPairingSources({ init, scope, adapter, path, seen }) {
  // ... an ALIAS of a call holds what the call yields - the value the wrapper and member walks read
  // through it (`const w = f(); const [A] = w`), with the call run where the alias was declared
  const initNode = unwrapTransparentSeq(installedWriteValue(init));
  const followed = followConstIdentifierInit({ node: initNode, readNode: init, seen, ctx: { scope, adapter, path } });
  const call = realmYieldingCallView(followed.node, { scope: followed.ctx.scope, adapter, path });
  if (!call) return null;
  const rejectConditional = adapter.method !== 'usage-global';
  let hop = {
    node: call,
    readNode: followed.readNode ?? init,
    seen,
    ctx: { scope: followed.ctx.scope, adapter, path },
    awaited: unwrapTransparentSeq(followed.node)?.type === 'AwaitExpression',
  };
  let yielded = null;
  let returned = null;
  let returnSink = [];
  // ... and a returned CALL stands for what ITS callee yields: usage-global unions on through the
  // chain, pure declines it - the flavor rule of `callYieldedLiteral`. each level reads its arguments
  // where its own call stands
  for (let depth = 0; depth < MAX_KEY_DEPTH; depth++) {
    yielded = pairedYieldedContainer(hop, { rejectConditional });
    returnSink = [];
    returned = yielded ? null : inlineCallReturnExpression(hop, { rejectConditional, returnSink });
    const chained = returned && adapter.method === 'usage-global'
      && realmYieldingCallView(unwrapExpressionChain(returned.node), { scope: returned.ctx.scope, adapter, path });
    if (!chained) break;
    hop = { node: chained, readNode: chained, seen: returned.seen, ctx: { scope: returned.ctx.scope, adapter, path } };
  }
  const proven = yielded ?? returned;
  const sources = (proven ? [proven] : returnSink).map(source => ({
    literal: unwrapExpressionChain(source.literal ?? source.node), scope: source.scope ?? source.ctx.scope, seen: source.seen,
  })).filter(({ literal }) => literal?.type === 'ObjectExpression' || literal?.type === 'ArrayExpression');
  return sources.length
    ? { sources, paramArgs: yielded?.paramArgs, argumentScope: hop.ctx.scope, proven, held: followed.node !== initNode } : null;
}

// the values a PATTERN binding `name` takes from `init`, each with the scope it is spelled in: a
// CALL init through the call canon above, any other through the literal pairer at `ctx` - the one
// pairing every reader of a pattern's slot asks, whatever the init's spelling. a level whose value
// is a selection or such a call pairs every arm and what the call canon pairs the call with, at the
// head and at every nested level (`pairedSources`), each value keeping the scope it is spelled in. a
// consumer that reads the slot as PROVEN asks `certainPairedSlotValue`
export function pairedSlotValues({ pattern, init, name, ctx, seen = new Set() }) {
  return pairSlotValues({ pattern, init, name, ctx, seen }).values;
}

// the ONE value a pattern slot CERTAINLY takes, with the scope it is spelled in: the pairing's single
// value, where a call init's pairing is complete and no default may fire in its place nor a spread
// shift the slot (`patternSlotValueAmbiguous`, asked of the literal the pairing read - a call's
// returned one included). null where the slot may hold anything else
export function certainPairedSlotValue({ pattern, init, name, ctx, seen = new Set() }) {
  const { called, values } = pairSlotValues({ pattern, init, name, ctx, seen });
  if (values.length !== 1 || !values[0].node || (called && !called.complete)) return null;
  return patternSlotValueAmbiguous(pattern, called ? called.literal : init, name, called ? called.ctx : ctx) ? null : values[0];
}

// the shared pairing of the two above, with the call canon's own answer (`called`) beside its values
function pairSlotValues({ pattern, init, name, ctx, seen }) {
  const valueScopes = new Map();
  function levelSources(rhs, levelCtx) {
    const arms = flattenBranchingValueNodes([rhs], { ctx: { ...ctx, scope: levelCtx.scope } });
    if (arms.length !== 1 || arms[0] !== rhs) return arms.map(arm => ({ source: arm }));
    const paired = callPairingSources({ init: rhs, scope: levelCtx.scope, adapter: ctx.adapter, path: ctx.path, seen });
    return paired?.sources.map(({ literal, scope }) => ({
      source: literal,
      scope,
      argumentScope: paired.argumentScope,
      filled: value => yieldedSlotValue(paired.paramArgs, value) ?? undefined,
    })) ?? null;
  }
  const nested = { pairedSources: levelSources, valueScopes };
  const called = callInitSlotValues({
    pattern, init, name, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path, seen, resolveKey: ctx.resolveKey ?? null, nested,
  });
  return {
    called,
    values: called ? called.values : patternSlotValues(pattern, init, name, { ...ctx, ...nested })
      .map(node => ({ node, scope: valueScopes.get(node) ?? ctx.scope })),
  };
}

// the ONE value an invocation provably stands for - any spelling the value walks follow
// (`realmYieldingCallView`, an optional call to a proven callee included: it never short-circuits)
// - with the scope it is spelled in: the container the callee fills from its parameters, `paramArgs`
// pairing its parameter slots with this call's arguments (`yieldedSlotValue`), or the single agreeing
// return expression, in the callee's scope, a literal or a name the caller follows on. the read a
// descent takes where it wants the value itself rather than a slot's values; null where the
// invocation yields neither. a returned INVOCATION stands for what ITS callee yields: usage-global
// unions on through the chain, while pure declines it - only one leg's routes would step a chain the
// other reads natively
export function callYieldedLiteral(hop, { allowUninitializedCallee = false } = {}) {
  const call = realmYieldingCallView(hop.node, hop.ctx);
  if (!call) return null;
  const callHop = { ...hop, node: call };
  const rejectConditional = hop.ctx.adapter.method !== 'usage-global';
  const yielded = pairedYieldedContainer(callHop, { rejectConditional, allowUninitializedCallee });
  if (yielded) return { literal: yielded.literal, scope: yielded.scope, seen: yielded.seen, paramArgs: yielded.paramArgs };
  const returned = inlineCallReturnExpression(callHop, { rejectConditional, allowUninitializedCallee });
  const literal = returned && unwrapExpressionChain(returned.node);
  return literal && !(invocationNode(literal) && hop.ctx.adapter.method === 'usage-pure')
    ? { literal, scope: returned.ctx.scope, seen: returned.seen, paramArgs: null } : null;
}

// what a slot of that literal holds for a reader (`paramArgs` from `pairedYieldedContainer`): the call's
// ARGUMENT where the slot names a confined parameter it spells one for, nothing (null) where the slot
// reads any other parameter - the literal's names resolve where the callee is declared, where no
// parameter is bound - and the node itself anywhere else, a node outside that literal included
export function yieldedSlotValue(paramArgs, node) {
  if (!paramArgs || !node || !subtreeContainsNode(paramArgs.literal, node)) return node;
  const value = unwrapRuntimeExpr(node);
  if (value?.type === 'Identifier' && paramArgs.args.has(value.name)) return paramArgs.args.get(value.name);
  return paramArgs.unproven.size && identifierReferencedInSubtree(node, paramArgs.unproven) ? null : node;
}

// Resolve the paired invocation to a synchronous function and its declaration scope.
// Follow local declarations, aliases, proven reaching writes and census-resolved methods;
// initializer availability and `rejectConditional` bound the weaker conditional-callee proof.
// Parameters require `allowIdentityParam`; the consumer still proves which value is returned.
// Return canonical `args` and a forked, advanced `seen` set. Async/generator functions and
// unresolved or cyclic callees return null; the caller's cycle set is never mutated. `allowAsync`
// admits an async function for a caller reading what an AWAIT of the call settles to; `declinedSink`
// collects the call where a hop's initializer cannot have run by the read - the call throws there,
// which a caller holding another answer about it must not override.
// eslint-disable-next-line max-statements -- the terminal memo belongs to the same paired callee proof
export function resolveInlineCalleeFunction(hop, {
  allowIdentityParam = false,
  rejectConditional = false,
  allowUninitializedCallee = false,
  allowAsync = hop.awaited === true,
  declinedSink = null,
} = {}) {
  const { adapter, path } = hop.ctx;
  // A direct name whose binding has no local function body cannot be inlined. Keep only
  // that terminal verdict within a read-only question, after pairing and write checks.
  // Alias walks, unavailable initializers and function-option refusals remain live.
  // The explicit read anchors only a spanless callee, as in the binding walk below.
  const readNode = typeof hop.node.callee?.start === 'number' ? null : hop.readNode ?? null;
  const opaqueCallees = hop.node.callee?.type === 'Identifier'
    ? canonAnswerTable(resolveInlineCalleeFunction, [hop.ctx.scope, adapter, path, readNode]) : null;
  if (opaqueCallees?.has(hop.node)) return null;
  // A named call asks about its module entry before following the same bindings as
  // callees. Share full records only during this proof, at the same scope and read.
  // The returned hop keeps the original adapter, so no lookup cache escapes.
  const bindings = hop.node.callee?.type === 'Identifier' ? new Map() : null;
  function calleeBinding({ scope, name, path: readPath, read = null }) {
    if (!bindings) return adapter.getBinding({ scope, name, path: readPath, read });
    const hit = bindings.get(name);
    if (hit && hit.scope === scope && hit.path === readPath && hit.read === read) return hit.binding;
    const binding = adapter.getBinding({ scope, name, path: readPath, read });
    bindings.set(name, { scope, path: readPath, read, binding });
    return binding;
  }
  const seen = new Set(hop.seen);
  // a receiver invoker, a pure invoker binding or a tag names its function through the pairing
  // canon; a plain call is read as the source spells it - SE-bail (unwrapTransparentSeq), NOT
  // peel-to-tail: recognizing a SE-callee IIFE (`(eff(), () => Array)()`) makes the resolver inline
  // it, but the emit layer has no receiver-less static spelling over the SE-wrapped callee. the
  // SE-bail keeps the shape unresolved (native call survives)
  const call = pairedCallView(hop.node, hop.ctx, bindings ? calleeBinding : null) ?? hop.node;
  const args = call.arguments ?? [];
  const argsUnknown = !!call.argsUnknown;
  let callee = unwrapTransparentSeq(call.callee);
  let hopScope = hop.ctx.scope;
  let lookupPath = path;
  const initAvailable = allowUninitializedCallee ? initializerMayRunBeforeUsage : varInitDominatesUsage;
  // a member the census resolved to a method, called in place or read into an alias (`const mk =
  // o.make; mk()`): its owner's initializer has to have run by the read. The selected value is still
  // in its owner's scope; Identifier-valued slots use the ordinary alias walk, without looking up a
  // path by scanning the file again
  function memberHop(member) {
    const owner = unwrapTransparentSeq(member.object);
    const binding = owner?.type === 'Identifier' ? calleeBinding({
      scope: hopScope,
      name: owner.name,
      path: lookupPath,
      read: owner,
    }) : null;
    if (binding && !initAvailable({
      declaratorNode: binding.path?.node ?? binding.node,
      usagePath: lookupPath,
      usageNode: lookupPath === path ? hop.node : member,
      kind: binding.kind,
    })) {
      declinedSink?.push(hop.node);
      return false;
    }
    const local = !cycleGuardHas(seen, member) && LOCAL_MEMBER_CALLEES.get(member);
    if (!binding || !local) return false;
    seen.add(member);
    callee = local;
    hopScope = aliasDeclScope(binding, hopScope);
    lookupPath = bindingDeclarationPath(binding) ?? lookupPath;
    return true;
  }
  // an init-less binding whose ONE write assigns a function literal (`let f; if (c) f = () =>
  // globalThis;`) proves through that write: on every path the value is either undefined or that
  // literal. the CALL ITSELF becomes an observable effect (it may throw / short-circuit on the
  // unassigned path), so the collapse must keep it - the marker feeds `inlineCallHasObservableEffects`,
  // which every dropping caller consults. `{ next, scope }` goes on through the callee a pattern slot
  // or a member write names, `{ done }` ends the walk with its answer
  function initlessHop(binding, name, anchor) {
    const write = binding.constantViolations?.length === 1
      ? unwrapTransparentSeq(violationAssignment(binding.constantViolations[0])) : null;
    const rhs = write?.type === 'AssignmentExpression' && write.operator === '='
      && write.left?.type === 'Identifier' && write.left.name === name
      ? unwrapTransparentSeq(write.right) : null;
    // a PATTERN-bound name holds the slot its declarator pairs (`const { make } = o`)
    const bound = write ? null : patternBoundCallee({
      binding, name, hop, scope: hopScope, readPath: lookupPath, readNode: anchor, initAvailable,
    });
    if (bound?.declined) declinedSink?.push(hop.node);
    if (bound?.declined || bound?.open) return { done: null };
    // ... and the one write storing a MEMBER the census resolved (`let mk; mk = o.make`) hands the
    // walk that member, the conditional proof of the literal write below applying to it alike
    const next = bound?.callee ?? (isMemberAccessNode(rhs) ? rhs : null);
    if (next && (!rhs || !rejectConditional)) return { next, scope: bound?.scope ?? (rhs && writeScopeAt(lookupPath, write)) };
    if (rhs?.type !== 'ArrowFunctionExpression' && rhs?.type !== 'FunctionExpression') return { done: null };
    // callers asking whether the call's VALUE is defined get no proof from a conditional
    // one: the unassigned path is exactly the value they must keep guarding
    if (rejectConditional) return { done: null };
    conditionallyProvenCallees.add(rhs);
    seen.add(name);
    // the write's RHS resolves in the binding's own declaration scope, like a declarator init
    return { done: finishInlineCallee({
      hop,
      callee: rhs,
      args,
      argsUnknown,
      scope: writeScopeAt(lookupPath, write, aliasDeclScope(binding, hopScope)),
      seen,
      allowIdentityParam,
      allowAsync,
    }) };
  }
  // identifier hops follow transitively (`const f = () => X; const q = f; q()`), each hop
  // re-anchored at the alias's own declaration scope (per-hop advance like the key/global
  // alias walks) with the seen-set guarding cycles
  while (callee.type === 'Identifier' || isMemberAccessNode(callee)) {
    if (isMemberAccessNode(callee)) {
      if (!memberHop(callee)) return null;
      continue;
    }
    const { name } = callee;
    if (cycleGuardHas(seen, name)) return null;
    const binding = calleeBinding({ scope: hopScope, name, path: lookupPath, read: callee });
    if (!binding) return null;
    const isDeclarator = bindingDeclaratorNode(binding)?.type === 'VariableDeclarator';
    // the shared accessor covers both binding shapes (detect adapters carry `.node`, the
    // type-resolver channel only `.path`) AND gates on a plain-Identifier declarator: a
    // pattern-bound name (`const { f } = g`) holds a SLOT of the init, so following the whole
    // init inlined the CONTAINER as the callee (`f().from` ran where native throws)
    const initNode = isDeclarator ? identifierDeclaratorInit(binding) : null;
    // the dominance question anchors at THIS read - the callee identifier itself (a clone with no
    // span falls back to the hop's read site): a write earlier in the same sequence (`(f = () =>
    // globalThis, f().Array)`) precedes it and dominates, a write after an alias captured the call
    // (`const G = mk().Array; mk = ...`) does not and leaves the init live. anchored at the outer
    // expression both were misjudged - the in-sequence write read as "after" (the FC-144 lesson)
    const anchor = typeof callee.start === 'number' ? callee : hop.readNode;
    // ... and the initializer has to have RUN by the call: a hoisted `var f = () => ...` declared
    // below the call is `undefined` there, and inlining its body would erase the throw the source
    // makes - the same gate the member-callee branch above applies
    // Mutation census admits conditional initialization, but a definitely earlier read or
    // alias capture cannot observe that initializer and still declines.
    if (initNode && !initAvailable({
      declaratorNode: bindingDeclaratorNode(binding), usagePath: lookupPath, usageNode: anchor, kind: binding.kind,
    })) {
      declinedSink?.push(hop.node);
      return null;
    }
    if (isDeclarator && !initNode) {
      const hopped = initlessHop(binding, name, anchor);
      if (!hopped.next) return hopped.done;
      callee = hopped.next;
      seen.add(name);
      hopScope = hopped.scope ?? aliasDeclScope(binding, hopScope);
      lookupPath = bindingDeclarationPath(binding) ?? lookupPath;
      continue;
    }
    if (reassignmentBlocksGlobalResolve({ binding, adapter, path: lookupPath, usageNode: anchor })) {
      // a dominating write replaced the callee, and its value IS the callee now: the enumerable
      // reaching value for usage-global, the single observable one for usage-pure - the callee twin
      // of `reachingContainerValueNode` (the init is dead, inlining it would name a callee the
      // runtime never calls); a value neither can determine leaves the call unresolved
      const { method } = adapter;
      const reaching = method === 'usage-global' || method === 'usage-pure' ? reachingReassignmentValueNode({
        binding,
        usagePath: lookupPath,
        ctx: { ...hop.ctx, scope: hopScope, path: lookupPath, resolveKey },
        usageNode: anchor,
        requireSingleObservation: method === 'usage-pure',
      }) : null;
      if (!reaching) return null;
      callee = unwrapTransparentSeq(reaching);
    } else if (isDeclarator) {
      // the init through the chain-assignment peel (`const mk = q = () => globalThis` binds the
      // function to both names) - SE-bailing like the callee peel above: an effect in the init
      // stays with the shape the emit layer has no receiver-less spelling for
      callee = unwrapTransparentSeq(peelChainAssignmentDeep(initNode));
    } else {
      // a zero-param FunctionDeclaration is the same inline shape (`function g() { return X; }
      // const B = g();`) - the declaration node IS the callee function
      const declNode = binding.path?.node ?? binding.node;
      if (declNode?.type !== 'FunctionDeclaration') {
        if (callee === hop.node.callee) opaqueCallees?.set(hop.node, true);
        return null;
      }
      callee = declNode;
    }
    seen.add(name);
    hopScope = aliasDeclScope(binding, hopScope);
    lookupPath = bindingDeclarationPath(binding) ?? lookupPath;
  }
  return finishInlineCallee({ hop, callee, args, argsUnknown, scope: hopScope, seen, allowIdentityParam, allowAsync });
}

// the callee a PATTERN-bound name holds (`const { make } = o`): the one value the pairer names for its
// slot, with the scope that value resolves in, or else the method the literal spells there. `open`
// where the file wrote the slot before the capture - it then holds no one certain function - and
// `declined` where the declarator has not run by the read. the pairing evaluates the init, and a call
// there naming the binding itself (`const { at } = at()`, `= await make()` returning `at()`) comes
// back to this very slot through callee proofs that start cycle sets of their own: guarded like a
// binding lookup, the slot re-entered while its pairing runs holds no callee
function patternBoundCallee({ binding, name, hop, scope, readPath, readNode, initAvailable }) {
  const declarator = bindingDeclaratorNode(binding);
  if (!declarator?.init) return null;
  const ctx = { scope: aliasDeclScope(binding, scope), adapter: hop.ctx.adapter, path: readPath, resolveKey };
  if (patternSlotWritten({
    pattern: declarator.id, init: declarator.init, name, ctx: { ...ctx, path: bindingDeclarationPath(binding) ?? readPath },
  })) return { open: true };
  const paired = withBindingLookupGuard(declarator, name,
    () => certainPairedSlotValue({ pattern: declarator.id, init: declarator.init, name, ctx }));
  if (paired) {
    return initAvailable({ declaratorNode: declarator, usagePath: readPath, usageNode: readNode, kind: binding.kind })
      ? { callee: unwrapTransparentSeq(paired.node), scope: paired.scope } : { declined: true };
  }
  const method = patternMethodSlot(declarator, name, { ...hop.ctx, scope, path: readPath });
  return method ? { callee: method } : null;
}

// the METHOD a pattern name takes off a literal its declarator spells or aliases (`const { make } =
// o`): the pairer names no value for a method slot - a reader reads through it - but a callee IS one
function patternMethodSlot(declarator, name, ctx) {
  const keys = patternLiteralKeyPath(declarator?.id, name);
  const literal = keys?.length === 1 ? followConstLiteralAlias(unwrapTransparentSeq(declarator.init), ctx) : null;
  if (literal?.type !== 'ObjectExpression') return null;
  const prop = findObjectKeyBeforeSpread(literal.properties, item => plainSynthKeyName(item.key) === keys[0] && !item.computed);
  const value = prop?.type === 'ObjectMethod' ? prop : prop?.value;
  return (prop?.type === 'ObjectMethod' ? prop.kind === 'method' : prop?.kind !== 'get' && prop?.kind !== 'set')
    && (value?.type === 'ObjectMethod' || value?.type === 'FunctionExpression' || value?.type === 'ArrowFunctionExpression') ? value : null;
}

// the shared callee-shape validation every proof arm funnels through; on success the hop advanced
// onto the callee, at `scope`, carrying the ARGUMENTS the invocation pairs with its parameters
// babel spells a class's STATIC method as the member itself, where ESTree hands the function under it
function finishInlineCallee({ hop, callee, args, argsUnknown, scope, seen, allowIdentityParam, allowAsync }) {
  if ((callee.type !== 'ArrowFunctionExpression' && callee.type !== 'FunctionExpression'
    && callee.type !== 'FunctionDeclaration' && callee.type !== 'ObjectMethod'
    && !(callee.type === 'ClassMethod' && callee.static && callee.kind === 'method'))
    || (callee.params?.length && !allowIdentityParam)
    || (callee.async && !allowAsync) || callee.generator) return null;
  // A named function expression binds its own name, outside the declaration scope carried here.
  if (callee.type === 'FunctionExpression' && callee.id?.name
    && identifierReferencedInSubtree(callee.body, callee.id.name)) return null;
  return { ...hop, node: callee, seen, args, argsUnknown, ctx: { ...hop.ctx, scope } };
}

// the ASSIGNMENT a constant-violation records, across the parser duality: babel points the
// violation at the AssignmentExpression itself, estree-toolkit at the written IDENTIFIER, so a
// node-only read saw `Identifier` there and every write-proving walk bailed on that parser
function violationAssignment(violation) {
  const node = violation?.node ?? violation;
  if (node?.type !== 'Identifier') return node;
  const parent = violation?.parentPath?.node ?? violation?.parent;
  return parent?.type === 'AssignmentExpression' && parent.left === node ? parent : node;
}

// function literals proven through a SINGLE conditional assignment (`let f; if (c) f = () =>
// globalThis;`): the call site may run with `f` still undefined, so the CALL is an observable
// effect the collapse must keep in the output (throw / short-circuit fidelity)
const conditionallyProvenCallees = new WeakSet();

// Resolve an inline-eligible call to its proven return expression. Local declarations and
// agreeing return paths keep the original call through `inlineCallHasObservableEffects`:
// their body and scopes survive, while a returned local binding still proves nothing.
// `returnSink` collects possible free returns as hops for a preserved receiver's identity guard;
// a candidate never promises that the function returns it on every path.
// takes the hop standing on the CALL and returns the hop standing on the returned expression: its
// `ctx.scope` is where that expression's identifiers resolve - the callee's declaration scope for
// a body return, the CALL site for an identity-arg return (the argument evaluates there).
// Body returns carry the callee's advanced `seen`; argument returns fork the call site's set.
// The caller's own set stays unmutated.
export function inlineCallReturnExpression(hop, {
  rejectConditional = false, allowMutatingForwarder = false, returnSink = null, allowUninitializedCallee = false,
} = {}) {
  const resolved = resolveInlineCalleeFunction(hop, { allowIdentityParam: true, rejectConditional, allowUninitializedCallee });
  if (!resolved) return null;
  const callee = resolved.node;
  // a return that reads no parameter, nor the arguments object, hands back the same value whatever
  // the call passed, so a parameter list alone keeps no candidate out; one that reads either is the
  // caller's to pair
  const paramNames = returnSink && callee.params?.length ? collectParamBindingNames(callee.params) : null;
  const candidates = returnSink && (!callee.params?.length || paramNames) ? [] : null;
  const body = singleReturnBodyExpression(callee.body, { preservesBody: true, returnSink: candidates });
  if (candidates) for (const node of candidates) {
    if (paramNames && (identifierReferencedInSubtree(node, paramNames) || identifierReferencedInSubtree(node, 'arguments'))) continue;
    returnSink.push({ ...resolved, node });
  }
  if (!callee.params?.length) return body ? { ...resolved, node: body } : null;
  // identity passthrough (`(x) => x` applied to one arg): the body IS the param, so the receiver is
  // the ARG - recovers a call/IIFE-rooted receiver (`((x)=>x)(globalThis).Symbol`, and the nested
  // `g(f()).Symbol` since the arg `f()` is itself resolved by the caller). an SE-bearing arg is
  // preserved by `inlineCallHasObservableEffects` (checks callNode.arguments), so return it as-is
  // ... through a sequence TAIL as well (`tag => (log(tag), tag)`): the prefix runs where the call
  // stands, which the effect gate reports and the call site keeps. the body is read through the
  // parens oxc keeps around an arrow's expression body and babel strips
  const bodyExpr = unwrapTransparentSeq(body);
  const tail = bodyExpr?.type === 'SequenceExpression' ? unwrapTransparentSeq(bodyExpr.expressions.at(-1)) : bodyExpr;
  // the parameter BINDING the returned name: itself, under a default, or as a leaf its pattern destructures
  const index = tail?.type === 'Identifier' ? callee.params.findIndex(param => patternSlotTarget(param).name === tail.name
    || isDestructurePattern(patternSlotTarget(param)) && !!collectParamBindingNames([param])?.has(tail.name)) : -1;
  if (index !== -1) {
    if (resolved.argsUnknown) return null;
    const returnedName = new Set([tail.name]);
    // Only the returned parameter needs this proof. Scanning the first parameter while
    // resolving every callee repeated whole-body walks even when no argument was returned.
    if (paramReboundInBody(callee.body, returnedName)) return null;
    // a slot that is not a plain Identifier carries expressions of its own, and a DEFAULT may write
    // the returned slot (`(value, n = (value = Other)) => value`): the argument then describes a
    // value the call no longer hands back. asked only of a list that HAS such a slot - a plain
    // Identifier param spells no expression, and walking one subtree per parameter to learn that
    // is a cost every ordinary callee would pay
    if (callee.params.some(param => param.type !== 'Identifier')
      && callee.params.some((param, slot) => slot !== index && param.type !== 'Identifier'
        && paramReboundInBody(param, returnedName))) return null;
    // a callee that WRITES through the parameter hands back a value the call site's literal no longer
    // describes, so the argument is no PROOF of what the call yields. a caller that keeps the call and
    // tests the value it gets at runtime asks for such a forwarder by name (`allowMutatingForwarder`);
    // one taking the answer as proven would read the slot the write already replaced
    if (!allowMutatingForwarder && bodyWritesThroughParameter(callee, tail.name)) return null;
    // a leading `this` pseudo-param fills an AST slot and no runtime argument, so the slot's
    // ARGUMENT stands one position lower - the raw index reads the next argument instead
    const param = callee.params[index];
    const target = patternSlotTarget(param);
    const argIndex = argIndexForParam(callee.params, index);
    // the value the parameter TAKES: the argument, or the parameter's own default where the call leaves
    // the slot to it (`argumentOverridesSlot`) - spelled where the callee is declared, where no
    // parameter is bound, so a default reading one proves nothing
    // the argument is a SIBLING sub-expression of the source, not a continuation of the binding and
    // return chain the cycle set guards, so it resolves in the context the call was reached in.
    // carrying the ADVANCED set read a second hop through the same callee NAME as a cycle and
    // answered nothing at all (`pick(pick(Array)).from` lost its polyfill on both methods); what
    // ends this descent is the finite tree, since every step moves strictly inward
    let source;
    if (param.type === 'AssignmentPattern' && !argumentOverridesSlot(resolved.args, argIndex,
      read => !!hop.ctx.adapter.getBinding({ scope: hop.ctx.scope, name: 'undefined', path: hop.ctx.path, read }),
      hop.ctx.adapter.isMutatedStaticSlot ?? hop.ctx.adapter.isMutatedStatic)) {
      const names = collectParamBindingNames(callee.params);
      if (!names || identifierReferencedInSubtree(param.right, names)
        || identifierReferencedInSubtree(param.right, 'arguments')) return null;
      source = { ...resolved, node: param.right };
    } else {
      const argument = resolveCallArgument(resolved.args, argIndex, hop.ctx.adapter.isMutatedStaticSlot ?? hop.ctx.adapter.isMutatedStatic);
      if (!argument) return null;
      // ... where a DEFAULT stands behind it, the argument is the value only if it cannot come out
      // undefined - an object-valued literal, a global constructor - or the default answers instead
      const value = unwrapRuntimeExpr(argument);
      const globalName = value?.type === 'Identifier' && isStaticPlacement(value.name)
        && !hop.ctx.adapter.getBinding({ scope: hop.ctx.scope, name: value.name, path: hop.ctx.path, read: value });
      if (param.type === 'AssignmentPattern' && !ALWAYS_TRUTHY_OBJECT_NODES.has(value?.type) && !globalName) return null;
      source = { ...hop, node: argument, seen: new Set(hop.seen) };
    }
    // ... and a CONTAINER argument is read by its SLOTS, so the literal standing at the call site has
    // to describe the object that comes back: every channel that can replace a slot - a handout to
    // something that writes, a write through a local alias - is a reference the callee kept, and the
    // one proof that rules them all out is that the parameter reached the RETURN and nothing else.
    // asked of the argument's VALUE - the tail of a sequence spelling (`f((log(), { M: Object }))`),
    // which is what the readers of the returned argument descend
    if (target.type === 'Identifier') {
      return !allowMutatingForwarder && CENSUS_CONTAINER_TYPES.has(unwrapExpressionChain(source.node)?.type)
        && !paramReturnsTheValue(callee, dropLeadingThisParam(callee.params).indexOf(param)) ? null : source;
    }
    // ... while a destructured parameter's leaf holds the slot its pattern names, read at the call
    const value = certainPairedSlotValue({ pattern: target, init: source.node, name: tail.name, ctx: source.ctx, seen: source.seen });
    return value ? { ...source, node: value.node, ctx: { ...source.ctx, scope: value.scope } } : null;
  }
  // a body that never READS a param yields the same value for every argument (`(x) => globalThis`,
  // and the tagged spelling that ignores its strings slot the same way), so the call resolves to the
  // body itself. bailing here on a param's mere PRESENCE left the shape unproven: the guard test
  // substituted the root while the static behind it kept reading native off the memo. a param may
  // still carry an effect in a prefix statement - that is the SE channel's business, not the value's
  // the body is resolved in the scope the callee was DECLARED in, where a parameter name is unbound -
  // so a body reading one would silently re-bind it to whatever stands outside under that name, and a
  // parameter spelling a proxy global would capture the realm the call never produced
  const names = collectParamBindingNames(callee.params);
  // ... asked of the NAMES the list binds, a destructuring slot's leaves included: a slot whose
  // bindings the walk cannot enumerate leaves the body unreadable and proves nothing
  return !body || !names || [...names].some(name => identifierReferencedInSubtree(body, name))
    ? null : { ...resolved, node: body };
}

export function isCallShape(node) {
  return node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression';
}

// the spellings the invocation canon pairs DIRECTLY: a call, or a tagged template - its tag the
// callee, its expressions the arguments. a value reader reaches `new` and `await` through
// `realmYieldingCallView`, which proves the callee constructible and the awaited value no thenable
function isPairedCallShape(node) {
  return isCallShape(node) || node?.type === 'TaggedTemplateExpression';
}

// is a `new` callee CONSTRUCTIBLE? only a named function the inline walk resolves to a plain
// declaration or expression: an arrow, an async / generator function and a method are not
// constructible at all - `new` over one throws - and a MEMBER callee hides which of those it holds
function constructibleRealmCallee(node, ctx) {
  if (unwrapTransparentSeq(node.callee)?.type !== 'Identifier') return false;
  const callee = resolveInlineCalleeFunction({ node, seen: new Set(), ctx }, { allowIdentityParam: true })?.node;
  return (callee?.type === 'FunctionDeclaration' || callee?.type === 'FunctionExpression')
    && !callee.async && !callee.generator;
}

// the value-transparent wrappers over a call, as the CALL the inline canon walks: `new` over a
// constructible callee yields what the constructor returns where that is an object - a proxy global
// always is - and `await` yields its operand where the operand is not a thenable (`awaitedValueNoThenable`).
// the view is LOCAL to the proof: every caller keeps re-emitting the source's own node, and the
// await's TICK stays an effect its keepers weigh, never a value difference
export function realmYieldingCallView(node, ctx) {
  const cur = invocationNode(node);
  const call = cur?.type === 'NewExpression'
    ? constructibleRealmCallee(cur, ctx) ? { ...cur, type: 'CallExpression', optional: false } : null : cur;
  return call && (unwrapTransparentSeq(node)?.type !== 'AwaitExpression' || awaitedValueNoThenable(call, ctx)) ? call : null;
}

// is what a call yields provably no THENABLE, so that awaiting it hands that value on? an await
// resolves a thenable through its `then`. the callee's literal qualifies where it is an array, or an
// object spelling no `then` - no such key, no spread, no unfoldable computed key, no `__proto__` - and
// so does a returned proxy global (the realm is none); anything the proof cannot see does not. every
// one of them inherits from `Object.prototype`, an array from `Array.prototype` too, so a `then` the
// FILE writes onto either makes it a thenable after all
const THENABLE_KEYS = new Set([null, 'then', '__proto__']);
function awaitedValueNoThenable(call, ctx) {
  if (prototypeChainMayLend('then', ctx, ['Object'])) return false;
  // an async callee settles the await to what it returns, which the proof reads the same way
  const hop = { node: call, seen: new Set(), ctx, awaited: true };
  const returned = inlineCallReturnExpression(hop, { allowUninitializedCallee: true });
  const followed = returned && followConstIdentifierInit({ ...returned, node: unwrapExpressionChain(returned.node) });
  const value = callYieldedContainer(hop, { allowUninitializedCallee: true })?.literal ?? followed?.node;
  if (value?.type === 'ArrayExpression') return !prototypeChainMayLend('then', ctx, ['Array']);
  if (value?.type === 'ObjectExpression') {
    return value.properties.every(prop => prop.type !== 'SpreadElement' && !THENABLE_KEYS.has(foldedPropertyKeyName(prop)));
  }
  const name = !!value && resolveObjectName({
    objectNode: value, scope: followed.ctx.scope, adapter: ctx.adapter, path: ctx.path,
  });
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return true;
  return !!name && isKnownStaticGlobal(name, ctx.adapter)
    && !!inlineCallReturnExpression({ ...hop, awaited: false }, { allowUninitializedCallee: true })
    && !prototypeChainMayLend('then', ctx, ['Function']) && !ctx.adapter?.isMutatedStaticSlot?.(name, 'then');
}

// the identifier's name when it IS a proxy-global or a transitive alias of the BARE global
// (`const g = globalThis; const h = g;`), null otherwise - an alias whose init NAVIGATES
// (`const w = globalThis.window`) is an undefinable VALUE, not the global itself
function bareProxyGlobalAliasName(node, aliasCtx) {
  let cur = node;
  let ctx = aliasCtx;
  // the pristine question is asked about the node the walk LANDED on, and the entry node is that
  // node until a write moves the walk: a followed write hands over a spelling of its own, and
  // asking the entry about it answered for a binding that is no longer the subject
  let subject = node;
  for (let depth = 0; depth < MAX_KEY_DEPTH; depth++) {
    if (cur?.type !== 'Identifier') return null;
    if (POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) {
      return findProxyGlobal(subject, ctx) ? cur.name : null;
    }
    const followed = enterIdentifierBindingFollow({ node: cur, seen: new Set(), ctx });
    if (!followed?.node) {
      // an init-less binding a TRUSTED write reaches (`let g; (g = globalThis, g.window?.self)`)
      // holds exactly what that write stored - the same follow the binding resolver makes. asked
      // by the init alone the alias spelling answered "unproven" where its BARE twin answered the
      // global, and the probe read off it was then called always-defined: one source, two verdicts
      const write = ctx?.adapter && ctx.scope
        ? trustedIdentifierAliasWrite({ scope: ctx.scope, name: cur.name, adapter: ctx.adapter, path: ctx.path, readNode: node })
        : null;
      if (write) {
        cur = unwrapTransparentSeq(write.right);
        subject = cur;
        ctx = { ...ctx, scope: writeScopeAt(ctx.path, write, ctx.scope) };
        continue;
      }
      // a TERMINAL init-less identifier that is a plugin-minted pure import (`const g =
      // _globalThis` after the in-place rewrite walks here) names its source global through
      // the polyfillHint side-channel (binding field OR adapter hook - the canonical duality);
      // a plain init-less binding (`let n; n = nav;`) stays unproven - its value is the
      // write's, exactly what the guard exists for
      const hint = followed
        ? bindingPolyfillHint({ binding: followed.binding, scope: ctx.scope, name: cur.name, adapter: ctx.adapter }) : null;
      // ... and the hint names what the alias HOLDS: an entry-backed name (`globalThis` by the
      // language, `self` by its ponyfill) is the realm object however it was reached, while an
      // entry-less one (`window` / `global`) can only have come through a probe-hop READ - a
      // destructure alias of a navigation, whose value is exactly the undefinable thing the
      // guard channels asking this proof exist for. it proves no bare root; the value canon
      // (`undefinableProxyRootValue`) owns that alias and keeps its guard live
      const hintName = asProxyGlobalName(hint);
      return guaranteedRealmObjectName(hintName) ? hintName : null;
    }
    cur = unwrapTransparentSeq(followed.node);
    ({ ctx } = followed);
  }
  return null;
}

// the FULL `=` chain of a kept assignment, dug through transparent wrappers AND SE-bearing
// sequences at every level (`((se0(), q = (se1(), w = nav)))` - the assign-only peel refused
// the wrappers and a lowered `?.` memo hid its chain-assign exactly so). an in-place collapse
// keeps the wrappers in the tree; a render that RE-EMITS the prefix needs the peeled expressions
// back: they ride `seqAroundPrefix` in encounter order, which IS their source-eval order (each
// prefix runs before the value below it computes), and re-emit ahead of the assignment heads.
// a render that rebuilds the chain must write the INNERMOST step's value slot (and re-spell
// every head) - replacing the OUTER right slot obliterates the mid-chain writes
function digChainAssignSteps(core) {
  // a sequence is a WRAPPER only while another `=` step lies below its tail; a sequence whose
  // tail is the navigation itself is the assignment's VALUE - the sequence-root question
  // (`allowSequenceRoot`), whose renders keep the prefix inside the value's own span
  function assignBelowSeqTail(seq) {
    let probe = seq;
    for (;;) {
      if (probe && isTransparentWrapper(probe)) probe = probe.expression;
      else if (probe?.type === 'SequenceExpression' && probe.expressions?.length) probe = probe.expressions.at(-1);
      else break;
    }
    return probe?.type === 'AssignmentExpression' && probe.operator === '=';
  }
  const steps = [];
  const prefix = [];
  let cur = core;
  for (;;) {
    if (cur && isTransparentWrapper(cur)) {
      cur = cur.expression;
    } else if (cur?.type === 'AssignmentExpression' && cur.operator === '=') {
      steps.push(cur);
      cur = cur.right;
    } else if (cur?.type === 'SequenceExpression' && cur.expressions?.length && assignBelowSeqTail(cur)) {
      prefix.push(...cur.expressions.slice(0, -1));
      cur = cur.expressions.at(-1);
    } else {
      return steps.length
        ? { steps, value: cur, seqAroundPrefix: prefix.length ? prefix : null } : null;
    }
  }
}

// climb the VALUE spine (wrappers, members, sequence TAILS) to the USER assignment whose `=`
// right slot holds the node - null for a write target, a discarded prefix, or a generated
// (positionless) memo target
// `throughReads` picks WHICH question the walk answers, and the two are not the same one: with it
// the store merely stands somewhere above (the read is observable through it), without it the
// assignment holds THIS value - a member step hands on its own, so `out = nav.Promise[k]` stores
// the read, not the nav, and a rule about what the write HOLDS may not fire there
export function storedUserAssignmentOf(path, { throughReads = true } = {}) {
  for (let p = path; p?.parentPath; p = p.parentPath) {
    const parent = p.parentPath.node;
    if (parent?.type === 'AssignmentExpression' && parent.operator === '=') {
      return parent.right === p.node && nodeCarriesSourceSpan(parent) ? parent : null;
    }
    if (parent?.type === 'SequenceExpression') {
      if (parent.expressions.at(-1) !== p.node) return null;
      continue;
    }
    if (parent?.type !== 'MemberExpression' && parent?.type !== 'OptionalMemberExpression'
      && !SKIPPABLE_WRAPPER_TYPES.has(parent?.type)) return null;
    if (!throughReads && parent.type !== 'ParenthesizedExpression'
      && !TS_EXPR_WRAPPERS.has(parent.type)) return null;
  }
  return null;
}

// the slots a value LEAVES a host through, on its way to whatever reads that host: a sequence tail,
// a further store's right, both arms of a branch and both operands of a logical (a `&&` left leaves
// when falsy - still a value the reader receives), and the wrapper layers. what does NOT hand it on
// is a TEST slot: the branch reads it and hands its arms out instead. the one home for the carrier
// set - the climb below and the emitters' own descents ask it in their own directions
export function handsValueOn(host, child) {
  switch (host?.type) {
    case 'SequenceExpression': return host.expressions.at(-1) === child;
    case 'AssignmentExpression': return host.operator === '=' && host.right === child;
    case 'ConditionalExpression': return host.consequent === child || host.alternate === child;
    case 'LogicalExpression': return host.left === child || host.right === child;
    default: return SKIPPABLE_WRAPPER_TYPES.has(host?.type);
  }
}

// does a write TARGET land on the slot of the pair a read names? a bare name no local binds is the realm's
// slot of that name, a member the pair its key and resolved object spell - every realm name one object, as
// the census keys them (`mutatedStaticKey`): `WeakSet = self.WeakSet` and `self.Promise = globalThis.Promise`
// write the slot they read
export function writeTargetsReadSlot(target, { objectName, keyName, scope, adapter, path }) {
  const left = unwrapTransparentSeq(target);
  const readSlot = mutatedStaticKey(objectName, keyName);
  if (left?.type === 'Identifier') {
    return mutatedStaticKey('globalThis', left.name) === readSlot && !adapter?.hasBinding?.({ scope, name: left.name, path, read: left });
  }
  const key = staticMemberKeyName(left);
  if (key === null) return false;
  const object = resolveObjectName({ objectNode: left.object, scope, adapter, path });
  return !!object && mutatedStaticKey(object, key) === readSlot;
}

// is this member READ the value the write to its OWN slot computes from? `X.y = X.y || patch` reads
// the slot to DETECT it, and that read runs BEFORE the write lands - so the mutation the census
// records for the pair says nothing about it, and the polyfill belongs exactly there: satisfied, the
// detect never installs the third-party patch, and what the slot then holds is core-js's own
// implementation, which is what every read AFTER the write goes on reading raw - an earlier write of
// the slot included: core-js wins every detect. the climb is the value-carrier set's, so the detect is
// recognised through the shapes that hand a value on, whichever realm name spells the read or the write
// (`writeTargetsReadSlot`)
export function readFeedsOwnSlotWrite(readPath, ctx) {
  let child = readPath?.node;
  let up = readPath?.parentPath;
  while (up?.node && handsValueOn(up.node, child)) {
    if (up.node.type === 'AssignmentExpression') return writeTargetsReadSlot(up.node.left, ctx);
    child = up.node;
    up = up.parentPath;
  }
  return false;
}

// ... and WHO owns what such a store hands on. a store nothing reads through holds the value its own
// spelling yields; a PLAIN read THROUGH it (`(q = nav).Map`) is the CONSUMER's, and that read is the proof
// the value must be the realm object. An optional reader tests the value first and proves nothing
// on its absent branch, so the environment probe must stay in the store. Over a consumed run the hop folds,
// where a bare store keeps the collapse's own spelling. ONE home for a question every channel over a
// stored nav asks, and each of them is asked in a DIFFERENT tree state: the consumer renders first
// (outer claims before their receiver's hops), so by the time the run's own channel asks, the read
// above may already be that render's minted sequence - which is why the discard verdict comes with
// the question of whose discard it is
export function storedValueConsumedAbove(path) {
  const store = storedUserAssignmentOf(path);
  if (!store) return false;
  let storePath = path;
  while (storePath?.node && storePath.node !== store) storePath = storePath.parentPath;
  if (!storePath?.node) return false;
  // READING the value is not yet reading THROUGH it: a `typeof`, an argument, a null test observe it
  // without dereferencing, and only a dereference proves what the value must be. the carriers hand
  // it on unchanged - the wrapper layers, a sequence whose tail it is, a further store
  for (let up = storePath.parentPath, child = storePath.node; up?.node; child = up.node, up = up.parentPath) {
    const { node: host } = up;
    if (isMemberAccessNode(host) && host.object === child) return !host.optional;
    if (host.type === 'VariableDeclarator' && host.init === child) return isDestructurePattern(host.id);
    if (host.type === 'AssignmentExpression' && host.operator === '=' && host.right === child) {
      if (isDestructurePattern(host.left)) return true;
      continue;
    }
    if (host.type === 'SequenceExpression' && host.expressions.at(-1) !== child) {
      // a sequence the SOURCE wrote holds the value beside its own expressions and reads nothing
      // through it; a MINTED one is a render's rebuilt read of exactly this value (`(q = nav).Map`
      // becomes `(q = nav, _Map)`), so the discard there IS the consumer
      return !nodeCarriesSourceSpan(host);
    }
    if (!handsValueOn(host, child)) return false;
  }
  return false;
}

// the LATE half of the store's guard verdict (`storeTakesGuard` is the early half): is the
// store's absence READ by flush time - a null test or another truth-reader standing over it,
// or a `?.` chain leading to a CLAIM, whose rendered guard test will read this store (the
// other leg re-visits the store inside that test's clone and keeps the probe the same way)?
// a `?.` no claim will guard observes nothing: over the always-defined value form it is the
// collapse's own vestigial class, and both legs hand such a store the value spelling.
// sequence: only the tail hands the value on
export function storedAbsenceObservedAbove(assignPath, { resolvePureGlobal, resolvePureStatic }) {
  for (let child = assignPath, up = child.parentPath; up?.node; child = up, up = up.parentPath) {
    const { node } = up;
    if (SKIPPABLE_WRAPPER_TYPES.has(node.type)) continue;
    if (node.type === 'SequenceExpression') {
      if (node.expressions.at(-1) !== child.node) return false;
      continue;
    }
    if (node.type === 'OptionalMemberExpression' || node.type === 'OptionalCallExpression') {
      // both resolution arms of `claimBelowEndOwnsChain`, asked of the chain ABOVE including
      // its end: a global's own name, or a static off a named host. an unnameable key is a
      // step, not a stop
      for (let m = up; m?.node; m = m.parentPath) {
        const mn = m.node;
        if (SKIPPABLE_WRAPPER_TYPES.has(mn.type)) continue;
        if (mn.type !== 'MemberExpression' && mn.type !== 'OptionalMemberExpression') break;
        const key = mn.computed ? null : staticMemberKeyName(mn);
        if (!key) continue;
        if (resolvePureGlobal?.(key)) return true;
        const host = staticMemberKeyName(mn.object);
        if (host && !POSSIBLE_GLOBAL_OBJECTS.has(host)
          && resolvePureStatic?.(host, key)?.kind === 'static') return true;
      }
      return false;
    }
    if (node.type === 'BinaryExpression') {
      return (node.operator === '==' || node.operator === '!=' || node.operator === '===' || node.operator === '!==')
        && (isNullLiteralNode(node.left) || isNullLiteralNode(node.right) || isUndefinedNode(node.left)
          || isUndefinedNode(node.right));
    }
    return node.type === 'LogicalExpression' || node.type === 'ConditionalExpression'
      || node.type === 'UnaryExpression';
  }
  return false;
}

// a pristine PROXY-named hop on the VALUE spine of a user chain-assign target whose receiver
// below is UNDEFINABLE: the hop collapse would change what the assignment STORES
// (`(k = globalThis.window.self)` must not store the ponyfill where the source stores what the
// environment's `window.self` holds), so the claim stands down and the caller renders the
// stored canon through the returned assignment. the READ position keeps the realm collapse.
// a READ target stays sound: its reads classify through the rendered guard conditional
// (`resolveAliasValueNode`'s defined-branch arm), so their claims and guards survive
export function storedNavHopClaimSuppressed(path, { scope, adapter, resolvePure }) {
  if (!memberProxyHopName(path.node)) return false;
  const stored = storedUserAssignmentOf(path, { throughReads: false });
  if (!stored) return false;
  // the write IS the proof the canon asks for: a stored read observes the whole proxy spine
  // below the probe hop, so a deeper unresolvable hop guards here where a plain nav collapses
  return proxyReceiverValueCanBeUndefined(path.node.object, resolvePure, { scope, adapter, path },
    { observableRead: true }) ? stored : false;
}

// a computed STRING-LITERAL key (`globalThis['self']`) navigates like the dotted spelling
function plainNavHopKey(node) {
  if (!node.computed) return node.property?.name ?? null;
  const key = peelTransparentExpr(node.property);
  return key?.type === 'TemplateLiteral' ? null : extractStaticString(key);
}

// a chain MARKER whose `?.` the guard canon ERASES guards nothing: the source cannot short-circuit
// there, so every receiver question below may read the nav it wraps. asked once, at the route's
// entry - the marker alone otherwise declined the extraction and the claim shipped native, while
// the babel binding (whose parser spells no marker at all) extracted off the same source
export function peelDeadChainMarker(node, guardCtx = null) {
  const cur = peelTransparentExpr(node);
  if (cur?.type !== 'ChainExpression' || !guardCtx?.resolvePure) return node;
  const inner = peelTransparentExpr(cur.expression);
  return undefinableOptionalGuard(inner, guardCtx.resolvePure, guardCtx.aliasCtx ?? null).kind === 'erase'
    ? inner : node;
}

// the one hop walk both nav questions ride - "is this a nav?" and "which surface does it name?":
// they differ in what they READ off the chain, never in what counts as a hop. an ERASED `?.` is
// transparent to the walk, its own hop carrying the marker's flag, so the guard verdict travels
// with the node - a resolver that judged the flags alone answered the opposite for a marked twin
// ... and a `?.` the marker no longer wraps - a canonical resolver peels the wrapper and hands the
// member on - is dead on the same verdict: the value canon says the chain cannot short-circuit
export function navHopChain(node, guardCtx = null, opts = null) {
  const { throughSequenceTails = false } = opts ?? {};
  const peeled = peelDeadChainMarker(node, guardCtx);
  const core = peelTransparentExpr(peeled);
  const deadOptionals = peeled !== node || (!!guardCtx?.resolvePure && receiverCarriesLiveOptional(core)
    && !navValueCanShortCircuit(core, guardCtx.resolvePure, guardCtx.aliasCtx ?? null));
  const keys = [];
  let computed = false;
  let wrapped = false;
  function hopIsNav(hop) {
    return isMemberAccessNode(hop) && (deadOptionals || !hop.optional) && plainNavHopKey(hop) !== null;
  }
  let cur = core;
  while (hopIsNav(cur)) {
    keys.push(plainNavHopKey(cur));
    computed ||= !!cur.computed;
    const object = throughSequenceTails ? peelReceiverSequenceTail(cur.object) : cur.object;
    cur = peelTransparentExpr(object);
    wrapped ||= cur !== object;
  }
  return { root: cur, keys: keys.toReversed(), computed, wrapped };
}

// The shape of an already admitted navigation: static member links end at an identifier or this.
// This is not a realm-identity proof. Callers establish that separately; a selection has its own
// proof. A caller stepping through sequence tails must preserve their effects in its kept value.
export function isPureNavReceiver(node, guardCtx = null, opts = null) {
  const { root } = navHopChain(node, guardCtx, opts);
  return root?.type === 'Identifier' || root?.type === 'ThisExpression';
}

// the backed-hop peel a kept sequence's guard test reads through: pristine possible-global hops
// navigate into the SAME surface, so above a PROBE they drop and the test reads at most the probe
// hop itself, never dereferencing past it. the ROOT is proved separately (`realmRootKind` below)
export function peelPristineProxyHops(node, { adapter, resolveGlobalPolyfill }) {
  let base = node;
  while (base?.type === 'MemberExpression' && !base.computed
    && POSSIBLE_GLOBAL_OBJECTS.has(base.property?.name)
    && isPristineProxyGlobal(adapter, base.property.name)
    && resolveGlobalPolyfill(base.property.name)) {
    base = unwrapRuntimeExpr(base.object);
  }
  return base;
}

// the kept-sequence TAIL decision both bindings apply (the former unplugin tail fold, shared with
// babel's memoized guard receiver): a tail the peel erases WHOLE folds onto its outermost hop's own
// ponyfill (`(c++, globalThis.self)` tests `_self` - the realm-fold canon); a tail whose peel stops
// on the environment PROBE with the spine below it backed keeps that probe as the guard test and
// reads the always-defined leaf past it (`(c++, globalThis.window.self)` tests `null ==
// _globalThis.window ? void 0 : _self`); any other stop keeps the tail as written. a kept WRITE at
// the tail hands its own value on, so the fold lands in the write's VALUE slot (`holder` / `key`) -
// read as an opaque tail instead, the store spelled the ponyfill while the guard beside it still
// tested the probe, and the user's variable held the realm object on the very branch the guard
// calls absent. a nested sequence retains the environment test before its backed tail
export function planKeptSequenceTail(node, ctx) {
  let nested = false;
  for (let seq = node; seq?.type === 'SequenceExpression';) {
    const tail = unwrapRuntimeExpr(seq.expressions.at(-1));
    if (tail?.type === 'SequenceExpression') {
      nested = true;
      seq = tail;
      continue;
    }
    const write = tail?.type === 'AssignmentExpression' && tail.operator === '=' ? tail : null;
    const navNode = write ? unwrapRuntimeExpr(write.right) : tail;
    const peeled = peelPristineProxyHops(navNode, ctx);
    if (peeled === navNode) return null;
    // the ROOT proof is binding-aware, never the file census alone: a shadowed realm name
    // (`function f(self)`) holds the user's object, and the hop peel above is name-blind - an
    // unproven root leaves the tail exactly as written. THE canon (`proxyGlobalRootName`) answers
    // name and alias alike with the shadow bail built in; a DIRECT realm name needs no entry of
    // its own (the mint is of the HOP's ponyfill, `window` roots included). a realm read out of a
    // container slot (`arr[0]` over `[globalThis]`) is no such root, so its `window?.` folds - an accepted price
    function realmRootKind(base) {
      const name = base?.type === 'Identifier' && ctx.aliasCtx
        ? proxyGlobalRootName({ node: base, ...ctx.aliasCtx }) : null;
      if (!name || !POSSIBLE_GLOBAL_OBJECTS.has(name) || !isPristineProxyGlobal(ctx.adapter, name)) return null;
      return POSSIBLE_GLOBAL_OBJECTS.has(base.name) ? 'direct' : 'alias';
    }
    const wholeKind = realmRootKind(peeled);
    const probeRootKind = peeled?.type === 'MemberExpression'
      ? realmRootKind(peelPristineProxyHops(unwrapRuntimeExpr(peeled.object), ctx)) : null;
    // ... and no hop earns a guard inside a caller-correct FALLBACK SLOT (`lastGuardEarningHopIdx`
    // owns that rule): the slot keeps the always-defined literal rather than the absent host's throw
    const probeStop = !wholeKind && !inCallerCorrectFallbackSlot(ctx.aliasCtx?.path)
      && unbackedProxyHopKey(peeled, meta => ctx.resolveGlobalPolyfill(meta.name)) && !!probeRootKind;
    if (!wholeKind && !probeStop) return null;
    return {
      holder: write ?? seq.expressions,
      key: write ? 'right' : seq.expressions.length - 1,
      // At the nested-sequence boundary, a kept write and a proven alias carry the realm value
      // into the outer null test.  Flat sequence memos retain their environmental probe.
      probe: probeStop && !(nested && (write || probeRootKind === 'alias')) ? peeled : null,
      pure: ctx.resolveGlobalPolyfill(navNode.property.name),
    };
  }
  return null;
}

// does this nav collapse to ONE probe over a ponyfill leaf, with nothing above the collapse? then a
// caller about to MEMOIZE it composes with the guard that render builds instead: the probe is the
// test and the leaf pure is what every read of the value spells. both bindings ask it at their own
// memo sites - a memo there would spell a second test over the first.
// `readThrough` is the caller's own position fact: a member reads the memoized value on (see the plan),
// `readerKey` that member's key
export function composableNavGuardPlan(navNode, {
  scope, adapter, path, resolvePure, readThrough = false, readerKey = null,
}) {
  if (!adapter || !scope || !resolvePure) return null;
  // never under a reader naming a slot the source writes AND a ponyfill serves: the read must reach
  // the user's patch through the memoized surface, where a composed base reads the pristine ponyfill.
  // a slot no ponyfill serves reads the realm either way, and composes like any other
  if (readerKey && isMutatedGlobalSlot(adapter, readerKey) && resolvePure({ kind: 'global', name: readerKey })) return null;
  // an undefinable ROOT is the probe itself: the memo composes a test on it exactly as on a probe
  // hop (`A?.self.X` off `A = globalThis.window` tests `A`), where memoizing the collapsed leaf
  // spelled a second test over the root guard the hop render builds
  // the SEQUENCE root is owned here too: what the composition re-emits is the PROBE alone, and the
  // prefix rides inside it exactly where the source runs it. the danger `allowSequenceRoot` carries
  // is a re-emitted root SPAN, which is the whole-nav render's shape, not this one - here the nav
  // stays where it stands and only its test is spelled
  const plan = planProvenNavGuardCollapse({
    rootNode: navNode,
    scope,
    adapter,
    path,
    resolvePure,
    allowUndefinableRoot: true,
    allowSequenceRoot: true,
    readThrough,
  });
  if (!plan || plan.topAssign || !plan.leafPure) return null;
  if (!navPlanNeedsGuard(plan)) return null;
  if (plan.hops.length !== plan.collapseIdx + 1) return null;
  // ... spelled through the kept WRITE that stores the root (`null == (a = w)`): the store is the
  // source's own act and the test is where it runs
  const probe = plan.rootUndefinable ? plan.rootAssign ?? plan.rootId : plan.hops[plan.lastUnresolvableIdx]?.node;
  return probe ? { probe, pure: plan.leafPure } : null;
}

// a sequence in the STORED VALUE hands its tail on, and the caller that asks for the descent lands
// its render in that tail - the prefix keeps running where the source wrote it. reports WHETHER it
// descended, because only then may the render land deeper than the value slot itself
function storedValueCore(value, descend) {
  const node = descend ? peelReceiverSequenceTail(value) : value;
  return { node, descended: node !== value };
}

// does this navigation fold WHOLE because it stands in a caller-correct fallback slot? the slot rule
// (provider AGENTS.md) keeps the always-defined literal there rather than reproducing the absent-host
// throw - but only over a PLAIN nav, the doctrine's own wording: a live `?.` in the navigation is a
// branch the SOURCE wrote, and no slot rule erases one
function navFoldsInFallbackSlot(hops, path) {
  return hops.every(hop => !hop.optional) && inCallerCorrectFallbackSlot(path);
}

// a hop earns a GUARD only when its own read can genuinely be undefined - the positional rule the
// value canon owns (`globalThis.window` is the environment probe; a DEEPER unresolvable hop is a
// realm self-reference the collapse assumes present). keying on name-resolution alone built a
// test for a value the same canon calls defined, and split the emitters on their own boundary
// ... and in a caller-correct FALLBACK SLOT no hop earns one at all: the slot keeps the
// always-defined literal, so the whole nav folds onto its leaf. only for a PLAIN nav - that is the
// doctrine's own wording, and a live `?.` in the navigation is a branch the SOURCE wrote.
// over a root that IS the environment read (an alias holding the probe's value, a bare probe name)
// every unbacked hop is such a deeper one, and the root's own test covers what it reads.
// the probe earns it only where the source's own `?.` reads its value - the hop right above it - and
// the two reads the value canon keeps observable earn it the same way: the hop a MUTATING consumer
// holds (`mutationGuardKeepingHop`) and the value a kept write stores
function lastGuardEarningHopIdx(hops, { collapseIdx, path, resolvePure, rootIsProbe, keptProbe, storedValue }) {
  if (rootIsProbe || navFoldsInFallbackSlot(hops, path)) return -1;
  for (let i = collapseIdx - 1; i >= 0; i--) {
    const probe = i === 0 || hops[i].node === keptProbe || hops[i].node === storedValue;
    if (hops[i + 1].optional && probe && !resolvePure({ kind: 'global', name: hops[i].name })) return i;
  }
  return -1;
}

// the realm hops a ponyfill is READ THROUGH fold away before anything is indexed. a hop the pure
// build cannot back names a realm self-reference; standing over a ponyfill it is a read that
// ponyfill cannot answer off-browser (`_self.window.X` throws where the source, written for a
// browser, read a value), and the collapse assumes the realm present anyway. what STAYS is the
// environment PROBE - the unbacked prefix reading off the source root, where the `?.` the source
// wrote is load-bearing. what a computed key spells is not part of the question: the hop is named by
// the canon like any other. Effectful keys never enter the collapse plan.
function foldReadThroughRealmHops(hops, { adapter, resolvePure, keptProbe = null, keepTerminal = true, path = null }) {
  let overPure = false;
  return hops.filter((hop, index) => {
    if (!foldableRealmHopKey(hop.name, { adapter, resolvePure }, path && { node: hop.node, path })) {
      overPure = !!resolvePure({ kind: 'global', name: hop.name });
      return true;
    }
    // ... and the probe a MUTATING consumer's `?.` tests reads through nothing: what the fold drops
    // there is not the value of a read but the branch deciding whether the write lands
    // The terminal hop IS this plan's value. Its environment probe stays readable even when
    // the backed span below it is replaced; only an actual reader may fold through the hop.
    if (hop.node === keptProbe || (keepTerminal && index === hops.length - 1)) return true;
    return !overPure;
  });
}

// PLAN a proven-nav guard collapse: the shared semantics both emitters render. a navigation
// over a PROVEN root (an inline-provable call, a pristine proxy-global identifier), optionally
// wrapped in a kept chain-assign, whose hops are all pristine proxy-global names splits into:
// (`throughKeptAssign` lets the hop descent continue THROUGH a kept write under a live `?.` - the
// write is an emit concern, and `assignWrap` hands its span back so the render spells it inside
// the test rather than after the read)
//   - the raw PREFIX up to the LAST unresolvable hop (stays in the guard test - collapsing it
//     would test an always-defined ponyfill and break the short-circuit),
//   - the ponyfill LEAF at the last resolvable hop,
//   - the TAIL hop names above it (`liveOptional` spelling - see the per-hop verdict below).
// Effectful realm keys stay in the source, with their ordinary traversal and short-circuit.
// kinds: 'nested' (a prefix test survives), 'sequence' (no prefix, but the root or its arg
// carries effects the collapse must keep), 'bare' (everything provably drops). null = not this
// shape; the callers keep their own canons there.
// `readThrough`: a member reads the run's value on, so its terminal realm hop is a self-reference
// that folds like the others, and a run with no hop pure can back lands on its root's own ponyfill -
// past the probe every hop names the realm the probe read
// eslint-disable-next-line max-statements -- the descent, the root proof and the per-hop verdicts of one plan
export function planProvenNavGuardCollapse({
  rootNode, scope, adapter, path, resolvePure, allowSequenceRoot = false,
  throughKeptAssign = false, descendSequenceTail = false, storedValueSequenceTail = false,
  allowUndefinableRoot = false, readThrough = false,
}) {
  let core = unwrapTransparentSeq(rootNode);
  const dug = digChainAssignSteps(core);
  const topAssign = dug?.steps[0] ?? null;
  const topAssignSteps = dug?.steps ?? [];
  const seqAroundPrefix = dug?.seqAroundPrefix ?? null;
  if (topAssign) core = unwrapTransparentSeq(storedValueCore(dug.value, storedValueSequenceTail).node);
  if (core?.type !== 'MemberExpression' && core?.type !== 'OptionalMemberExpression') return null;
  const hops = [];
  // one hop of the descent: record it and hand back the object below, or null when the key is not
  // a pristine proxy-global. both descents below take their steps through here
  function takeHop(node) {
    // the dotted key through the canon: a PRIVATE name carries `.name` too, and read raw it passed
    // for the realm self-reference it can never be
    const name = pristineRealmHopKey(node, { scope, adapter, path });
    if (!name) return null;
    hops.unshift({ name, node, optional: !!node.optional });
    return unwrapTransparentSeq(node.object);
  }
  // one descent, used twice: for the nav itself and, under a live `?.`, for the nav a kept write
  // stores. returns the node below the hops, or null when a key is not a pristine proxy-global.
  // local by necessity: the canon's walkers answer about a chain as a WHOLE - `descendToChainRoot`
  // hands back the root, `maximalProxyGlobalPrefix` the prefix, `navValueCanShortCircuit` a verdict -
  // while this one has to record each hop into this plan's own array as it goes
  function descendHops(from) {
    let at = from;
    while (at?.type === 'MemberExpression' || at?.type === 'OptionalMemberExpression') {
      at = takeHop(at);
      if (at === null) return null;
    }
    return at;
  }
  let n = descendHops(core);
  if (n === null) return null;
  // a SEQUENCE below the hops (`(se(), globalThis).self.window`) is owned ONLY on request
  // (`allowSequenceRoot`): the 'sequence' renders re-emit the root span, but an INNER claim's
  // own queued rewrite (`arr.at(0)` in the prefix) has no slot in that re-emit - the guard
  // channels re-emit a snapshot taken before those claims land, so widening this walk
  // unconditionally dropped their polyfills. an IMMEDIATE value-position consumer renders live
  // nodes and opts in; everyone else keeps the root-substituted raw spelling for the shape
  const seqRootNode = allowSequenceRoot && n?.type === 'SequenceExpression' ? n : null;
  const seqRootEffects = !!seqRootNode && seqRootNode.expressions.slice(0, -1).some(mayHaveSideEffects);
  // the peel stops at the sequence's own tail unless the caller asks to DESCEND past it: below the
  // tail the hops are the nav's own, and owning them lets the plan render the whole thing - which
  // only a consumer that both re-emits the peeled prefix AND keeps the sealed read may ask for.
  // the probe is that consumer; a kept-nav flush is not, and letting it own the shape cost first the
  // prefix effect and then the read's throw
  if (seqRootNode) {
    n = descendSequenceTail ? descendHops(unwrapTransparentSeq(peelReceiverSequenceTail(seqRootNode)))
      : peelReceiverSequenceTail(seqRootNode);
    if (n === null) return null;
  }
  // the kept write under the nav, and the root below it. a write can sit under a sequence
  // (`(n++, w = globalThis.window)?.self`) - the VALUE question reads through both, so the tail is
  // peeled first, under the same opt-in that lets the hop descent continue THROUGH the write. that
  // descent needs a live `?.` above it: `(m = globalThis.window).self` has no short-circuit to
  // reproduce, and descending there rendered a guard the source never wrote and dropped the write
  // local: it exists so the sequence peel and the live-`?.` condition live in ONE place (they are the
  // same decision) - no canon candidate answers "the write under this nav plus the root below it"
  function keptWriteRoot() {
    const host = throughKeptAssign ? peelReceiverSequenceTail(n) : n;
    const { outer, value } = peelChainAssignment(host);
    const below = outer ? unwrapTransparentSeq(value) : n;
    if (!throughKeptAssign || !outer || !hops[0]?.optional) return { outer, below };
    return { outer, below: descendHops(below), stored: below };
  }
  const { outer: chainAssign, below: call, stored: storedValue = null } = keptWriteRoot();
  if (call === null) return null;
  const aliasCtx = { scope, adapter, path };
  // an ALIAS root (`const g = globalThis; g.window?.self...`) resolves to the global it names -
  // the pristine gate below must ask about THAT name, not the local alias identifier (which is
  // never a possible-global name and would bail the whole plan for a semantically identical nav).
  // a CHAIN-ASSIGN wrapper is an emit concern, not a proof one: the write rides the rendered
  // test / sequence prefix, so an identifier root proves through it exactly like a call root
  // through the SAME proxy-root canon the undefinability verdict next door asks: the bare-alias
  // walk stops at an init-less binding on purpose (its value is the write's), but the ROOT question
  // is which global the identifier names, and the trusted-write resolver answers it - split, the
  // plan declined a nav whose undefinability the sibling verdict had already proven
  const identRootName = call?.type === 'Identifier'
    ? bareProxyGlobalAliasName(call, aliasCtx) ?? proxyGlobalRootName({ node: call, ...aliasCtx }) : null;
  const identRoot = identRootName ? call : null;
  if (!identRoot && call?.type !== 'CallExpression' && call?.type !== 'OptionalCallExpression') return null;
  const rootId = identRoot ?? inlineCallProxyGlobalRoot({ callNode: call, scope, adapter, path });
  // an emitter may have already rewritten the proven root INSIDE the callee to its pure
  // import (`() => _globalThis`); the import binding names its source global through the
  // polyfillHint side-channel - resolve through it exactly like the bare-alias walk
  const rootName = identRootName
    ?? (rootId && (asProxyGlobalName(rootId.name) ?? bareProxyGlobalAliasName(rootId, aliasCtx)));
  if (!rootName || !isPristineProxyGlobal(adapter, rootName)) return null;
  // proving WHICH global a call root yields is not proving it yields a DEFINED one: a body reaching
  // the environment probe (`() => globalThis.window`) is undefined off-window, and every render this
  // plan offers reads THROUGH that value. only where the `?.` it would ERASE guards the call value
  // itself - the hop read directly off it; an optional higher up guards what the call produced, and a
  // plain read throws before any of them, so those keep the ordinary collapse both legs spell.
  // an OPTIONAL call link keeps its own `?.` in every render, so its undefinedness is reproduced
  if (!identRoot && !call.optional && hops[0]?.optional
    && callValueCanBeUndefined(call, aliasCtx, resolvePure)) return null;
  // ... and an IDENTIFIER root is held to the same bar: a bare probe name (`window?.self`) or an
  // alias holding a probe read or a rendered guard (`const A = globalThis.window; A?.self`) proves
  // WHICH realm the run reads, not that the read is defined - the plan's 'bare' kind would call
  // everything below the leaf droppable and erase the `?.` the source wrote over the root. the
  // claim verdict sources that guard from the root itself; a render that spells the root test of
  // its own asks for the plan anyway (`allowUndefinableRoot`) and reads the flag
  const rootUndefinable = !!identRoot && !!hops[0]?.optional
    && undefinableProxyRootValue(identRoot, resolvePure, aliasCtx);
  if (rootUndefinable && !allowUndefinableRoot) return null;
  // the probe hop the shared exception keeps for a MUTATING consumer survives that fold: over a
  // ponyfill a read really does pass through such a hop, while a write or a delete performs its act
  // on the ponyfill instead of taking the source's branch
  const keptHop = mutationGuardKeepingHop(core, resolvePure, aliasCtx);
  const keptProbe = keptHop ? unwrapRuntimeExpr(peelReceiverSequenceTail(keptHop.object)) : null;
  // A guard observes the store before dereferencing it. A plain consumer owns the stored
  // realm value instead, including after its claim has become a generated sequence.
  const optionalStore = topAssign && ownChainOptionalObjects(path?.node)
    .some(object => peelChainAssignment(peelReceiverSequenceTail(object)).outer === topAssign);
  // A cloned value differs by identity from its source RHS without gaining a consumer.
  // Only a source member surrounding the store supplies the anchor's dereference proof.
  const consumedStore = topAssign && !optionalStore && !runStandsInLoweredGuardTest(path, unwrapRuntimeExpr)
    && (storedValueConsumedAbove(path)
      || (isMemberAccessNode(path?.node) && nodeRangeContains(path.node, topAssign)));
  // A root guard already protects the backed claim. Its continuation folds the
  // same realm hops as the claim-tail planner; a kept mutation probe still wins.
  hops.splice(0, hops.length, ...foldReadThroughRealmHops(hops,
    { adapter, resolvePure, keptProbe,
      keepTerminal: !consumedStore && !readThrough && !rootUndefinable, path }));
  let collapseIdx = -1;
  // the winning entry travels with the plan: every renderer needs exactly this resolution, and
  // re-asking it there also carried a `!pure` bail that the plan's own existence rules out
  let leafPure = null;
  for (let i = hops.length - 1; i >= 0; i--) {
    leafPure = resolvePure({ kind: 'global', name: hops[i].name });
    if (leafPure) {
      collapseIdx = i;
      break;
    }
  }
  if (collapseIdx === -1 && readThrough) {
    leafPure = resolvePure({ kind: 'global', name: rootName });
    if (leafPure) collapseIdx = hops.length - 1;
  }
  if (collapseIdx === -1) return null;
  const lastUnresolvableIdx = lastGuardEarningHopIdx(hops,
    { collapseIdx, path, resolvePure, rootIsProbe: rootUndefinable, keptProbe, storedValue });
  // per-hop `?.` verdict for the TAIL, the spelling both emitters read off the plan: an optional
  // is load-bearing only over a value that can short-circuit, and above the collapse that value
  // starts as the always-defined ponyfill leaf (`_self.window?.global`). the KEPT prefix's own
  // `?.` spelling is not decided here - it belongs to `vestigialNavOptionals`, which both
  // emitters consult for exactly those hops
  let tailShortCircuits = false;
  for (let i = collapseIdx + 1; i < hops.length; i++) {
    hops[i].liveOptional = hops[i].optional && tailShortCircuits;
    tailShortCircuits ||= !resolvePure({ kind: 'global', name: hops[i].name });
  }
  const rootEffects = !!chainAssign || seqRootEffects
    || (!identRoot && inlineCallHasObservableEffects({ callNode: call, scope, adapter, path }));
  // the kept write rides INSIDE the rendered test - but ONLY the 'nested' render has a test to put
  // it in. the 'sequence' and 'bare' renders spell it their own way (the re-emitted
  // root), and reporting it here would make them drop it as already-spelled or print it twice
  const prefixHopNode = lastUnresolvableIdx === -1 ? null : hops[lastUnresolvableIdx].node;
  const assignWrap = chainAssign && prefixHopNode && chainAssign.start <= prefixHopNode.start
    && chainAssign.end >= prefixHopNode.end ? chainAssign : null;
  // WHAT the two value verdicts below read - one shape, asked twice with different slots
  const valueFormShape = {
    kind: lastUnresolvableIdx !== -1 ? 'nested' : rootEffects ? 'sequence' : 'bare',
    seqAroundPrefix,
    rootEffectCall: !chainAssign && !identRoot && rootEffects ? call : null,
    rootValueNode: seqRootNode ?? n,
    call: identRoot ? null : call,
    rootEffects,
  };
  return {
    assignWrap: lastUnresolvableIdx !== -1 ? assignWrap : null,
    kind: lastUnresolvableIdx !== -1 ? 'nested' : rootEffects ? 'sequence' : 'bare',
    // whether the root below the hops does anything observable - a write, a sequence prefix, an
    // effect-bearing call. the base substitution of `navGuardTestBase` spells the whole prefix away,
    // so it is exactly this that decides whether it may
    rootEffects,
    // the WRITE the plan's own test spells (`null == (w = _globalThis).window`): a consumer replaying
    // the claim's side effects must skip it, or the source's single store runs twice - and a raw
    // replay spells it unpolyfilled (`w = globalThis`), a bare global in usage-pure output
    rootAssign: chainAssign ?? null,
    topAssign, topAssignSteps, topValue: dug?.value ?? null, hops, collapseIdx, lastUnresolvableIdx,
    seqAroundPrefix,
    leafName: hops[collapseIdx].name, leafPure, rootValueNode: seqRootNode ?? n, seqRoot: !!seqRootNode,
    // the root itself can be absent (an alias holding a probe, a bare probe name): the render owes a
    // test on it, ahead of whatever the hops fold to
    rootUndefinable,
    // the sequence's TAIL is part of what the hops navigate, so a render that descended past it
    // re-emits the PREFIX only: spelling the whole sequence puts the tail's ponyfill in twice
    // (`(k++, _globalThis, _self).window`)
    seqTailDescended: !!seqRootNode && descendSequenceTail,
    // asked of the RAW right, not of the dug value: the chain-assign walk hands the value with its
    // transparent layers already peeled, so a render reading the flag off the peeled node landed OVER
    // them and dropped an assertion the source wrote - and a runtime narrowing outranks the wider
    // type it asserts, so the layers stay and the render lands inside them
    storedValueSeqDescended: !!topAssign
      && storedValueCore(topAssignSteps.at(-1)?.right, storedValueSequenceTail).descended,
    // the proven root identifier and its resolved global name: an IDENT root's own node (a
    // call root's inlined identifier lives off-span inside the callee and is not this), so a
    // piecewise render can substitute the root inside a kept source slice
    rootId: identRoot, rootName,
    call: identRoot ? null : call,
    // the resolve context travels with the plan: a render re-asks the shared vestigial-`?.`
    // verdict about the kept prefix (a CLONE of it, so node identity cannot carry it)
    ctx: aliasCtx, resolvePure,
    // an effect-bearing CALL root the render re-emits (nested: inside the prefix test;
    // sequence: as the kept prefix) - it runs exactly ONCE there, so every other SE channel
    // (a discard harvest, a claim side-effect replay) must not re-run it
    rootEffectCall: !chainAssign && !identRoot && rootEffects ? call : null,
    // WHAT a kept store's value slot takes - the plan's VALUE spelling or its guarded render. ONE home
    // for a question the render channels used to answer apart: whichever of them reached the store
    // first decided it, and which one reaches depends on the POSITION (a deferred body, a repeated
    // statement, a fallback slot), so one source rendered differently by where it stood
    valueFormSpells: planValueFormSpells(valueFormShape),
    storedValueSpells: planValueFormSpells(valueFormShape)
      && !!topAssignSteps.at(-1)?.right
      && !navValueCanShortCircuit(topAssignSteps.at(-1).right, resolvePure, { scope, adapter, path },
        { observableRead: true }),
  };
}

// A nav plan owes a guard for an absent source root or a probe before its backed leaf.
// The leaf's own definedness never licenses erasing that earlier short-circuit.
export function navPlanNeedsGuard(plan) {
  return !!plan && (plan.kind === 'nested' || !!plan.rootUndefinable);
}

// the expressions a nav plan's ROOT runs before its leaf: sequence prefixes at every nesting
// depth and the effect-bearing call at their tail. a non-sequence root is itself the kept effect
// (a call or a write). the plan's kind describes its render, so nested plans can owe this prefix
// too; the binding's speller keeps or clones each source node for its own traversal lifetime.
export function navRootPrefixNodes(plan, spell) {
  if (!plan.seqRoot) return [spell(plan.rootValueNode)];
  const out = [];
  peelSequenceTail(plan.rootValueNode, {
    step: unwrapRuntimeExpr,
    onPrefix: expressions => out.push(...expressions.slice(0, -1).map(expr => spell(expr))),
  });
  if (plan.rootEffectCall && inlineCallHasObservableEffects({ callNode: plan.rootEffectCall, ...plan.ctx })) {
    out.push(spell(plan.rootEffectCall));
  }
  return out;
}

// does the plan's VALUE spelling carry everything its guarded render does? only when the plan has no
// effects to re-emit: a sequence prefix and an effectful call root both live INSIDE the rendered
// prefix, and the value form has no slot for either. Effectful realm keys never enter this plan.
function planValueFormSpells(shape) {
  if (shape.kind !== 'nested' || shape.seqAroundPrefix?.length || shape.rootEffectCall) return false;
  // an effect-free proven CALL root spells too: the fold drops the call with the navigation and there
  // is nothing it DID on the way to replay - the value is the leaf its hops reached
  return unwrapRuntimeExpr(shape.rootValueNode)?.type === 'Identifier'
    || (!!shape.call && !shape.rootEffects);
}

// resolve a call ROOT to the proxy-global it provably yields, walking NESTED single-return
// wrappers (`const f = () => g(); const g = () => globalThis`) - each layer inlines through the
// same canon; one `seen` set guards cycles across the whole walk
export function inlineCallProxyGlobalRoot({ callNode, scope, adapter, path, rejectConditional = false }) {
  let hop = { node: callNode, seen: new Set(), ctx: { scope, adapter, path } };
  while (isCallShape(hop.node)) {
    hop = inlineCallReturnExpression(hop, { rejectConditional });
    if (!hop) return null;
  }
  return findProxyGlobal(hop.node, hop.ctx);
}

// does the inline-resolved call carry prefix statements that would be lost if the site is
// replaced by the polyfill? expression-body (`() => X`) and direct-return block-body
// (`() => { return X; }`) - false. block bodies with any non-return statement - true;
// the caller pushes the original call into `meta.sideEffects` so emit re-emits it via
// SequenceExpression wrap, preserving `calls++; return Promise;` execution alongside
// the polyfilled static dispatch.
// recurses through alias chains: `outerSE = () => innerSE()` where innerSE has block-body
// prefix statements - effects propagate up the chain so the OUTER call site SE-wraps,
// preserving inner prefix execution. `seen` Set carries cycle protection across hops
export function inlineCallHasObservableEffects({ callNode, scope, adapter, path }) {
  return hasObservableEffectsRec({ node: callNode, seen: new Set(), ctx: { scope, adapter, path } });
}

// the walk behind `inlineCallHasObservableEffects`, over the hop standing on the call: it descends
// nested single-return callees with the advanced hop until a returned value or an effect answers
function hasObservableEffectsRec(hop) {
  while (true) {
    // the call's own ARGUMENTS run when the call runs; folding the call down to its inlined receiver
    // drops them, so a side-effecting argument (`(() => Array)(c++)`) must force SE preservation -
    // in both spellings of the list: the raw one carries a receiver slot (`f.call(eff(), x)`), the
    // paired one a tag's interpolations and a bind's captured arguments
    if (hop.node.arguments?.some(argument => mayHaveSideEffects(argument, hop.ctx))
      || pairedCallView(hop.node, hop.ctx)?.arguments.some(argument => mayHaveSideEffects(argument, hop.ctx))) return true;
    // `allowIdentityParam` MUST mirror the fold (`inlineCallReturnExpression`): the fold inlines an
    // identity-param IIFE (`((x) => { g(); return x; })(Array)`), so the effect gate has to inspect its
    // block body too - a stricter gate here misses the `g()` prefix and drops it at the source
    const resolved = resolveInlineCalleeFunction(hop, { allowIdentityParam: true });
    if (!resolved) return false;
    // Even a fixed method is read and called at the source position: its owner can still
    // be uninitialized, and optional calls must retain their original short-circuit.
    if (isMemberAccessNode(unwrapTransparentSeq(hop.node.callee))) return true;
    const callee = resolved.node;
    // a parameter LIST that runs - a destructuring pattern, a default initializer with effects -
    // does its work when the call runs, so a fold that drops the call would drop that work with it
    if (paramListRunsWork(callee.params, resolved.ctx)) return true;
    // a conditionally-proven callee makes the CALL itself observable: the unassigned path
    // must keep its native throw / short-circuit, so the collapse may not drop the call
    if (conditionallyProvenCallees.has(callee)) return true;
    const { body } = callee;
    const isBlock = body.type === 'BlockStatement';
    // filter out leading directive ExpressionStatements (`'use strict';`) - parser-shape
    // diff only: oxc inlines them in body[]; babel separates into `program.directives`.
    // either way `'use strict'` carries no observable runtime effect for SE-wrap purposes
    const stmts = isBlock ? body.body.filter(s => !isDirectiveStatement(s)) : null;
    // block w/ anything beyond a single `return X;` carries observable effects directly
    if (isBlock && (stmts.length !== 1 || stmts[0].type !== 'ReturnStatement')) return true;
    // chain target: block-body extracts return arg, expression-body is itself the target.
    const next = isBlock ? stmts[0].argument : body;
    // mirror the fold's `peelReceiverSequenceTail` + recurse: a sequence return (`() => (0, inner())`)
    // is peeled to its tail and re-driven, so an inner call in the tail keeps its own prefix effects.
    // the peeled-away prefix runs at the source too, so its effects count when the fold drops the call
    const peeled = peelReceiverSequenceTail(next);
    if (peeled !== next && next?.type === 'SequenceExpression'
      && next.expressions.slice(0, -1).some(expression => mayHaveSideEffects(expression, resolved.ctx))) return true;
    // recurse when the (peeled) target is an inline-resolvable call (`() => inner()` with its own effects)
    if (isCallShape(peeled)) {
      // the inner call sits in the callee's body - resolve it there, with the advanced cycle set
      hop = { ...resolved, node: peeled };
      continue;
    }
    // else the returned value IS the inlined receiver; it carries observable effects only when the
    // receiver is wrapped in a write or an SE-prefixed sequence (`a = Array`, `(eff(), Array)`) - the
    // substitution drops the whole call, so those must be preserved. a bare receiver ref has none
    return returnedReceiverHasEffects(next, resolved.ctx);
  }
}

// the returned expression of an inlined call, beyond the receiver value the caller resolves: a
// chain-assignment / update writes a binding, an SE-prefixed sequence runs its leading elements -
// both are dropped when the call is replaced by the polyfill. a bare Identifier / member receiver
// has no such effect (a CallExpression receiver is handled by the recursion above). peel transparent
// wrappers first: oxc keeps the arrow-body parens (`() => (a = Array)`) babel strips, so the write
// hides under a ParenthesizedExpression on one adapter only
export function returnedReceiverHasEffects(node, ctx = null) {
  node &&= unwrapTransparentSeq(node, ctx);
  if (!node) return false;
  if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') return true;
  if (node.type === 'SequenceExpression') {
    return node.expressions.slice(0, -1).some(expression => mayHaveSideEffects(expression, ctx))
      || returnedReceiverHasEffects(node.expressions.at(-1), ctx);
  }
  return false;
}

// check if an identifier refers to a proxy global: either directly (`globalThis`)
// or through a const alias (`const g = globalThis`).
// `seen` threaded so cyclic `const a = b.x; const b = a.x;` doesn't restart the guard
function isProxyGlobalIdentifier({ node, scope, adapter, seen, path, usageNode = null, readNode = null }) {
  // a mutated proxy SLOT (`window = fake`) holds the user's replacement: neither the direct
  // name nor an alias resolving to it re-enters the pristine global surface - what an alias
  // holds depends on capture order, which no span model covers, so both stay ungated raw
  return proxyGlobalRootName({ node, scope, adapter, path, seen, usageNode, readNode }) !== null;
}

// side-effecting computed key a caller with no effects channel (bailOnSideEffectKey) cannot re-emit
const KEY_SIDE_EFFECT_BAIL = Symbol('key-side-effect-bail');

// normalize a COMPUTED key node before identity resolution. oxc-parser preserves
// ParenthesizedExpression / TS wrappers Babel strips - peel up front so the alias / Symbol-member
// branches work uniformly across parsers. SequenceExpression tail: only the last element drives key
// identity (its SE prefix is captured by unwrapParensCollectingEffects at meta-build sites, or replayed
// by direct callers) - unwrap parens at EACH level (`(e++, (d++, 'self'))`). a zero-arg IIFE key
// (`obj[(() => 'len')()]`) evaluates to its return - peel to a fixpoint; usage-pure relocates the key
// by DROPPING the node, so it peels only an observably-pure IIFE, while usage-global keeps the node and
// peels unconditionally (over-inject-safe). returns KEY_SIDE_EFFECT_BAIL when bailOnSideEffectKey and a
// SE prefix survives (`[(fn(), 'X')]`), so the whole construct is skipped rather than dropping the effect
// ... and a call to a BOUND identity callee names its argument the same way (`const k = tag =>
// (log.push(tag), tag); { [k('at')]: a }` - the body hands the param back unchanged, so the key is the
// argument's key, read at the call site). the same purity discipline: usage-global keeps the node and
// folds outright; usage-pure folds an effect-free call, or an effectful one only for a consumer that
// KEEPS the key node where it stands (`keepsKeyNode` - the sentinel residual runs the call in place)
function normalizeComputedKeyNode(node, bailOnSideEffectKey, adapter, ctx = null) {
  node = unwrapTransparentSeq(node, ctx);
  while (true) {
    if (bailOnSideEffectKey && node?.type === 'SequenceExpression' && sequencePrefixWithSideEffects(node, ctx)) return KEY_SIDE_EFFECT_BAIL;
    node = peelSequenceTail(node, { step: expression => unwrapTransparentSeq(expression, ctx) });
    if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return node;
    if (adapter.method === 'usage-pure' && !zeroArgIifeSideEffectFree(node, ctx && { ...ctx, adapter })) {
      const argument = ctx && !bailOnSideEffectKey ? identityCallKeyArgument(node, adapter, ctx) : null;
      if (!argument) return node;
      node = argument;
      continue;
    }
    const iifeRet = peelZeroArgIifeReturn(node, { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic })
      ?? (ctx && !bailOnSideEffectKey ? identityCallKeyArgument(
        node,
        adapter,
        ctx,
      ) : null);
    if (!iifeRet) return node;
    node = unwrapTransparentSeq(iifeRet, ctx);
  }
}

// the argument a bound identity call hands back as its key, or null: a callee this file binds whose
// body returns its one param, folded through the shared inline canon; an effectful call folds only
// where the node stays (usage-global, or a consumer holding the key in place)
function identityCallKeyArgument(node, adapter, { scope, path, usageNode, seen, keepsKeyNode = false }) {
  const inlined = inlineCallReturnExpression({ node, readNode: usageNode, seen, ctx: { scope, adapter, path } });
  if (!inlined?.node || inlined.node === node) return null;
  const effectful = node.arguments?.some(mayHaveSideEffects) || inlineCallHasObservableEffects({ callNode: node, scope, adapter, path });
  if (effectful && adapter.method === 'usage-pure' && !keepsKeyNode) return null;
  return unwrapTransparentSeq(inlined.node);
}

// a numeric literal key node under either parser (babel `NumericLiteral`, estree `Literal`)
function isNumericLiteralKeyNode(node) {
  return node.type === 'NumericLiteral' || (node.type === 'Literal' && typeof node.value === 'number');
}

// Keys left after literal/alias following: global injection names an unwritten local undefined;
// pure keeps its computed step because this key names no supported constructor static. A computed
// MEMBER key - `E.A` off a TS enum - is named by the TYPE layer's own key-name resolver,
// which already owns that fold (its shadowing gate, its merged-enum-block walk). asked as a
// callback rather than re-derived here: one name must not have two resolvers, and detection had
// none of its own, so `[3, 4][E.A](0)` stayed raw while every other spelling of that key claimed.
// the key resolver's other arms keep their method-aware gates - this fills only the shape they
// never answered
function resolveUnfollowedKey(node, computed, scope, adapter, path, resolveStaticKey) {
  if (!computed) return null;
  if (node?.type === 'Identifier' && adapter.method === 'usage-global') {
    const binding = adapter.getBinding?.({ scope, name: node.name, path, read: node });
    const declaration = bindingDeclaratorNode(binding);
    return declaration?.type === 'VariableDeclarator' && declaration.id?.type === 'Identifier'
      && !declaration.init && !declaration.declare && !binding.constantViolations?.length
      && !forXHeadLoopPath(bindingDeclarationPath(binding))
      && !isAmbientBindingShape(declaration, bindingDeclarationPath(binding)?.parentPath?.node) ? 'undefined' : null;
  }
  if (!resolveStaticKey) return null;
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  const named = resolveStaticKey(node, scope, path);
  if (typeof named !== 'string' || !named) return null;
  // ... and only while the container itself stays in this file's hands: a call handed the enum
  // object (`Object.assign(E, { A: 'flat' })`, `Reflect.defineProperty(E, ...)`) can rewrite the
  // member the fold just read, and the write index behind the fold is keyed by ASSIGNED FIELD and
  // never sees such a patch. asked of the escape census this pass already builds - it follows the
  // alias hops a reference travels, which a local re-walk here would have to re-derive. the census
  // is PER FILE, so an enum this module exports and ANOTHER module patches reads as untouched here -
  // the same per-file horizon every mutation channel in this plugin has, not a hole of this gate
  const container = node.object?.type === 'Identifier' ? node.object.name : null;
  const program = path ? rootProgramOf(path) : null;
  return container && program && ESCAPED_CONTAINER_NAMES.get(program)?.has(container) ? null : named;
}

// one IDENTIFIER hop of a computed-key walk - the folding one (`resolveKey`) and the provenance one
// (`isSymbolSourcedKey`) alike, so both answer of the value the read observes: the registered Symbol.X
// alias the binding carries (`{ symbolKey }`: `const { iterator } = Symbol`, a minted import), else the
// value node with the scope its own names resolve in and the advanced cycle guard - the declarator init,
// or the reaching write over a dead one, or the reaching write of a binding only writes give a value
// (`let K; K = 'of'`). `{ refused }` where usage-pure must not follow a conditionally-initialized alias
// (`if (c) var K = 'fromEntries'` - substituting the literal masks the native TypeError on the skipped
// path; usage-global over-injects and keeps following). null where nothing is followed
function followKeyIdentifier({ node, seen, scope, adapter, path, usageNode }) {
  const entry = enterIdentifierBindingFollow({ node, readNode: usageNode, seen, ctx: { scope, adapter, path } });
  if (entry) {
    // the registered alias runs BEFORE the init: following a destructure init resolves the WHOLE
    // receiver (`Symbol`), losing the `.iterator` slot
    const symbolKey = bindingSymbolKey(entry.binding, adapter.packages, { name: node.name, scope, adapter, path, usageNode });
    if (symbolKey) return { symbolKey };
    if (!entry.node) return null;
    if (adapter.method === 'usage-pure' && !initializerReachesRead({
      adapter, binding: entry.binding, declaratorNode: entry.binding.node, usagePath: path, usageNode,
    })) return { refused: true };
    // usage-global: an unconditional reassignment can kill the init before the use - including one
    // that completes before a capturing closure is defined (`let K = 'of'; K = 'from'; () =>
    // Array[K]` can never dispatch Array.of) - read in the scope that write stands in, as the
    // reaching lane below reads it
    const writeScopes = [];
    const value = reachingValueOverDeadInit({ binding: entry.binding, adapter, path, scope, usageNode, writeScopes });
    return { node: value || entry.node, seen: entry.seen, scope: value && writeScopes[0] || entry.ctx.scope };
  }
  if (cycleGuardHas(seen, node.name)) return null;
  // the alias-follow bailed on a reassignment (declarator init dead at the use): the reaching
  // definition (`K = 'of'` in `let K = 'from'; K = 'of'; Array[K]()`) when it is unambiguous
  const binding = adapter.getBinding({ scope, name: node.name, path, read: node });
  if (!binding || !isReassignedBeyondDeclarator(binding)) return null;
  const reaching = reachingKeyValue({ binding, name: node.name, scope, adapter, path, usageNode, seen });
  if (reaching) return { node: reaching.node, seen: new Set(seen).add(node.name), scope: reaching.scope };
  return iteratorOrFallbackKey({ binding, name: node.name, scope, adapter, path, usageNode, seen })
    ? { symbolKey: 'Symbol.iterator' } : null;
}

// ... and a key the walk cannot pin to one write but whose every value is the iterator symbol or its
// `'@@iterator'` fallback - the helpers' loop trying one and then the other (`_asyncIterator`) - which
// the iterator method's lookup answers either way: a write always lands before the read, and each one
// the read may see installs one of the two, the symbol at least once. read as the iterator symbol, so
// only a READ renders through the helper; a write keyed by it keeps the alias
function iteratorOrFallbackKey({ binding, name, scope, adapter, path, usageNode, seen }) {
  if (identifierDeclaratorInit(binding) || !bindingWrittenBeforeUsage({ binding, usagePath: path, usageNode, adapter })) return false;
  const { nodes, complete } = reassignmentValueEnumeration({
    binding, usagePath: path, name, ctx: { scope, adapter, path, resolveKey }, usageNode,
  });
  if (!complete) return false;
  let symbol = false;
  for (const value of nodes) {
    const valueCtx = { scope: writeScopeAt(path, value, aliasDeclScope(binding, scope)), adapter, seen: new Set(seen).add(name), path };
    const key = resolveKey({ node: value, computed: true, ...valueCtx });
    if (key === 'Symbol.iterator' && isSymbolSourcedKey({ node: value, ...valueCtx })) symbol = true;
    else if (key !== '@@iterator') return false;
  }
  return symbol;
}

// the property name a key node folds to, or null: an identifier or literal spelling, a template or `+`
// concat of folds, an alias through its binding (`followKeyIdentifier`), the operand a selection the build
// decides always yields, a `Symbol.X` spelling as `'Symbol.X'` (its provenance is `isSymbolSourcedKey`'s),
// an enum member through the type layer. `usageNode` anchors the read an alias hop observes; a key whose
// evaluation runs code bails under `bailOnSideEffectKey`
export function resolveKey({ node, computed, scope, adapter, seen, path, depth = 0, bailOnSideEffectKey = false,
  usageNode = null, resolveStaticKey = null, keepsKeyNode = false }) {
  while (true) {
    // an over-deep chain and an ABSENT key answer alike: a mutator called with fewer arguments than it
    // takes (`Object.defineProperty(target)`) leaves the key slot empty - legal source that throws at
    // runtime, and callers already treat a null key as "not resolvable"
    if (depth > MAX_KEY_DEPTH || !node) return null;
    if (computed) {
      node = normalizeComputedKeyNode(node, bailOnSideEffectKey, adapter, { scope, adapter, path, usageNode, seen, keepsKeyNode });
      if (node === KEY_SIDE_EFFECT_BAIL) return null;
      const operand = decidedKeyOperand(node, { scope, adapter, path, seen, depth });
      if (operand) {
        node = operand;
        depth += 1;
        continue;
      }
    }
    if (!computed && node.type === 'Identifier') return node.name;
    // a NUMERIC literal names its slot as much as the string spelling does (`obj[0]` and `obj['0']`
    // are one property). naming only strings split READ from WRITE: a mutation through the numeric
    // spelling stayed untracked while a read resolved, so a user's patch lost to the polyfill
    if (adapter.isStringLiteral(node) || isNumericLiteralKeyNode(node)) {
      return adapter.isStringLiteral(node) ? adapter.getStringValue(node) : String(node.value);
    }
    // `at` -> 'at'; `${'iter'}${'ator'}` -> 'iterator' when every interpolation resolves to a literal
    if (node.type === 'TemplateLiteral') {
      const single = singleQuasiString(node);
      if (single !== null) return single;
      let out = '';
      for (let i = 0; i < node.quasis.length; i++) {
        // tagged template with invalid escape (`\\xZ`, `\\u{...}`) leaves `cooked === null`
        // post-ES2018. bailing here is right - the cooked form is what runtime concat would
        // see, so we can't form a valid lookup key without it
        const { cooked } = node.quasis[i].value;
        if (cooked === null || cooked === undefined) return null;
        out += cooked;
        if (i < node.expressions.length) {
          // fork `seen` per interpolation - same-binding reuse (`${k}${k}`) must not
          // trip the cycle guard after the first interpolation mutates a shared Set.
          // mirrors the fork pattern in the BinaryExpression `+` branch below
          const part = resolveKey({
            node: node.expressions[i], computed: true, scope, adapter, seen: new Set(seen),
            path, depth: depth + 1, resolveStaticKey, usageNode, bailOnSideEffectKey,
          });
          if (part === null) return null;
          out += part;
        }
      }
      return out;
    }
    if (node.type === 'Identifier' && computed) {
      const hop = followKeyIdentifier({ node, seen, scope, adapter, path, usageNode });
      if (hop?.symbolKey) return hop.symbolKey;
      if (hop?.refused) return null;
      if (hop) {
        ({ node, seen, scope } = hop);
        usageNode = node;
        depth += 1;
        continue;
      }
    }
    // string concatenation: 'a' + 'b'
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      // fork `seen` per branch so `a + a` (same binding both sides) doesn't mis-trigger the
      // cycle guard on the right branch after the left added `a` to the shared Set
      const left = resolveKey({
        node: node.left, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
        resolveStaticKey, usageNode, bailOnSideEffectKey,
      });
      const right = resolveKey({
        node: node.right, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
        resolveStaticKey, usageNode, bailOnSideEffectKey,
      });
      if (left !== null && right !== null) return left + right;
    }
    // Symbol.X computed access - Symbol.iterator, Symbol['iterator'], Symbol[key] where key = 'iterator'
    // fork `seen` per side so shared-binding probe (e.g. `obj[s[s]]` re-entering `s`) doesn't
    // trip the cycle guard on the second side after the first side populated the Set. mirrors
    // the TemplateLiteral / `+` branches above.
    // reject the doubly-bracket-nested case `Symbol[Symbol.X]`: the inner `Symbol.X` resolves
    // to a well-known symbol VALUE (not the string 'X'), so the outer reads property keyed by
    // a symbol value - Symbol constructor itself doesn't carry well-known-symbol-valued
    // properties, so `Symbol[Symbol.iterator]` is `undefined` at runtime. recognising that as
    // a well-known polyfill dispatch is a misclassification
    if (computed && (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && asSymbolRef({ node: node.object, scope, adapter, seen: new Set(seen), path })) {
      const name = resolveKey({
        node: node.property, computed: node.computed, scope, adapter, seen: new Set(seen),
        path, depth: depth + 1, resolveStaticKey, usageNode, bailOnSideEffectKey,
      });
      if (name && !name.startsWith('Symbol.')) return `Symbol.${ name }`;
    }
    return resolveUnfollowedKey(node, computed, scope, adapter, path, resolveStaticKey);
  }
}

// which WELL-KNOWN SYMBOL a COMPUTED key names - spelled `[Symbol.iterator]`, aliased (`[s]`), or
// through the pure import an emitter minted for it (`[_Symbol$iterator]`)? such a key replays
// losslessly into a synth literal: the slot evaluates to the same symbol the pattern's own key
// reads, and the import is one the pattern already owes. the fold plus its provenance answer, so
// the two emitters agree however their rewrite order left the spelling, while a minted pure CTOR
// standing in for a bare global (`[Set]` -> `[_Set]`) names none and stays out - a raw emission
// there would ReferenceError off-engine
export function computedKeyWellKnownSymbolName({ keyNode, scope, adapter, path }) {
  const key = resolveKey({ node: keyNode, computed: true, scope, adapter, path });
  // the fold alone cannot answer: a STRING spelling folds to the same name (`['Symbol.iterator']`
  // reads an ordinary property called that), so provenance decides
  return symbolSourcedFoldedKey({ key, keyNode, scope, adapter, path }) ? key.slice('Symbol.'.length) : null;
}

// the boolean view, for the gates that only ask whether the key is one
export function computedKeyIsWellKnownSymbol(args) {
  return computedKeyWellKnownSymbolName(args) !== null;
}

// the two keys a synth-swap pattern property needs, derived once so babel-plugin and unplugin agree:
// `lookupKey` is the resolved static NAME used to probe a receiver for a polyfillable static (a computed
// `[k]` with `const k = 'from'` resolves to 'from'); `slotKey` is the stable map / emit slot that
// distinguishes `[k]` from a plain `k` (`{ k: v, [k]: w }`). a non-computed key uses its name for both -
// through the shared resolver, since a string / numeric key carries its name somewhere other than
// `.name` and reading that slot raw probes the receiver with `undefined`, losing the polyfill.
// a dynamic computed key (`resolveKey` -> null) yields `lookupKey: null` so the caller bails the synth
export function resolveSynthKeys({ node, scope, adapter, path }) {
  const slotKey = synthSwapPropKey(node);
  // pass `path` so `resolveKey`'s flow-sensitive gate (`varInitDominatesUsage`) sees the real usage
  // position: a flow-dependent computed key (`if (c) var K = 'from'; { [K]: m }`) must NOT fold to its
  // conditional init for usage-pure - a null path defaults the dominance check to true and folds wrongly
  // ... the literal REPLACES the receiver and the pattern keeps its key node, so a key spelled through
  // a bound identity call folds here as it does for every consumer holding the key in place
  const lookupKey = node.computed
    ? resolveKey({ node: node.key, computed: true, scope, adapter, path, keepsKeyNode: true })
    : plainSynthKeyName(node.key);
  // a key only SCOPE can name (a bound identity call) has no structural slot: it takes the quoted
  // notation of a folded string, the slot its resolved name reads
  return { lookupKey, slotKey: slotKey ?? (node.computed && typeof lookupKey === 'string' ? `[${ JSON.stringify(lookupKey) }]` : null) };
}

// Resolve a hop's slot from its structural spelling or a scope-aware key fold.
// Effects belong to the retained key node, not this lookup result: a caller consuming
// an effectful hop must retain that node or preserve its effects.
export function consumableHopSlotName(prop, keyCtx = null) {
  // ... a key with an EFFECT still names its slot: the level it stands on survives every render
  // (`hostLevelSurvives` - the key runs once where the source wrote it, the leaves below retire to
  // sentinels), so the fold keeps the key node and nothing drops the effect
  return spelledSlotName(prop)
    ?? (prop.computed && keyCtx?.adapter ? resolveSynthKeys({ node: prop, ...keyCtx }).lookupKey : null);
}

// bare unbound `Symbol` / capitalised const-alias (`const Sym = Symbol`) /
// proxy-global access (`globalThis.Symbol`, `self.window.Symbol`). other idents skip the
// const-chain walk unless their declaration may name `Symbol` (`symbolAliasShapedInit`) -
// `Symbol` aliases are capitalised by convention, minified helpers' are not.
// `seen` threaded through so callers caught in a cyclic const-alias chain
// (`const a = b.Symbol; const b = a;`) don't restart the cycle guard
function resolvesToGlobalSymbol({ node, scope, adapter, seen, path }) {
  // a SLOT-mutated `Symbol` (`globalThis.Symbol = Fake`) is the user's replacement: its keys
  // are not the well-known symbols, so recognition bails and the key stays a raw member read
  // (the bare `Symbol` identifier then re-routes through the global-object binding) - save a read
  // the write does not reach: one before every write, or below a patch the build never runs
  if (isMutatedGlobalSlot(adapter, 'Symbol', path && { node, path })) return false;
  if (node.type === 'Identifier') {
    if (node.name === 'Symbol') return !adapter.hasBinding({ scope, name: 'Symbol', path, read: node });
    // the capitalisation probe bounds the const-alias walk for USER names only - a binding this
    // plugin minted in place (`Symbol` -> `_Symbol`) carries its original global in the
    // `polyfillHint` side-channel and is NOT capitalised, so the hint is asked first: gating it
    // behind the convention makes the plugin fail to recognise its own rewrite
    if (!CAPITALISED_IDENT.test(node.name)) {
      const binding = adapter.getBinding({ scope, name: node.name, path, read: node });
      if (!bindingPolyfillHint({ binding, scope, name: node.name, adapter }) && !symbolAliasShapedInit(binding)) return false;
    }
    return resolveBindingToGlobal({ name: node.name, scope, adapter, seen, path, read: node }) === 'Symbol';
  }
  return globalProxyMemberName({ node, scope, adapter, path }) === 'Symbol';
}

// may a name's declaration hold `Symbol` - its init a name, a selection or a `.Symbol` read - the shapes a
// minified helper spells the alias with (`i = "function" == typeof Symbol ? Symbol : {}`). a cheap screen
// ahead of the alias walk, which every member key's receiver would otherwise pay
function symbolAliasShapedInit(binding) {
  const init = binding ? unwrapRuntimeExpr(identifierDeclaratorInit(binding)) : null;
  return init?.type === 'Identifier' || init?.type === 'ConditionalExpression' || init?.type === 'LogicalExpression'
    || (isMemberAccessNode(init) && memberKeyName(init) === 'Symbol');
}

// the re-key question BOTH destructure emitters ask of an anchored residual: does this key READ a
// well-known symbol off the pristine global `Symbol`, and under which name? the residual is rendered
// as a whole prop, so a key left raw leaks a `Symbol` read into it - a ReferenceError on the engines
// this method targets. the RECEIVER half goes through `asSymbolRef`, so an alias (`const Sym = Symbol`)
// and a proxy-global access (`globalThis.self.Symbol`) answer like the bare name, and a SLOT-mutated
// `Symbol` refuses - the user's replacement does not carry the well-known symbols, and re-keying to the
// ponyfill would swap their object for it. the NAME half folds through `resolveKey` like every other
// key. null = not this shape; the caller renders the entry, which is all that stays plugin-local.
// distinct from `destructuredGlobalKeyPathNamesSymbol`, which walks a PATTERN's key path against a
// proxy-global init - here the subject is the key EXPRESSION's own receiver, not the init it destructures
export function anchoredResidualSymbolKeyName({ key, computed, scope, adapter, path }) {
  if (!computed) return null;
  const prop = unwrapParens(key);
  if (prop?.type !== 'MemberExpression' && prop?.type !== 'OptionalMemberExpression') return null;
  if (!asSymbolRef({ node: prop.object, scope, adapter, path })) return null;
  const name = prop.computed
    ? resolveKey({ node: prop.property, computed: true, scope, adapter, path })
    : memberKeyName(prop);
  return typeof name === 'string' && name ? name : null;
}

// preserve pre-unwrap node so callers can seed both forms into handledObjects;
// Set dedup absorbs the duplicate when raw === unwrapped
export function asSymbolRef({ node, scope, adapter, seen, path }) {
  const unwrapped = unwrapTransparentSeq(node);
  return unwrapped && resolvesToGlobalSymbol({ node: unwrapped, scope, adapter, seen, path })
    ? { raw: node, unwrapped } : null;
}

// descend a member chain to its ROOT, peeling the full wrapper set at every hop: transparent wrappers
// (parens / TS / Chain) AND SequenceExpression tails via `peelReceiverSequenceTail` (`(eff(), globalThis).Map`
// -> the SE prefix stays in the source for the emit side to collect), plus chain-assignments when
// `throughChainAssign` (`(a = IIFE()).Symbol`). returns { root, firstHop, optionalCount } - the root node
// (Identifier / Call / This / ...), the member sitting directly on it, and the number of optional hops in the
// chain; root is null past the depth ceiling (pathological). the single chain-root walk shared by
// `findProxyGlobal` and the detect-usage chain-root probes - each applies its own classification to the
// result. the OBJECTS a `?.` hop guards are NOT surfaced here: the guard decision reads them through
// `ownChainOptionalObjects`, which stops at the sealing wrappers this descent peels through
export function descendToChainRoot(node, throughChainAssign = false) {
  let root = throughChainAssign ? peelChainRootValue(node) : peelReceiverSequenceTail(node);
  let firstHop = null;
  let optionalCount = 0;
  let depth = 0;
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    if (++depth > MAX_KEY_DEPTH) return { root: null, firstHop, optionalCount };
    // count the `.optional` FLAG only, NOT the node type: babel makes every member of an optional chain an
    // OptionalMemberExpression (`a?.b.c` -> all three) with `.optional` true only on the actual `?.` hop, so
    // a type-based count over-counts. the flag means "this hop uses `?.`" in both parsers
    if (root.optional) optionalCount++;
    firstHop = root;
    root = throughChainAssign ? peelChainRootValue(root.object) : peelReceiverSequenceTail(root.object);
  }
  return { root, firstHop, optionalCount };
}

// optional flags within the node's OWN unterminated chain: the raw member / call descent stops at
// any SEALING wrapper - parens, `as`-casts and sequences terminate the `?.` short-circuit in both
// grammars (babel stops its Optional* type promotion there; estree closes the ChainExpression) -
// while the chain-transparent postfix `!` (TSNonNullExpression) continues it. contrast with
// `descendToChainRoot`, whose ROOT-finding walk deliberately peels the full wrapper set: its
// optionalCount aggregates across sealed boundaries and over-reports for chain SEMANTICS (an
// emit route keyed on it would treat `(a?.b).c` like a live `?.` and mis-place receiver SE)
export function ownChainOptionalCount(node) {
  return ownChainOptionalObjects(node).length;
}

// find the proxy global identifier (globalThis, self, etc.) at the root of a MemberExpression chain.
// `aliasCtx` ({ scope, adapter, path }), when supplied, makes the root check follow const-alias
// roots through the canonical resolver (`const g = globalThis; g.self.X`); without it the root is
// classified by NAME only (POSSIBLE_GLOBAL_OBJECTS) - byte-identical to every existing node-only
// caller. the emit-side collapse passes it so an aliased proxy global drops its `.self` hop too.
// `throughChainAssign` extends the root walk through chain-assignments (`(a = globalThis).self.X`
// roots at `globalThis`); only the hop-collapse drive opts in - detection keeps the blind default
export function findProxyGlobal(node, aliasCtx = null, throughChainAssign = false) {
  const { root } = descendToChainRoot(node, throughChainAssign);
  if (root?.type !== 'Identifier') return null;
  return isProxyGlobalIdentifierNode({ node: root, ...aliasCtx }) ? root : null;
}

// WHAT a proxy-global navigation spells: its own claim's ponyfill when the navigation IS the value the
// source reads (`globalThis.self` -> `_self`), or the collapsed ROOT when something reads THROUGH it
// (`globalThis.self.Array` -> `_globalThis.Array`, where an intermediate `self` would be undefined off
// a host that has none). the KEY SPELLING does not enter the question: a folded computed key -
// literal, variable or SE-bearing - names the same leaf, and its discarded effects ride ahead of the
// binding (`globalThis[(c++, 'self')]` -> `(c++, _self)`). weighing the effects here answered a
// DIFFERENT global for the noisy spelling than for every quiet twin, which is the one thing a proxy
// alias may never do - the two ponyfills are separate modules
function proxyNavSpellsClaimPure({ navigated }) {
  return !navigated;
}

// Decide how the source consumes a collapsed surface. A read through it navigates;
// a write normally keeps its value, but an unbacked tail or a retained probe store
// must remain the write's base. A patched polyfillable slot reads the nearest surface.
// Delete reads no slot: only deleting a patched proxy hop itself can fold past that
// patch, whereas an ordinary patched global can also stand below the deleted leaf.
// Native bindings supply write/delete facts for their live cursor, never a fold verdict.
export function proxyCollapseConsumer({
  node, source = node, host, writeTarget = false, deleted = false, deleteAbove = false,
  keptWrite = null, hasKeptTail = false, deadOptional = false, storeHoldsProbe = false,
  keyName = isMemberAccessNode(host) && !host.computed ? host.property?.name : null,
}, { adapter, resolvePure }) {
  const member = isMemberAccessNode(host) && host.object === node;
  const pattern = (host?.type === 'VariableDeclarator' && host.init === node && isDestructurePattern(host.id))
    || (host?.type === 'AssignmentExpression' && host.right === node && isDestructurePattern(host.left));
  const mutatedSlot = member && !writeTarget && !!keyName && isMutatedGlobalSlot(adapter, keyName)
    && !!resolvePure({ kind: 'global', name: keyName });
  const deleteFoldsRead = POSSIBLE_GLOBAL_OBJECTS.has(keyName) ? deleted : deleteAbove;
  const mutatedAbove = mutatedSlot && !deleteFoldsRead && !writeTarget;
  const writeThrough = writeTarget && (hasKeptTail || storeHoldsProbe);
  if (keptWrite && deleted && !hasKeptTail
    && unwrapRuntimeExpr(keptWrite.right)?.type !== 'Identifier') {
    return { navigated: false, mutatedAbove: false, mutatedSlot, writeThrough };
  }
  const optionalOverTail = !deadOptional && hasKeptTail && member && host.optional;
  const navigated = (member && !writeTarget && !mutatedAbove && !optionalOverTail)
    || (hasKeptTail && pattern && deadOptional) || writeThrough
    || (writeTarget && !hasKeptTail && !mutatedAbove && deadOptional
      && isMemberAccessNode(unwrapRuntimeExpr(unwrapRuntimeExpr(source)?.object)));
  return { navigated, mutatedAbove, mutatedSlot, writeThrough };
}

// Select the value a decided collapse hands to its reader. A retained probe store wins;
// an alias stays in navigation or a memo, but a source value takes the claim's own pure.
// Forced folds (a deleted slot or an unbacked prefix below a patch) use the run's root.
export function proxyCollapseBase({
  keptStore = null,
  aliasRoot = null,
  sourceValue = false,
  claimPure = null,
  rootPure,
  keepClaim = false,
  writeReceiver = null,
}) {
  if (keptStore) {
    // A final write reference throws after its RHS; the erased hop read threw
    // before it. Re-read only an identifier, never a user's assignment target.
    const readKey = writeReceiver && !storeReadHopOptional(writeReceiver) && memberKeyName(unwrapRuntimeExpr(writeReceiver));
    const read = keptStore.left.type === 'Identifier' && typeof readKey === 'string'
      ? { object: keptStore.left, key: readKey, computed: false } : null;
    return read ? { keep: keptStore, read } : { keep: keptStore };
  }
  if (aliasRoot && !sourceValue) return { alias: aliasRoot };
  return { pure: keepClaim ? claimPure : rootPure };
}

// Finish an outward collapse without rendering or mutating it. Consumer facts describe
// live native slots; memo membership and a delete's owning run come from the binding.
// A live memo keeps its terminal probe, and a source store keeps effects inside its value.
// Extending a nullable alias collapse must leave a reader that owns its earlier throw;
// the inward admission's reader may already have been swallowed by this outward span.
// The returned route names the replacement and the optional handoff, never a host API.
export function planOuterCollapseValue(outer, collapsed, claim, ctx, facts) {
  const { target, keptTail, writeStep, innerKeptTail, seqPrefixEffects, valueEffects, outerHopName, outerBacked } = outer;
  const { resolvePure } = ctx;
  const { consumer } = facts;
  if (collapsed.aliasRoot && aliasRootedReadMayThrow(collapsed.aliasRoot, resolvePure, ctx)
    && !(memberKeepsReceiverThrow(consumer.host) && consumer.host.object === consumer.node)) return null;
  const deadOptional = facts.allowOptional
    || (!facts.mutatedGuards && proxyRunValueIsProven(target.node, resolvePure, ctx));
  const source = { ...consumer, keptWrite: collapsed.keptWrite ?? writeStep, hasKeptTail: !!keptTail.length };
  const navigation = proxyCollapseConsumer({ ...source, deadOptional,
    storeHoldsProbe: !!collapsed.keptWrite && !collapsed.writeStoreSpellable }, ctx);
  const sealedDeleteValue = facts.sealed && facts.deletedAbove && !facts.deleteFold;
  const navigated = navigation.navigated && !sealedDeleteValue;
  const { mutatedAbove } = navigation;
  const valuePosition = proxyNavSpellsClaimPure({ navigated });
  if (!proxyCollapseConsumer(source, ctx).navigated
    && keptTail.some(kept => !resolvePure({ kind: 'global', name: kept.name })) && facts.inProbe) return null;
  if (!writeStep && !collapsed.keptWrite && !navigated && keptTail.length
    && (storedUserAssignmentOf(ctx.path) || !unbackedTailRidesAbove(ctx.path, resolvePure))) return null;
  if (writeStep) {
    const tail = keptProxyTailPlan(writeStep, keptTail, resolvePure, { navigated, backed: outerBacked });
    if (tail.decline) return { kind: 'decline' };
    const inPlace = navigated && collapsed.aliasRoot && !!collapsed.effects?.length;
    if (inPlace && !facts.directReader) return { kind: 'decline' };
    const outerPure = resolvePure({ kind: 'global', name: navigated || !outerHopName ? collapsed.hintName : outerHopName });
    const base = proxyCollapseBase({ aliasRoot: !collapsed.effects?.length && collapsed.aliasRoot, rootPure: outerPure });
    if (!inPlace && !base.alias && !base.pure) return { kind: 'decline' };
    return {
      kind: inPlace ? 'write-in-place' : 'write', base, write: writeStep, tail: keptTail,
      innerTail: innerKeptTail, prefix: seqPrefixEffects,
      innerPure: { entry: collapsed.valueEntry ?? collapsed.entry ?? claim.entry,
        hintName: collapsed.valueHintName ?? collapsed.hintName ?? claim.hintName },
      storedEffects: [...valueEffects, ...collapsed.effects ?? []],
      readsOffWrite: tail.readsOffWrite, valuePosition, optional: !!target.node.optional,
    };
  }
  if (navigated && collapsed.keptWrite && !collapsed.writeStoreSpellable) {
    return {
      kind: 'store', base: proxyCollapseBase({ keptStore: collapsed.keptWrite,
        writeReceiver: navigation.writeThrough && !facts.deletedAbove ? target.node : null }),
      prefix: collapsed.effects.slice(0, collapsed.effects.indexOf(collapsed.keptWrite)),
      optional: storeReadHopOptional(target.node),
    };
  }
  const carriedStore = !!storedUserAssignmentOf(ctx.path, { throughReads: false }) && facts.parentInMemo;
  const sourceValue = valuePosition && !mutatedAbove && (carriedStore || !facts.inMemo);
  const forced = mutatedAbove && navHasUnresolvableProxyHop(ctx.path.node.object, resolvePure, ctx);
  const deleted = !!collapsed.entry && !storedUserAssignmentOf(ctx.path) && facts.deleteFold;
  const effects = [...seqPrefixEffects, ...collapsed.effects];
  return {
    kind: 'value', base: proxyCollapseBase({ aliasRoot: collapsed.aliasRoot, sourceValue,
      claimPure: claim, rootPure: collapsed, keepClaim: (valuePosition || mutatedAbove) && !forced && !deleted }),
    prefix: navigated ? effects.filter(effect => mayHaveSideEffects(effect)) : effects,
    tail: valuePosition ? keptTail : [], valuePosition, deadOptional,
    swallowDeadSequence: navigated && !collapsed.aliasRoot,
  };
}

// the ONE name a realm HOP has, whatever spells its key: the forms the node itself carries
// (`staticMemberKeyName` - dotted, string / template literal, a SE-bearing key's quiet tail, a pure
// zero-arg IIFE) and, where a scope context can reach the binding, a key BOUND to a constant string
// (`const k = 'self'; g[k]`). the walks that DROP such a hop already read the second, so a predicate
// GATING one of those folds on the node-only half answered a narrower name than the fold it guards -
// one hop with two names, and the two emitters then folded one source two ways. `allowSideEffectKeys`
// permits naming keys whose original reads the caller keeps; declining one never authorizes
// a separate effectful realm-hop collapse
export function realmHopKeyName(node, aliasCtx = null, { allowSideEffectKeys = false } = {}) {
  if (!node?.computed) return memberKeyName(node);
  if (!allowSideEffectKeys && mayHaveSideEffects(node.property)) return null;
  return staticMemberKeyName(node) ?? (aliasCtx
    ? resolveKey({ node: node.property, computed: true, bailOnSideEffectKey: !allowSideEffectKeys, ...aliasCtx })
    : null);
}

// Admit one hop of a realm collapse, independent of traversal direction or AST dialect.
// The caller supplies the established optional proof; an effectful key is admissible only
// when its source read survives. Mutation always ends the pristine prefix at that read.
export function pristineRealmHopKey(node, ctx = null, { allowOptional = true, allowSideEffectKeys = false } = {}) {
  if (!isMemberAccessNode(node) || (node.optional && !allowOptional)) return null;
  const key = realmHopKeyName(node, ctx, { allowSideEffectKeys });
  return key && isPristineProxyGlobal(ctx?.adapter, key, ctx?.path && { node, path: ctx.path }) ? key : null;
}

// ... and does a DELETED navigation read through a realm hop whose slot the source itself replaced?
// such a hop holds the user's own object, so the fold may not drop it - nor the hops BELOW it, which
// drop only together with the read above them - and the run deopts WHOLE, every hop rendering its own
// claim. the span is the CANON chain end minus the deleted member itself: that slot is the operator's
// own target, and a file deleting it is exactly why the census calls the name mutated, so counting it
// would stop every run in such a file. asked of the CLAIM's own path by both emitters' delete folds,
// each landing its base itself - a span that stops at a source seal answers for the hops below the seal
// alone, and the fold lands under the ones above it. the hop reads through the name canon above, keys
// with effects included: the gate only ever KEEPS a hop, so the widest name is its safe pole - off the
// node alone a key-spelled hop walked past the mutated slot its literal twin stopped at
function deletedRunCarriesMutatedRealmHop(path, { adapter, unwrap = node => node }) {
  const end = unwrap(memberChainEndPath({ path, unwrap }).node);
  const aliasCtx = path?.scope ? { scope: path.scope, adapter, path } : null;
  for (let cur = isMemberAccessNode(end) ? unwrap(end.object) : null;
    isMemberAccessNode(cur); cur = unwrap(cur.object)) {
    const key = realmHopKeyName(cur, aliasCtx, { allowSideEffectKeys: true });
    if (key && POSSIBLE_GLOBAL_OBJECTS.has(key) && !isPristineProxyGlobal(adapter, key, path && { node: cur, path })) return true;
  }
  return false;
}

// the largest pure proxy-global navigation sub-expression of `node`: the root proxy-global
// identifier plus any consecutive member hops whose key is itself a proxy-global (`globalThis.self`
// - `self` is a proxy-global alias of the global object). a non-proxy key (a constructor leaf or a
// user property) ends it. callers collapse this whole span to the substituted root, so the emitted
// expression reads the constructor off the global object directly instead of an intermediate proxy:
// `_globalThis.self.Array` would read an undefined `self` off the global object on hosts without it
// (ie:11 pure, non-browser), whereas the collapsed `_globalThis.Array` is safe across the target range
export function maximalProxyGlobalPrefix(node, aliasCtx = null, { allowSideEffectKeys = false, throughChainAssign = false } = {}) {
  const root = findProxyGlobal(node, aliasCtx, throughChainAssign);
  if (!root) return null;
  const chain = [];
  // peel the SE tail (matching findProxyGlobal above, which roots the chain via peelReceiverSequenceTail):
  // a SE-prefixed proxy receiver `(se(), globalThis.self.Array)` must still collapse its `.self` hop -
  // SE-bailing unwrapTransparentSeq left the chain unwalked so `_globalThis.self.Array` survived to ie:11
  let cur = peelReceiverSequenceTail(node);
  while (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
    chain.push(cur);
    cur = peelReceiverSequenceTail(cur.object);
  }
  let prefix = root;
  for (let i = chain.length - 1; i >= 0; i--) {
    const member = chain[i];
    // through the hop-name canon: a const-alias computed hop (`const k='self'; globalThis[k].X`) names
    // the same slot the dotted and computed-literal forms name, so the collapse drops it too -
    // `_globalThis.X`, not `_globalThis[k].X` which reads an undefined key off-engine.
    const key = pristineRealmHopKey(member, aliasCtx, { allowSideEffectKeys });
    // a mutated hop slot (`window.self = fake`) is the user's redirection - collapsing the hop
    // away would silently read the pristine global instead of the replacement
    if (key) prefix = member;
    else break;
  }
  return prefix;
}

// the pure CONSTRUCTOR a per-branch synth's passthrough receiver collapses to when the receiver is a
// proxy-global member whose object is the FULL proxy navigation and whose LEAF is a polyfillable global
// constructor (`globalThis.Map` / `globalThis.self.Map` -> the Map pure ctor). the whole receiver swaps to
// that pure ctor, so an unpolyfilled sibling key reads off it (`_Map.foo`), matching the nested partial-
// mirror canon. a non-ctor leaf (`globalThis.Math`) returns null, leaving the proxy-root collapse
// (`_globalThis.Math.x`). shared by both synth-swap emitters so their per-branch receiver agrees
export function proxyGlobalMemberCtorPure({ receiver, aliasCtx = null, resolvePure }) {
  if (!aliasCtx) return null;
  // the canonical proxy-member walk returns the LEAF key (peeling intermediate proxy hops AND a
  // call-rooted IIFE - `(() => globalThis)().Map` -> 'Map'), so it covers every navigation shape and
  // never over-walks a leaf that is itself in POSSIBLE_GLOBAL_OBJECTS
  // a SLOT-mutated leaf yields null here (the canonical walk gates it), keeping the
  // proxy-root collapse - the user's replacement stays visible through the raw member
  const leaf = globalProxyMemberName({ node: receiver, ...aliasCtx });
  if (!leaf) return null;
  const pure = resolvePure({ kind: 'global', name: leaf });
  return pure && pure.kind !== 'instance' ? pure : null;
}

// the MEMO-ARG form of the pure-ctor whole-swap: the swap erases the WHOLE navigation
// (`g.self[(e++, 'Map')]` -> `_Map`), so every effect buried in it - computed-key SEs and an
// SE-bearing chain-root call, in source eval order - must re-run ahead of the binding (the
// shared discarded-receiver rescue plan; a provably-pure inline root call is dropped). the
// direct (non-memo) re-read never carries receiver SE (an SE receiver is classified
// callBranch and always memoizes), so `proxyGlobalMemberCtorPure` stays SE-blind there
export function proxyGlobalMemberCtorPureSwap({ receiver, aliasCtx = null, resolvePure }) {
  const pure = proxyGlobalMemberCtorPure({ receiver, aliasCtx, resolvePure });
  if (!pure) return null;
  return { pure, se: discardRescueNodes({ node: receiver, ...aliasCtx }) };
}

// PARENTHESIZED / seal layer scan between a member's RAW object and its peeled core:
// source parens (babel: extra.parenthesized; oxc: ParenthesizedExpression), a paren'd cast,
// or the estree ChainExpression boundary itself. sequence layers are value-transparent
export function sealedLayerBetween(rawObj, object) {
  if (rawObj?.extra?.parenthesized) return true;
  for (let layer = rawObj; layer;
    layer = layer.type === 'SequenceExpression' ? layer.expressions.at(-1) : layer.expression) {
    // a bare ChainExpression layer is NOT a seal: oxc closes the chain at a bare TS wrapper
    // (`a?.b!.c` - TSNonNull over a ChainExpression), yet the erased form is one chain whose
    // short-circuit survives. real source parens arrive as a ParenthesizedExpression node
    // (oxc preserves them) or the parenthesized flag (babel)
    if (layer.type === 'ParenthesizedExpression' || layer.extra?.parenthesized) return true;
    // the CORE carries the flag dialect's parens itself (`(nav)!.X` - babel hangs `parenthesized` on
    // the nav, under the TS wrapper), so it is examined too: stopping one step short of it read that
    // seal as absent and erased the throw the read above it performs
    if (layer === object) break;
  }
  return false;
}

// the FIRST sealed boundary of a nav chain: the member whose object is a sealed layer, plus
// the peeled inner nav and its member reader, if one belongs to this source chain.
// The member's KEY spells the read on the sealed value; its reader may own later effects.
export function sealedChainBoundary(node) {
  let cur = peelReceiverSequenceTail(node);
  let reader = null;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const object = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object));
    // an OPTIONAL consumer performs no read of the sealed value - its short-circuit IS the guard's
    // void-0 branch, the same exemption `chainReadsThroughSeal` spells. Reproducing a read
    // the source never performs would throw off-window where the source answers `undefined`.
    if (!cur.optional && sealedLayerBetween(cur.object, object)) return { member: cur, inner: object, reader };
    reader = cur;
    cur = object;
  }
  return null;
}

// does the chain READ THROUGH a seal? a parenthesized layer over an UNDEFINABLE value whose
// consumer member is a PLAIN read: the sealed value short-circuits internally, but that read
// observes it and THROWS where a guard render answers `void 0`. so no render may fold steps into
// a guarded alternate across such a seal, re-hang a `?.` above it, or climb a guard out of a
// helper that consumes the value. an OPTIONAL consumer (`(nav)?.X`) performs no such read - its
// short-circuit IS the guard's void-0 branch - and a seal over an always-defined value (`(q =
// globalThis).window` - the parens only group the assignment) reads nothing that can throw
export function chainReadsThroughSeal(node, resolvePure, aliasCtx = null) {
  for (let cur = peelReceiverSequenceTail(node);
    cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';) {
    const object = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object));
    // the sealed value is a VALUE question, so it reads through a chain assignment: the write
    // stores the nav and the seal observes exactly what the nav produced
    // WHAT the seal hides decides, not the seal: a live `?.` under it short-circuits where the plain
    // read above throws, and no ponyfill can serve that - the read stays. a PLAIN proxy navigation
    // under it is the ordinary collapse, and keeping ITS read makes the polyfilled output throw
    // off-window, exactly where the ponyfill exists to answer
    if (!cur.optional && sealedLayerBetween(cur.object, object)
      && navValueCanShortCircuit(object, resolvePure, aliasCtx, { throughChainAssign: true })) return true;
    cur = object;
  }
  return false;
}

// the BASE a nav-guard test reads its probe hop off, as a decision both emitters render their own
// way. by default the test is the source slice with only the root substituted (`_globalThis.self
// ['window']` - a native `self` read where its ponyfill is the point); the hops below the
// probe are resolvable by construction, so the deepest of them supplies the base. the price is
// deliberate and owner-decided: that base is always defined, so a host missing `self` gets the
// guard's `void 0` where the source threw. null keeps the source slice - no resolvable hop below
// the probe or a computed probe key. Effectful realm keys never enter this plan.
// a PLAIN probe hop over a resolvable one no longer reaches here at all: the plan folds it onto
// that ponyfill (the realm-hop canon), so what still asks is a COMPUTED probe key
export function navGuardTestBase(plan) {
  const idx = plan.lastUnresolvableIdx;
  const below = idx > 0 ? plan.hops[idx - 1] : null;
  // the base is the point: without it the test reads `_globalThis.self` off the ponyfill, undefined
  // in exactly the realms the polyfill exists for. what the prefix DID on the way (a write, a
  // sequence, an effect-bearing call) is the caller's to spell ahead of it - `rootAssign` and the
  // rest travel on the plan for exactly that
  if (!below || plan.hops[idx].computed) return null;
  const basePure = plan.resolvePure({ kind: 'global', name: below.name });
  return basePure ? { basePure, probeName: plan.hops[idx].name } : null;
}

// which side of a sealed throw probe an effect rides: source order decides, and the probe RENDERS
// the nav, so an effect written BEFORE it (`((c++, nav)).Array.of(1)`) runs before the read the
// probe reproduces. both emitters split their residual effects on this one rule. the boundary is
// `sideEffectsPastOffset` - asked once and complemented, so the halves stay EXHAUSTIVE: consumers
// splice them as the whole effect list, and an offset that helper declines (a synthetic node has
// no `start`) must leave every effect ahead of the probe, never drop it
function partitionEffectsAtProbe(effects, navStart) {
  const after = sideEffectsPastOffset(navStart, effects);
  const past = new Set(after);
  return { ahead: effects.filter(effect => !past.has(effect)), after };
}

// Choose the read a claim would erase, on the pristine source and its read-site context.
// `preserveRead` is for a discarded initializer: its terminal environment read remains observable,
// even when a claim-only probe can fold that hop onto its ponyfill base. `allowStoreHolder` means
// the consumer discards the whole holder; a retained holder or an array mirror already runs it.
// This is a question only: no imports, skips, live claims or AST edits. Source identities and the
// position belong to this read; deferred consumers capture the guard before rewriting, retain
// the live effectsHost for child claims, and never cache the answer across source mutations.
function sealedClaimProbePlan(source, resolvePure, aliasCtx, {
  preserveRead = false, allowStoreHolder = false,
} = {}) {
  const value = peelTransparentExpr(source);
  // A fallback changes the bound value, but its left read always runs, including its throw.
  const read = preserveRead && value?.type === 'LogicalExpression' ? value.left : source;
  const outerBoundary = sealedChainBoundary(read);
  function aliasPlan() {
    if (preserveRead) return null;
    const member = outerBoundary?.member ?? read;
    // Source clones retain a span or location; a true mint must not recursively probe itself.
    if (!nodeCarriesSourceSpan(member)) return null;
    const aliasProbe = aliasHeldClaimProbe(member, resolvePure, aliasCtx, { allowStoreHolder });
    return aliasProbe ? { kind: 'alias', source, aliasProbe, navStart: aliasProbe.navStart } : null;
  }
  // An outer seal can end at a claim with no guard of its own. Keep descending the SOURCE
  // boundaries: that claim's value does not discharge a throwing read through an inner seal.
  for (let boundary = outerBoundary; boundary; boundary = sealedChainBoundary(boundary.inner)) {
    const key = memberKeyName(boundary.member);
    if (key === null || !proxyReceiverValueCanBeUndefined(boundary.inner,
      resolvePure, aliasCtx, { throughChainAssign: true })) continue;
    const facts = { source, boundary, key, navStart: boundary.inner.start, effectsHost: boundary.inner, preserveRead };
    const navPlan = !preserveRead && planProvenNavGuardCollapse({
      rootNode: boundary.inner, ...aliasCtx, resolvePure,
      throughKeptAssign: true, allowSequenceRoot: true, descendSequenceTail: true,
    });
    if (navPlan && !navPlan.topAssign && navPlan.kind === 'nested' && navPlan.leafPure) {
      return { ...facts, kind: 'nav', navPlan };
    }
    const leafPlan = sealedClaimLeafGuardPlan(boundary.inner, resolvePure, aliasCtx);
    if (!leafPlan?.leafPure && !leafPlan?.leafName) {
      if (preserveRead) return { ...facts, kind: 'passthrough' };
      continue;
    }
    const keyEffects = navComputedKeyEffects(boundary.inner);
    const alternateEffects = keyEffects.filter(expr => !subtreeContainsNode(leafPlan.guardObject, expr));
    return {
      ...facts, kind: 'leaf', navPlan: navPlan || null, leafPlan, keyEffects, alternateEffects,
      guardEffects: discardRescueNodes({ node: leafPlan.guardObject, ...aliasCtx }),
      foldLeafOntoBase: !preserveRead && !!leafPlan.foldLeafOntoBase,
    };
  }
  return aliasPlan();
}

// A source slot carried by a claim or pattern probe. The paths describe only its value spine: computed
// keys, sequence prefixes, assignment targets and call arguments remain live child slots.
// Decide deopts and root substitution BEFORE cloning; rendering applies these facts verbatim.
export function claimProbeSourceSlot(source, resolvePure, ctx) {
  const dead = new Set(vestigialNavOptionals(unwrapRuntimeExpr(source), resolvePure, ctx));
  const served = [];
  const deopt = [];
  const children = [];
  let visitChildren = true;
  let root = null;
  let path = [];
  for (let node = source, depth = 0; node && depth++ < MAX_KEY_DEPTH;) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled !== node) {
      path = [...path, 'expression'];
      node = node.expression;
    } else if (isMemberAccessNode(node)) {
      if (visitChildren && node.computed) children.push(node.property);
      if (visitChildren) served.push(path);
      if (dead.has(node)) deopt.push(path);
      path = [...path, 'object'];
      node = node.object;
    } else if (node.type === 'SequenceExpression') {
      if (visitChildren) children.push(...node.expressions.slice(0, -1));
      path = [...path, 'expressions', node.expressions.length - 1];
      node = node.expressions.at(-1);
    } else if (node.type === 'AssignmentExpression') {
      // A stored RHS computes a value of its own, including navigation below the write.
      // Visit that value once, rather than separately accepting each of its descendants.
      if (visitChildren) children.push(node.left, node.right);
      visitChildren = false;
      path = [...path, 'right'];
      node = node.right;
    } else {
      if (node.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(node.name)
        && isProxyGlobalIdentifierNode({ node, ...ctx })) {
        const pure = resolvePure({ kind: 'global', name: node.name });
        if (pure) root = { path, pure };
      }
      if (visitChildren && node.type !== 'Identifier' && node.type !== 'ThisExpression') children.push(node);
      break;
    }
  }
  return { source, served, deopt, root, children };
}

// A retained receiver with a live optional realm hop keeps that probe and hangs its plain
// tail on the hop's ponyfill. Computed tails and unbacked hops retain their source spelling.
export function guardedNavPassthroughPlan(receiver, resolvePure, ctx) {
  if (chainReadsThroughSeal(receiver, resolvePure, ctx)) return null;
  const hops = [];
  let cur = unwrapRuntimeExpr(receiver);
  while (isMemberAccessNode(cur) && !cur.optional) {
    if (cur.computed || cur.property?.type !== 'Identifier') return null;
    hops.unshift({ name: cur.property.name, node: cur });
    cur = peelTransparentExpr(cur.object);
  }
  if (!isMemberAccessNode(cur)) return null;
  const name = realmHopKeyName(cur, ctx);
  const leafPure = name && resolvePure({ kind: 'global', name });
  if (!leafPure) return null;
  return {
    kind: 'nav',
    source: receiver,
    boundary: { inner: receiver },
    prefix: [],
    navPlan: { hops, collapseIdx: -1, leafPure },
    test: { source: claimProbeSourceSlot(cur.object, resolvePure, ctx) },
  };
}

// A terminal value has no reader retaining its unbacked tail. Fold that quiet remainder
// onto the backed leaf; a kept store or a consumer reading through the value owns it instead.
export function terminalNavCollapsePlan(plan, { node, consumer }) {
  const readsThrough = (isMemberAccessNode(consumer) && consumer.object === node)
    || (isCallShape(consumer) && consumer.callee === node)
    || (consumer?.type === 'AssignmentExpression' && consumer.right === node);
  let { collapseIdx } = plan;
  if (!readsThrough && !plan.rootAssign && !plan.topAssign) {
    while (collapseIdx + 1 < plan.hops.length
      && (!plan.hops[collapseIdx + 1].node.computed || !mayHaveSideEffects(plan.hops[collapseIdx + 1].node.property))
      && unbackedProxyHopKey(plan.hops[collapseIdx + 1].node, plan.resolvePure)) collapseIdx++;
  }
  return collapseIdx === plan.collapseIdx ? plan : { ...plan, collapseIdx };
}

// The test of a decided navigation: either the backed base or the retained source read.
// A call's nullable yield is the probe itself; its own optional invocation still keeps the hop.
export function navGuardTestPlan(plan) {
  const { resolvePure, ctx } = plan;
  const base = navGuardTestBase(plan);
  let probe = plan.hops[plan.lastUnresolvableIdx].node;
  const below = unwrapRuntimeExpr(probe.object);
  if (isCallShape(below) && !below.optional
    && proxyReceiverValueCanBeUndefined(below, resolvePure, ctx, { throughChainAssign: true })) probe = below;
  const test = base ? { base, prefix: plan.rootAssign ? [claimProbeSourceSlot(plan.rootAssign, resolvePure, ctx)] : [] }
    : { source: claimProbeSourceSlot(probe, resolvePure, ctx) };
  if (plan.assignWrap) test.assign = plan.assignWrap;
  return test;
}

// A guard may read through collapsed navigation, but never through a load-bearing seal.
// Its prefix effects stay on the leaf before the retained tail, in source evaluation order.
export function navGuardSourcePlan(guard, resolvePure, ctx) {
  let root = guard;
  const rehang = [];
  function planFor(node) {
    return planProvenNavGuardCollapse({ rootNode: node, ...ctx, resolvePure,
      allowSequenceRoot: true, descendSequenceTail: true });
  }
  const sealedRead = chainReadsThroughSeal(guard, resolvePure, ctx);
  let plan = !sealedRead && planFor(root);
  if (!plan && !sealedRead && isMemberAccessNode(root) && !root.computed && root.property?.type === 'Identifier') {
    rehang.push({ name: root.property.name, liveOptional: !!root.optional, node: root });
    root = unwrapRuntimeExpr(root.object);
    plan = planFor(root);
  }
  if (!plan || plan.topAssign || !plan.leafPure) return { source: claimProbeSourceSlot(guard, resolvePure, ctx) };
  const prefix = navHopSequencePrefixes(guard, ctx);
  if (plan.rootAssign) prefix.push(plan.rootAssign);
  if (plan.rootEffectCall && inlineCallHasObservableEffects({ callNode: plan.rootEffectCall, ...ctx })) {
    prefix.push(plan.rootEffectCall);
  }
  return { pure: plan.leafPure, prefix: prefix.map(node => claimProbeSourceSlot(node, resolvePure, ctx)),
    tail: [...plan.hops.slice(plan.collapseIdx + 1), ...rehang] };
}

// Rendering facts for ordinary claims and receiver rebases. Pattern/deferred consumers keep
// their capture contract; this adds no live claims or host mutations to the shared question.
export function directClaimProbePlan(source, resolvePure, ctx, options) {
  const decision = sealedClaimProbePlan(source, resolvePure, ctx, options);
  return decision && claimProbeRenderPlan(decision, resolvePure, ctx, options);
}

// Enrich a decided read or guarded value with source slots shared by both render channels.
// A value probe preserves its terminal read; only a direct claim can fold the test navigation.
function claimProbeRenderPlan(decision, resolvePure, ctx, options) {
  // The navigation passthrough retains this whole source read. Its effects still
  // have the same source owner as the other probes; deferred drains need no offset fallback.
  if (decision.kind === 'passthrough') return { ...decision, retained: [decision.boundary.inner], consumed: [] };
  const { source } = decision;
  const retained = [];
  function slot(node) {
    retained.push(node);
    return claimProbeSourceSlot(node, resolvePure, ctx);
  }
  if (decision.kind === 'alias') {
    let { aliasProbe } = decision;
    // The alias read must still throw when its holder is absent. A backed constructor above
    // it, however, belongs to pure: reading through the native constructor would throw on the
    // legacy engines it serves. Keep the read BELOW each substituted value, not through it.
    let member = unwrapRuntimeExpr(peelReceiverSequenceTail(source));
    for (let receiver = unwrapRuntimeExpr(peelReceiverSequenceTail(member?.object));
      isMemberAccessNode(receiver) && proxyGlobalMemberCtorPure({ receiver, aliasCtx: ctx, resolvePure });
      receiver = unwrapRuntimeExpr(peelReceiverSequenceTail(member.object))) {
      const shorter = aliasHeldClaimProbe(receiver, resolvePure, ctx, options);
      if (!shorter) break;
      aliasProbe = shorter;
      member = receiver;
    }
    return { ...decision, aliasProbe, object: slot(aliasProbe.object), retained, consumed: [], readsSource: true };
  }
  const { navPlan, leafPlan, boundary } = decision;
  let test;
  if (decision.kind === 'value' || decision.preserveRead) {
    test = { source: slot(leafPlan.guardObject) };
  } else {
    test = decision.kind === 'nav' ? navGuardTestPlan(navPlan) : navGuardSourcePlan(leafPlan.guardObject, resolvePure, ctx);
    if (test.source) retained.push(test.source.source);
    else retained.push(...test.prefix.map(item => item.source));
  }
  const navPrefix = navHopSequencePrefixes(boundary.inner, ctx);
  const prefix = navPrefix.filter(effect => retained.every(node => !subtreeContainsNode(node, effect)));
  const consumed = [...navPrefix, ...decision.keyEffects ?? [], ...decision.guardEffects ?? [],
    ...navPlan?.rootEffectCall ? [navPlan.rootEffectCall] : [],
    ...navPlan?.rootAssign ? [navPlan.rootAssign] : [], ...navPlan?.assignWrap ? [navPlan.assignWrap] : []];
  return { ...decision, test, prefix, retained, consumed, readsSource: !!boundary.member };
}

// Residual effects use source ownership, never a scan of the emitted probe. A retained source
// slot already runs its descendants; the remaining effects straddle the source read's boundary.
export function directClaimProbeEffects(probe, effects = []) {
  const { decision } = probe;
  const rest = effects.filter(effect => !decision.consumed.includes(effect)
    && decision.retained.every(node => !subtreeContainsNode(node, effect)));
  const { ahead, after } = partitionEffectsAtProbe(rest, decision.navStart);
  return [...ahead, probe.node, ...after];
}

// where the READ a rendered probe reproduces begins - asked of the SOURCE spelling, at plan time:
// by drain time the collapse has rebuilt the init and its minted nodes carry no span, so the split
// would hand the probe's own read back to the effect channel and run it twice
function discardedInitProbeNavStart(initNode) {
  const tail = peelReceiverSequenceTail(initNode);
  // no SEQUENCE around the init means nothing precedes the read the probe reproduces: every effect
  // the harvest found lives INSIDE that read, and the probe carries it. `0` says exactly that -
  // the tail's own start would put the read's own effects ahead of it and run them twice
  return tail && tail !== unwrapRuntimeExpr(initNode) ? tail.start ?? 0 : 0;
}

// A fully consumed pattern needs the value's own probe, or the alias read through its first seal.
// A sequence contributes its tail; a one-element array's mirror already owns an inline store.
// As with sealedClaimProbePlan, this retains source facts without committing any host effects.
export function discardedInitProbePlan(initNode, resolvePure, aliasCtx) {
  const peeled = unwrapRuntimeExpr(peelReceiverSequenceTail(initNode));
  const arrayWrapped = peeled?.type === 'ArrayExpression';
  let nav = arrayWrapped && peeled.elements.length === 1 ? unwrapRuntimeExpr(peeled.elements[0]) : peeled;
  if (nav?.type === 'ConditionalExpression') {
    nav = agreeingTernaryArm(nav, aliasCtx.path, aliasCtx.adapter) ?? nav;
  }
  if (!nav) return null;
  const leafPlan = sealedClaimLeafGuardPlan(nav, resolvePure, aliasCtx, { probeLeaf: true });
  if (leafPlan) {
    const keyEffects = navComputedKeyEffects(nav);
    return claimProbeRenderPlan(
      {
        kind: 'value',
        source: initNode,
        boundary: { inner: nav },
        leafPlan,
        keyEffects,
        alternateEffects: keyEffects.filter(effect => !subtreeContainsNode(leafPlan.guardObject, effect)),
        navStart: discardedInitProbeNavStart(initNode),
        foldLeafOntoBase: !!leafPlan.foldLeafOntoBase,
      },
      resolvePure,
      aliasCtx,
    );
  }
  const aliasProbe = aliasHeldClaimProbe(sealedChainBoundary(nav)?.member ?? nav,
    resolvePure, aliasCtx, { allowStoreHolder: !arrayWrapped });
  return aliasProbe ? claimProbeRenderPlan({ kind: 'alias', source: initNode, aliasProbe,
    navStart: aliasProbe.navStart }, resolvePure, aliasCtx) : null;
}

// The immediate pattern's discarded receiver: a sealed source read takes precedence over
// reading the first pattern key. Otherwise preserve the guarded value used by a full consume
// or mirror. Queue timing stays with the host; asking this question never accepts child claims.
export function destructureProbePlan(source, resolvePure, ctx) {
  const sealed = directClaimProbePlan(source, resolvePure, ctx, { allowStoreHolder: true });
  if (sealed) return sealed;
  const value = probedDestructureInitValue(source, resolvePure, ctx);
  if (!value) return null;
  // A dead fallback still evaluates its left value before reading the pattern's first key.
  // Its seal is a guarded VALUE here, not the complete destructure read.
  if (value !== source) {
    const left = directClaimProbePlan(value, resolvePure, ctx);
    if (left) return { ...left, readsSource: false };
    source = value;
  }
  const navPlan = planProvenNavGuardCollapse({ rootNode: source, ...ctx, resolvePure });
  if (navPlan) {
    if (navPlan.topAssign || navPlan.kind !== 'nested' || !navPlan.leafPure) return null;
    return claimProbeRenderPlan({ kind: 'nav', source, navPlan, boundary: { inner: source },
      navStart: discardedInitProbeNavStart(source) }, resolvePure, ctx);
  }
  return discardedInitProbePlan(source, resolvePure, ctx);
}

// A residual guarded value keeps the navigation plan's declines. Otherwise a sealed read
// takes precedence over the leaf's definedness: the leaf cannot discharge that source throw.
// A leaf-only value folds its guard navigation, while discarded initializer probes retain it.
export function probedNavGuardValuePlan(source, resolvePure, ctx) {
  const navPlan = planProvenNavGuardCollapse({ rootNode: source, ...ctx, resolvePure });
  if (navPlan) {
    if (navPlan.topAssign || navPlan.kind !== 'nested') return null;
    return claimProbeRenderPlan({ kind: 'nav', source, navPlan, boundary: { inner: source } }, resolvePure, ctx);
  }
  const boundary = sealedChainBoundary(source) && directClaimProbePlan(source, resolvePure, ctx);
  if (boundary && !boundary.consumed.length) return boundary;
  const leafPlan = sealedClaimLeafGuardPlan(unwrapRuntimeExpr(source), resolvePure, ctx, { probeLeaf: true });
  if (!leafPlan || (!leafPlan.leafPure && !leafPlan.leafIsProbe && !leafPlan.leafBasePure
    && !isValidIdentifierName(leafPlan.leafName))) return null;
  const keyEffects = navComputedKeyEffects(source);
  return claimProbeRenderPlan({
    kind: 'leaf',
    source,
    boundary: { inner: source },
    leafPlan,
    keyEffects,
    alternateEffects: keyEffects.filter(effect => !subtreeContainsNode(leafPlan.guardObject, effect)),
    foldLeafOntoBase: !!leafPlan.foldLeafOntoBase,
  }, resolvePure, ctx);
}

// the guarded VALUE of a sealed nav that ENDS AT a claim, as a shared decision: the
// nav plan has no ponyfillable hop leaf to build a guard from there, so the erase
// verdict names the `?.` object to test and the claim's own leaf supplies the always-defined
// alternate. `leafPure` when core-js ponyfills that leaf as a constructor; otherwise `leafName` -
// the source's own global name, which IS that value (the probe reads a property off it exactly as
// written, and the claim beside it still carries the polyfill). null when no single `?.` expresses
// the short-circuit, or the leaf is neither ponyfilled nor a plain name
function sealedClaimLeafGuardPlan(nav, resolvePure, aliasCtx = null, { probeLeaf = false } = {}) {
  const verdict = undefinableOptionalGuard(nav, resolvePure, aliasCtx);
  if (verdict.kind !== 'guard') {
    // a value that IS the environment probe carries no `?.` for the verdict to key on - the
    // bare one-hop read (`globalThis.window`) and an alias HOLDING an absent-able value are
    // undefinable by the value canon alone. the leaf to read off the guard is the probe
    // itself (`null == _globalThis.window ? void 0 : _globalThis.window` - the test operand
    // doubles as the alternate), which `leafIsProbe` tells the renders to spell. OPT-IN
    // (`probeLeaf`): only the direct guard-value consumers (a full consume of the probe
    // itself) ask this - a SEALED path's inner probe keeps the accepted plain-seal collapse
    // (`(globalThis.window).self` reads off the realm global like its unsealed twin)
    if (probeLeaf && verdict.kind === 'erase' && ownChainOptionalObjects(nav).length === 0
      && !chainSealsAShortCircuit(nav, resolvePure, aliasCtx)
      && (nav?.type === 'Identifier'
        ? aliasHeldValueCanBeUndefined(nav, resolvePure, aliasCtx)
        : proxyReceiverValueCanBeUndefined(nav, resolvePure, aliasCtx))) {
      return { guardObject: nav, leafPure: null, leafName: null, leafIsProbe: true };
    }
    return null;
  }
  const leafPure = proxyRunLeafPure(nav, aliasCtx, resolvePure);
  if (leafPure) return { guardObject: verdict.object, leafPure, leafName: null };
  const leafName = staticMemberKeyName(nav);
  if (!leafName) return null;
  if (POSSIBLE_GLOBAL_OBJECTS.has(leafName) && !realmHopKeyName(nav, aliasCtx)) return null;
  // an UNBACKED realm leaf (`window`) over a ponyfill BASE folds onto that base: it names the realm
  // the ponyfill already is, and off-browser the ponyfill cannot answer it - the nav plan's own
  // fold of a hop read through. the base is the ctor pure of the hop below the leaf; without one
  // the leaf keeps its own name, and a leaf that is a plain GLOBAL name (`Array`) keeps it too -
  // the claim beside it carries the polyfill, the probe reads a property off the global as
  // written. ONE verdict for both renders: spelled per leg, one folded and the other spelled the
  // raw name, and the two import sets differed on the same source
  const leafBasePure = POSSIBLE_GLOBAL_OBJECTS.has(leafName)
    ? proxyRunLeafPure(unwrapRuntimeExpr(nav.object), aliasCtx, resolvePure) : null;
  const foldLeafOntoBase = !!leafBasePure && foldableRealmHopKey(leafName, { adapter: aliasCtx?.adapter, resolvePure });
  return { guardObject: verdict.object, leafPure: null, leafName, leafBasePure, foldLeafOntoBase };
}

// the ponyfill of a proxy-global LEAF read off a run the realm canon speaks for: the member canon
// walks identifier roots, and a run rooted at a kept STORE or a proven CALL names the same global
// (`((w = gw.window)?.self).Array` reads the realm's `self`) - spelled raw, that leaf was a bare
// global read in pure output on one leg and the ponyfill on the other
function proxyRunLeafPure(node, aliasCtx, resolvePure) {
  const direct = proxyGlobalMemberCtorPure({ receiver: node, aliasCtx, resolvePure });
  if (direct) return direct;
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  const leafName = realmHopKeyName(node, aliasCtx);
  if (!leafName || !POSSIBLE_GLOBAL_OBJECTS.has(leafName) || !navProxyRooted(unwrapRuntimeExpr(node.object), aliasCtx)) return null;
  const pure = resolvePure({ kind: 'global', name: leafName });
  return pure && pure.kind !== 'instance' ? pure : null;
}

// is this navigation rooted where the realm canon speaks - a proxy-global identifier (through the
// alias and kept-store walks) or a call that provably yields one? the leaf read off such a run
// names the realm's global whatever carries it
function navProxyRooted(node, aliasCtx) {
  const { root } = descendToChainRoot(node, true);
  if (root?.type === 'Identifier') return !!aliasCtx && !!isProxyGlobalIdentifierNode({ node: root, ...aliasCtx });
  return isCallShape(root) && !!aliasCtx && !!inlineCallProxyGlobalRoot({ callNode: root, ...aliasCtx });
}

// SEALED objects of a nav chain: each member OBJECT wrapped in a parenthesized layer (source
// parens, a paren'd cast - `(nav).X`, `(nav as any).X`). the seal hides the inner nav from
// own-chain walks (the outer chain parses PLAIN above it), but the sealed VALUE still
// short-circuits internally - callers ask the value canon about each inner nav
function chainSealedObjects(node) {
  const sealed = [];
  let cur = peelReceiverSequenceTail(node);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const object = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object));
    if (sealedLayerBetween(cur.object, object)) {
      sealed.push(object);
      break;
    }
    cur = object;
  }
  return sealed;
}

// does a SEAL in this chain hide a SHORT-CIRCUIT? that is the one thing a seal can hide that the
// collapse may not erase: the `?.` under it is the user's own runtime test, and the seal makes its
// result observable to the read above (`(globalThis.window?.self).X` throws off-window, where the
// unsealed spelling short-circuits). a seal over a PLAIN nav hides nothing of the sort - the value
// canon reads such a nav as the proxy global it navigates, so it collapses like its unsealed twin.
// THE question every seal-aware channel of both emitters asks; asking "can the sealed value be
// undefined" instead kept the environment probe in the output, which is undefined in exactly the
// realms the polyfill exists for
export function chainSealsAShortCircuit(node, resolvePure, aliasCtx = null, { throughChainAssign = false } = {}) {
  return chainSealedObjects(node)
    .some(inner => navValueCanShortCircuit(inner, resolvePure, aliasCtx, { throughChainAssign }));
}

// the runtime VALUE of an inline proxy-nav can short-circuit to undefined: a LIVE `?.` in its
// chain guards a read that can itself be undefined (an unresolvable hop read - `globalThis
// .window?.self...`). an ALL-PLAIN nav stays the always-defined realm global under the
// proxy-collapse assumption (no live source of undefined, the spelling declares the env), and
// a live `?.` over a resolvable read (`globalThis.self?.x`) tests a ponyfill-backed value -
// both stay erasable. a PARENTHESIZED object SEALS its own chain (`(nav).X` - the nav's
// internal `?.` short-circuits only the sealed value; the plain read above observes it, throw
// semantics, never skips), so the walk stops at a seal after testing the link's own `?.`.
// entry parens are value-transparent - the value asked about IS the sealed one
export function navValueCanShortCircuit(navNode, resolvePure, aliasCtx = null, options = {}) {
  return !!navShortCircuitSource(navNode, resolvePure, aliasCtx, options);
}

// ... and WHICH read short-circuits it: the value the deepest live `?.` tests, which is what a
// guard over the whole nav has to spell. one walk, two shapes of its answer - a caller asking
// only whether the value can vanish takes the boolean above
export function navShortCircuitSource(navNode, resolvePure, aliasCtx = null,
  { throughChainAssign = false, observableRead = false } = {}) {
  let cur = unwrapRuntimeExpr(peelReceiverSequenceTail(navNode));
  let source = null;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const raw = peelReceiverSequenceTail(cur.object);
    const object = unwrapRuntimeExpr(raw);
    // a CALL object answers by its OWN canon and by nothing under it - the value arm below reaches a
    // call's verdict only back through this same question - so the two are one reading of the
    // object, not a step and a fallback, and the loop ends on a call whatever either answers
    if (cur.optional && (isCallShape(object)
      ? callValueCanBeUndefined(object, aliasCtx, resolvePure)
    // the object's own VALUE decides, not "some unresolvable hop stands below it": a DEEPER
    // unbacked hop is a realm self-reference the collapse assumption defines (`globalThis.window
    // .self` IS the realm), and only the value canon says so - asked by hop presence, this arm
    // built a probe guard over a read that cannot be absent, and the run kept hops its plain twin
    // folds. the value canon's own two shapes (the FIRST hop off the root, a live `?.` under it)
    // are exactly the branch this render owes
    // `throughChainAssign`: a write under the `?.` STORES the nav and hands the same value on
    // (`(q = globalThis.window)?.self`). only a caller asking about the VALUE reads through it -
    // the default verdict keeps the write opaque, because the emit channels key their routing on
    // it and flipping that globally strands a raw root in a guard memo. what the write stores is
    // OBSERVED, so the stored nav is judged as an observable read (`(v = globalThis.self.window)?.X`
    // tests the stored `_self.window` - folded, the store held the realm where native holds undefined)
    // ... or an alias HOLDING a value that can be absent (`const w = globalThis.window;
    // w?.Array` short-circuits like the value it hides)
      : proxyReceiverValueCanBeUndefined(throughChainAssign
        ? peelChainAssignment(object).value ?? object : object, resolvePure, aliasCtx,
      { throughChainAssign, observableRead: observableRead || (throughChainAssign && !!peelChainAssignment(object).outer) })
        || (object?.type === 'Identifier'
          && aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx)))) source = object;
    // a PARENTHESIZED layer (source parens or a paren'd cast - `(nav).X`, `(nav as any).X`) stops
    // the OUTER chain's short-circuit but not this walk: what the seal HIDES is the question, and a
    // live `?.` under one still short-circuits the value the read above observes. a seal over a
    // PLAIN nav hides no such thing - that nav is the proxy global it navigates (`globalThis`,
    // `self` and `window` are one object), so it collapses like its unsealed twin instead of keeping
    // a `window` read off the PONYFILL, undefined in the realms the polyfill exists for. what a seal
    // OWES its consumers is `chainSealsAShortCircuit`, built on this verdict
    cur = object;
  }
  return source;
}

// THE canonical "can this proxy-receiver VALUE be undefined at runtime" verdict, shared by
// the erase / deopt decisions of both emitters. undefined arises from exactly two shapes:
//   - the bare ENVIRONMENT PROBE: the FIRST hop off the proxy root reads the host environment
//     (`globalThis.window` - undefined off-window hosts). DEEPER unresolvable hops are realm
//     self-references, defined under the proxy-collapse assumption (`globalThis.self.window`
//     collapses whole - the multihop deopt canon);
//   - a live `?.` in the chain guarding such a probe (short-circuit - `navValueCanShortCircuit`,
//     seal-aware).
// an Identifier resolves through the alias walk (`undefinableProxyRootValue` - an alias
// HOLDING a probe/nav is as undefinable as the nav); other shapes (opaque calls, ...) stay
// with each caller's own arm - pass only nav/Identifier cores here
export function proxyReceiverValueCanBeUndefined(node, resolvePure, aliasCtx = null,
  { throughChainAssign = false, observableRead = false } = {}) {
  const core = unwrapRuntimeExpr(peelReceiverSequenceTail(node));
  if (core?.type !== 'MemberExpression' && core?.type !== 'OptionalMemberExpression') {
    return undefinableProxyRootValue(core, resolvePure, aliasCtx);
  }
  if (navValueCanShortCircuit(core, resolvePure, aliasCtx, { throughChainAssign, observableRead })) return true;
  const hop = realmHopKeyName(core, aliasCtx, { allowSideEffectKeys: true });
  if (!proxyHopLacksPureEntry(hop, resolvePure)) return false;
  const rootRaw = unwrapRuntimeExpr(peelReceiverSequenceTail(core.object));
  // the chain-root peel to FIXPOINT: a write storing an effect-prefixed root is the shape it
  // exists for (`(held = (n++, globalThis)).window`) - the one-step assign peel stops at that
  // sequence and reads no root, calling a load-bearing probe always-defined
  let rootObj = unwrapRuntimeExpr(peelChainRootValue(rootRaw) ?? rootRaw);
  // only an OBSERVABLE read (a kept write, a seal - the caller proves it) may treat a proxy
  // SPINE below the probe hop as one surface (`(v = globalThis.self.window)`: the probe reads
  // off `globalThis.self`); a PLAIN multi-hop nav collapses whole and its `?.` deopts instead
  // An unspellable root leaves the navigation raw, so its terminal probe is an observable
  // read too. The effect-bearing spelling of a hop has the same value as its dotted twin.
  // A value query also observes the surface stored BELOW the terminal probe. The
  // store fixes that base: `(held = globalThis.self).window` still reads window,
  // including when effects and further assignments wrap the stored surface.
  if (observableRead || (throughChainAssign && peelChainAssignment(rootRaw).outer)
    || !realmRootIsSpellable(core, resolvePure)) {
    while (rootObj?.type === 'MemberExpression' || rootObj?.type === 'OptionalMemberExpression') {
      const hopName = realmHopKeyName(rootObj, aliasCtx, { allowSideEffectKeys: true });
      if (!hopName || !POSSIBLE_GLOBAL_OBJECTS.has(hopName)) break;
      // A backed span supplies the base of the terminal environment read, not its result:
      // `(v = globalThis.self.window)?.Map` tests the stored `_self.window` value.
      // A store may sit below any hop, so each step owes the same root-value peel as the
      // first one. Otherwise `(v = globalThis).self.window` loses its root proof here.
      rootObj = unwrapRuntimeExpr(peelChainRootValue(rootObj.object) ?? rootObj.object);
    }
  }
  // a MINTED pure import at the root (`_self.window` after the in-place rewrite) names its
  // source global through the polyfillHint side-channel - the probe read is the same
  if (rootObj?.type === 'Identifier') {
    return !!isProxyGlobalIdentifierNode({ node: rootObj, ...aliasCtx })
      || (!!aliasCtx && !!bareProxyGlobalAliasName(rootObj, aliasCtx));
  }
  // the probe read off a PROVEN inline call is the same environment probe (`f()?.window`,
  // `f = () => globalThis` - the opaque-root canon guards it)
  return (rootObj?.type === 'CallExpression' || rootObj?.type === 'OptionalCallExpression')
    && !!aliasCtx && !!inlineCallProxyGlobalRoot({ callNode: rootObj, ...aliasCtx });
}

// the two halves an emitter asks TOGETHER wherever what it renders stands on the run's VALUE: the
// run must be proxy-ROOTED - a nav the realm canon speaks for, where an opaque call root is
// undefinable by its own canon - and that value must be proven. one reading of "proven", so a `?.`
// verdict and a fold's landing cannot disagree about it
export function proxyRunValueIsProven(node, resolvePure, aliasCtx = null) {
  return !!findProxyGlobal(node, aliasCtx, true)
    && !proxyReceiverValueCanBeUndefined(node, resolvePure, aliasCtx, { throughChainAssign: true });
}

// can the VALUE of a CALL be undefined? an opaque call is a genuine guard (the opaque-root
// canon keeps those `?.`); an inline-PROVEN proxy-global call yields a proxy global, which is not
// the same as yielding a DEFINED one - a body that navigates through a live `?.`
// (`() => globalThis.window?.self`) short-circuits, and only then is the `?.` above the call
// vestigial (the optional-count collapse canon). asking that needs `resolvePure`; a caller with
// none keeps the older, narrower verdict. a CONDITIONALLY proven callee
// (`let f; if (c) f = () => globalThis;`) proves no value at all - the unassigned path yields
// undefined through the call's own `?.()`, exactly what the outer `?.` guards
// the VALUE a proven inline call yields, walked through nested single-return wrappers - the shape
// `callValueCanBeUndefined` tests. null when the call does not inline; on success the hop standing
// on the yielded value, its `ctx` re-anchored at the callee's own scope for the caller's analysis
function inlineCallProxyGlobalNavValue(callNode, aliasCtx) {
  if (!aliasCtx) return null;
  let hop = { node: callNode, seen: new Set(), ctx: aliasCtx };
  while (isCallShape(hop.node)) {
    const next = inlineCallReturnExpression(hop, { rejectConditional: true });
    if (!next) return null;
    hop = { ...next, node: unwrapRuntimeExpr(next.node) };
  }
  return hop;
}

// the NAME a proven-call source keys by: what makes its value undefinable, which is usually the same
// probe the hop above it reads (`(() => globalThis.window?.self)()?.window` - one source, one test)
function callSourceName(callNode, aliasCtx, resolvePure) {
  const body = inlineCallProxyGlobalNavValue(callNode, aliasCtx);
  return (body && deepestUnresolvableHopSource(body.node, body.ctx, resolvePure)?.name) ?? '<call>';
}

// can this call's VALUE be undefined at runtime - the probe-yield question of a proven call root
// (`() => globalThis.window` yields the probe; `() => globalThis` never): the collapse and memo
// channels of both legs gate on it before reading THROUGH the yield
export function callValueCanBeUndefined(callNode, aliasCtx, resolvePure = null) {
  // an OPTIONAL call is a chain LINK, not a plain value: dropping the `?.` above it re-groups
  // the chain (dropping it means parenthesizing the link, `(oc?.()).window`, where the source's
  // `oc?.().window` reads as one chain). the source spelling is the one both
  // emitters print, so the optional above such a link is never dead
  if (callNode.optional) return true;
  return callYieldCanBeUndefined(callNode, aliasCtx, resolvePure);
}

// the value-definedness half of the call canon, without the optional-LINK print rule above: can
// what the call YIELDS be absent - an unproven / CONDITIONALLY-proven callee (`let f; if (c)
// f = () => globalThis;` - the unassigned path short-circuits through the call's own `?.()`,
// which nothing above re-tests), or a proven body whose returned navigation is itself
// undefinable. the guard-SOURCE arm asks this of an optional call: the print rule answers true
// for every optional link, but a const-bound callee yields a proven value whose collapse is sound
export function callYieldCanBeUndefined(callNode, aliasCtx, resolvePure) {
  if (!aliasCtx || !inlineCallProxyGlobalRoot({ callNode, ...aliasCtx, rejectConditional: true })) return true;
  // proving the call YIELDS a proxy global is not proving its value is DEFINED: an inlined body that
  // navigates through a live `?.` (`() => globalThis.window?.self`) short-circuits to undefined, and
  // the `?.` above the call is what reproduces that. read as vestigial and dropped, both emitters
  // threw where native answers undefined. a caller with no `resolvePure` cannot ask, and keeps the
  // older, narrower verdict
  if (!resolvePure) return false;
  const body = inlineCallProxyGlobalNavValue(callNode, aliasCtx);
  if (!body) return false;
  // the same distinction one step further: a body that navigates PLAINLY to the environment probe
  // (`() => globalThis.window`) yields a value that is undefined off-window without short-circuiting
  // anywhere, so the `?.` above the call is the only thing standing between the collapse and a read
  // off `undefined` (`(() => globalThis.window)()?.self.window.Array` threw inside the ponyfill)
  return navValueCanShortCircuit(body.node, resolvePure, body.ctx)
    || proxyReceiverValueCanBeUndefined(body.node, resolvePure, body.ctx);
}

// Decide each continuation of a guarded value without editing its source. Native bindings
// supply the next member/call and its source reader; the planner owns the realm fold,
// live-optional boundary, optional erasure and the value left after a retained realm hop.
// A dispatch result is not navigation. A nav collapse additionally stops at the next live
// guard once a retained hop has made its leaf undefinable. Each planner belongs to one climb.
export function createGuardTailPlanner({
  alwaysDefined = false, navAlternate = false, navCollapse = false, preserveOptionalHops = false,
} = {}) {
  let absorbed = false;
  let adjacent = alwaysDefined;
  let erasedOptional = false;
  let crossedUnbacked = false;
  let inRealmRun = alwaysDefined;
  let defined = alwaysDefined;
  let allPlain = alwaysDefined;
  let inChain = false;
  let pulled = 0;
  return function planTailStep({
    optional, isCall, realmHop = false, computed = false, property = null,
    reader = null, readsMember = false, readsThrough = false, foreign = false,
  }) {
    if (foreign) return null;
    const sourceReadContinues = preserveOptionalHops && !optional && readsThrough
      && (!readsMember || reader.optional || !POSSIBLE_GLOBAL_OBJECTS.has(memberKeyName(reader)));
    const foldRealmHop = realmHop && !sourceReadContinues && (!optional || !preserveOptionalHops)
      && (!computed || !!property && !mayHaveSideEffects(property)) && (alwaysDefined || navAlternate);
    const absorbWrappers = alwaysDefined && !absorbed;
    let folded = false;
    let keepOptional = optional;
    if (navCollapse) {
      inRealmRun &&= !isCall && realmHop;
      if (inRealmRun) {
        keepOptional = false;
        folded = foldRealmHop;
        if (!folded) {
          inRealmRun = false;
          defined = allPlain = false;
        }
      } else {
        if (isCall ? !pulled : optional && !defined && !inChain && !allPlain) return null;
        keepOptional &&= !(pulled === 0 && defined);
        pulled += 1;
        inChain ||= isCall && optional;
        if (!isCall) {
          defined = false;
          allPlain &&= !optional;
        }
      }
    } else {
      if (optional) {
        if (isCall) {
          if (!absorbed) return null;
        } else {
          if ((!alwaysDefined && !navAlternate) || crossedUnbacked
            || (!adjacent && erasedOptional && !navAlternate)) return null;
          if (adjacent) {
            keepOptional = false;
            erasedOptional = true;
          }
        }
      }
      if (!isCall && realmHop) {
        folded = foldRealmHop;
        if (folded) erasedOptional = false;
        else crossedUnbacked = true;
      }
    }
    adjacent = folded && alwaysDefined;
    absorbed = true;
    return { folded, optional: !!keepOptional, absorbWrappers };
  };
}

// Within a substituted proxy navigation, the optional is dead only when its receiver
// cannot be undefined. This is a VALUE proof: a source receiver also needs a replacement
// claim (isPolyfillableOptional). Guard renders already carry that claim in their plan.
export function isVestigialOptionalHop(node, resolvePure, aliasCtx = null) {
  if (!isMemberAccessNode(node) || !node.optional) return false;
  const object = unwrapRuntimeExpr(node.object);
  // A kept write observes its value; a sequence hands its tail on. The same probe can
  // therefore be live in a store even when the surrounding navigation would collapse.
  const value = peelChainAssignmentDeep(peelReceiverSequenceTail(object));
  const undefinable = isCallShape(value)
    ? callValueCanBeUndefined(value, aliasCtx, resolvePure)
    : proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx, value === object ? undefined : { observableRead: true });
  return !undefinable && realmRootIsSpellable(value, resolvePure);
}

// Every guard renderer applies the same value proof to its claimed navigation.
export function vestigialNavOptionals(navNode, resolvePure, aliasCtx = null) {
  const dead = [];
  for (let cur = navNode; isMemberAccessNode(cur); cur = unwrapRuntimeExpr(cur.object)) {
    if (isVestigialOptionalHop(cur, resolvePure, aliasCtx)) dead.push(cur);
  }
  return dead;
}

// which `?.` decides a fold over a KEPT STORE: only the hop READING the store can see its void,
// so its own `?.` slides onto whatever now reads the folded value, and a plain hop there erases
// the `?.` above - a void store then throws on that member exactly where the source threw on the
// hop. deeper hops read the realm object the first read already proved, so their `?.` never
// travels. `navNode` is the folded span; the walk descends to the hop whose object is the store
export function storeReadHopOptional(navNode) {
  let hop = null;
  for (let cur = unwrapRuntimeExpr(navNode);
    cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object))) hop = cur;
  return hop?.optional === true;
}

// does this nav hop FOLD onto the ponyfill below it? a hop the pure build cannot back names a realm
// SELF-REFERENCE the collapse assumes present, and standing over a ponyfill it is a read that
// ponyfill cannot answer off-browser - so it folds, the way a whole nav folds in a fallback slot.
// PRISTINE, because a slot the source itself wrote holds the user's own object. what SPELLS the key
// is the name canon's question and lives at the node-shaped ask below. the positional half - which
// hops stand over a ponyfill - belongs to the caller: the nav plan for a planned collapse, the
// emitters' own tail walks for the hops a plan does not reach. a caller holding the hop's read hands it
function foldableRealmHopKey(key, { adapter, resolvePure }, read = null) {
  return proxyHopLacksPureEntry(key, resolvePure) && isPristineProxyGlobal(adapter, key, read);
}

// the node-shaped ask of the same verdict. WHICH name the hop has is the name canon's question,
// never this one's: gating the fold on the node's own SHAPE gave one hop two names - a `['window']`
// step kept a slot its dotted twin drops, and the two emitters then folded one source two ways. an
// EFFECT-bearing key still declines, because `realmHopKeyName` refuses one wherever the caller
// carries no slot to replay it in, and this verdict carries none
export function foldableRealmHop(node, ctx) {
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return false;
  return foldableRealmHopKey(realmHopKeyName(node, ctx?.scope ? ctx : null), ctx, ctx?.path ? { node, path: ctx.path } : null);
}

// the UNBACKED half alone, node-shaped: a hop READ the pure package cannot back (`window` - there is
// no `_window`), so a value past one is no longer the always-defined ponyfill. both questions are the
// canon's own - `staticMemberKeyName` folds the dotted, static-computed and SE-seq-keyed spellings
// alike (a hand-rolled `!computed` read left the seq-keyed `[eff(), 'window']` hop looking backed,
// and the value collapse rode one hop past what the realm can prove). `resolveHere` is the caller's
// pure resolver over a meta, the kept-sequence plan and both emitters' tail walks ask it
export function unbackedProxyHopKey(node, resolveHere) {
  const key = isMemberAccessNode(node) ? staticMemberKeyName(node) : null;
  return !!key && proxyHopLacksPureEntry(key, resolveHere);
}

// does a TERMINAL run of unbacked pristine hops ride ABOVE the claim - `window` reads that end
// the spine without another backed hop or claimable member folding them? that run is the value
// the source itself reads, so it keeps its slots and respells over the claim's own pure
// (`globalThis.self.window` -> `_self.window`), where folding it would answer the environment
// probe with an always-defined ponyfill. a backed hop above RESETS the run (deep-nav folds), and
// a claimable member above navigates it - both belong to the collapse, not here
export function unbackedTailRidesAbove(path, resolvePure) {
  let sawUnbacked = false;
  let cur = path;
  for (let up = cur.parentPath; up?.node; up = cur.parentPath) {
    // every layer that hands the value UP is stepped, not just the wrapper kinds: a SEQUENCE
    // whose tail the run is carries it exactly as a paren does, and stopping there answered
    // "no run" for `(0, globalThis.self).window` while its unwrapped twin answered yes
    if (SKIPPABLE_WRAPPER_TYPES.has(up.node.type)
      || (up.node.type === 'SequenceExpression' && up.node.expressions.at(-1) === cur.node)
      // a STORE hands the value on, so what reads the STORE decides for the run inside it: a claim
      // above consumes it and folds the probe (`(q = (eff(), globalThis.self).window).Map`), a bare
      // store keeps whatever the run spells
      || (up.node.type === 'AssignmentExpression' && up.node.operator === '=' && up.node.right === cur.node)) {
      cur = up;
      continue;
    }
    if (!isMemberAccessNode(up.node) || up.node.object !== cur.node) {
      // a NULL-PROBE test reading the run (`null == <run>`, a rendered guard or the
      // source's own lowered spelling) reads the terminal environment probe. A backed
      // span below it may substitute, but the test must still read the unbacked tail.
      if (up.node.type === 'BinaryExpression' && (up.node.operator === '==' || up.node.operator === '!=')
        && [up.node.left, up.node.right].some(isNullLiteralNode)) return sawUnbacked;
      break;
    }
    if (up.node.optional && sawUnbacked) return true;
    const key = memberProxyHopName(up.node);
    // a real member READ above NAVIGATES the run - the deep-nav collapse owns it
    // (`globalThis.self.window.k` collapses whole); this walk answers for a run whose
    // VALUE flows out (a bare read, an argument, a `typeof`) with the unbacked hop terminal
    if (key === null) return false;
    sawUnbacked = !resolvePure({ kind: 'global', name: key });
    cur = up;
  }
  return sawUnbacked;
}

// ... and the verdict every channel over such a run asks before its swap, while the source spine is
// still standing: is the run the value the SOURCE reads? then it keeps its slots over the ponyfill
// the swap lands and nothing above folds it. A STORE keeps that same value until a PLAIN
// consumer reads through it; an optional reader or a null test observes the probe itself.
export function probeRunIsTheSourceValue(path, { resolvePure }) {
  // off the claim's OWN member: a bare root claim navigates nothing, so no run of its own stands
  // over it - the walk below would answer for a nav the claim is only the base of
  if (!isMemberAccessNode(path.node) || !unbackedTailRidesAbove(path, resolvePure)) return false;
  const store = storedUserAssignmentOf(path);
  if (!store) return true;
  return !storedValueConsumedAbove(path);
}

// ... and the same question asked from the CARRIER the base stands in: a store or a sequence INSIDE
// the deleted navigation is a consumer the plain walk stops at (the value has another reader), while
// the fold below still lands the base its carrier-less twin lands - a carrier decides what RUNS,
// never what the delete lands on. one home for both emitters' root-driven folds
export function deleteHostAboveCarriedChain(path) {
  // only for the BASE of a run: a claim standing INSIDE a stored navigation is the store's own act
  // (its value keeps whatever short-circuit it spells), and stepping out of the carrier there would
  // hand the delete's fold the guards the source wrote inside the store
  if (isMemberAccessNode(unwrapRuntimeExpr(path?.node))) return false;
  let anchor = path;
  for (let up = anchor.parentPath; up?.node; up = anchor.parentPath) {
    // a wrapper the carrier HOLDS lies inside the stored value, not around it: the paren in
    // `(w = (globalThis))` asserts nothing, and reading it as a consumer answered the delete
    // question differently for two spellings of one source
    const insideCarrier = unwrapRuntimeExpr(up.node) === unwrapRuntimeExpr(anchor.node)
      && !!up.parentPath?.node && chainValueCarrier(up.parentPath.node, up.node);
    if (!insideCarrier && !chainValueCarrier(up.node, anchor.node)) break;
    anchor = up;
  }
  return deleteHostAboveChain(anchor, anchor.node, unwrapRuntimeExpr);
}

// ... and the other half of the same question: does the root's substitution REACH the hops above it?
// an SE-bearing sequence standing in the run is re-emitted by no root claim - that claim spells its
// own identifier INSIDE the prefix while the hops above keep their raw realm read, so the fold a
// caller stands down for never happens (`(c++, globalThis).window?.self.X` kept a native `self`
// read). only a channel that re-emits the prefix ITSELF owns such a run; a caller deferring to the
// root render asks this first
export function realmRunSplitBySequencePrefix(navNode, ctx = null) {
  for (let cur = unwrapRuntimeExpr(navNode);
    cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(cur.object)) {
    if (sequencePrefixWithSideEffects(unwrapRuntimeExpr(cur.object), ctx)) return true;
  }
  return false;
}

// can THIS BUILD spell the realm ROOT of a run - the base every fold lands on? a root with no entry
// here (one the configuration excluded, one a target needs none of) leaves the fold nothing to land,
// and the run rides the deepest span pure CAN back instead. asked by the marking gate and by the
// channels whose render is root-anchored, so all of them read one answer
export function realmRootIsSpellable(navNode, resolvePure) {
  const { root } = descendToChainRoot(navNode, true);
  // through the CARRIER standing at the root: what a sequence hands on is the root the plain twin
  // has, and reading the carrier itself as the root answered "nothing to spell here" - the run then
  // stood down and left a raw realm read where the deepest backed span was waiting for it
  const core = unwrapRuntimeExpr(peelReceiverSequenceTail(root));
  const name = core?.type === 'Identifier' ? asProxyGlobalName(core.name) : null;
  return !name || !!resolvePure({ kind: 'global', name });
}

// ... and the RUN of them standing above a SUBSTITUTED proxy binding: each names the realm the
// ponyfill already is, and off-browser the ponyfill cannot answer it, so the whole run folds onto the
// binding - the verdict the nav plan reaches by truncating its hops, spelled for the emitters' own
// tail walks. path-shaped and dialect-neutral like the delete-host walk above: this answers WHERE the
// fold lands and WHAT it lands, and each binding performs the replacement itself.
// the base is tracked as a NODE, not by the path's own slot - a path whose span was just replaced
// still answers with the source node - and every layer between hands the same value up: a chain of
// wrappers and a sequence whose tail the base is, both peeled on either side of the comparison,
// because the base may arrive WRAPPED in the harvest a swap re-emitted (`(call(), _self)`).
// a sequence wrapper observing nothing else goes WITH the fold rather than surviving around the
// value (`(0, _self).window` is `_self`, the identifier twin's bytes)
// a DELETEd navigation takes the same walk with a wider hop test: the operator reads no value over
// the run, so every PRISTINE realm hop between the base and the deleted slot drops onto it - whether
// or not pure can spell that hop - and the deleted member itself, a slot rather than a read, ends the
// run. that is the verdict a hop claim's own fold reaches (`delete globalThis.self.window` is
// `delete _globalThis.window` on both emitters); the flavor spells it for the ROOT claim, which a
// build without the hop's entry leaves as the only driver
export function unbackedRealmHopFoldAbove(basePath, baseNode, ctx, { deleted = false } = {}) {
  // what the level below hands on: the base itself, and then every hop the walk has already taken -
  // the fold erases them, so the hop above reads the base through them
  let carried = peelReceiverSequenceTail(baseNode);
  function handsOnBase(node) {
    return peelReceiverSequenceTail(node) === carried;
  }
  let fold = null;
  let landing = null;
  let cursor = basePath;
  for (let up = cursor?.parentPath; up?.node; up = cursor.parentPath) {
    const { node } = up;
    if ((SKIPPABLE_WRAPPER_TYPES.has(node.type) && handsOnBase(node.expression))
      || (node.type === 'SequenceExpression' && handsOnBase(node.expressions.at(-1)))
      // a value CARRIER holding the base ITSELF hands it on exactly as a paren does (`delete
      // (w = globalThis).self.k`): what the run reads is what the carrier stored, and the write
      // re-emits ahead of the base with the rest of the dropped span
      || (deleted && !fold && chainValueCarrier(node, cursor.node))) {
      // a carrier is not peeled by the value walk the way a paren is, so what the level above reads
      // is the CARRIER's own node - the comparison follows it up, while what LANDS stays the value
      // the carrier stored: the carrier itself rides out as an effect of the dropped span
      if (!SKIPPABLE_WRAPPER_TYPES.has(node.type) && node.type !== 'SequenceExpression') {
        // what lands is the BASE this swap put in, not the carrier's stored spelling: the carrier
        // rides out whole as an effect, and landing its value re-ran whatever that value did
        // (`delete (w = (e++, globalThis)).self.k` ran `e++` twice)
        landing ??= carried;
        carried = node;
      }
      cursor = up;
      continue;
    }
    if (!handsOnBase(node.object)) break;
    // WHAT READS this hop, and the node that read sees - one answer per hop, for all three questions
    // below. read off a fixed parent step it is whatever wrapper the source wrote there, and every
    // one of them then answers "nothing reads this hop": the deleted slot folds away with the run,
    // a literal-keyed hop keeps a slot its dotted twin drops, and a live `?.` loses its refusal
    const [readerInner, readerPath] = stepOverChainWrappers(node, up.parentPath);
    const readerAbove = readerPath?.node;
    const readsThisHop = !!readerAbove && isMemberAccessNode(readerAbove)
      && unwrapRuntimeExpr(readerAbove.object) === unwrapRuntimeExpr(readerInner);
    if (deleted) {
      if (readerAbove?.type === 'UnaryExpression' && readerAbove.operator === 'delete') break;
      // a LOWERED guard scaffold's null test READS the run it guards: the source's `?.` survived
      // the lowering as that test, so dropping the hop answers the probe instead of running it
      if (runStandsInLoweredGuardTest(up, unwrapRuntimeExpr)) return null;
      // a realm hop the run cannot drop - a live `?.` whose short-circuit decides whether the delete
      // happens, a computed key whose effects would go with it, a MUTATED slot holding the user's own
      // object - deopts the run WHOLE: the hops below it drop only together with the read above them,
      // and dropping the base out from under a kept hop rewrites what that hop reads off
      if (node.computed || node.optional
        || !isPristineProxyGlobal(ctx.adapter, staticMemberKeyName(node))) {
        return memberProxyHopName(node) || node.computed || node.optional ? null : fold;
      }
    } else if (!foldableRealmHop(node, { ...ctx, path: up })) {
      // a MUTATED slot holds the user's own object, and the read flavor owes the same verdict the
      // delete flavor gives it: the run deopts WHOLE. the hops BELOW such a hop fold only together
      // with the read above them, so folding them out leaves the kept hop reading off a base the
      // source never wrote. every OTHER reason a hop does not fold is positional - a backed hop
      // ends the run without undoing what is already folded
      if (memberProxyHopName(node)
        && !isPristineProxyGlobal(ctx.adapter, staticMemberKeyName(node))) return null;
      break;
    }
    // a hop whose VALUE a live `?.` above TESTS folds nowhere: that test is the branch the SOURCE
    // wrote, and folding the hop out of it answers the branch with the always-defined ponyfill below
    // (`dh().self.window?.name` reads `_self.window?.name`, not `_self?.name`). the delete flavor
    // already refuses a `?.` of the hop's own; the read owes the same verdict one member up, where
    // the short-circuit actually stands
    if (readsThisHop && readerAbove.optional) return fold;
    // what lands is the object's CORE: the wrapper layers the fold's own operand carried are the
    // erased read's, not the value's (`((eff(), g.self) as any).window` lands `(eff(), _self)` -
    // the other leg's plan rebuilds the value the same way), while the sequence stays, because its
    // prefix is what the run DID
    const objectCore = unwrapRuntimeExpr(node.object);
    const deadSeqWrapper = objectCore?.type === 'SequenceExpression'
      && objectCore.expressions.slice(0, -1).every(expr => !mayHaveSideEffects(expr));
    // the OUTERMOST folding hop is the one slot that lands, and what it lands is what the FIRST
    // fold reached: everything between is erased with the run, so a per-hop replacement would
    // only rewrite nodes the next one drops
    // ... and whether what lands still CARRIES what the dropped span did: the object's own core does
    // (a live sequence prefix rides inside it), while a carrier's stored value does not - only that
    // second case owes the caller a harvest, and harvesting the first re-ran the prefix twice
    fold ??= {
      node: landing ?? (deadSeqWrapper ? objectCore.expressions.at(-1) : objectCore),
      carriesOwnEffects: !landing,
    };
    fold.path = up;
    carried = node;
    cursor = up;
  }
  return fold;
}

// is this proxy-hop key one the pure package cannot back at all (`window` - there is no `_window`)?
// the question is about the ENTRY EXISTING, never about the target asking for it: a hop the target
// already has natively (`self` on a modern browserslist) is still a name pure can spell, and reading
// it as "unresolvable" turns an erasable navigation into an environment probe - the two emitters
// then answer the same source differently, which is what the target-only spelling produced. the
// per-target resolver still leads, so a hop it answers needs no definitions lookup.
// the canon's near names decide a HOST SHAPE, not entry existence, so none of them subsumes this:
// `classifyVariableDeclarationHost` classifies a destructure host, `respellKeptHop`
// re-spells a kept hop onto a binding. `navHasUnresolvableProxyHop` stays the owner of the question - this is
// its arm, lifted so `proxyReceiverValueCanBeUndefined` asks it in the same spelling
export function proxyHopLacksPureEntry(hop, resolvePure) {
  return !!hop && POSSIBLE_GLOBAL_OBJECTS.has(hop)
    && !resolvePure({ kind: 'global', name: hop })
    && !resolveBuiltInMeta({ kind: 'global', name: hop });
}

// true when ANY hop of a proxy-nav is a proxy-global name WITHOUT a pure entry (`globalThis.window` -
// no `_window`): the natural visitor leaves it raw off the pure root (`_globalThis.window`, undefined
// off-engine). both emitters' hop-collapse drives gate WRITE targets on this: a nav whose every hop
// resolves stays with the natural per-hop rewrite (`(a = globalThis).self.Set = v` -> `(a = _globalThis,
// _self).Set = v`), and claiming it here would conflict with that already-queued rewrite.
// the hop-name canon folds a SE-bearing computed hop key (`globalThis[(e++, 'window')]`) so it is
// detected, and a const-bound one (`const k = 'window'; globalThis[k]`) wherever the caller hands
// over a scope context - the collapse this gates reads that second name either way
export function navHasUnresolvableProxyHop(navNode, resolvePure, aliasCtx = null) {
  let cur = peelReceiverSequenceTail(navNode);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const hop = realmHopKeyName(cur, aliasCtx, { allowSideEffectKeys: true });
    if (proxyHopLacksPureEntry(hop, resolvePure)) return true;
    cur = peelReceiverSequenceTail(cur.object);
  }
  return false;
}

// Classify the value a kept write hands on, independently of where the write lands.
// A source root and an already substituted binding name the same stored value; only the
// binding can supply the latter fact. A raw probe must survive a collapse, while spellability
// asks whether a retained navigation can ride an extraction. Neither is a realm-root proof.
// Prefix effects and chained writes stay owned by the source node; this query never moves them.
function keptProxyValueFacts(node, resolvePure, isSubstituted = null) {
  const value = peelReceiverSequenceTail(node);
  const identifier = value?.type === 'Identifier';
  const member = isMemberAccessNode(value);
  const key = identifier ? value.name : member ? staticMemberKeyName(value) : null;
  const pure = key && resolvePure({ kind: 'global', name: key });
  return {
    rawRead: !identifier && (!member || proxyHopLacksPureEntry(key, resolvePure)),
    spellable: identifier ? !!pure || POSSIBLE_GLOBAL_OBJECTS.has(value.name) || !!isSubstituted?.(value.name)
      : !member || value.computed || !!pure,
  };
}

// A retained store and the realm tail reading it have one value contract. A backed hop
// supplies the surface through which later unbacked hops can fold; without one a raw
// stored probe must remain the base. In value position a surviving tail reads the write
// itself, never a fresh root. The caller proves the realm run before asking this question.
export function keptProxyTailPlan(write, tail, resolvePure, { navigated = true, backed = false } = {}) {
  const value = peelChainAssignment(write).value ?? write?.right;
  const { rawRead } = keptProxyValueFacts(value, resolvePure);
  return {
    decline: rawRead && !!tail.length && !backed,
    readsOffWrite: !navigated && !!tail.length,
  };
}

// Decide one outward continuation of an admitted proxy collapse. Native cursors report
// the next source carrier and its reader; this planner owns whether it can be consumed
// and where its effects belong. Prefixes outside a write lead the whole render; prefixes
// inside its value stay there. A backed hop resets the retained tail, including after a
// write. The source nodes are retained by identity and nothing in the source is mutated.
export function createOuterCollapsePlanner({ allowOptional = false, resolvePure }) {
  const plan = {
    seqPrefixEffects: [], valueEffects: [], keptTail: [], writeStep: null,
    innerKeptTail: null, outerHopName: null, outerBacked: false,
  };
  function canCrossWrite({ optional = false, deadOptional = false, readerHop = false }) {
    return !plan.writeStep && readerHop && (!optional || allowOptional || deadOptional);
  }
  function step({ kind, node, keyName, optional = false, deadOptional = false, readerHop = false,
    stored = false, prefixes = [], writeTarget = false }) {
    switch (kind) {
      case 'write':
        if (!canCrossWrite({ optional, deadOptional, readerHop })) return false;
        plan.writeStep = node;
        plan.innerKeptTail = plan.keptTail;
        plan.keptTail = [];
        return true;
      case 'chain': return allowOptional;
      case 'wrapper':
        return (!plan.keptTail.length || readerHop) && (!stored || node.type === 'ParenthesizedExpression');
      case 'sequence':
        if (readerHop) plan.seqPrefixEffects.unshift(...prefixes);
        else if (!plan.writeStep && stored) plan.valueEffects.push(...prefixes);
        else return false;
        return true;
      case 'member':
        if (writeTarget || !keyName
          || (node.optional && !allowOptional && plan.keptTail.length && !deadOptional)) return false;
        if (!resolvePure({ kind: 'global', name: keyName })) {
          plan.keptTail.push({ name: keyName, node, liveOptional: false });
        } else {
          plan.keptTail = [];
          if (plan.writeStep) {
            plan.outerHopName = keyName;
            plan.outerBacked = true;
          }
        }
        return true;
      default: return false;
    }
  }
  return { plan, step, canCrossWrite };
}

// An unbacked hop above a kept store may not replace the raw value that store observed.
// Hops inside the write belong to its own value plan; a bare root or backed terminal value
// lets the outer run fold. The caller has already proved the run's realm identity.
export function runSwallowsStoreProbe(runNode, resolvePure) {
  for (let hop = runNode; isMemberAccessNode(hop);) {
    const inner = unwrapRuntimeExpr(hop.object);
    if (inner?.type === 'AssignmentExpression') {
      const tail = unbackedProxyHopKey(hop, resolvePure) ? [hop] : [];
      return keptProxyTailPlan(inner, tail, resolvePure).decline;
    }
    hop = inner;
  }
  return false;
}

// A spellable retained write stays beside the value re-read from it. Other effects can lift
// independently. The navigation/selection gate is a shape proof on an already admitted receiver;
// substituted bindings are supplied explicitly, never inferred from a generated name's spelling.
export function keptWriteRidesValue(node, { adapter, injectorState, resolvePure, isSubstituted = null }) {
  const write = peelTransparentExpr(node);
  return write?.type === 'AssignmentExpression' && write.left?.type === 'Identifier'
    && keptProxyValueFacts(write.right, resolvePure, isSubstituted).spellable
    && (isPureNavReceiver(write.right) || allProxySelectingInit(write.right, { adapter, injectorState }));
}

// the chain-assign a navigation stands on when the value it stores navigates a hop pure cannot
// back (`(n = globalThis.window).self.X`): that store holds the environment probe, not the realm,
// so the run keeps the write as its base and only the hops above it drop - for a member the source
// reads and for one it writes alike. landing a write on the ponyfill instead performs it on the
// realm exactly where the source throws. null for any other base: a store of the realm itself
// (`(a = globalThis).self.Set = v`) rides the run's own landing
export function keptProbeStore(navNode, resolvePure, aliasCtx = null) {
  const { outer, value } = peelChainAssignment(descendToChainRoot(navNode).root);
  return outer && navHasUnresolvableProxyHop(value, resolvePure, aliasCtx) ? outer : null;
}

// the kept store of the environment probe a hop claim's member chain WRITES through (`(w =
// f().window).self.k = v`), else null: the write reaches what the store holds, so a claim the
// run-landing channels leave to the plain swap lands on that store, the hops above it dropping - the
// swap's ponyfill base performs the write on the realm exactly where the source throws. a `delete`
// names its slot by its own rule, and a read keeps the swap - the accepted price of a collapsed
// `window` read
export function writtenRunKeptProbeStore(path, { resolvePure, aliasCtx = null, unwrap = node => node }) {
  const end = memberChainEndPath({ path, unwrap });
  return isMemberWriteHost(end) && !deleteHostAboveChain(end, end.node, unwrap)
    ? keptProbeStore(path.node, resolvePure, aliasCtx) : null;
}

// the maximal proxy-global prefix WHEN it spans at least one intermediate proxy hop
// (`globalThis.self` in `globalThis.self.Array`), else null. a bare root is an Identifier; an
// absorbed hop makes the prefix a member expression. distinguishes a chain whose collapse
// actually changes the output (root + hops) from a bare root (`globalThis.Array`) that the
// standard root substitution / natural global rewrite already handles. callers that only need
// to drop the "extra" hops gate on this and leave the bare-root case alone
export function maximalProxyGlobalHop(node, aliasCtx = null, { allowSideEffectKeys = false, throughChainAssign = false } = {}) {
  const prefix = maximalProxyGlobalPrefix(node, aliasCtx, { allowSideEffectKeys, throughChainAssign });
  return prefix && prefix.type !== 'Identifier' ? prefix : null;
}

// the underlying CallExpression at a chain root (`f().X`, `(() => globalThis)().Array`), null otherwise -
// callers probe `inlineCallHasObservableEffects` for SE-preservation. `throughChainAssign` additionally
// sees the call under `(a = IIFE()).Symbol` (the subsumption gate needs it); the SE-harvest callers must
// NOT pass it - the preserved assignment already re-emits the call, so harvesting it too would double-run it
export function findChainRootCallExpression(node, throughChainAssign = false) {
  const { root } = descendToChainRoot(node, throughChainAssign);
  return isCallShape(root) ? root : null;
}

// SE-bearing call at the root of a chain (`(() => { c++; return X; })()`, direct or under member
// hops): a fold / flatten that DISCARDS the chain would silently drop the call's observable setup.
// answers the node the SOURCE wrote where the root owes an effect at all - a call that carries one,
// a tagged template, an `await` whose tick is the effect, a `new` that runs its constructor - and
// null otherwise; callers either harvest it for re-emission or bail the discard entirely
export function seBearingChainRootCall({ node, scope, adapter, path }) {
  // a TAGGED TEMPLATE invokes its tag with the quasi's expressions - a call in every way that
  // matters to a discard, and one no callee resolution reaches through, so it never erases
  const { root } = descendToChainRoot(node);
  if (root?.type === 'TaggedTemplateExpression') return root;
  // an `await` is an effect in ITSELF - the tick it costs is observable whatever it awaits - so it
  // is always rescued; a `new` runs its constructor and is rescued on the same terms as a call.
  // both are rescued as the node the SOURCE wrote: the call view the realm proof reads them through
  // is the proof's alone and never reaches an emission
  if (root?.type === 'AwaitExpression') return root;
  const rootCall = findChainRootCallExpression(node) ?? (root?.type === 'NewExpression' ? root : null);
  if (!rootCall) return null;
  // an UNRESOLVABLE callee is UNKNOWN, not pure - erasing the call would drop whatever it does.
  // `inlineCallHasObservableEffects` answers the opposite question (may I INLINE this call), where
  // a callee it cannot reach simply means there is nothing to inline, so it answers "no effects"
  const callee = resolveInlineCalleeFunction(
    { node: rootCall, seen: new Set(), ctx: { scope, adapter, path } }, { allowIdentityParam: true },
  );
  if (!callee) return rootCall;
  return inlineCallHasObservableEffects({ callNode: rootCall, scope, adapter, path }) ? rootCall : null;
}

// observable nodes a DISCARD would silently drop, in source-eval order: chain-assignments
// (direct or buried under member hops - rescued WHOLE, the structural walk pushes them without
// descending), an SE-bearing chain-root call (interleaved at its true position via the rescue
// channel), and every effect buried in a computed member KEY the discard folds away
// (`globalThis[(c++, 'self')]` - a chain-assignment/root-call-only probe dropped the key effect).
// the root call evaluates at its true source position - BEFORE any hop-key effect above it
// (`mk()[(eff(), 'self')].Array` runs mk THEN eff) - so it interleaves via the rescue channel,
// never appends last. the destructure flatten consults this for the init it is about to discard,
// and the fallback-logical synth-collapse (`{from} = LEFT || Set`) for the resolved LEFT it folds
// away; callers re-emit the returned nodes ahead of the extraction / polyfill literal or keep the
// init verbatim. NOT for the `in` fold, whose planner rescues a DIRECT assignment RHS itself -
// routing it through here would double-rescue. a value the build decides owes what the part of it that
// runs owes (`decidedRunningPart`)
export function discardRescueNodes({ node: value, scope, adapter, path }) {
  const node = decidedRunningPart(value, { scope, adapter, path });
  const rootCall = seBearingChainRootCall({ node, scope, adapter, path });
  return collectFoldedReceiverSideEffects(node, { rescue: rootCall ? new Set([rootCall]) : null, ctx: { scope, adapter, path } });
}

// `resolveKey` can fold StringLiteral / TemplateLiteral / `+` concat to the string
// `'Symbol.X'`, but none of those are the well-known symbol. this predicate rejects
// string-sourced keys so `'Symbol.iterator' in Array` isn't miscategorised as an
// is-iterable check. parallel to resolveKey's Identifier / MemberExpression branches and its
// decided-selection step, minus the string-folding cases
export function isSymbolSourcedKey({ node, scope, adapter, seen, path, depth = 0 }) {
  let usageNode = null;
  while (true) {
    if (depth > MAX_KEY_DEPTH) return false;
    node = unwrapTransparentSeq(node);
    const operand = decidedKeyOperand(node, { scope, adapter, path, seen, depth });
    if (operand) {
      node = operand;
      depth += 1;
      continue;
    }
    const { type } = node;
    // string-folded sources - plain strings, not the symbol
    if (adapter.isStringLiteral(node) || type === 'TemplateLiteral'
      || (type === 'BinaryExpression' && node.operator === '+')) return false;
    // Symbol[.X] direct / via chained proxy-global - canonical symbol-ref shape.
    // also confirm the property is a symbol-name shape: `symbolKeyToEntry` maps ANY lowercase-first
    // name to a synthetic `symbol/<name>` entry, so it does not itself filter to well-known symbols
    // (`Symbol.someUserKey` passes here too). the real well-known gate is downstream `isEntryNeeded`
    // / `isEntryAvailable`, which turns a non-well-known name into a noop plan (no dead import), so a
    // random `Symbol.foo` never triggers symbol-routed dispatch.
    // for `Symbol[key]` with statically-resolvable computed key - resolve via `resolveKey`
    // and validate the resulting name. when the key isn't statically resolvable (dynamic
    // expression), return true conservatively: we know the shape is Symbol-indexed, even
    // if the specific well-known name is unknown - downstream callers rely on this to
    // avoid over-eliminating polyfill dispatch, and `resolveKey` pairing in the caller
    // filters on the string form anyway
    if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
      if (!asSymbolRef({ node: node.object, scope, adapter, seen: new Set(seen), path })) return false;
      if (!node.computed && node.property?.type === 'Identifier') {
        return symbolKeyToEntry(`Symbol.${ node.property.name }`) !== null;
      }
      if (node.computed) {
        const name = resolveKey({
          node: node.property, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1,
        });
        if (name !== null) return symbolKeyToEntry(`Symbol.${ name }`) !== null;
      }
      return true;
    }
    if (type !== 'Identifier') return false;
    // the alias hop the fold takes, so the provenance is of the value the fold named
    const hop = followKeyIdentifier({ node, seen, scope, adapter, path, usageNode });
    if (!hop || hop.refused) return false;
    if (hop.symbolKey) return true;
    ({ node, seen, scope } = hop);
    usageNode = node;
    depth += 1;
  }
}

// folded `Symbol.X` string whose SOURCE is a real well-known-symbol reference, not a string
// spelling. sequence-tail peel so an SE-prefixed key (`[(eff(), Symbol.iterator)]`) classifies
// by its tail. the `in`-producers deliberately do NOT route through this: there the check GATES
// meta production with its own nested-dot rule, and a peel would fold an SE-carrying LHS whose
// effects that branch has no channel to preserve (the string-branch keeps them in place)
export function symbolSourcedFoldedKey({ key, keyNode, scope, adapter, path }) {
  return typeof key === 'string' && key.startsWith('Symbol.')
    && isSymbolSourcedKey({ node: peelReceiverSequenceTail(keyNode), scope, adapter, path });
}

// is `node` a member chain rooted at an ALIAS of a proxy-global (NOT a proxy-global NAME) carrying a REAL
// proxy hop (`g.self.X` where `const g = globalThis`)? such a chain with a non-polyfilled leaf gets no leaf
// usage and no `kind:'global'` trigger on the alias root, so the babel emitter drives its hop
// collapse off this predicate (the unplugin's own visitor reaches such hops through its
// suppressed-hop callback). the hop key resolves binding-aware - a computed `g[k]` (`const k =
// 'self'`) or string-literal `g['self']` is caught like the dotted `g.self`; a side-effecting
// computed key bails (uncollapsible). a
// proxy-NAME root (`globalThis.self.X`) is EXCLUDED (it collapses via its own `kind:'global'` trigger, so
// this never double-fires) - UNLESS the chain passes THROUGH a kept store: there the name's own trigger
// renders the STORE, never the hops above it (`(v = globalThis.window?.self)?.window.X` guards the store
// and leaves the tail unasked), so the double-fire the exclusion prevents cannot happen and the drive is
// this chain's only route - whichever spelling roots the probe. the cheap dotted check screens before
// any binding resolve. the caller peels to the root path and runs its per-emitter
// `collapseProxyHopRoot` (which self-gates on the hop, the root's shadowing and the store again)
export function isAliasProxyHopChain(node, aliasCtx) {
  if (!aliasCtx) return false;
  // peel the file's chain-walk canon at the entry AND at every hop (transparent wrappers +
  // SE-tails via the sequence peel, plus chain-assignments) - oxc preserves the wrapper nodes
  // babel strips, and an unpeeled walk left `(g).self.Array` stranded on one emitter only
  let cur = peelChainRootValue(node);
  if (cur?.type !== 'MemberExpression' && cur?.type !== 'OptionalMemberExpression') return false;
  let hasProxyHopKey = false;
  let throughStore = false;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const { computed, property: key } = cur;
    const hopName = computed
      ? resolveKey({ node: key, computed: true, bailOnSideEffectKey: true, ...aliasCtx })
      : key?.type === 'Identifier' && key.name;
    if (hopName && POSSIBLE_GLOBAL_OBJECTS.has(hopName)) hasProxyHopKey = true;
    if (peelChainAssignment(peelReceiverSequenceTail(cur.object)).outer) throughStore = true;
    cur = peelChainRootValue(cur.object);
  }
  if (!hasProxyHopKey || cur?.type !== 'Identifier') return false;
  return isAliasProxyRoot(cur, aliasCtx)
    || (throughStore && POSSIBLE_GLOBAL_OBJECTS.has(cur.name)
      && !aliasCtx.adapter?.hasBinding?.({ scope: aliasCtx.scope, name: cur.name, path: aliasCtx.path }));
}

// transparent value-position wrappers between a proxy-global receiver and its binding context. the
// emit-side proxy-hop collapse climbs these to distinguish a destructure SOURCE (`{from} = (se, chain)
// || Set` / `{from,of} = (chain as any)` - owned by the destructure path, which feeds the props into a
// synth literal) from a plain default VALUE (`{ x = chain }`, target Identifier - collapsed in place).
// shared by both emitters' collapse gate so the source-vs-value decision is one provider-level
// definition. includes TS expression wrappers so a cast/non-null source is gated explicitly here rather
// than relying on the (timing-dependent) skipped-node marking that protects some shapes but not others
export const PROXY_HOP_VALUE_CARRIERS = new Set([
  'SequenceExpression',
  'LogicalExpression',
  'ConditionalExpression',
  'ParenthesizedExpression',
  'ChainExpression',
  ...TS_EXPR_WRAPPERS,
]);
