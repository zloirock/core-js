// AST-pattern resolvers shared across detect-usage submodules. covers the core walk
// primitives (`unwrapTransparentSeq`, `unwrapParensCollectingEffects`, `isStaticPlacement`),
// binding-to-global resolution (`resolveBindingToGlobal` and friends), and the high-level
// resolvers used by callers (`resolveKey`, `resolveObjectName`, `patternBindingName`,
// `findProxyGlobal`, `createSelfRefVarGuard`). also hosts Symbol-ref helpers
// (`resolvesToGlobalSymbol`, `asSymbolRef`) consumed by the members submodule, and the
// proxy-global recogniser (`proxyGlobalRootName` and its member twin) - asking which realm
// name a binding stands for is asking this module what the binding holds and keeping the
// realm names off the answer, so the narrow lives with the canon instead of forking it
import { entryToGlobalHint, resolve as resolveBuiltInMeta } from '../index.js';
import {
  aliasDeclScope,
  aliasReadGuardedAgainstNullish,
  asProxyGlobalName,
  assignmentAliasHintSoundAtRead,
  bindingDeclaratorNode,
  bindingPolyfillHint,
  bindsModuleDefault,
  chainValueCarrier,
  collectFoldedReceiverSideEffects,
  definedBranchOfGuardConditional,
  deleteHostAboveChain,
  globalProxyNameFromImportSource,
  identifierDeclaratorInit,
  identifierReferencedInSubtree,
  IMPORT_SPECIFIER_TYPES,
  importBindingIsTypeOnly,
  importedGlobalProxyName,
  importSourceMatchesUserPackage,
  inCallerCorrectFallbackSlot,
  isAliasProxyRoot,
  isDestructurePattern,
  isDirectiveStatement,
  isMemberAccessNode,
  isMutatedGlobalSlot,
  isNullLiteralNode,
  isPristineProxyGlobal,
  isReassignedBeyondDeclarator,
  isRenderedStoredValue,
  isTopLevelThisContext,
  isTransparentWrapper,
  isUndefinedNode,
  isValidIdentifierName,
  isVarDeclaratorInLoopRerun,
  kebabToCamel,
  mayHaveSideEffects,
  memberKeyName,
  memberProxyHopName,
  nodeCarriesSourceSpan,
  paramReboundInBody,
  MUTATED_MEMBERS_UNKNOWN,
  patternRootKeyPathsFor,
  patternSlotHasDefault,
  patternSlotSpreadShifted,
  patternSlotValues,
  peelChainAssignment,
  peelChainAssignmentDeep,
  peelMemoizeWrappers,
  peelProxyGlobalObject,
  peelSequenceTail,
  peelZeroArgIifeReturn,
  plainSynthKeyName,
  POSSIBLE_GLOBAL_OBJECTS,
  pureCtorNameFromImportSource,
  pureImportEntryOf,
  reachingReassignmentValueNode,
  reassignBailApplies,
  reassignmentBlocksGlobalResolve,
  reassignmentValueNodes,
  sequencePrefixWithSideEffects,
  singleQuasiString,
  singleReturnBodyExpression,
  SKIPPABLE_WRAPPER_TYPES,
  spreadAtOrBefore,
  staticMemberKeyName,
  synthSwapPropKey,
  trustedIdentifierAliasWrite,
  TS_EXPR_WRAPPERS,
  tsImportEqualsProxyName,
  tsImportEqualsRequireSource,
  unwrapParens,
  unwrapRuntimeExpr,
  unwrapTransparentSeq,
  varInitDominatesUsage,
  zeroArgIifeSideEffectFree,
} from '../helpers/ast-patterns.js';
import { nodeRangeContains } from '../resolve-node-type/ast-shapes.js';
import { SYMBOL_STATIC_KEYS, symbolKeyToEntry } from './globals.js';

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains.
// exported so cohort recursive walkers (`isSymbolSourcedKey` in members.js) share the bound
const MAX_KEY_DEPTH = 64;

// SequenceExpression collect mode: push side-effect preceding elements into `effects` for
// the caller to re-attach via a SequenceExpression wrap around the polyfill replacement.
// the deliberate counterpart of the plain `unwrapParens` (helpers/ast-patterns.js), which peels
// parens only: merging the two would hand peeled effects to callers with nowhere to re-attach them
export function unwrapParensCollectingEffects(node, effects) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      for (const e of node.expressions.slice(0, -1)) if (mayHaveSideEffects(e)) effects.push(e);
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

// the sequence prefixes the hop OBJECTS of a sealed nav carry, in source-eval order. the guard
// render unwraps them transparently, so the probe re-spells them ahead of itself - but only the
// ones the render does not already re-emit from source, which is why the caller hands its own
// rendered spans in. both emitters walk the same hops; the render shape is all that differs.
// one level per hop object: a NESTED level is the plan renders' own business - their sequence
// descent replays every level, and no caller reaches this walk with one still buried
export function navHopSequencePrefixes(inner, { unwrap, renderedSpans = null }) {
  const all = [];
  for (let cur = unwrap(inner); cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrap(peelReceiverSequenceTail(cur.object))) {
    const obj = unwrap(cur.object);
    if (obj?.type === 'SequenceExpression') all.push(...sequencePrefixWithSideEffects(obj) ?? []);
  }
  // `all` is what the probe REPORTS (every prefix now runs through one of the two channels, so no
  // other one may repeat it); `spell` is what it spells itself, the render carrying the rest
  return {
    all,
    spell: renderedSpans?.length
      ? all.filter(expr => renderedSpans.every(span => !nodeRangeContains(span, expr))) : all,
  };
}

// classify how an instance-call rewrite must handle a SequenceExpression receiver:
//   `'peel'`     - non-optional case: peel receiver to SE tail so memoize captures only
//                  the unwrapped value; sideEffects (prepend) supplies preceding-effects
//   `'suppress'` - optional case: leave SE intact, the optional-guard memoize already
//                  captures it (`null == (_ref = (fn(), arr)) ? void 0 : ...`); suppress
//                  prepend to avoid double-emit on non-nullish branch
//   `null`       - no SE receiver / no sideEffects to prepend - no special handling
// detects SE through transparent wrappers (Paren / Chain / TS) so oxc + babel parser
// shapes work uniformly. shared between babel-compat and unplugin instance dispatch
export function classifyReceiverSE(receiver, isOptional, sideEffects) {
  if (!sideEffects?.length || !receiver) return null;
  let cur = receiver;
  while (cur && isTransparentWrapper(cur)) cur = cur.expression;
  if (cur?.type !== 'SequenceExpression') return null;
  return isOptional ? 'suppress' : 'peel';
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
// are captured separately upstream by `unwrapParensCollectingEffects` in `buildMemberMeta`
export function collectChainAssignsThroughMemberChain(receiverNode) {
  const collected = [];
  let cur = peelReceiverSequenceTail(receiverNode);
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
    cur = peelReceiverSequenceTail(cur.object);
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
      : root.property?.name ?? null;
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
    // a chain-assign bottom holding an UNDEFINABLE nav is where the source lives (`(w = globalThis
    // .window)?.self` - the probe is the stored value): keep walking into it, and remember the write,
    // which is what the test has to spell so the store still happens. a write storing a DEFINED value
    // (`(held = (k(9), globalThis))?.window`) contributes no source and keeps the walk's old bottom
    const stored = peelChainAssignment(root);
    if (stored.outer && navHasUnresolvableProxyHop(stored.value, resolvePure)) {
      crossedAssign ??= { node: stored.outer, hopsAbove: hopsInfo.length };
      root = peelReceiverSequenceTail(unwrapRuntimeExpr(stored.value));
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
// canon re-emits it as the NEXT member's key (`X?.[(c++, 'self')].Array` -> `X?.[c++, 'Array']`),
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

// the `delete` fold's one exception, spelled once for every channel that folds a deleted
// navigation: on a CALL-rooted run a LIVE `?.` decides whether the delete HAPPENS - it stays
// on every emitter, the deleted member outside the ternary behind a `?.` of its own. LIVE
// means the value under the `?.` can actually SHORT-CIRCUIT (the value canon's question): a
// plain read off an absent-able base THROWS instead - dead-by-throw, folds with the run - and
// a below-value proven defined folds too. a run rooted in a NAME - bare, or handed on by a carrier
// standing there - folds whole regardless (its own root claim drives the fold; the split is between
// a call root and a name root, never between a name and the carrier around it),
// and a seal over the below-value stays with the seal canon
export function deleteGuardKeepingHop(node, resolvePure, aliasCtx) {
  let root = unwrapRuntimeExpr(peelReceiverSequenceTail(node));
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    root = unwrapRuntimeExpr(peelReceiverSequenceTail(root.object));
  }
  if (root?.type !== 'CallExpression' && root?.type !== 'OptionalCallExpression') return null;
  // nullish-WITHOUT-throw, composed: the below-value short-circuits, or its LEAF is an
  // unbacked probe read over a proven-defined base (reached, and absent exactly off-env) -
  // a plain read off an absent-able base THROWS instead and its `?.` is dead-by-throw
  function belowCanBeNullish(below) {
    if (navValueCanShortCircuit(below, resolvePure, aliasCtx)) return true;
    if (below?.type !== 'MemberExpression' && below?.type !== 'OptionalMemberExpression') return false;
    const leaf = memberProxyHopName(below);
    if (!leaf || resolvePure({ kind: 'global', name: leaf })) return false;
    return !proxyReceiverValueCanBeUndefined(unwrapRuntimeExpr(peelReceiverSequenceTail(below.object)),
      resolvePure, aliasCtx);
  }
  for (let cur = unwrapRuntimeExpr(node);
    cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object))) {
    if (cur.optional
      && !chainSealsAShortCircuit(cur.object, resolvePure, aliasCtx)
      && belowCanBeNullish(unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object)))) return cur;
  }
  return null;
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
  if (aliasCtx?.path && deleteHostAboveChain(aliasCtx.path, memberNode, unwrapRuntimeExpr)
    && !deleteGuardKeepingHop(memberNode, resolvePure, aliasCtx)) return { kind: 'erase' };
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
        // a CHAIN-ASSIGN object keeps its own locked rule: the captured value's undefinedness
        // is hop-based (`(v = globalThis.self.window)?.x` guards - the write observes the raw
        // read), matching the deopt gate's chain-assign arm. a CALL object answers the call
        // canon's yield question (the nav canon owns only nav/Identifier cores) - a
        // conditionally-proven callee's yield is absent-able even though the alias walk keeps
        // its stricter proof for the deopt renders
        if (!(source && (!ownKey || source.optional)
          && (sealedSource ? undefinableProxyRootValue(value, resolvePure, aliasCtx)
            : objAssign ? navHasUnresolvableProxyHop(value, resolvePure)
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
        const guardObj = objAssign ? obj
          : crossedAssign && hopsInfo.findIndex(hop => hop.node === source) >= crossedAssign.hopsAbove
            ? crossedAssign.node : source;
        if (!prior || depth < prior.depth) provenSources.set(key, { obj: guardObj, depth });
        continue;
      }
    }
    if (!ownKey && undefinableProxyRootValue(value, resolvePure, aliasCtx)) undefinable.push(obj);
  }
  // a guard for any DEEPER source spells the whole prefix - the root call's own `?.()` link
  // included - so the call's undefinedness rides that same test: the opaque call key stands as
  // a source only while nothing deeper guards the chain
  if (provenSources.size > 1) provenSources.delete('<call>');
  for (const entry of provenSources.values()) undefinable.push(entry.obj);
  if (undefinable.length === 0) return { kind: 'erase' };
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

// the one question every guard-keep decision asks about a chain root's VALUE: can it
// genuinely be undefined on-target? true for a nav through an unponyfilled proxy hop
// (`globalThis.window`) and for an ALIAS of one (`const w = globalThis.window` - the binding
// hides the same navigation; the POSSIBLE gate keeps non-proxy resolutions - a follow that
// lands on a plain local - out of the refusal); false for resolvable navs and other values
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

// the statically-undefined value shape and the guard-conditional branch picker live in
// `helpers/ast-patterns.js`, below this module's layer; re-exported here so the destructure
// consumers keep their import path
export { definedBranchOfGuardConditional, isUndefinedNode };

export function undefinableProxyRootValue(value, resolvePure, aliasCtx = null) {
  const seen = new Set();
  while (true) {
    if (navHasUnresolvableProxyHop(value, resolvePure)) return true;
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
    if (!aliasCtx || value?.type !== 'Identifier' || seen.has(value.name)) return false;
    const aliasName = proxyGlobalRootName({ node: value, ...aliasCtx });
    if (aliasName && POSSIBLE_GLOBAL_OBJECTS.has(aliasName)
      && !resolvePure({ kind: 'global', name: aliasName })) return true;
    // an alias HOLDING an undefinable nav (`let n; n = globalThis.window?.self.window;
    // n?.X...`) is as undefinable as the nav itself: follow the init or the single write and
    // keep walking. the prefix walks see through the binding to the always-defined global, but
    // the VALUE read at runtime is the nav's - eating the alias guard ran the branch where
    // native short-circuits
    seen.add(value.name);
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
export function aliasHeldClaimProbe(member, resolvePure, aliasCtx) {
  // through the wrapper canon: a paren or TS skin on the read is value-transparent, and a seal
  // over a plain run is not load-bearing - the probe answers both spellings like the bare one
  member = unwrapRuntimeExpr(member);
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
  if (object?.type !== 'Identifier') return null;
  const key = memberKeyName(member);
  if (key === null) return null;
  if (!aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx)) return null;
  // a read the source already guards against the nullish branch (an enclosing null-test or a
  // truthy `if` on the binding) cannot see the void - no probe is owed there, and the plain
  // erase keeps the guarded branch byte-clean
  if (aliasCtx?.path && aliasReadGuardedAgainstNullish(aliasCtx.path, object.name)) return null;
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
  return tail?.type === 'Identifier' && !!adapter?.getBinding?.(scope, tail.name, path)?.polyfillHint;
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
  return tail?.type === 'Identifier' && !!adapter?.getBinding?.(scope, tail.name, path)?.polyfillHint;
}

// the VALUE canon asked THROUGH an Identifier alias: follow the binding to what it holds and
// ask `proxyReceiverValueCanBeUndefined` of THAT. distinct from the hop-based alias walk
// (`undefinableProxyRootValue`): an all-plain held nav stays the declared environment under
// the proxy-collapse assumption, so only a held value the VALUE canon calls absent-able
// counts - the wider hop-based answer belongs to the alias's own `?.`, not to its value
function aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx) {
  if (!aliasCtx) return false;
  const seen = new Set();
  let cur = object;
  let ctx = aliasCtx;
  while (cur?.type === 'Identifier' && !seen.has(cur.name)) {
    seen.add(cur.name);
    const step = aliasHeldValueStep(cur, ctx);
    if (!step) return false;
    ({ value: cur, aliasCtx: ctx } = step);
  }
  return cur !== object && cur?.type !== 'Identifier'
    && proxyReceiverValueCanBeUndefined(cur, resolvePure, ctx);
}

// one alias-follow step shared by the undefinability walks: the declarator init or the
// binding's single `=` write, transparently unwrapped, plus the scope the held value's own
// identifiers resolve in (same per-hop advance as the key/global alias walks). null for an
// opaque binding - a param, multiple writes, no init
function aliasHeldValueStep(node, aliasCtx) {
  const binding = aliasCtx.adapter?.getBinding?.(aliasCtx.scope, node.name, aliasCtx.path);
  // pattern-gated: a destructure declarator binds the name to a SLOT, not the init it follows
  let held = binding ? identifierDeclaratorInit(binding) : null;
  if (!held && binding?.constantViolations?.length === 1) {
    const write = unwrapTransparentSeq(binding.constantViolations[0]?.node ?? binding.constantViolations[0]);
    if (write?.type === 'AssignmentExpression' && write.operator === '='
      && write.left?.type === 'Identifier' && write.left.name === node.name) held = write.right;
  }
  if (!held) return null;
  return {
    value: unwrapTransparentSeq(held),
    aliasCtx: binding?.scope && binding.scope !== aliasCtx.scope ? { ...aliasCtx, scope: binding.scope } : aliasCtx,
  };
}

// callers pass either a receiver identifier or a FOLDED property key, and a key folds to any
// string at all - `Symbol.iterator`, `'App-Key'`, `` `A.b` ``. an answer here licenses the name
// to be SPELLED as a member tail (the ctor-key anchor plan), so the capitalisation convention
// must be paired with the identifier-validity canon: without it babel aborts the build on
// `t.identifier`, and unplugin splices unparsable text or silently reads a different property
export function isStaticPlacement(name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return 'static';
  if (name[0] >= 'A' && name[0] <= 'Z' && isValidIdentifierName(name)) return 'static';
  return null;
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

// re-exported from the shared helper layer: the proxy-ROOT recogniser lives in a module this one
// imports FROM, so the canon cannot sit here without a cycle; the transparent / chain-assignment
// peels moved there for the same reason (the const-alias follow reads them), and keep this name
export {
  bindsModuleDefault, globalProxyNameFromImportSource, isTransparentWrapper, isTypeOnlyImportKind,
  peelChainAssignment, peelChainAssignmentDeep, pureCtorNameFromImportSource, tsImportEqualsProxyName,
  tsImportEqualsRequireSource, unwrapTransparentSeq,
} from '../helpers/ast-patterns.js';

// shared Identifier-binding gate for key-resolution walks: cycle guard via the hop's `seen`, fork
// before recurse, reject reassigned bindings. takes the hop standing on the identifier and returns
// the hop standing on its binding's `VariableDeclarator` init (`node` null when the binding has
// none to follow) with the `binding` beside it and `seen` advanced, so callsites converge on
// `entry.node ? recurse : fallback`; null on miss
function enterIdentifierBindingFollow(hop) {
  const { node, readNode: usageNode = null, seen } = hop;
  const { scope, adapter, path = null } = hop.ctx;
  if (seen?.has(node.name)) return null;
  const binding = adapter.getBinding(scope, node.name, path);
  // method-aware reassignment bail: usage-global keeps following a reassigned key/value alias when the
  // reassignment does not dominate the use; pure / narrowing keep the flat bail. `usageNode` anchors the
  // dominance at THIS hop's read site so a multi-hop key alias (`let k='from'; const j=k; k='of';
  // Array[j]`) sees `k='of'` as after the `const j=k` read, not dominating - `j` keeps 'from'
  // the assignment-form Symbol alias's ONLY write IS the aliasing destructure: its write set
  // was already judged clean by the shadow-safe predicate that surfaced `aliasSymbolSource`.
  // blocking on that same write kept the fold babel-only (babel's in-place rewrite hides the
  // write from its own scope tracker, the mutation-free estree side always saw it)
  if (!binding || (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode })
    && !binding.aliasSymbolSource)) return null;
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

// resolve a plugin-managed binding to its Symbol.X key if any. covers two markers:
// `polyfillHint` (in-place AST mutation leaves this on the binding) and `importSource`
// (real `import X from '.../symbol/iterator'` that the plugin emitted). an entry for a `Symbol.X`
// static exports that static as its default - only default bindings count as Symbol.X refs, and
// only for the leaves SYMBOL_STATIC_KEYS lists (the plugin's OWN `symbol/constructor` import binds
// the constructor, not a `Symbol.constructor` value).
// CORE_JS_SOURCE_PREFIX filter rejects unrelated user imports like `my-lib/symbol/iterator`
// whose `*/symbol/X` suffix would otherwise match the regex and route through Symbol.X polyfill.
// optional `packages` array extends the prefix check to user-aliased polyfill packages
// (`additionalPackages` config) so monorepo / vendor-fork imports are recognised
export function bindingSymbolKey(binding, packages = null) {
  if (binding.polyfillHint?.startsWith('Symbol.')) return binding.polyfillHint;
  // a registered destructure alias whose import source is a Symbol.X module (`const { iterator } =
  // Symbol` / `= globalThis.Symbol`): the binding is a pattern, not a module default, so the
  // `importSource` path below can't claim it (`bindsModuleDefault` fails). the adapter's
  // shadow-safe `aliasSymbolSource` (surfaced only when `isPolyfillAliasBinding` holds) carries the
  // module source directly, so both substrates fold uniformly regardless of the pattern's mutated init
  const aliasKey = symbolKeyFromSource(binding.aliasSymbolSource, packages);
  if (aliasKey) return aliasKey;
  if (!bindsModuleDefault(binding.node)) return null;
  return symbolKeyFromSource(binding.importSource, packages);
}

// `<pkg>/.../symbol/<name>` module source -> `Symbol.<name>`, or null when the source is absent /
// unrelated. CORE_JS_SOURCE_PREFIX (+ user `packages`) rejects a coincidental `my-lib/symbol/X`;
// SYMBOL_STATIC_KEYS then rejects the `symbol/` leaves that are NOT a `Symbol.<name>` value
// (`constructor` exports the constructor itself, `description` nothing, `index` the namespace)
function symbolKeyFromSource(source, packages) {
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
    && !adapter.hasBinding(scope, 'babelHelpers', path)
    && callee.property?.type === 'Identifier' && /^interopRequire(?:Default|Wildcard)$/.test(callee.property.name)) {
    return true;
  }
  if (callee?.type !== 'Identifier') return false;
  if (INTEROP_DEFAULT_CALLEE.test(callee.name)) return true;
  const binding = adapter.getBinding(scope, callee.name, path);
  // no binding OBJECT: estree surfaces TSImportEquals only through the dedicated lookup
  if (!binding) {
    const tsNode = adapter.getTSImportEqualsNode?.(scope, callee.name, path);
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

// extract a static string from a node that's either a StringLiteral or a no-interpolation
// TemplateLiteral. without TemplateLiteral support, `require(\`core-js/actual/promise\`)`
// (any tagless single-quasi template) silently bypasses entry detection
export function extractStaticString(node, adapter) {
  if (!node) return null;
  // peel paren / TS wrappers so `require((`core-js/...`))` (oxc keeps the ParenthesizedExpression
  // that babel strips) and `require('core-js/...' as const)` reach the literal check on both
  // parsers. SequenceExpression is deliberately NOT peeled here: `adapter.getStringValue` already
  // resolves a side-effect-free SE tail (`require((0, 'core-js/...'))`) to its literal on BOTH
  // parsers via the shared paren-unwrap, and a side-effecting prefix bails on both - detection
  // stays parser-symmetric without peeling SE at this layer
  const inner = unwrapRuntimeExpr(node);
  if (inner?.type === 'TemplateLiteral') return singleQuasiString(inner);
  // adapter-less callers (the node-level census gates, which have no scope machinery) still get the
  // plain-literal answer - the adapter only adds const-folding on top
  if (!adapter) return typeof inner?.value === 'string' ? inner.value : null;
  return adapter.getStringValue(inner);
}

// `require('core-js/...')` value-call -> source string, or null. peels webpack `(0, require)(...)`
// (SequenceExpression callee tail) and paren / TS / chain wrappers (`(require as any)('...')`,
// `require!('...')`); accepts optional `require?.(...)` on both parsers. a locally-shadowed
// `require` (looked up via the alias context's `scope` / `adapter` - a hop's `ctx`) is ignored -
// its `path` reaches the adapter's var-hoist / TS-runtime shadow recovery, so a `var require`
// hoisted out of a nested block shadows on the estree leg exactly as babel's scope tracker sees
// it; with no context the shadow check is skipped. the ONE require-source canon: entry
// detection / existing-import scan (entries.js) and the proxy-import recognition branches below
// all read through it
export function requireCallSource(node, aliasCtx = {}) {
  const { adapter = null, scope = null, path = null } = aliasCtx;
  // `var P = require?.('x')` wraps the call in a ChainExpression (estree / oxc); peel transparent
  // wrappers at the top so the type-gate sees the (Optional)CallExpression instead of rejecting it
  // and re-emitting a duplicate import for an already-provided module
  node = unwrapTransparentSeq(node);
  if ((node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression')
    || node.arguments?.length !== 1) return null;
  // the callee sequence descends UNCONDITIONALLY - an effectful prefix does not hide the entry,
  // it is preserved separately when the statement is removed - and at any depth: a single peel
  // recognised `(spy(), require)('core-js/...')` but not `(a(), (b(), require))('core-js/...')`,
  // and an unrecognised entry is left in place while its targets go uninjected
  const callee = peelSequenceTail(unwrapTransparentSeq(node.callee), { step: unwrapTransparentSeq });
  if (callee?.type !== 'Identifier' || callee.name !== 'require') return null;
  if (scope && adapter?.hasBinding?.(scope, 'require', path)) return null;
  return extractStaticString(node.arguments[0], adapter);
}

// `_interopRequireDefault(require('<pkg>/<mode>/global-this'))` call -> the proxy name its
// `.default` member carries, or null
function interopCallProxySource({ callNode, scope, adapter, path = null }) {
  if (callNode?.type !== 'CallExpression' || callNode.arguments?.length !== 1
    || !isInteropDefaultCallee(callNode.callee, scope, adapter, path)) return null;
  const required = requireCallSource(callNode.arguments[0], { adapter, scope, path });
  return required ? globalProxyNameFromImportSource(required, adapter.packages) : null;
}

// the proxy name a `.default` member read carries, or null. babel's module lowering wraps a
// CJS module as `{ default: module.exports }` and bundler namespace interop does the same, so
// for a pure GLOBAL-PROXY entry the WRAPPER / NAMESPACE is not the global - its `.default`
// is. three shapes of the same fact, all folded here so the member branch of
// `resolveObjectName` keeps taint and reads symmetric across them:
//   `var X = _interopRequireDefault(require('.../global-this')); X.default.Map = shim`
//   `import * as X from '.../global-this'; X.default.Map = shim`
//   `_interopRequireDefault(require('.../global-this')).default.Map = shim`
// dropping the inline call on a READ substitution is sound: a pure entry module evaluates
// with no user-visible effects, so skipping its load changes nothing observable
export function interopDefaultProxyName({ objectNode, scope, adapter, path }) {
  // peel parens / TS casts (`(_g).default`, `(_g as any).default` - oxc keeps the
  // ParenthesizedExpression babel strips) so both parsers reach the same shape check;
  // an effect-bearing sequence prefix stops the peel and stays unrecognized (bail)
  objectNode = unwrapTransparentSeq(objectNode);
  if (objectNode?.type === 'CallExpression') return interopCallProxySource({ callNode: objectNode, scope, adapter, path });
  if (objectNode?.type !== 'Identifier') return null;
  // follow single-assignment Identifier alias hops down to the interop-call / namespace-import
  // binding - babel's merged-import lowering emits `var ns = _globalThis;` between the use and
  // the wrapper var. every hop must itself be write-free (a reassigned name no longer provably
  // holds the wrapper); the seen-set guards alias cycles
  const seen = new Set();
  let { name } = objectNode;
  let lookupScope = scope;
  while (!seen.has(name)) {
    seen.add(name);
    const binding = adapter.getBinding(lookupScope, name, path);
    if (!binding || isReassignedBeyondDeclarator(binding)) return null;
    if (binding.node?.type === 'ImportNamespaceSpecifier') {
      // `import type * as X` erases like every type-only form - same gate as the default-import arm
      return importBindingIsTypeOnly(binding)
        ? null : globalProxyNameFromImportSource(binding.importSource, adapter.packages);
    }
    const init = binding.node?.type === 'VariableDeclarator' && binding.node.id?.type === 'Identifier'
      ? unwrapTransparentSeq(binding.node.init) : null;
    if (!init) return null;
    if (init.type === 'Identifier') {
      // the init resolves in the alias's OWN declaration scope, not the use scope
      lookupScope = aliasDeclScope(binding, lookupScope);
      ({ name } = init);
      continue;
    }
    return interopCallProxySource({ callNode: init, scope: aliasDeclScope(binding, lookupScope), adapter, path });
  }
  return null;
}

// the proxy name a binding bound to a bare `require('<pkg>/<mode>/global-this')` carries: for the
// unwrapped CJS shape `module.exports` IS the global object, with no `.default` hop between
export function requireBoundProxyGlobalName({ node, scope, adapter, path }) {
  if (node?.type !== 'Identifier') return null;
  const binding = adapter.getBinding?.(scope, node.name, path);
  if (!binding || isReassignedBeyondDeclarator(binding)) return null;
  const init = binding.node?.type === 'VariableDeclarator' && binding.node.id?.type === 'Identifier'
    ? unwrapTransparentSeq(binding.node.init) : null;
  const required = init && requireCallSource(init, { adapter, scope: aliasDeclScope(binding, scope), path });
  return required ? globalProxyNameFromImportSource(required, adapter.packages) : null;
}

// BOTH cycle guards below answer with the shared narrow: on a cycle nothing is resolvable through
// the binding, so the node NAME is all that is left - a self-referential PROXY name (`var self =
// self`) stays a proxy, matching the node-only natural-global rewrite that already turns it into
// `_self` so the hop collapse fires consistently in both emitters (unplugin has no AST re-visit to
// recover it otherwise); a non-proxy self-cycle (`var Map = Map`) stays false

// names whose binding lookup is IN FLIGHT, per scope. the adapter's own alias pre-pass re-enters
// this resolver from inside `getBinding` (`isPolyfillAliasBinding` -> `declaratorInitResolvesForName`
// -> `aliasInitResolvesToGlobal` -> `isProxyGlobalIdentifierNode`) and carries no `seen` across that
// boundary, so the binding-keyed guard below - which only sees bindings `getBinding` already
// RETURNED - never fires on that route: a self-referential alias init recursed until the stack blew.
// keyed by scope + NAME because the binding is exactly what the in-flight lookup has yet to produce.
// a WeakMap keyed by the scope object keeps concurrent transforms apart and leaks nothing; entry and
// exit are synchronous around the one adapter call, so a released name is free to resolve again
const inFlightBindingLookups = new WeakMap();

function withBindingLookupGuard(scope, name, lookup) {
  let names = inFlightBindingLookups.get(scope);
  if (!names) inFlightBindingLookups.set(scope, names = new Set());
  if (names.has(name)) return undefined;
  names.add(name);
  try {
    return lookup();
  } finally {
    names.delete(name);
  }
}

// direct proxy-global (`globalThis`) or plugin-managed alias (`_globalThis` via polyfillHint).
// scope+adapter optional. shadow check (`function f(globalThis) {}`) bails unless polyfillHint
// is set. `path` anchors TS-runtime shadow detection (`enum globalThis {}`).
// const aliases (`const g = globalThis`) pass through via init-peel
export function proxyGlobalRootName({ node, scope, adapter, path, seen, binding = null, usageNode = null, readNode = null }) {
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
    binding = withBindingLookupGuard(scope, node.name, () => adapter.getBinding(scope, node.name, path) ?? null);
    // the re-entrancy and cycle fallbacks name the proxy global like every other arm here, so they
    // owe the SAME second half: a name whose slot the user overwrote holds the replacement, and
    // answering it pristine only because the walk had to stop is the one shape where a cycle
    // changes a VALUE verdict
    if (binding === undefined) return isPristineProxyGlobal(adapter, node.name) ? node.name : null;
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
    return isPristineProxyGlobal(adapter, hint) ? hint : null;
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
    const tsImportNode = adapter.getTSImportEqualsNode(scope, node.name, path);
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
    if (seen?.has(binding.node ?? binding) || seen?.has(node.name)) {
      return isPristineProxyGlobal(adapter, node.name) ? node.name : null;
    }
    const nextSeen = new Set(seen).add(node.name);
    const held = resolveVariableBindingToGlobal({ name: node.name, binding, scope, adapter, seen: nextSeen, path, usageNode, readNode });
    if (held) return isPristineProxyGlobal(adapter, held) ? held : null;
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
  if (adapter.hasBinding?.(scope, node.name, path)) return null;
  return isPristineProxyGlobal(adapter, node.name) ? node.name : null;
}

// boolean view for the call sites that only ask "is it a proxy root", not "which one"
export function isProxyGlobalIdentifierNode(args) {
  return proxyGlobalRootName(args) !== null;
}

// `globalThis.X` / `globalThis?.X` / `globalThis['X']` / `globalThis[(e++, 'X')]` / `globalThis.self.X`
// -> 'X', else null. `staticMemberKeyName` folds a side-effecting computed key to its static tail so a
// SE-bearing hop / leaf resolves the same as its plain form (the emitter replays / collapse-guards the SE).
// walks intermediate proxy-global links so deeper chains resolve to the leaf key; peels a
// zero-arg IIFE-return at each hop so `(()=>globalThis)().Array` resolves like `globalThis.Array`.
// empty-string key returns null - no real global has empty name; keeps callers' `!== null` sound
export function globalProxyMemberName({ node, scope, adapter, path, seen }) {
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  let object = peelProxyGlobalObject(node.object);
  while (object?.type === 'MemberExpression' || object?.type === 'OptionalMemberExpression') {
    const linkName = staticMemberKeyName(object);
    // a mutated hop slot holds the user's replacement - the chain no longer re-enters the
    // global-object surface, so it must not resolve to the leaf global
    if (!linkName || !POSSIBLE_GLOBAL_OBJECTS.has(linkName)
      || isMutatedGlobalSlot(adapter, linkName)) return null;
    object = peelProxyGlobalObject(object.object);
  }
  if (!isProxyGlobalIdentifierNode({ node: object, scope, adapter, path, seen })) return null;
  // a mutated proxy ROOT (`window = fake; window.Promise`) reads through the user's
  // replacement, same as a mutated intermediate hop - the chain must not resolve. aliases
  // decline through the recognizers' own gates (capture order decides what an alias holds,
  // which no span model covers)
  if (object?.type === 'Identifier'
    && isMutatedGlobalSlot(adapter, object.name)) return null;
  const leaf = staticMemberKeyName(node) || null;
  // a SLOT-mutated leaf (`globalThis.Map = Shim`) holds the user's replacement - the chain
  // does not name the pristine global, so every READ consumer (pure-ctor swaps, deopts,
  // typing) must fall back to its raw / generic path
  return isMutatedGlobalSlot(adapter, leaf) ? null : leaf;
}

// the global a name stands for when NO scope binding backs it. a plugin-MINTED alias carries the
// original through the injector's hint hook - `_globalThis` has no scope entry of its own after the
// in-place rewrite, and reading the raw spelling called it no global at all - otherwise the spelling
// itself must pass the direct read's admission (capitalised, or a known proxy). a mutated proxy SLOT
// is the user's replacement whichever route reached the name
function bindingLessGlobalName(name, { scope, adapter }) {
  // only a PROXY hint is taken: the same hook also carries a `*/constructor` stub, whose hint is the
  // constructor NAME (`_Map` hints `Map`) - and that binding serves no statics, so reading it as the
  // global puts a static read back on the entry that cannot answer it
  const held = asProxyGlobalName(bindingPolyfillHint({ binding: null, scope, name, adapter })) ?? name;
  // a proxy name whose SLOT the file overwrote is the user's replacement - that pair is the pristine
  // predicate's own question, asked here rather than re-spelled
  if (asProxyGlobalName(held) && !isPristineProxyGlobal(adapter, held)) return null;
  return isStaticPlacement(held) ? held : null;
}

// `path` (optional) - an AST path inside the lookup site so the adapter can anchor TS-runtime
// shadow detection at a deeper scope than `scope.path`. estree-toolkit's scope tracker doesn't
// register StaticBlock as its own scope owner, so a member visit `Map.Foo` inside
// `static { enum Map {} ... }` lands at the enclosing ClassDeclaration scope; without path,
// `findTSRuntimeBindingInPath` walks UP from ClassDeclaration and never enters the StaticBlock
// to find the enum. babel's scope tracker does anchor at StaticBlock so the legacy `scope.path`
// fallback works for it; estree-toolkit needs the explicit path
function resolveBindingToGlobal({ name, scope, adapter, seen, path, usageNode = null, readNode = null }) {
  seen ??= new Set();
  if (seen.has(name)) return null;
  // `seen` is a recursion STACK, not a visited set: only names on the CURRENT descent stay
  // guarded (cycle guard intact), and a COMPLETED resolution backtracks so it cannot poison a
  // SIBLING resolution of the same name later in the walk - an array-wrap init like
  // `[_globalThis, _globalThis]` (babel's in-place substitution binds the name) resolves each
  // element independently; a visited-set left every later element unresolvable
  seen.add(name);
  try {
    return resolveGuardedBindingToGlobal({ name, scope, adapter, seen, path, usageNode, readNode });
  } finally {
    seen.delete(name);
  }
}

function resolveGuardedBindingToGlobal({ name, scope, adapter, seen, path, usageNode = null, readNode = null }) {
  // single binding lookup - reused by polyfillHint, type gate, and VariableDeclarator init walk.
  // pass `path` so the adapter's var-hoist fallback can surface a nested-block `var` alias
  // (`var g = globalThis` inside an `if`) that estree-toolkit's name-only scope index misses
  const binding = adapter.getBinding(scope, name, path);
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
    || (binding?.node?.type === 'VariableDeclarator' && binding.node.init?.type === 'CallExpression'
      && binding.node.init.callee?.name === 'require'))) {
    const entry = pureImportEntryOf(path, name);
    if (entry) hint = entryToGlobalHint(entry) ?? null;
  }
  // the pristine gate the twin recogniser (`proxyGlobalRootName`) applies: a hint naming a proxy
  // slot the file itself overwrote no longer stands for the pristine global. registration does not
  // mint hints for mutated slots today, so this only pins the invariant against the fork drifting
  if (hint && (CAPITALISED_IDENT.test(hint) || POSSIBLE_GLOBAL_OBJECTS.has(hint))
    && (!POSSIBLE_GLOBAL_OBJECTS.has(hint) || isPristineProxyGlobal(adapter, hint))) {
    // pure only - the hint drives a receiver-dropping rewrite, so it must be flow-sound at THIS use;
    // global / entry modes inject side-effect imports and stay sound regardless (over-inject-safe).
    // an `aliasWrite` hint was verified clean at REGISTRATION (single write, unconditional same-scope
    // placement) - but placement says nothing about ORDER: the write must also END before the read
    // ANCHOR begins (`usageNode` - an alias-hop reads its source at the hop declarator, so a source
    // written after that capture must not narrow it: `const S = T; ({ Symbol: T } = g)` captures
    // undefined). unknown positions bail - pure resolves on proof. a hoisted-var alias declarator
    // must additionally DOMINATE the use (`if (c) { var { Map: M } = globalThis } M.groupBy`
    // binds everywhere but assigns on one path)
    const hintFlowSound = assignmentAliasHintSoundAtRead({ binding, adapter, readNode: usageNode ?? path?.node })
      && (adapter.method !== 'usage-pure' || binding.aliasWrite || !binding.node
        || varInitDominatesUsage({ declaratorNode: binding.node, usagePath: path, usageNode, kind: binding.kind }));
    if (hintFlowSound) return hint;
  }
  const bindingType = adapter.getBindingNodeType(scope, name, path);
  // an import binding maps to a known global ONLY through a pure GLOBAL-PROXY entry source
  // (`import g from '<pkg>/<mode>/global-this'`) - any other imported value stays opaque;
  // param / catch / class name fall through to the final null. import bindings are hoisted
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
    const tsImportNode = adapter.getTSImportEqualsNode(scope, name, path);
    if (tsImportNode) return tsImportEqualsProxyName(tsImportNode, adapter, adapter.packages);
  }
  if (bindingType === 'VariableDeclarator') {
    return resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path, usageNode, readNode });
  }
  return null;
}

// usage-global: when following a reassigned alias's declarator init, an unconditional reassignment can
// kill that init before the use - including across a closure boundary, where it runs before the
// capturing closure is defined (`let K = 'of'; K = 'from'; () => Array[K]` / `let M = Object; M =
// Array; () => M.assign()`). returns the reaching value NODE to resolve instead of the dead init, or
// null to keep following the init (no reassignment / init still live / value indeterminable - over-
// inject-safe). shared by the key (resolveKey) and receiver (resolveVariableBindingToGlobal) follows
function reachingValueOverDeadInit({ binding, adapter, path, scope, usageNode = null }) {
  if (adapter.method !== 'usage-global' || !isReassignedBeyondDeclarator(binding)) return null;
  return reachingReassignmentValueNode({ binding, usagePath: path, ctx: { scope, adapter, path, resolveKey }, usageNode });
}

function resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path, usageNode = null, readNode = null }) {
  // the declarator through the canonical view: the proxy-root recogniser hands this the raw babel
  // scope Binding of the type-resolution adapter, whose `.node` is not the declarator
  const declarator = bindingDeclaratorNode(binding);
  if (!declarator) return null;
  // a real reassignment (a constantViolation beyond a loop-reinit declarator-self) makes the alias
  // flow-dependent. usage-pure bails on ANY reassignment (its receiver-dropping rewrite is unsound);
  // usage-global bails ONLY when a reassignment DOMINATES the use (init provably dead) - a
  // conditional / after-use reassignment leaves the init live, and inject-if-maybe-needed keeps
  // resolving it. `usageNode` anchors the dominance at THIS hop's read site for a multi-hop alias
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
    // the READ must sit textually AFTER the write: a hoisted-var read, an earlier-defined
    // closure body, or an alias hop CAPTURED before the write (`const S = T; ({ Map: T } =
    // globalThis)` - the hop reads T at the S declarator) runs pre-assignment, and a static
    // narrow there would un-throw it (mirrors the registration-table dominance gate;
    // `usageNode` is the hop's read anchor, the plain use keeps its own position)
    const write = adapter.findTrustedAliasWrite(scope, name);
    if (write && (adapter.method !== 'usage-pure' || ((usageNode ?? path?.node)?.start ?? 0) > write.end)) {
      // the write is adapter-verified as unconditionally placed in the binding's OWN scope, so its
      // RHS receiver resolves there - `scope` (the use site) only located the write; resolving the
      // RHS in it would rebind an outer receiver to an inner shadow (same missed-sibling gap as the
      // declarator-init delegations)
      const writeScope = aliasDeclScope(binding, scope);
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
        value: peelChainRootValue(idWrite.right), name, binding, scope, adapter, seen, path,
      });
      if (alias) return alias;
    }
  }
  if (isReassignedBeyondDeclarator(binding) && reassignBailApplies({ binding, adapter, path, usageNode })) return null;
  // a function-scoped `var` whose assignment is conditional (`if (c) { var M = globalThis }`)
  // holds the global only on paths through that branch. usage-pure rewrites `M.Array.from` to a
  // receiver-less helper, DROPPING the guard - so a non-dominating assignment would mask the
  // native undefined-access on the skipped-branch path. global / entry modes keep the call site
  // (side-effect import only) and stay sound regardless, so the gate is pure-only
  if (adapter.method === 'usage-pure'
    && !varInitDominatesUsage({ declaratorNode: declarator, usagePath: path, usageNode, kind: binding.kind })) return null;
  // dead-init across a closure: resolve the reaching value as the receiver instead of the dead init
  // (`let M = Object; M = Array; () => M.assign()` resolves to Array, not the unreachable Object).
  // the write's RHS was spelled where the binding lives, not at the use - resolve it in the
  // binding's own declaration scope so a use-site shadow of an RHS name cannot capture it
  const reaching = reachingValueOverDeadInit({ binding, adapter, path, scope, usageNode });
  if (reaching) return resolveObjectName({
    objectNode: reaching, scope: aliasDeclScope(binding, scope), adapter, seen: new Set(seen).add(name), path, usageNode: reaching,
  });
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
    // a slot default makes the value default-or-runtime, and this union sees only the values
    // `patternSlotValues` could pair (its contract is over-approximation - a dynamic / spread-
    // shifted / foreign pair contributes nothing), so a lone resolved default wrongly reads as
    // certain. pure's receiver-dropping fold needs certainty - bail on the ambiguity (the
    // default-aware extraction channels keep their runtime-guarded handling); usage-global
    // keeps the maybe-union (inject-if-might is sound and desirable there)
    if (adapter?.method === 'usage-pure'
      && (patternSlotHasDefault(pattern, name)
        || patternSlotSpreadShifted(pattern, init, name, { scope, adapter, path, resolveKey }))) return null;
    // a slot the file REPLACED no longer holds what the container's literal spells (`const w = { k:
    // Object }; w.k = Map; const { k } = w` binds Map) - the same rule the static receiver walk
    // applies to the `w.k` spelling, owed here because this route reads the pairing directly and
    // would otherwise resolve a DIFFERENT constructor's static: a wrong value, not a missed one
    if (writtenSlotBlocksPatternRead({ pattern, init, name, scope, adapter, path })) return null;
    const globals = new Set();
    for (const value of patternSlotValues(pattern, init, name, { scope, adapter, path, resolveKey })) {
      const global = resolveObjectName({
        objectNode: value, scope: initScope, adapter, seen: new Set(seen).add(name), path, usageNode: value,
      });
      if (global) globals.add(global);
    }
    return globals.size === 1 ? [...globals][0] : null;
  }
  if (pattern && pattern.type !== 'Identifier') return null;
  if (!init) return null;
  return resolveAliasValueNode({ value: init, name, binding, scope, adapter, seen, path });
}

// does a written container slot stand between this pattern and the value its literal spells?
// method-aware like every other consult of that record: pure bails (a write anywhere in the file
// may reach the read), global keeps resolving and over-injects, the safe direction there
function writtenSlotBlocksPatternRead({ pattern, init, name, scope, adapter, path }) {
  if (adapter?.method !== 'usage-pure' || !adapter.isWrittenContainerSlot) return false;
  const container = unwrapRuntimeExpr(init);
  if (container?.type !== 'Identifier') return false;
  const paths = patternRootKeyPathsFor(pattern, name, { scope, adapter, path, resolveKey });
  // a slot this walk cannot name reads an UNKNOWN one, so any write on the container reaches it
  return paths === null
    ? adapter.isWrittenContainerSlot(container.name, [MUTATED_MEMBERS_UNKNOWN])
    : paths.some(keys => adapter.isWrittenContainerSlot(container.name, keys));
}

// resolve the VALUE an Identifier-pattern alias stores - the declarator init, or a trusted
// assignment-form write's RHS (both feed the same canon so the two spellings cannot drift)
function resolveAliasValueNode({ value, name, binding, scope, adapter, seen, path }) {
  // parens/chain/TS wrappers vanish; SequenceExpression pulls the effective value off its tail.
  // the binding's init declaration stays verbatim (only USES of the binding are rewritten / import-
  // injected), so preceding SE effects are preserved in place - resolution peels to the tail value
  const unwrapped = peelReceiverSequenceTail(value);
  // resolve the init in the alias's OWN declaration scope, not the receiver-use scope - the init
  // expression (`a.Map`, `(() => a.Map)()`, `require(...)`) was written where the alias was declared,
  // so a later hop reading an outer-declared receiver must not bind to an inner shadow of it. EVERY
  // init-shape delegation below threads `initScope`; passing the raw use `scope` was the missed-
  // sibling gap that dropped injection under an inner-shadowed alias hop (`var g = a.Map` used where
  // `a` is a shadowing param)
  const initScope = aliasDeclScope(binding, scope);
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
      ? resolveAliasValueNode({ value: definedBranch, name, binding, scope, adapter, seen, path })
      : null;
  }
  if (unwrapped?.type === 'Identifier') {
    // self-reference (`var Map = Map`) -> global; unbound -> global; bound -> follow chain
    // (recursion hits the top-level polyfillHint translation for plugin-managed imports).
    // a MUTATED proxy slot is the user's replacement whatever route reaches it: an ALIAS of
    // that name (`globalThis.self = X; const g = self`) holds the replacement too, so it
    // resolves to no global - the same verdict the direct read gets.
    // the binding-less name passes the SAME admission the direct spelling gets
    // (`resolveObjectName`: capitalised or a known proxy) - without it an alias of any free
    // lowercase name reported a "global" receiver the direct read would never claim
    if (unwrapped.name === name || !adapter.hasBinding(initScope, unwrapped.name, path)) {
      return bindingLessGlobalName(unwrapped.name, { scope: initScope, adapter });
    }
    return resolveBindingToGlobal({ name: unwrapped.name, scope: initScope, adapter, seen, path, usageNode: unwrapped });
  }
  // identity / param-free / SE-prefix IIFE peel applied ONLY in the binding-init walk,
  // not in `resolveObjectName`'s generic CallExpression branch: the const intermediate
  // (`const X = (arg => arg)(Array)`) keeps the IIFE detached from the eventual usage
  // site, so polyfill emit operates on the binding name (`X`) not the IIFE expression.
  // direct member-receiver IIFE (`((arg) => arg)(WeakMap).has(1)`) doesn't reach here
  // and preserves its AST shape -- the identifier-visitor's inner-arg rewrite stays
  // unrivalled, no double-rewrite overlap with a wide polyfill substitution
  const iifePeeled = peelZeroArgIifeReturn(unwrapped);
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
  const receiver = resolveObjectName({ objectNode: init, scope, adapter, seen, path, usageNode: init });
  // a mutated proxy RECEIVER (`window = fake; const { Promise: P } = window`) destructures the
  // user's replacement - the pattern keys no longer name pristine globals (the key-level gate
  // below covers mutated LEAF keys; this covers the replaced container itself)
  if (!receiver || !isPristineProxyGlobal(adapter, receiver)) return null;
  // the pattern's computed keys EVALUATE at the destructure site: a use-site anchor would
  // resolve a key reassigned AFTER the capture to its post-capture value - a wrong-value
  // alias (`let k = "Array"; const { [k]: S } = globalThis; k = "Symbol";` must resolve S
  // as Array, not Symbol). anchor on the PATTERN, not the init: babel may have substituted
  // the init already (`_globalThis`, a synthetic positionless node the position math
  // cannot order against), while the pattern keeps its source positions on both parsers
  return walkProxyDestructurePattern({ pattern, name, scope, adapter, seen, path, usageNode: pattern });
}

// descend array-wrapper layers pairing each pattern element to its init element positionally: an
// ObjectPattern slot resolves via the flat proxy-global alias path, a nested ArrayPattern recurses.
// `const [{ Array: A }] = [globalThis]` (and deeper `[[{ Array: A }]] = [[globalThis]]`) resolve `A`
// to its property key just like the un-wrapped `{ Array: A } = globalThis`. a spread at/before the
// slot breaks positional pairing, so that slot is skipped
function resolveArrayWrappedProxyGlobalAlias({ pattern, init, name, scope, adapter, seen, path }) {
  if (pattern?.type !== 'ArrayPattern' || init?.type !== 'ArrayExpression') return null;
  for (let i = 0; i < pattern.elements.length; i++) {
    const raw = pattern.elements[i];
    const slot = raw?.type === 'AssignmentPattern' ? raw.left : raw;
    if (!slot || spreadAtOrBefore(init.elements, i)) continue;
    const paired = init.elements[i];
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
    // so neither the leaf alias nor a hop descent may resolve it as the pristine global
    if (isMutatedGlobalSlot(adapter, key)) continue;
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

// walks a chain of proxy-global links (`globalThis.self.window.X`) to its root identifier;
// returns true when the root is a proxy global and every intermediate link is also one.
// IIFE-at-root (`(() => globalThis).Array.from(x)`) is inlined via `inlineCallReturnExpression`
// so the chain bottoms out on the proxy-global identifier inside the IIFE body. caller is
// responsible for marking the inner proxy-global identifier (`markSubsumedProxyChain`) so the
// binding's own visitor does not rewrite `globalThis -> _globalThis` a second time inside a
// span the outer polyfill replacement already owns
// the chain-root peel plus one more carrier only this walk may read through: a `??` / `||` over
// a guaranteed realm name ITSELF yields that left operand - the binding is guaranteed (by the
// language for `globalThis`, by the ponyfill entry for `self`) and an object is neither nullish
// nor falsy, so the defensive right side is dead code
// (`(globalThis ?? {}).Number.MAX_SAFE_INTEGER` reads the realm's static and owes its polyfill).
// the NAME is the gate: `window` / `global` are the environment probes this codebase guards, and a
// navigation that can short-circuit makes the right side live. the walk descends nested defaults
// (`((self ?? {}) ?? {})`) - the same guarantee kills the right side at every level - and hands
// back the UNTOUCHED core when the innermost left proves nothing
function peelRealmLogicalDefault(node) {
  const core = peelChainRootValue(node);
  let current = core;
  while (current?.type === 'LogicalExpression' && (current.operator === '??' || current.operator === '||')) {
    const left = peelChainRootValue(current.left);
    if (left?.type === 'Identifier' && guaranteedRealmObjectName(left.name)) return left;
    current = left;
  }
  return core;
}

function resolveProxyGlobalRoot({ receiver, scope, adapter, seen, path, usageNode = null }) {
  while (true) {
    // peel chain-assign AND SE-tail to fixpoint at every step: `((a = globalThis).Array).from(x)`
    // buries the assignment inside .object's .object, and `(eff(), globalThis).Map.groupBy` buries the
    // proxy root behind a sequence tail - a flat unwrapTransparentSeq loses both. this is pure shape
    // classification: the SE prefix stays in the source and is collected by the emit side
    let obj = peelRealmLogicalDefault(receiver);
    while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
      // carry `seen` into computed-key resolution so a shared alias chain across the
      // proxy-global walk and its intermediate member keys can't exceed the cycle guard
      const memberKey = obj.computed
        ? resolveKey({ node: obj.property, computed: true, scope, adapter, seen, path, usageNode })
        : obj.property?.name;
      // a mutated hop slot (`window.self = fake`) is the user's replacement, not the global -
      // the chain no longer re-enters the pristine global-object surface.
      // a `.default` hop off a CJS-interop-wrapped pure global-proxy require re-enters it
      // (`X.default.Map.groupBy()`) exactly like the top-level interop read the sibling
      // resolver recognizes - the wrapper below the hop IS the chain's global root then
      if (!memberKey || !isPristineProxyGlobal(adapter, memberKey)) {
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

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow.
// initialize at entry so the cycle guard accumulates across recursion regardless of whether
// the caller passed one - matches resolveBindingToGlobal's convention
export function resolveObjectName({ objectNode, scope, adapter, seen, path, usageNode = null, readNode = null }) {
  seen ??= new Set();
  // peel chain-assign rhs + parens to a fixpoint (`(a = Array)`, `(a = b = Array)`,
  // `(a = (b = Array))`, `((a = Array))` all resolve to Array). closes binding-init walks
  // (`const X = (a = Array); X.from(...)`) and IIFE-return walks
  // (`(() => (a = Array))().from(...)`) symmetrically. SE preservation is downstream's
  // problem - resolveObjectName only classifies receiver shape
  objectNode = peelChainAssignmentDeep(objectNode);
  // the receiver ITSELF spelled as a logical default over the realm: the same rule the proxy-root
  // walk reads for a receiver BELOW it (`peelRealmLogicalDefault`) - a guaranteed realm name is
  // an object, so the defensive right side is dead and `(globalThis ?? {}).Map` names the realm's
  // constructor, at every nesting level (`((self ?? {}) ?? {}).Map` too). without it a ctor claim
  // through this carrier stayed a native read
  for (let left = objectNode; left?.type === 'LogicalExpression'
    && (left.operator === '??' || left.operator === '||');) {
    left = peelChainAssignmentDeep(left.left);
    if (left?.type === 'Identifier' && guaranteedRealmObjectName(left.name)
      && !adapter.hasBinding(scope, left.name, path)) {
      objectNode = left;
      break;
    }
  }
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name, path)) {
      return resolveBindingToGlobal({ name: objectNode.name, scope, adapter, seen, path, usageNode, readNode });
    }
    // no binding - global only if starts with uppercase or is a known global proxy.
    // a mutated proxy SLOT (`globalThis.self = fake`) is the user's replacement, not the
    // global - the bare name no longer roots a global surface (the recognizer and the
    // member-tail hop already decline it; this is the binding-less name's own spelling)
    return bindingLessGlobalName(objectNode.name, { scope, adapter });
  }
  // call expression: inline the function-like callee's body return when it bottoms out on
  // a resolvable receiver. covers IIFE (`(() => Map)()`), function-expression IIFE, and
  // identifier-bound arrow/fn (`const f = () => Map; 'X' in f()`). recursion through
  // resolveObjectName handles chains like `(() => globalThis)().Map`.
  // identity / param-free / SE-prefix IIFE peel (`peelZeroArgIifeReturn`) is intentionally
  // NOT applied at this generic call site -- it'd let `((Map) => Map)(WeakMap).has(1)`
  // resolve as a polyfillable receiver, and unplugin's text-rewrite would queue a wide
  // replacement overlapping the identifier-visitor's inner-arg rewrite (`WeakMap` ->
  // `_WeakMap`), producing broken `__WeakMap` output. binding-init walks apply the peel
  // separately (`resolveVariableBindingToGlobal`); direct member-receiver IIFE preserves
  // its AST shape so identifier-visitor's inner rewrite stays the single source of truth
  if (objectNode.type === 'CallExpression' || objectNode.type === 'OptionalCallExpression') {
    const inlined = inlineCallReturnExpression({ node: objectNode, readNode: usageNode, seen, ctx: { scope, adapter, path } });
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
    ? resolveKey({ node: objectNode.property, computed: true, scope, adapter, seen, path, usageNode })
    : objectNode.property.type === 'Identifier' ? objectNode.property.name : null;
  if (!propertyName) return null;
  // `X.default` of a CJS-interop-wrapped pure GLOBAL-PROXY require resolves to the proxy
  // itself (the wrapper is not the global, its `.default` is) - the receiver shape babel's
  // module lowering leaves for a pure global-this import, and the host of slot writes like
  // `X.default.Map = shim` that must keep tainting after the lowering
  if (propertyName === 'default') {
    const interopProxy = interopDefaultProxyName({ objectNode: objectNode.object, scope, adapter, path });
    if (interopProxy) return interopProxy;
  }
  if (!resolveProxyGlobalRoot({ receiver: objectNode.object, scope, adapter, seen, path, usageNode })) return null;
  // a mutated ctor slot read THROUGH the global (`globalThis.Map = Shim; globalThis.Map.<...>`)
  // holds the user's replacement - the member chain no longer names the pristine built-in, so
  // property reads behind it must stay raw instead of resolving to pure statics
  return isMutatedGlobalSlot(adapter, propertyName) ? null : propertyName;
}

// the distinct values an alias can hold at the use for the usage-global union: the resolved primary
// (declarator init) plus every reachable reassignment RHS that resolves, deduped. a non-Identifier
// alias or one with no reassignment contributes only the primary. `resolve` maps a value HOP to its
// receiver name / key string: the hop's `ctx.scope` re-anchors the resolution at the scope the value
// was SPELLED in (a write RHS / init resolves where the binding lives, not at the alias read - a
// use-site shadow of an RHS name must not capture it), its `readNode` at the site it was read
export function reachableAliasValues({ aliasNode, primary, resolve, scope, adapter, path, seen, usageNode = null }) {
  const values = primary ? [primary] : [];
  // follow an Identifier alias SOURCE (a declarator init OR a reassignment value) to the aliased
  // binding's own reachable values, so `const/let M = M0`, `M = M0` and `[M] = [M0]` all reach M0's
  // transitive reassignments (`let M0 = Object; if (c) M0 = Array; ...; M.from()`). ADDITIVE to the
  // reassigned-arm: a reassigned alias whose source aliases another reassigned binding still reaches
  // the source's targets on the no-own-write path. anchored at the alias read site (a later write to
  // the source does not enter the union); `asCall` re-enters the factory branch for an `f()` receiver;
  // `seen` guards alias cycles. `sourceScope` is where the source expression lives - the hop's own
  // binding resolves there
  function pushAliasHop(source, currentName, asCall, sourceScope) {
    let node = source && unwrapTransparentSeq(source);
    // a source wrapped in zero-arg IIFEs (`const f = (() => f0)()`, nested `(() => (() => f0)())()`)
    // aliases the IIFEs' return, so peel to a fixpoint to reach the underlying binding - the same
    // wrapper the container / global resolvers peel
    while (node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression') {
      const ret = peelZeroArgIifeReturn(node);
      if (!ret) break;
      node = unwrapTransparentSeq(ret);
    }
    if (node?.type !== 'Identifier' || node.name === currentName || seen?.has(node.name)) return;
    const recursed = asCall ? { type: 'CallExpression', callee: node, arguments: [] } : node;
    // an `f()` receiver has no caller-resolved primary (the call is opaque to `resolveObjectName`), so
    // the aliased factory's DECLARED return is captured here beside its reassignments: `const f = f0`
    // with `let f0 = () => Object; if (c) f0 = () => Map` reaches BOTH Object and Map. `node` anchors
    // the dominance check at the alias-read, excluding a dead factory init. an Identifier receiver
    // already gets its declared value from the caller's primary, so re-resolving it would double-count
    // (and mis-anchor a dead init) - it stays null
    values.push(...reachableAliasValues({
      aliasNode: recursed, resolve,
      primary: asCall ? resolve({ node: recursed, readNode: node, ctx: { scope: sourceScope, adapter, path } }) : null,
      scope: sourceScope, adapter, path,
      seen: new Set(seen).add(currentName), usageNode: node,
    }));
  }
  if (aliasNode?.type === 'Identifier') {
    const binding = adapter.getBinding(scope, aliasNode.name, path);
    const declScope = binding ? aliasDeclScope(binding, scope) : scope;
    if (binding && isReassignedBeyondDeclarator(binding)) {
      // the alias name activates pattern-LHS pairing (`[A] = [Iterator]`) in the enumerator -
      // adapter binding wrappers do not all surface the bound identifier
      for (const rhs of reassignmentValueNodes({
        binding, usagePath: path, name: aliasNode.name, ctx: { scope, adapter, path, resolveKey }, usageNode,
      })) {
        // the written value was READ at its write site - anchor its own resolution there, so a
        // cross-write (`a = b; b = x`) resolves b's value as captured BEFORE `b = x` overwrote it,
        // and in the binding's own scope, so a use-site shadow cannot swallow the RHS name
        const value = resolve({ node: rhs, readNode: rhs, ctx: { scope: declScope, adapter, path } });
        if (value) values.push(value);
        pushAliasHop(rhs, aliasNode.name, false, declScope);
      }
    }
    // pattern-gated init follow: a destructure declarator binds the name to a SLOT of the init -
    // following the whole init smuggled the CONTAINER into the union (`const { M } = src` fanned
    // src's reachable values as M's)
    if (binding) pushAliasHop(identifierDeclaratorInit(binding), aliasNode.name, false, declScope);
  } else if (aliasNode?.type === 'CallExpression' || aliasNode?.type === 'OptionalCallExpression') {
    // IIFE-callee receiver `f()` whose factory `f` is a reassigned alias: each reachable `() => X`
    // value returns X. recover each so a dominating reassignment to a polyfillable global (`let f =
    // () => Object; f = () => Array; f().from()`) still injects the reaching value's polyfill - the
    // direct-Identifier-receiver union path could not, since `f()` is not an Identifier alias
    const callee = unwrapTransparentSeq(aliasNode.callee);
    const binding = callee.type === 'Identifier' ? adapter.getBinding(scope, callee.name, path) : null;
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
          const value = ret && resolve({ node: ret, ctx: { scope: declScope, adapter, path } });
          if (value) values.push(value);
        } else pushAliasHop(rhs, callee.name, true, declScope); // a factory bound through an Identifier alias
      }
    }
    if (binding) pushAliasHop(identifierDeclaratorInit(binding), callee.name, true, declScope);
  }
  return [...new Set(values)];
}

// resolve a call-expression callee to a function-like node (arrow / fn-expr) suitable
// for inlining. handles direct IIFE (callee = arrow/fn-expr) AND identifier-bound callees
// (`const f = () => X; f()` walks through the binding's init to the same form, following
// identifier-to-identifier hops transitively).
// rejects shapes where inlining would change semantics: non-VariableDeclarator bindings,
// reassigned bindings (constantViolations), parameter-bearing fn (would shadow free
// identifiers), async / generator fn (wrapped return value misrepresents the result type
// for downstream `resolveObjectName` consumers - `(async()=>Map)().has(1)` tags the
// receiver as Map and emits es.map.* polyfills for a Promise call site).
// the hop's `seen` tracks binding names already in the resolution chain for cycle protection
// (`const f = () => g(); const g = () => f();`); pass an empty Set when recursion isn't
// possible at the call site. the caller's set is never mutated - the walk forks it
// (fork-before-recurse, the `enterIdentifierBindingFollow` discipline) and returns the fork, so
// a name consumed while proving one branch cannot block the SAME name in a SIBLING branch; a
// caller descending into the returned body threads the returned set.
// takes the hop standing on the CALL and returns the hop standing on the callee function: its
// `ctx.scope` anchors the callee's BODY - identifiers resolve where the callee was declared, not
// at the call site (a use-site shadow of a name the body reads must not capture it)
function resolveInlineCalleeFunction(hop, { allowIdentityParam = false, rejectConditional = false } = {}) {
  const { adapter, path } = hop.ctx;
  const seen = new Set(hop.seen);
  // SE-bail (unwrapTransparentSeq), NOT peel-to-tail: recognizing a SE-callee IIFE (`(eff(), () => Array)()`)
  // makes the resolver inline it, but the emit layer has no receiver-less static spelling
  // over the SE-wrapped callee. the SE-bail keeps the shape unresolved (native call survives)
  let callee = unwrapTransparentSeq(hop.node.callee);
  // identifier hops follow transitively (`const f = () => X; const q = f; q()`), each hop
  // re-anchored at the alias's own declaration scope (per-hop advance like the key/global
  // alias walks) with the seen-set guarding cycles
  let hopScope = hop.ctx.scope;
  while (callee.type === 'Identifier') {
    const { name } = callee;
    if (!adapter.hasBinding(hopScope, name, path) || seen.has(name)) return null;
    const binding = adapter.getBinding(hopScope, name, path);
    if (!binding) return null;
    const isDeclarator = adapter.getBindingNodeType(hopScope, name, path) === 'VariableDeclarator';
    // the shared accessor covers both binding shapes (detect adapters carry `.node`, the
    // type-resolver channel only `.path`) AND gates on a plain-Identifier declarator: a
    // pattern-bound name (`const { f } = g`) holds a SLOT of the init, so following the whole
    // init inlined the CONTAINER as the callee (`f().from` ran where native throws)
    const initNode = isDeclarator ? identifierDeclaratorInit(binding) : null;
    if (isDeclarator && !initNode) {
      // an init-less binding whose ONE write assigns a function literal (`let f; if (c) f =
      // () => globalThis;`) proves through that write: on every path the value is either
      // undefined or that literal. the CALL ITSELF becomes an observable effect (it may
      // throw / short-circuit on the unassigned path), so the collapse must keep it - the
      // marker feeds `inlineCallHasObservableEffects`, which every dropping caller consults
      const write = binding.constantViolations?.length === 1
        ? unwrapTransparentSeq(violationAssignment(binding.constantViolations[0])) : null;
      const rhs = write?.type === 'AssignmentExpression' && write.operator === '='
        && write.left?.type === 'Identifier' && write.left.name === name
        ? unwrapTransparentSeq(write.right) : null;
      if (rhs?.type !== 'ArrowFunctionExpression' && rhs?.type !== 'FunctionExpression') return null;
      // callers asking whether the call's VALUE is defined get no proof from a conditional
      // one: the unassigned path is exactly the value they must keep guarding
      if (rejectConditional) return null;
      conditionallyProvenCallees.add(rhs);
      callee = rhs;
      seen.add(name);
      // the write's RHS resolves in the binding's own declaration scope, like a declarator init
      return finishInlineCallee({ hop, callee, scope: aliasDeclScope(binding, hopScope), seen, allowIdentityParam });
    }
    // the dominance question anchors at THIS read - the callee identifier itself (a clone with no
    // span falls back to the hop's read site): a write earlier in the same sequence (`(f = () =>
    // globalThis, f().Array)`) precedes it and dominates, a write after an alias captured the call
    // (`const G = mk().Array; mk = ...`) does not and leaves the init live. anchored at the outer
    // expression both were misjudged - the in-sequence write read as "after" (the FC-144 lesson)
    const anchor = typeof callee.start === 'number' ? callee : hop.readNode;
    if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: anchor })) {
      // a dominating write replaced the callee, and its value IS the callee now: the enumerable
      // reaching value for usage-global, the single observable one for usage-pure - the callee twin
      // of `reachingContainerValueNode` (the init is dead, inlining it would name a callee the
      // runtime never calls); a value neither can determine leaves the call unresolved
      const { method } = adapter;
      const reaching = method === 'usage-global' || method === 'usage-pure' ? reachingReassignmentValueNode({
        binding, usagePath: path, ctx: { ...hop.ctx, resolveKey }, usageNode: anchor, requireSingleObservation: method === 'usage-pure',
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
      if (declNode?.type !== 'FunctionDeclaration') return null;
      callee = declNode;
    }
    seen.add(name);
    hopScope = aliasDeclScope(binding, hopScope);
  }
  return finishInlineCallee({ hop, callee, scope: hopScope, seen, allowIdentityParam });
}

// the shared callee-shape validation every proof arm funnels through; on success the hop advanced
// onto the callee, at `scope`
function finishInlineCallee({ hop, callee, scope, seen, allowIdentityParam }) {
  if ((callee.type !== 'ArrowFunctionExpression' && callee.type !== 'FunctionExpression'
    && callee.type !== 'FunctionDeclaration')
    || (callee.params?.length && !identityParam({ callee, allowIdentityParam })) || callee.async || callee.generator) return null;
  return { ...hop, node: callee, seen, ctx: { ...hop.ctx, scope } };
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

// an `(x) => x` identity callee is inlineable when `allowIdentityParam` is set: its single Identifier
// param is substituted with the call arg by `inlineCallReturnExpression`. every other param shape
// needs substitution we don't do, so it still bails (params?.length && !identity -> null above)
function identityParam({ callee, allowIdentityParam }) {
  if (!allowIdentityParam || callee.params?.length !== 1 || callee.params[0].type !== 'Identifier') return false;
  // the param must flow UNCHANGED to the return - a body write (`arg = x`, `[arg] = e`, `arg++`, or
  // one inside a nested closure that runs) makes `return arg` yield the new value, not the call arg,
  // so the passthrough would over-resolve (native throws / diverges on the reassigned value)
  return !paramReboundInBody(callee.body, new Set([callee.params[0].name]));
}

// resolve an inline-eligible call to its single-return expression. `null` if the callee
// isn't inlineable or the body has multiple returns / local bindings (see
// `singleReturnBodyExpression`). prefix ExpressionStatements ARE allowed - their effects
// are preserved at the call site via `inlineCallHasObservableEffects` + `meta.sideEffects`.
// takes the hop standing on the CALL and returns the hop standing on the returned expression: its
// `ctx.scope` is where that expression's identifiers resolve - the callee's declaration scope for
// a body return, the CALL site for an identity-arg return (the argument evaluates there) - and
// its `seen` the advanced cycle-guard set a caller descending into the node threads on (the
// caller's own set stays unmutated)
export function inlineCallReturnExpression(hop, { rejectConditional = false } = {}) {
  const resolved = resolveInlineCalleeFunction(hop, { allowIdentityParam: true, rejectConditional });
  if (!resolved) return null;
  const callee = resolved.node;
  const body = singleReturnBodyExpression(callee.body);
  if (!callee.params?.length) return body ? { ...resolved, node: body } : null;
  // identity passthrough (`(x) => x` applied to one arg): the body IS the param, so the receiver is
  // the ARG - recovers a call/IIFE-rooted receiver (`((x)=>x)(globalThis).Symbol`, and the nested
  // `g(f()).Symbol` since the arg `f()` is itself resolved by the caller). an SE-bearing arg is
  // preserved by `inlineCallHasObservableEffects` (checks callNode.arguments), so return it as-is
  if (body?.type === 'Identifier' && body.name === callee.params[0].name) {
    return hop.node.arguments?.[0] ? { ...hop, node: hop.node.arguments[0], seen: resolved.seen } : null;
  }
  // a body that never READS the param yields the same value for every argument (`(x) => globalThis`),
  // so the call resolves to the body itself. bailing here on the param's mere PRESENCE left the shape
  // unproven: the guard test substituted the root while the static behind it kept reading native off
  // the memo. the param may still carry an effect in a prefix statement - that is the SE channel's
  // business, not the value's
  return !body || identifierReferencedInSubtree(body, callee.params[0].name)
    ? null : { ...resolved, node: body };
}

export function isCallShape(node) {
  return node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression';
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

// ... and WHO owns what such a store hands on. a store nothing reads through holds the value its own
// spelling yields; a read THROUGH it (`(q = nav).Map`) is the CONSUMER's, and that read is the proof
// the value must be the realm object - over a probe run the hop folds there whatever the run carries,
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
    if (isMemberAccessNode(host) && host.object === child) return true;
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

// resolve every computed hop's key to a pristine proxy-global name, harvesting an SE-bearing
// key's prefix expressions onto the hop (`[(c++, 'self')]` re-emits the `c++` with the render);
// false = a key that does not fold to a pristine name, or one whose effects have no re-emit
// shape - the whole plan bails on it
function resolveComputedHopKeys(hops, { scope, adapter, path }) {
  for (const hop of hops) {
    if (hop.name !== null) continue;
    hop.name = resolveKey({ node: hop.node.property, computed: true, scope, adapter, seen: new Set(), path });
    if (!hop.name || !isPristineProxyGlobal(adapter, hop.name)) return false;
    const prop = unwrapTransparentSeq(hop.node.property);
    if (prop.type === 'SequenceExpression' && prop.expressions.length > 1
      && prop.expressions.slice(0, -1).some(mayHaveSideEffects)) {
      hop.keySeExprs = prop.expressions.slice(0, -1);
    } else if (mayHaveSideEffects(prop)) return false;
  }
  return true;
}

// the RENDER-time read of a plan's key effects, off the LIVE key containers: a claim landing
// inside a kept computed key swaps the node in its PARENT slot (`path.replaceWith` /
// `replaceNodeInTree`), so the plan's eager `keySeExprs` references go stale by flush time.
// every renderer that re-emits the key effects reads THROUGH the plan's `liveKeySeExprs`
// instead - one liveness rule for both emitters (babel's re-read at flush == the ast
// engine's keep-live identity); the shape check falls back to the captured nodes when a
// rewrite reshaped the container
function liveHopKeySeExprs(hops) {
  return hops.flatMap(hop => {
    if (!hop.keySeExprs?.length) return [];
    const prop = unwrapTransparentSeq(hop.node.property);
    return prop?.type === 'SequenceExpression' && prop.expressions.length === hop.keySeExprs.length + 1
      ? prop.expressions.slice(0, -1) : hop.keySeExprs;
  });
}

// does this nav collapse to ONE probe over a ponyfill leaf, with nothing above the collapse and no
// key effects? then a caller about to MEMOIZE it composes with the guard that render builds instead:
// the probe is the test and the leaf pure is what every read of the value spells. both bindings ask
// it at their own memo sites - a memo there would spell a second test over the first
export function composableNavGuardPlan(navNode, { scope, adapter, path, resolvePure }) {
  if (!adapter || !scope || !resolvePure) return null;
  const plan = planProvenNavGuardCollapse({ rootNode: navNode, scope, adapter, path, resolvePure });
  if (!plan || plan.kind !== 'nested' || plan.topAssign || plan.seqRoot || !plan.leafPure) return null;
  if (plan.hops.length !== plan.collapseIdx + 1 || plan.testKeySeCount || plan.keySeExprs?.length) return null;
  const probe = plan.hops[plan.lastUnresolvableIdx]?.node;
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
// doctrine's own wording, and a live `?.` in the navigation is a branch the SOURCE wrote
function lastGuardEarningHopIdx(hops, { collapseIdx, path, resolvePure }) {
  let idx = -1;
  for (let i = 0; i < collapseIdx && !navFoldsInFallbackSlot(hops, path); i++) {
    if (!resolvePure({ kind: 'global', name: hops[i].name })) idx = i;
  }
  return idx;
}

// the realm hops a ponyfill is READ THROUGH fold away before anything is indexed. a hop the pure
// build cannot back names a realm self-reference; standing over a ponyfill it is a read that
// ponyfill cannot answer off-browser (`_self.window.X` throws where the source, written for a
// browser, read a value), and the collapse assumes the realm present anyway. what STAYS is the
// environment PROBE - the unbacked prefix reading off the source root, where the `?.` the source
// wrote is load-bearing. a COMPUTED key stays too: folding it would fold its effect away with it,
// and the value above it is then no longer a ponyfill
function foldReadThroughRealmHops(hops, { adapter, resolvePure }) {
  let overPure = false;
  return hops.filter(hop => {
    if (!foldableRealmHopKey(hop.name, { adapter, resolvePure })) {
      overPure = !!resolvePure({ kind: 'global', name: hop.name });
      return true;
    }
    return !(overPure && !hop.node.computed && !hop.keySeExprs?.length);
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
//   - the TAIL hop names above it (`liveOptional` spelling - see the per-hop verdict below),
//   - SE computed-key expressions of collapsed hops (replayed before the leaf, native order).
// kinds: 'nested' (a prefix test survives), 'sequence' (no prefix, but the root or its arg
// carries effects the collapse must keep), 'bare' (everything provably drops). null = not this
// shape; the callers keep their own canons there
export function planProvenNavGuardCollapse({
  rootNode, scope, adapter, path, resolvePure, allowSequenceRoot = false,
  throughKeptAssign = false, descendSequenceTail = false, storedValueSequenceTail = false,
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
    const dottedKey = node.computed ? null : memberKeyName(node);
    if (!node.computed && !isPristineProxyGlobal(adapter, dottedKey)) return null;
    hops.unshift({ name: dottedKey, node, optional: !!node.optional, keySeExprs: null });
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
    return { outer, below: descendHops(below) };
  }
  const { outer: chainAssign, below: call } = keptWriteRoot();
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
  if (!resolveComputedHopKeys(hops, { scope, adapter, path })) return null;
  const rootId = identRoot ?? inlineCallProxyGlobalRoot({ callNode: call, scope, adapter, path });
  // an emitter may have already rewritten the proven root INSIDE the callee to its pure
  // import (`() => _globalThis`); the import binding names its source global through the
  // polyfillHint side-channel - resolve through it exactly like the bare-alias walk
  const rootName = identRootName
    ?? (rootId && (asProxyGlobalName(rootId.name) ?? bareProxyGlobalAliasName(rootId, aliasCtx)));
  if (!rootName || !isPristineProxyGlobal(adapter, rootName)) return null;
  hops.splice(0, hops.length, ...foldReadThroughRealmHops(hops, { adapter, resolvePure }));
  let collapseIdx = -1;
  // proving WHICH global a call root yields is not proving it yields a DEFINED one: a body reaching
  // the environment probe (`() => globalThis.window`) is undefined off-window. every render this plan
  // offers reads THROUGH that value - test-free onto the ponyfill, or a test that dereferences it -
  // so neither is safe. decline: the `?.` above the call keeps its own guard, which the claim
  // verdict now sources from the call itself
  // proving WHICH global a call root yields is not proving it yields a DEFINED one: a body reaching
  // the environment probe (`() => globalThis.window`) is undefined off-window, and every render this
  // plan offers reads THROUGH that value. only where the `?.` it would ERASE guards the call value
  // itself - the hop read directly off it; an optional higher up guards what the call produced, and a
  // plain read throws before any of them, so those keep the ordinary collapse both legs spell.
  // an OPTIONAL call link keeps its own `?.` in every render, so its undefinedness is reproduced
  if (!identRoot && !call.optional && hops[0]?.optional
    && callValueCanBeUndefined(call, aliasCtx, resolvePure)) return null;
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
  if (collapseIdx === -1) return null;
  // a TAIL hop's key effects ride WITH the hop: the render re-hangs every hop above the collapse in
  // the source's own spelling, key node included, so the effect stays where the source runs it -
  // after the collapsed value, before the read it keys
  const lastUnresolvableIdx = lastGuardEarningHopIdx(hops, { collapseIdx, path, resolvePure });
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
  const keySeExprs = hops.flatMap(hop => hop.keySeExprs ?? []);
  // how many of those the rendered TEST already evaluates. a 'nested' render spells the test as the
  // source of `hops[lastUnresolvableIdx]`, which CONTAINS the key of every hop at or below it, so
  // prefixing the alternate with the whole set runs those effects a second time (native evaluates
  // the computed key once, before the short-circuit decision). `keySeExprs` is in hop order, so the
  // test's share is its head - a COUNT, not a second node array, which would go stale when a
  // renderer re-clones the plan's expressions for a deferred flush
  const testKeySeCount = lastUnresolvableIdx === -1 ? 0
    : hops.slice(0, lastUnresolvableIdx + 1).reduce((count, hop) => count + (hop.keySeExprs?.length ?? 0), 0);
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
    topAssign, topAssignSteps, topValue: dug?.value ?? null, hops, collapseIdx, lastUnresolvableIdx, keySeExprs,
    // the COLLAPSED hops only: their key nodes are discarded with them, so their effects have to be
    // replayed ahead of the leaf. a hop ABOVE the collapse survives as itself, key node included,
    // and replaying it here too would run the source's effect twice
    liveKeySeExprs: () => liveHopKeySeExprs(hops.slice(0, collapseIdx + 1)), testKeySeCount,
    seqAroundPrefix,
    leafName: hops[collapseIdx].name, leafPure, rootValueNode: seqRootNode ?? n, seqRoot: !!seqRootNode,
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

// does the plan's VALUE spelling carry everything its guarded render does? only when the plan has no
// effects to re-emit: a sequence prefix and an effectful call root both live INSIDE the rendered
// prefix, and the value form has no slot for either. a collapsed hop's computed-KEY effects DO have
// one - the value replays them ahead of the leaf
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
    // drops them, so a side-effecting argument (`(() => Array)(c++)`) must force SE preservation
    if (hop.node.arguments?.some(mayHaveSideEffects)) return true;
    // `allowIdentityParam` MUST mirror the fold (`inlineCallReturnExpression`): the fold inlines an
    // identity-param IIFE (`((x) => { g(); return x; })(Array)`), so the effect gate has to inspect its
    // block body too - a stricter gate here misses the `g()` prefix and drops it at the source
    const resolved = resolveInlineCalleeFunction(hop, { allowIdentityParam: true });
    if (!resolved) return false;
    const callee = resolved.node;
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
      && next.expressions.slice(0, -1).some(mayHaveSideEffects)) return true;
    // recurse when the (peeled) target is an inline-resolvable call (`() => inner()` with its own effects)
    if (isCallShape(peeled)) {
      // the inner call sits in the callee's body - resolve it there, with the advanced cycle set
      hop = { ...resolved, node: peeled };
      continue;
    }
    // else the returned value IS the inlined receiver; it carries observable effects only when the
    // receiver is wrapped in a write or an SE-prefixed sequence (`a = Array`, `(eff(), Array)`) - the
    // substitution drops the whole call, so those must be preserved. a bare receiver ref has none
    return returnedReceiverHasEffects(next);
  }
}

// the returned expression of an inlined call, beyond the receiver value the caller resolves: a
// chain-assignment / update writes a binding, an SE-prefixed sequence runs its leading elements -
// both are dropped when the call is replaced by the polyfill. a bare Identifier / member receiver
// has no such effect (a CallExpression receiver is handled by the recursion above). peel transparent
// wrappers first: oxc keeps the arrow-body parens (`() => (a = Array)`) babel strips, so the write
// hides under a ParenthesizedExpression on one adapter only
export function returnedReceiverHasEffects(node) {
  node &&= unwrapTransparentSeq(node);
  if (!node) return false;
  if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') return true;
  if (node.type === 'SequenceExpression') {
    return node.expressions.slice(0, -1).some(mayHaveSideEffects) || returnedReceiverHasEffects(node.expressions.at(-1));
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
function normalizeComputedKeyNode(node, bailOnSideEffectKey, adapter) {
  node = unwrapTransparentSeq(node);
  while (true) {
    if (bailOnSideEffectKey && node?.type === 'SequenceExpression' && sequencePrefixWithSideEffects(node)) return KEY_SIDE_EFFECT_BAIL;
    node = peelSequenceTail(node, { step: unwrapTransparentSeq });
    if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return node;
    if (adapter.method === 'usage-pure' && !zeroArgIifeSideEffectFree(node)) return node;
    const iifeRet = peelZeroArgIifeReturn(node);
    if (!iifeRet) return node;
    node = unwrapTransparentSeq(iifeRet);
  }
}

// a numeric literal key node under either parser (babel `NumericLiteral`, estree `Literal`)
function isNumericLiteralKeyNode(node) {
  return node.type === 'NumericLiteral' || (node.type === 'Literal' && typeof node.value === 'number');
}

export function resolveKey({ node, computed, scope, adapter, seen, path, depth = 0, bailOnSideEffectKey = false, usageNode = null }) {
  while (true) {
    // an over-deep chain and an ABSENT key answer alike: a mutator called with fewer arguments than it
    // takes (`Object.defineProperty(target)`) leaves the key slot empty - legal source that throws at
    // runtime, and callers already treat a null key as "not resolvable"
    if (depth > MAX_KEY_DEPTH || !node) return null;
    if (computed) {
      node = normalizeComputedKeyNode(node, bailOnSideEffectKey, adapter);
      if (node === KEY_SIDE_EFFECT_BAIL) return null;
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
            path, depth: depth + 1, usageNode, bailOnSideEffectKey,
          });
          if (part === null) return null;
          out += part;
        }
      }
      return out;
    }
    // computed: const variable - follow to init, else fall back to plugin-managed bindings
    // (`polyfillHint` in-place mutation / `core-js/.../symbol/X` import, incl. user-aliased
    // polyfill packages from `additionalPackages`)
    if (node.type === 'Identifier' && computed) {
      const entry = enterIdentifierBindingFollow({ node, readNode: usageNode, seen, ctx: { scope, adapter, path } });
      if (entry) {
        // a registered Symbol.X alias resolves the key regardless of the binding's (possibly mutated /
        // pattern) init: `const { iterator } = Symbol; obj[iterator]`. must run BEFORE the init branch -
        // following a destructure init resolves the WHOLE receiver (`Symbol`), losing the `.iterator` slot
        const aliasKey = bindingSymbolKey(entry.binding, adapter.packages);
        if (aliasKey) return aliasKey;
        if (entry.node) {
          // usage-pure: a conditionally-initialized key alias (`if (c) var K = 'fromEntries'`) holds
          // the literal only on the guarded path, so following it would rewrite `Builtin[K]()` to a
          // receiver-less polyfill and mask the native TypeError on the skipped path. gate on
          // init-dominance like the receiver branch (usage-global over-injects, so it keeps following)
          if (adapter.method === 'usage-pure' && !varInitDominatesUsage({
            declaratorNode: entry.binding.node, usagePath: path, usageNode, kind: entry.binding.kind,
          })) return null;
          // usage-global: an unconditional reassignment can kill the init before the use - including one
          // that completes before a capturing closure is defined (`let K = 'of'; K = 'from'; () =>
          // Array[K]` can never dispatch Array.of). prefer the reaching value so the dead init does not
          // become the primary key; fall through to the init when no such value is determinable
          const target = reachingValueOverDeadInit({ binding: entry.binding, adapter, path, scope, usageNode }) || entry.node;
          node = usageNode = target;
          ({ seen } = entry);
          scope = entry.ctx.scope;
          depth += 1;
          continue;
        }
      } else if (!seen?.has(node.name)) {
        // the alias-follow bailed on a reassignment (declarator init dead at the use). resolve the key
        // from the value the use actually sees - the reaching definition (`K = 'of'` in
        // `let K = 'from'; K = 'of'; Array[K]()`) when it is unambiguous. null when flow-dependent
        const binding = adapter.getBinding(scope, node.name, path);
        const reaching = binding && isReassignedBeyondDeclarator(binding)
          ? reachingReassignmentValueNode({
            binding, usagePath: path, ctx: { scope, adapter, path, resolveKey }, usageNode,
            requireSingleObservation: adapter.method === 'usage-pure',
          }) : null;
        if (reaching) {
          // extend the cycle-guard set BEFORE overwriting `node` - it reads the current name
          seen = new Set(seen).add(node.name);
          node = reaching;
          depth += 1;
          usageNode = reaching;
          continue;
        }
      }
    }
    // string concatenation: 'a' + 'b'
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      // fork `seen` per branch so `a + a` (same binding both sides) doesn't mis-trigger the
      // cycle guard on the right branch after the left added `a` to the shared Set
      const left = resolveKey({
        node: node.left, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1, usageNode, bailOnSideEffectKey,
      });
      const right = resolveKey({
        node: node.right, computed: true, scope, adapter, seen: new Set(seen), path, depth: depth + 1, usageNode, bailOnSideEffectKey,
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
        path, depth: depth + 1, usageNode, bailOnSideEffectKey,
      });
      if (name && !name.startsWith('Symbol.')) return `Symbol.${ name }`;
    }
    return null;
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
  const lookupKey = node.computed
    ? resolveKey({ node: node.key, computed: true, scope, adapter, path })
    : plainSynthKeyName(node.key);
  return { lookupKey, slotKey };
}

// bare unbound `Symbol` / capitalised const-alias (`const Sym = Symbol`) /
// proxy-global access (`globalThis.Symbol`, `self.window.Symbol`). lowercase idents skip
// the const-chain walk - `Symbol` aliases are capitalised by convention.
// `seen` threaded through so callers caught in a cyclic const-alias chain
// (`const a = b.Symbol; const b = a;`) don't restart the cycle guard
function resolvesToGlobalSymbol({ node, scope, adapter, seen, path }) {
  // a SLOT-mutated `Symbol` (`globalThis.Symbol = Fake`) is the user's replacement: its keys
  // are not the well-known symbols, so recognition bails and the key stays a raw member read
  // (the bare `Symbol` identifier then re-routes through the global-object binding)
  if (isMutatedGlobalSlot(adapter, 'Symbol')) return false;
  if (node.type === 'Identifier') {
    if (node.name === 'Symbol') return !adapter.hasBinding(scope, 'Symbol', path);
    // the capitalisation probe bounds the const-alias walk for USER names only - a binding this
    // plugin minted in place (`Symbol` -> `_Symbol`) carries its original global in the
    // `polyfillHint` side-channel and is NOT capitalised, so the hint is asked first: gating it
    // behind the convention makes the plugin fail to recognise its own rewrite
    if (!CAPITALISED_IDENT.test(node.name) && !bindingPolyfillHint({
      binding: adapter.getBinding(scope, node.name, path), scope, name: node.name, adapter,
    })) return false;
    return resolveBindingToGlobal({ name: node.name, scope, adapter, seen, path }) === 'Symbol';
  }
  return globalProxyMemberName({ node, scope, adapter, path }) === 'Symbol';
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
    : prop.property?.type === 'Identifier' ? prop.property.name : null;
  return typeof name === 'string' && name ? name : null;
}

// preserve pre-unwrap node so callers can seed both forms into handledObjects;
// Set dedup absorbs the duplicate when raw === unwrapped
export function asSymbolRef({ node, scope, adapter, seen, path }) {
  const unwrapped = unwrapTransparentSeq(node);
  return unwrapped && resolvesToGlobalSymbol({ node: unwrapped, scope, adapter, seen, path })
    ? { raw: node, unwrapped } : null;
}

// `var X = X` - hoisted var init references its own name, which at runtime reads the
// outer (global) scope before the local is assigned. Factory wraps a per-binding cache
// because the usage transform mutates `init.name` (X -> _X) after the first visit, so a
// non-cached recheck on later references would miss the invariant.
// `getKind` varies by adapter: babel has `binding.kind`, estree-toolkit reads `kind` off
// the parent VariableDeclaration.
// intentionally `var`-only: `let`/`const` self-ref (`let X = X`) hits the TDZ at runtime,
// so plugin shouldn't invent a global mapping. the duplicated shape in `resolveBindingToGlobal`
// for any kind exists because that code path handles the already-mutated binding (post-rewrite
// shape) and needs to resolve through it regardless of kind.
// constantViolations check: `var X = X; X = mock; X.method()` reassigns the binding before
// the use site, so subsequent reads MUST not be rewritten to the polyfill - mock would be
// silently ignored. without the check `Promise.try` after `var Promise = Promise; Promise = mock`
// would rewrite to `_Promise.try`, dropping the user's reassignment.
// usage-global is injection-only on this shape (the self-ref binding is never rewritten -
// side-effect import only), so a NON-dominating reassignment keeps the pristine global
// reachable on some path and only a DOMINATING violation suppresses the injection - the
// method-aware dominance gate mirrors every other reassignment read in this file. the flat
// bail stays for usage-pure (init rewrite - any reaching write is unsafe) and for
// method-less adapters (entry / narrowing) that pass no adapter
export function createSelfRefVarGuard(getKind, adapter = null) {
  const cache = new WeakMap();
  return function isSelfRefVarBinding(binding, path = null) {
    if (!binding) return false;
    if (binding.constantViolations?.length) {
      if (adapter?.method !== 'usage-global' || !path) return false;
      if (reassignBailApplies({ binding, adapter, path })) return false;
    }
    const decl = binding.path?.node ?? binding.node;
    if (!decl || decl.type !== 'VariableDeclarator') return false;
    if (cache.has(decl)) return cache.get(decl);
    const { id, init } = decl;
    // oxc preserves `ParenthesizedExpression` while babel strips them - peel so
    // `var Promise = (Promise)` matches the self-ref shape in both parsers
    const peeled = unwrapTransparentSeq(init);
    const result = getKind(binding) === 'var'
      && id?.type === 'Identifier'
      && peeled?.type === 'Identifier'
      && peeled.name === id.name
      // a self-ref re-run by a loop reads the local (undefined on iteration 1), so it must NOT map
      // to the global there. babel's native binding flags this via constantViolations (bailed
      // above); estree-toolkit's doesn't, so check the declarator's loop nesting to keep parity
      && !(binding.path && isVarDeclaratorInLoopRerun(binding.path, id.name));
    cache.set(decl, result);
    return result;
  };
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
export function proxyNavSpellsClaimPure({ navigated }) {
  return !navigated;
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
    // resolve the hop key the SAME way the usage resolver does. with an alias context, `resolveKey`
    // is binding-aware: a const-alias computed hop (`const k='self'; globalThis[k].X`) resolves like
    // the dotted (`globalThis.self`) and computed-literal (`globalThis['self']`) forms, so the collapse
    // drops it too - `_globalThis.X`, not `_globalThis[k].X` which reads an undefined key off-engine. a
    // side-effecting key bails (left uncollapsed) since dropping the hop would drop its effect - UNLESS the
    // caller opts in via `allowSideEffectKeys` (the hop-collapse driver does, because it routes the collapse
    // through the call-rooted plan that HARVESTS the dropped key SE). node-only callers (no aliasCtx) keep
    // literal-only `memberKeyName`, byte-identical to the prior behavior
    const key = aliasCtx
      ? resolveKey({ node: member.property, computed: member.computed, bailOnSideEffectKey: !allowSideEffectKeys, ...aliasCtx })
      : memberKeyName(member);
    // a mutated hop slot (`window.self = fake`) is the user's redirection - collapsing the hop
    // away would silently read the pristine global instead of the replacement
    if (key && isPristineProxyGlobal(aliasCtx?.adapter, key)) prefix = member;
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
function sealedLayerBetween(rawObj, object) {
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
// the peeled inner nav. probe/render callers need both - the member's KEY spells the read the
// source performs on the sealed value (the throw the erase must reproduce)
export function sealedChainBoundary(node) {
  let cur = peelReceiverSequenceTail(node);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const object = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object));
    // an OPTIONAL consumer performs no read of the sealed value - its short-circuit IS the guard's
    // void-0 branch, the same exemption `chainReadsThroughSeal` spells. the throw probes on both
    // legs are this function's only callers, and reproducing a read the source never performs made
    // the polyfilled output throw off-window where the source answers `undefined`
    if (!cur.optional && sealedLayerBetween(cur.object, object)) return { member: cur, inner: object };
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
// [(e++, 'window')]` - a native `self` read where its ponyfill is the point); the hops below the
// probe are resolvable by construction, so the deepest of them supplies the base. the price is
// deliberate and owner-decided: that base is always defined, so a host missing `self` gets the
// guard's `void 0` where the source threw. null keeps the source slice - no resolvable hop below
// the probe, a computed probe key, or a key effect the slice evaluates.
// a PLAIN probe hop over a resolvable one no longer reaches here at all: the plan folds it onto
// that ponyfill (the realm-hop canon), so what still asks is a COMPUTED probe key
export function navGuardTestBase(plan) {
  const idx = plan.lastUnresolvableIdx;
  const below = idx > 0 ? plan.hops[idx - 1] : null;
  // the base is the point: without it the test reads `_globalThis.self` off the ponyfill, undefined
  // in exactly the realms the polyfill exists for. what the prefix DID on the way (a write, a
  // sequence, an effect-bearing call) is the caller's to spell ahead of it - `rootAssign` and the
  // rest travel on the plan for exactly that
  if (!below || plan.testKeySeCount || plan.hops[idx].computed) return null;
  const basePure = plan.resolvePure({ kind: 'global', name: below.name });
  return basePure ? { basePure, probeName: plan.hops[idx].name } : null;
}

// which side of a sealed throw probe an effect rides: source order decides, and the probe RENDERS
// the nav, so an effect written BEFORE it (`((c++, nav)).Array.of(1)`) runs before the read the
// probe reproduces. both emitters split their residual effects on this one rule. the boundary is
// `sideEffectsPastOffset` - asked once and complemented, so the halves stay EXHAUSTIVE: consumers
// splice them as the whole effect list, and an offset that helper declines (a synthetic node has
// no `start`) must leave every effect ahead of the probe, never drop it
export function partitionEffectsAtProbe(effects, navStart) {
  const after = sideEffectsPastOffset(navStart, effects);
  const past = new Set(after);
  return { ahead: effects.filter(effect => !past.has(effect)), after };
}

// the guarded VALUE of a sealed nav that ENDS AT a claim, as a decision both emitters render their
// own way: the nav plan has no ponyfillable hop leaf to build a guard from there, so the erase
// verdict names the `?.` object to test and the claim's own leaf supplies the always-defined
// alternate. `leafPure` when core-js ponyfills that leaf as a constructor; otherwise `leafName` -
// the source's own global name, which IS that value (the probe reads a property off it exactly as
// written, and the claim beside it still carries the polyfill). null when no single `?.` expresses
// the short-circuit, or the leaf is neither ponyfilled nor a plain name
export function sealedClaimLeafGuardPlan(nav, resolvePure, aliasCtx = null, { probeLeaf = false } = {}) {
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
  const leafPure = proxyGlobalMemberCtorPure({ receiver: nav, aliasCtx, resolvePure });
  if (leafPure) return { guardObject: verdict.object, leafPure, leafName: null };
  const leafName = staticMemberKeyName(nav);
  return leafName ? { guardObject: verdict.object, leafPure: null, leafName } : null;
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
export function navValueCanShortCircuit(navNode, resolvePure, aliasCtx = null,
  { throughChainAssign = false, observableRead = false } = {}) {
  let cur = unwrapRuntimeExpr(peelReceiverSequenceTail(navNode));
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const raw = peelReceiverSequenceTail(cur.object);
    const object = unwrapRuntimeExpr(raw);
    if (cur.optional) {
      if (isCallShape(object)) return callValueCanBeUndefined(object, aliasCtx, resolvePure);
      // the object's own VALUE decides, not "some unresolvable hop stands below it": a DEEPER
      // unbacked hop is a realm self-reference the collapse assumption defines (`globalThis.window
      // .self` IS the realm), and only the value canon says so - asked by hop presence, this arm
      // built a probe guard over a read that cannot be absent, and the run kept hops its plain twin
      // folds. the value canon's own two shapes (the FIRST hop off the root, a live `?.` under it)
      // are exactly the branch this render owes
      // `throughChainAssign`: a write under the `?.` STORES the nav and hands the same value on
      // (`(q = globalThis.window)?.self`). only a caller asking about the VALUE reads through it -
      // the default verdict keeps the write opaque, because the emit channels key their routing on
      // it and flipping that globally strands a raw root in a guard memo
      if (proxyReceiverValueCanBeUndefined(throughChainAssign
        ? peelChainAssignment(object).value ?? object : object, resolvePure, aliasCtx,
      { throughChainAssign, observableRead })) return true;
      // an alias HOLDING a value that can be absent (`const w = globalThis.window; w?.Array`)
      // short-circuits like the value it hides
      if (object?.type === 'Identifier'
        && aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx)) return true;
    }
    // a PARENTHESIZED layer (source parens or a paren'd cast - `(nav).X`, `(nav as any).X`) stops
    // the OUTER chain's short-circuit but not this walk: what the seal HIDES is the question, and a
    // live `?.` under one still short-circuits the value the read above observes. a seal over a
    // PLAIN nav hides no such thing - that nav is the proxy global it navigates (`globalThis`,
    // `self` and `window` are one object), so it collapses like its unsealed twin instead of keeping
    // a `window` read off the PONYFILL, undefined in the realms the polyfill exists for. what a seal
    // OWES its consumers is `chainSealsAShortCircuit`, built on this verdict
    cur = object;
  }
  return false;
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
  const hop = staticMemberKeyName(core);
  if (!proxyHopLacksPureEntry(hop, resolvePure)) return false;
  const rootRaw = unwrapRuntimeExpr(peelReceiverSequenceTail(core.object));
  // the chain-root peel to FIXPOINT: a write storing an effect-prefixed root is the shape it
  // exists for (`(held = (n++, globalThis)).window`) - the one-step assign peel stops at that
  // sequence and reads no root, calling a load-bearing probe always-defined
  let rootObj = unwrapRuntimeExpr(peelChainRootValue(rootRaw) ?? rootRaw);
  // only an OBSERVABLE read (a kept write, a seal - the caller proves it) may treat a proxy
  // SPINE below the probe hop as one surface (`(v = globalThis.self.window)`: the probe reads
  // off `globalThis.self`); a PLAIN multi-hop nav collapses whole and its `?.` deopts instead
  if (observableRead) {
    while (rootObj?.type === 'MemberExpression' || rootObj?.type === 'OptionalMemberExpression') {
      const hopName = staticMemberKeyName(rootObj);
      if (!hopName || !POSSIBLE_GLOBAL_OBJECTS.has(hopName)) break;
      // ... and a hop the pure build CAN back ENDS the walk: the plan folds the unbacked hops above
      // such a hop onto its ponyfill, so what the read observes is that ponyfill and no `?.` is owed
      // (`(v = globalThis.self.window)?.Map` observes `_self`). only a spine with no backed hop
      // under the probe is the environment read this peel was written for
      if (!proxyHopLacksPureEntry(hopName, resolvePure)) return false;
      rootObj = unwrapRuntimeExpr(peelReceiverSequenceTail(rootObj.object));
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
    && !proxyReceiverValueCanBeUndefined(node, resolvePure, aliasCtx);
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

// how many TAIL steps above a guard render ride INSIDE its alternate, the one rule every guard
// channel of both emitters counts with. steps run leaf-outwards, each `{ optional, isCall,
// foreign }`; `definedAtLeaf` says whether the rendered value is provably defined (a ponyfill
// leaf with no unresolvable hop of its own). a live `?.` over a value that CAN be absent guards
// it and stays outside; a CALL only comes along behind a member (an optional call straight on
// the render owns its own guard); a FOREIGN step is another channel's claim and ends the run.
// past the first member the value is whatever that unponyfilled name holds - not provably
// defined - so only plain steps keep pulling
export function guardTailPullCount(steps, definedAtLeaf) {
  let defined = definedAtLeaf;
  // a pulled OPTIONAL CALL keeps its `?.(` inside the alternate, which re-opens the chain there:
  // every step above it must stay in that chain, or the printer ends it and the source's
  // short-circuit turns into a read off `undefined`
  let inChain = false;
  // while every step so far was PLAIN the folded value is a straight continuation of the LEAF,
  // so the first live `?.` above it still rides inside the alternate; once a step carried its
  // own `?.` - or the render already ended in a hop of its own - the value can be absent and
  // the next guard belongs outside
  let allPlain = definedAtLeaf;
  let taken = 0;
  for (const step of steps) {
    if (step.foreign) break;
    if (step.isCall) {
      if (!taken) break;
    } else if (step.optional && !defined && !inChain && !allPlain) break;
    taken += 1;
    inChain ||= step.isCall && step.optional;
    if (!step.isCall) {
      defined = false;
      allPlain &&= !step.optional;
    }
  }
  return taken;
}

// THE vestigial-`?.` verdict of a proxy nav, shared by every guard render of both emitters:
// an optional whose RECEIVER cannot be undefined is dead text (a proven inline-call root, a
// pristine global, a hop below the first unresolvable one) and the renders drop it; over a
// value that genuinely short-circuits the optional is LOAD-BEARING and survives - stripping
// it throws where the source yields undefined. returns the nav nodes whose own `?.` is dead
export function vestigialNavOptionals(navNode, resolvePure, aliasCtx = null) {
  const dead = [];
  for (let cur = navNode; cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(cur.object)) {
    const object = unwrapRuntimeExpr(cur.object);
    // a KEPT WRITE holds its VALUE, and the write makes the read observable - a proxy
    // spine below the probe hop counts as one surface (`(w = globalThis.window)?.X`
    // keeps its guard, `(w = globalThis)?.X` is dead)
    // a SEQUENCE hands its tail on, so a store standing there is the value this `?.` reads
    // (`(eff(), t = globalThis.window)?.self` guards the probe the write kept)
    const value = peelChainAssignmentDeep(peelReceiverSequenceTail(object));
    const undefinable = isCallShape(value)
      ? callValueCanBeUndefined(value, aliasCtx, resolvePure)
      : proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx,
        value === object ? undefined : { observableRead: true });
    if (cur.optional && !undefinable) dead.push(cur);
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
// PRISTINE, because a slot the source itself wrote holds the user's own object; and never a
// COMPUTED key, whose effects would fold away with it. the positional half - which hops stand over
// a ponyfill - belongs to the caller: the nav plan for a planned collapse, the emitters' own tail
// walks for the hops a plan does not reach
export function foldableRealmHopKey(key, { adapter, resolvePure }) {
  return proxyHopLacksPureEntry(key, resolvePure) && isPristineProxyGlobal(adapter, key);
}

// the node-shaped ask of the same verdict: a plain member key only - the computed-key refusal
// lives here, where the KEY form has no node to refuse on
export function foldableRealmHop(node, ctx) {
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return false;
  return !node.computed && foldableRealmHopKey(staticMemberKeyName(node), ctx);
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
      // source's own lowered spelling) is an environment probe: the below-probe collapse
      // owns it (the owner-decided price - `undefined` where the raw read throws)
      if (up.node.type === 'BinaryExpression' && (up.node.operator === '==' || up.node.operator === '!=')
        && [up.node.left, up.node.right].some(isNullLiteralNode)) return false;
      break;
    }
    // a LIVE `?.` anywhere in the run is the source's own environment probe - the guarded
    // collapse channel owns that spine, and its test folds the probe onto the ponyfill
    if (up.node.optional) return false;
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
// the swap lands and nothing above folds it. a STORE is the other half: the value it hands on IS the
// realm object, so the run folds there - unless it carries an effect the folded value has no slot
// for (the line the `delete` fold takes too), and unless a CONSUMER reads through the store, whose
// read owns the value whatever the run carries. `effects` is the claim's own harvest, where a hop's
// key effects reach this question - the run's own spelling carries the rest
export function probeRunIsTheSourceValue(path, { resolvePure, effects = null }) {
  // off the claim's OWN member: a bare root claim navigates nothing, so no run of its own stands
  // over it - the walk below would answer for a nav the claim is only the base of
  if (!isMemberAccessNode(path.node) || !unbackedTailRidesAbove(path, resolvePure)) return false;
  const store = storedUserAssignmentOf(path);
  if (!store) return true;
  if (storedValueConsumedAbove(path)) return false;
  return !!effects?.length || !!collectFoldedReceiverSideEffects(store.right).length;
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
    if (deleted) {
      if (up.parentPath?.node?.type === 'UnaryExpression' && up.parentPath.node.operator === 'delete') break;
      // a LOWERED guard scaffold's null test READS the run it memoizes (`null == (_ref = _globalThis
      // .window) ? void 0 : _ref.x`): the source's `?.` survived the lowering as that test, so
      // dropping the hop answers the probe instead of running it
      const memo = up.parentPath?.node;
      const test = up.parentPath?.parentPath?.node;
      if (memo && test?.type === 'BinaryExpression' && chainValueCarrier(memo, node)
        && chainValueCarrier(test, memo)) return null;
      // a realm hop the run cannot drop - a live `?.` whose short-circuit decides whether the delete
      // happens, a computed key whose effects would go with it, a MUTATED slot holding the user's own
      // object - deopts the run WHOLE: the hops below it drop only together with the read above them,
      // and dropping the base out from under a kept hop rewrites what that hop reads off
      if (node.computed || node.optional
        || !isPristineProxyGlobal(ctx.adapter, staticMemberKeyName(node))) {
        return memberProxyHopName(node) || node.computed || node.optional ? null : fold;
      }
    } else if (!foldableRealmHop(node, ctx)) {
      // a MUTATED slot holds the user's own object, and the read flavor owes the same verdict the
      // delete flavor gives it: the run deopts WHOLE. the hops BELOW such a hop fold only together
      // with the read above them, so folding them out leaves the kept hop reading off a base the
      // source never wrote. every OTHER reason a hop does not fold is positional - a backed hop
      // ends the run without undoing what is already folded
      if (!node.computed && memberProxyHopName(node)
        && !isPristineProxyGlobal(ctx.adapter, staticMemberKeyName(node))) return null;
      // a STRING-LITERAL computed key is the dotted hop in disguise - same name, nothing else
      // observed - but only where something READS THROUGH it: standing terminal it is the probe the
      // source asked for and keeps its slot, which is why the key question alone cannot answer here
      const literalHop = node.computed && !mayHaveSideEffects(node.property)
        && foldableRealmHopKey(staticMemberKeyName(node), ctx);
      const readThrough = !!up.parentPath?.node && isMemberAccessNode(up.parentPath.node)
        && unwrapRuntimeExpr(up.parentPath.node.object) === node;
      if (!literalHop || !readThrough) break;
    }
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
// `staticMemberKeyName` folds a SE-bearing computed hop key (`globalThis[(e++, 'window')]`) so it is
// detected
export function navHasUnresolvableProxyHop(navNode, resolvePure) {
  let cur = peelReceiverSequenceTail(navNode);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const hop = staticMemberKeyName(cur);
    if (proxyHopLacksPureEntry(hop, resolvePure)) return true;
    cur = peelReceiverSequenceTail(cur.object);
  }
  return false;
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
// returns the call node when it carries effects, null otherwise - callers either harvest it for
// re-emission or bail the discard entirely
export function seBearingChainRootCall({ node, scope, adapter, path }) {
  // a TAGGED TEMPLATE invokes its tag with the quasi's expressions - a call in every way that
  // matters to a discard, and one no callee resolution reaches through, so it never erases
  const { root } = descendToChainRoot(node);
  if (root?.type === 'TaggedTemplateExpression') return root;
  const rootCall = findChainRootCallExpression(node);
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
// routing it through here would double-rescue
export function discardRescueNodes({ node, scope, adapter, path }) {
  const rootCall = seBearingChainRootCall({ node, scope, adapter, path });
  return collectFoldedReceiverSideEffects(node, [], rootCall ? new Set([rootCall]) : null);
}

// `resolveKey` can fold StringLiteral / TemplateLiteral / `+` concat to the string
// `'Symbol.X'`, but none of those are the well-known symbol. this predicate rejects
// string-sourced keys so `'Symbol.iterator' in Array` isn't miscategorised as an
// is-iterable check. parallel to resolveKey's Identifier / MemberExpression branches
// minus the string-folding cases
export function isSymbolSourcedKey({ node, scope, adapter, seen, path, depth = 0 }) {
  while (true) {
    if (depth > MAX_KEY_DEPTH) return false;
    node = unwrapTransparentSeq(node);
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
    const entry = enterIdentifierBindingFollow({ node, seen, ctx: { scope, adapter, path } });
    if (!entry) return false;
    // a registered Symbol.X alias resolves regardless of the binding's init (`const { iterator } =
    // Symbol; iterator in X`) - run before the init branch, which would follow the destructure init
    // to the whole receiver and lose the `.iterator` slot
    if (bindingSymbolKey(entry.binding, adapter.packages) !== null) return true;
    // alias indirection (`const k = Symbol.iterator; k in X`) else plugin-managed binding
    // (`polyfillHint` in-place mutation / real `core-js/.../symbol/X` import, incl.
    // user-aliased polyfill packages from `additionalPackages`)
    if (entry.node) {
      ({ node, seen } = entry);
      scope = entry.ctx.scope;
      depth += 1;
      continue;
    }
    return false;
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
export function isAliasProxyHopChain(node, aliasCtx, allowSideEffectKeys = false) {
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
    // `allowSideEffectKeys`: recognize a SE-bearing hop key too (`g[(eff(), 'self')].X`); the collapse driver
    // this gates now harvests the dropped key SE, so the hop is collapsible, not a forced bail
    const hopName = computed
      ? resolveKey({ node: key, computed: true, bailOnSideEffectKey: !allowSideEffectKeys, ...aliasCtx })
      : key?.type === 'Identifier' && key.name;
    if (hopName && POSSIBLE_GLOBAL_OBJECTS.has(hopName)) hasProxyHopKey = true;
    if (peelChainAssignment(peelReceiverSequenceTail(cur.object)).outer) throughStore = true;
    cur = peelChainRootValue(cur.object);
  }
  if (!hasProxyHopKey || cur?.type !== 'Identifier') return false;
  return isAliasProxyRoot(cur, aliasCtx)
    || (throughStore && POSSIBLE_GLOBAL_OBJECTS.has(cur.name)
      && !aliasCtx.adapter?.hasBinding?.(aliasCtx.scope, cur.name, aliasCtx.path));
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
