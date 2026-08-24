// AST-pattern resolvers shared across detect-usage submodules. covers the core walk
// primitives (`unwrapTransparentSeq`, `unwrapParensCollectingEffects`, `isStaticPlacement`),
// binding-to-global resolution (`resolveBindingToGlobal` and friends), and the high-level
// resolvers used by callers (`resolveKey`, `resolveObjectName`, `patternBindingName`,
// `findProxyGlobal`, `createSelfRefVarGuard`). also hosts Symbol-ref helpers
// (`resolvesToGlobalSymbol`, `asSymbolRef`) consumed by the members submodule
import { entryToGlobalHint, resolve as resolveBuiltInMeta } from '../index.js';
import {
  assignmentAliasHintSoundAtRead,
  bindingPolyfillHint,
  isAliasProxyRoot, globalProxyMemberName, isProxyGlobalIdentifierNode, memberKeyName,
  symbolKeyToEntry,
  proxyGlobalRootName,
  trustedIdentifierAliasWrite,
} from '../helpers/class-walk.js';
import {
  pureImportEntryOf,
  asProxyGlobalName,
  bindsModuleDefault,
  globalProxyNameFromImportSource,
  importSourceMatchesUserPackage,
  importBindingIsTypeOnly,
  tsImportEqualsProxyName,
  tsImportEqualsRequireSource,
  isTopLevelThisContext,
  collectFoldedReceiverSideEffects,
  isDirectiveStatement,
  IMPORT_SPECIFIER_TYPES,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  isReassignedBeyondDeclarator,
  isValidIdentifierName,
  isVarDeclaratorInLoopRerun,
  kebabToCamel,
  aliasReadGuardedAgainstNullish,
  definedBranchOfGuardConditional,
  isRenderedStoredValue,
  isUndefinedNode,
  mayHaveSideEffects,
  memberProxyHopName,
  paramReboundInBody,
  patternSlotHasDefault,
  patternSlotSpreadShifted,
  patternSlotValues,
  unwrapParens,
  unwrapRuntimeExpr,
  peelSequenceTail,
  peelZeroArgIifeReturn,
  pureCtorNameFromImportSource,
  reachingReassignmentValueNode,
  reassignBailApplies,
  reassignmentBlocksGlobalResolve,
  reassignmentValueNodes,
  sequencePrefixWithSideEffects,
  singleQuasiString,
  singleReturnBodyExpression,
  spreadAtOrBefore,
  staticMemberKeyName,
  plainSynthKeyName,
  synthSwapPropKey,
  SKIPPABLE_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  identifierReferencedInSubtree,
  varInitDominatesUsage,
  zeroArgIifeSideEffectFree,
  POSSIBLE_GLOBAL_OBJECTS,
  deleteHostAboveChain,
} from '../helpers/ast-patterns.js';
import { nodeRangeContains } from '../resolve-node-type/ast-shapes.js';
import { SYMBOL_STATIC_KEYS } from './globals.js';

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains.
// exported so cohort recursive walkers (`isSymbolSourcedKey` in members.js) share the bound
export const MAX_KEY_DEPTH = 64;

// transparent expression wrappers (paren / optional-chain / TS) - single-sourced from the canon
export function isTransparentWrapper(node) {
  return SKIPPABLE_WRAPPER_TYPES.has(node.type);
}

// SequenceExpression bail mode: stop unwrapping when preceding elements carry side effects.
// caller can't preserve them (inner resolveKey recursion, handleBinaryIn) - keep sequence intact
export function unwrapTransparentSeq(node) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      const preceding = node.expressions.slice(0, -1);
      if (preceding.some(mayHaveSideEffects)) break;
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

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
// `replaceInstanceLike` (mutates path.node.object before extractCheck) and unplugin emitter's
// `addInstanceTransform` (passes peeled node to resolveReceiverSource). idempotent for non-
// SE / non-wrapped receivers
export function peelReceiverSequenceTail(node) {
  while (node && (isTransparentWrapper(node)
    || (node.type === 'SequenceExpression' && node.expressions?.length))) {
    node = node.type === 'SequenceExpression' ? node.expressions.at(-1) : node.expression;
  }
  return node;
}

// the sequence prefixes the hop OBJECTS of a sealed nav carry, in source-eval order. the guard
// render unwraps them transparently, so the probe re-spells them ahead of itself - but only the
// ones the render does not already re-emit from source, which is why the caller hands its own
// rendered spans in. both emitters walk the same hops; the render shape is all that differs
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
export function sideEffectsPastOffset(offset, sideEffects) {
  if (!sideEffects?.length || typeof offset !== 'number') return [];
  return sideEffects.filter(effect => effect.start >= offset);
}

// peel chain-assignment `=` chain, returning the rhs-most non-assignment node + the
// outermost assignment (evaluating it covers every nested `=` step in source). used by
// static-method dispatch to recover the actual constructor identifier from a receiver like
// `(a = Array)` / `(a = b = Array)` and to re-emit the assignment as a side effect.
// instance dispatch captures it via the `_ref = (a = Array)` memoize shape so doesn't need
// this. handles nested-with-parens shapes (`(a = (b = Array))`) by alternating paren/assign
// peel internally - safe regardless of caller's pre-unwrap, robust to babel's
// `createParenthesizedExpressions: true` option. returns null `outer` when input isn't a
// chain-assign shape
export function peelChainAssignment(node) {
  const peeled = unwrapTransparentSeq(node);
  if (peeled?.type !== 'AssignmentExpression' || peeled.operator !== '=') return { value: peeled, outer: null };
  let cur = peeled.right;
  // alternate paren-peel + chain-assign-descend to fixpoint; covers `(a = (b = X))` and
  // multi-layer paren wraps around inner `=`
  for (;;) {
    cur = unwrapTransparentSeq(cur);
    if (cur?.type !== 'AssignmentExpression' || cur.operator !== '=') break;
    cur = cur.right;
  }
  return { value: cur, outer: peeled };
}

// back-compat alias: `peelChainAssignment` already does the alternating peel internally,
// so deep-walking just extracts the value field. preserves the legacy two-function API
// for external callers
export function peelChainAssignmentDeep(node) {
  return peelChainAssignment(node).value;
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
  let start = node;
  while (start?.type === 'ParenthesizedExpression' || start?.type === 'ChainExpression') start = start.expression;
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
  if (sealedAt || root?.type !== 'Identifier' || !bareProxyGlobalAliasName(root, aliasCtx)) return null;
  let found = null;
  for (const hop of hopsInfo) {
    if (!hop.name || (POSSIBLE_GLOBAL_OBJECTS.has(hop.name) && !resolvePure({ kind: 'global', name: hop.name }))) {
      found = { name: hop.name ?? '<opaque>', node: hop.node };
    }
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

export function undefinableOptionalGuard(memberNode, resolvePure, aliasCtx = null) {
  if (!memberNode || !resolvePure) return { kind: 'erase' };
  // the deleted member is never READ, so nothing over the navigation below it is load-bearing and the
  // whole thing erases. asked HERE because every channel that builds a guard asks this verdict - spelled
  // at the call sites instead, the two emitters answered the same source differently per claim kind. an
  // ALREADY-LOWERED input carries no `?.` for this to reach, and the pre / post legs then answer
  // differently - the second-pass class the area's AGENTS.md records
  if (aliasCtx?.path && deleteHostAboveChain(aliasCtx.path, memberNode, unwrapRuntimeExpr)) return { kind: 'erase' };
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
  const undefinable = [],
        provenSources = new Map(),
        // objects of one chain share the root - prove the inline call once per verdict
        provenRootCache = new Map();
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
    // of `dw()?.window?.self` guard as ONE test on the window hop (the AST emitter's shape)
    if (aliasCtx) {
      const { hopsInfo, root: walkedRoot, depth, sealedAt, crossedAssign } = walkGuardSourceHops(value, aliasCtx, resolvePure);
      let root = walkedRoot;
      // a chain-assign wrapper at the bottom peels for the proof - the write is an emit concern
      if (root) root = peelChainAssignment(root).value;
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
        // hop names look (the AST emitter reaches the same verdict on its post-deopt tree).
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
        const [key] = [...sourceNames];
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
// `helpers/ast-patterns.js` (the class-walk follow needs them below this module's layer);
// re-exported here so the destructure consumers keep their import path
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
// the other init shapes stay with their own channels
export function probedDestructureInitValue(initNode, resolvePure, aliasCtx) {
  let value = initNode;
  for (let guard = 0; guard < 8; guard++) {
    const core = unwrapRuntimeExpr(peelReceiverSequenceTail(value));
    if (core?.type !== 'LogicalExpression' || core.operator === '&&') break;
    if (proxyReceiverValueCanBeUndefined(core.left, resolvePure, aliasCtx)
      && !chainSealsAShortCircuit(core.left, resolvePure, aliasCtx)) return null;
    value = core.left;
  }
  return proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx) ? value : null;
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
  if (member?.type !== 'MemberExpression' && member?.type !== 'OptionalMemberExpression') return null;
  if (member.optional) return null;
  const objectRaw = peelReceiverSequenceTail(member.object);
  const object = unwrapRuntimeExpr(objectRaw);
  if (object?.type !== 'Identifier') return null;
  const key = memberKeyName(member);
  if (key === null) return null;
  if (!aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx)) return null;
  return { object, key, computed: member.computed, navStart: objectRaw.start ?? member.object.start ?? null };
}

// the VALUE canon asked THROUGH an Identifier alias: follow the binding to what it holds and
// ask `proxyReceiverValueCanBeUndefined` of THAT. distinct from the hop-based alias walk
// (`undefinableProxyRootValue`): an all-plain held nav stays the declared environment under
// the proxy-collapse assumption, so only a held value the VALUE canon calls absent-able
// counts - the wider hop-based answer belongs to the alias's own `?.`, not to its value
export function aliasHeldValueCanBeUndefined(object, resolvePure, aliasCtx) {
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
  const bindingNode = binding?.node ?? binding?.path?.node;
  let held = bindingNode?.type === 'VariableDeclarator' ? bindingNode.init : null;
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
const CAPITALISED_IDENT = /^[A-Z]\w*$/;
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
// imports FROM, so the canon cannot sit here without a cycle
export {
  bindsModuleDefault, globalProxyNameFromImportSource, isTypeOnlyImportKind, pureCtorNameFromImportSource,
  tsImportEqualsProxyName, tsImportEqualsRequireSource,
} from '../helpers/ast-patterns.js';

// shared Identifier-binding gate for key-resolution walks: cycle guard via `seen`, fork
// before recurse, reject reassigned bindings. precomputes `VariableDeclarator` init for
// the common "follow alias" step so callsites converge on `entry.init ? recurse : fallback`.
// returns `{ binding, init, nextSeen }` on success, null on miss
export function enterIdentifierBindingFollow({ node, scope, adapter, seen, path = null, usageNode = null }) {
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
  // the returned scope anchors the NEXT hop: the init's identifiers resolve in the alias's OWN
  // declaration scope, not the use scope - a use-site shadow of an init name (`const k = j;
  // function f(j) { obj[k] }`) must not swallow the module-level value the alias actually holds
  return { binding, init, nextSeen, scope: binding.scope ?? scope };
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
    ?? (binding.node?.type === 'VariableDeclarator' ? requireCallSource(binding.node.init, adapter, binding.scope ?? scope) : null)
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
// `require` (looked up via `scope` / `adapter`) is ignored. the ONE require-source canon:
// entry detection / existing-import scan (entries.js) and the proxy-import recognition
// branches below all read through it
export function requireCallSource(node, adapter, scope) {
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
  if (scope && adapter?.hasBinding?.(scope, 'require')) return null;
  return extractStaticString(node.arguments[0], adapter);
}

// `_interopRequireDefault(require('<pkg>/<mode>/global-this'))` call -> the proxy name its
// `.default` member carries, or null
function interopCallProxySource({ callNode, scope, adapter, path = null }) {
  if (callNode?.type !== 'CallExpression' || callNode.arguments?.length !== 1
    || !isInteropDefaultCallee(callNode.callee, scope, adapter, path)) return null;
  const required = requireCallSource(callNode.arguments[0], adapter, scope);
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
      lookupScope = binding.scope ?? lookupScope;
      ({ name } = init);
      continue;
    }
    return interopCallProxySource({ callNode: init, scope: binding.scope ?? lookupScope, adapter, path });
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
  const required = init && requireCallSource(init, adapter, binding.scope ?? scope);
  return required ? globalProxyNameFromImportSource(required, adapter.packages) : null;
}

// `path` (optional) - an AST path inside the lookup site so the adapter can anchor TS-runtime
// shadow detection at a deeper scope than `scope.path`. estree-toolkit's scope tracker doesn't
// register StaticBlock as its own scope owner, so a member visit `Map.Foo` inside
// `static { enum Map {} ... }` lands at the enclosing ClassDeclaration scope; without path,
// `findTSRuntimeBindingInPath` walks UP from ClassDeclaration and never enters the StaticBlock
// to find the enum. babel's scope tracker does anchor at StaticBlock so the legacy `scope.path`
// fallback works for it; estree-toolkit needs the explicit path
function resolveBindingToGlobal({ name, scope, adapter, seen, path, usageNode = null }) {
  seen ??= new Set();
  if (seen.has(name)) return null;
  // `seen` is a recursion STACK, not a visited set: only names on the CURRENT descent stay
  // guarded (cycle guard intact), and a COMPLETED resolution backtracks so it cannot poison a
  // SIBLING resolution of the same name later in the walk - an array-wrap init like
  // `[_globalThis, _globalThis]` (babel's in-place substitution binds the name) resolves each
  // element independently; a visited-set left every later element unresolvable
  seen.add(name);
  try {
    return resolveGuardedBindingToGlobal({ name, scope, adapter, seen, path, usageNode });
  } finally {
    seen.delete(name);
  }
}

function resolveGuardedBindingToGlobal({ name, scope, adapter, seen, path, usageNode = null }) {
  // single binding lookup - reused by polyfillHint, type gate, and VariableDeclarator init walk.
  // pass `path` so the adapter's var-hoist fallback can surface a nested-block `var` alias
  // (`var g = globalThis` inside an `if`) that estree-toolkit's name-only scope index misses
  const binding = adapter.getBinding(scope, name, path);
  // plugin-managed pure-import mutation (`globalThis` -> `_globalThis` / `Symbol` -> `_Symbol`)
  // leaves a real import binding; adapter's `polyfillHint` carries the source global name so
  // downstream proxy-global / constructor recognition survives the rewrite
  let hint = binding?.polyfillHint;
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
  if (hint && (CAPITALISED_IDENT.test(hint) || POSSIBLE_GLOBAL_OBJECTS.has(hint))) {
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
  if (bindingType === 'VariableDeclarator') return resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path, usageNode });
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

function resolveVariableBindingToGlobal({ name, binding, scope, adapter, seen, path, usageNode = null }) {
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
  if (!binding.node?.init && binding.node?.id?.type === 'Identifier' && adapter.findTrustedAliasWrite) {
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
      const writeScope = binding.scope ?? scope;
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
    const idWrite = trustedIdentifierAliasWrite({ scope, name, adapter, path });
    if (idWrite) {
      const alias = resolveAliasValueNode({
        value: peelChainAssignment(idWrite.right).value, name, binding, scope, adapter, seen, path,
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
    && !varInitDominatesUsage({ declaratorNode: binding.node, usagePath: path, usageNode, kind: binding.kind })) return null;
  // dead-init across a closure: resolve the reaching value as the receiver instead of the dead init
  // (`let M = Object; M = Array; () => M.assign()` resolves to Array, not the unreachable Object)
  const reaching = reachingValueOverDeadInit({ binding, adapter, path, scope, usageNode });
  if (reaching) return resolveObjectName({
    objectNode: reaching, scope, adapter, seen: new Set(seen).add(name), path, usageNode: reaching,
  });
  const { init } = binding.node;
  const pattern = binding.node.id;
  // the init/destructure RHS was written in the alias's OWN declaration scope, so its proxy-global
  // receiver resolves there, not at the use site - an inner shadow of the receiver name must not
  // capture it (mirror of the identifier-hop rule in `resolveAliasValueNode`; passing raw `scope`
  // was the missed-sibling gap that dropped injection for `const { Map: M } = a` / `const [A] =
  // [a.Map]` used under a shadowing param)
  const initScope = binding.scope ?? scope;
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
  if ((pattern?.type === 'ArrayPattern' || pattern?.type === 'ObjectPattern') && init) {
    // a slot default makes the value default-or-runtime, and this union sees only the values
    // `patternSlotValues` could pair (its contract is over-approximation - a dynamic / spread-
    // shifted / foreign pair contributes nothing), so a lone resolved default wrongly reads as
    // certain. pure's receiver-dropping fold needs certainty - bail on the ambiguity (the
    // default-aware extraction channels keep their runtime-guarded handling); usage-global
    // keeps the maybe-union (inject-if-might is sound and desirable there)
    if (adapter?.method === 'usage-pure'
      && (patternSlotHasDefault(pattern, name)
        || patternSlotSpreadShifted(pattern, init, name, { scope, adapter, path, resolveKey }))) return null;
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
  const initScope = binding.scope ?? scope;
  // a guard-shaped conditional value (the stored kept-nav render - `null == _globalThis.window
  // ? void 0 : _self.window` - or any user ternary of the same shape) stores either undefined
  // or the defined branch: classification follows that branch, and the undefinable verdict
  // (which reads the same shape) keeps the alias guard live at every claim site. without this
  // arm the AST emitter's in-place collapse (and the sandwich's second pass over collapsed
  // text) hides the nav from the alias reads, and their claims silently die. only a GUARDED
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
    // (recursion hits the top-level polyfillHint translation for plugin-managed imports)
    if (unwrapped.name === name || !adapter.hasBinding(initScope, unwrapped.name, path)) return unwrapped.name;
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
    const required = requireCallSource(unwrapped, adapter, initScope);
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

// walks a chain of proxy-global links (`globalThis.self.window.X`) to its root identifier;
// returns true when the root is a proxy global and every intermediate link is also one.
// IIFE-at-root (`(() => globalThis).Array.from(x)`) is inlined via `inlineCallReturnExpression`
// so the chain bottoms out on the proxy-global identifier inside the IIFE body. caller is
// responsible for marking the inner proxy-global identifier (`markSubsumedProxyChain`) so
// unplugin's text-emit doesn't queue a parallel `globalThis -> _globalThis` rewrite that
// would overlap the outer polyfill replacement
function resolveProxyGlobalRoot({ receiver, scope, adapter, seen, path, usageNode = null }) {
  while (true) {
    // peel chain-assign AND SE-tail to fixpoint at every step: `((a = globalThis).Array).from(x)`
    // buries the assignment inside .object's .object, and `(eff(), globalThis).Map.groupBy` buries the
    // proxy root behind a sequence tail - a flat unwrapTransparentSeq loses both. this is pure shape
    // classification: the SE prefix stays in the source and is collected by the emit side
    let obj = peelChainRootValue(receiver);
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
      obj = peelChainRootValue(obj.object);
    }
    if (obj.type === 'CallExpression' || obj.type === 'OptionalCallExpression') {
      const inlined = inlineCallReturnExpression({ callNode: obj, scope, adapter, seen, path });
      if (inlined) {
        receiver = inlined;
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
    return obj.type === 'Identifier' && (isProxyGlobalIdentifier({ node: obj, scope, adapter, seen, path, usageNode })
      || !!requireBoundProxyGlobalName({ node: obj, scope, adapter, path }));
  }
}

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow.
// initialize at entry so the cycle guard accumulates across recursion regardless of whether
// the caller passed one - matches resolveBindingToGlobal's convention
export function resolveObjectName({ objectNode, scope, adapter, seen, path, usageNode = null }) {
  seen ??= new Set();
  // peel chain-assign rhs + parens to a fixpoint (`(a = Array)`, `(a = b = Array)`,
  // `(a = (b = Array))`, `((a = Array))` all resolve to Array). closes binding-init walks
  // (`const X = (a = Array); X.from(...)`) and IIFE-return walks
  // (`(() => (a = Array))().from(...)`) symmetrically. SE preservation is downstream's
  // problem - resolveObjectName only classifies receiver shape
  objectNode = peelChainAssignmentDeep(objectNode);
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name, path)) {
      return resolveBindingToGlobal({ name: objectNode.name, scope, adapter, seen, path, usageNode });
    }
    // no binding - global only if starts with uppercase or is a known global proxy
    return isStaticPlacement(objectNode.name) ? objectNode.name : null;
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
    const inlined = inlineCallReturnExpression({ callNode: objectNode, scope, adapter, seen, path, usageNode });
    // an SE-arrow body inlines to a SEQUENCE (`() => (r++, globalThis)`) - classify through its
    // tail value like the proxy-root walk does; SE preservation stays the emit side's concern
    // (`inlineCallHasObservableEffects`), this is pure shape classification
    return inlined ? resolveObjectName({
      objectNode: peelReceiverSequenceTail(inlined), scope, adapter, seen, path, usageNode,
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
// alias or one with no reassignment contributes only the primary. `resolve` maps a value node to its
// receiver name / key string
export function reachableAliasValues({ aliasNode, primary, resolve, scope, adapter, path, seen, usageNode = null }) {
  const values = primary ? [primary] : [];
  // follow an Identifier alias SOURCE (a declarator init OR a reassignment value) to the aliased
  // binding's own reachable values, so `const/let M = M0`, `M = M0` and `[M] = [M0]` all reach M0's
  // transitive reassignments (`let M0 = Object; if (c) M0 = Array; ...; M.from()`). ADDITIVE to the
  // reassigned-arm: a reassigned alias whose source aliases another reassigned binding still reaches
  // the source's targets on the no-own-write path. anchored at the alias read site (a later write to
  // the source does not enter the union); `asCall` re-enters the factory branch for an `f()` receiver;
  // `seen` guards alias cycles
  function pushAliasHop(source, currentName, asCall) {
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
      aliasNode: recursed, primary: asCall ? resolve(recursed, node) : null, resolve, scope, adapter, path,
      seen: new Set(seen).add(currentName), usageNode: node,
    }));
  }
  if (aliasNode?.type === 'Identifier') {
    const binding = adapter.getBinding(scope, aliasNode.name, path);
    if (binding && isReassignedBeyondDeclarator(binding)) {
      // the alias name activates pattern-LHS pairing (`[A] = [Iterator]`) in the enumerator -
      // adapter binding wrappers do not all surface the bound identifier
      for (const rhs of reassignmentValueNodes({
        binding, usagePath: path, name: aliasNode.name, ctx: { scope, adapter, path, resolveKey }, usageNode,
      })) {
        // the written value was READ at its write site - anchor its own resolution there, so a
        // cross-write (`a = b; b = x`) resolves b's value as captured BEFORE `b = x` overwrote it
        const value = resolve(rhs, rhs);
        if (value) values.push(value);
        pushAliasHop(rhs, aliasNode.name, false);
      }
    }
    if (binding) pushAliasHop(binding.node?.init, aliasNode.name, false);
  } else if (aliasNode?.type === 'CallExpression' || aliasNode?.type === 'OptionalCallExpression') {
    // IIFE-callee receiver `f()` whose factory `f` is a reassigned alias: each reachable `() => X`
    // value returns X. recover each so a dominating reassignment to a polyfillable global (`let f =
    // () => Object; f = () => Array; f().from()`) still injects the reaching value's polyfill - the
    // direct-Identifier-receiver union path could not, since `f()` is not an Identifier alias
    const callee = unwrapTransparentSeq(aliasNode.callee);
    const binding = callee.type === 'Identifier' ? adapter.getBinding(scope, callee.name, path) : null;
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
          const value = ret && resolve(ret);
          if (value) values.push(value);
        } else pushAliasHop(rhs, callee.name, true); // a factory bound through an Identifier alias
      }
    }
    if (binding) pushAliasHop(binding.node?.init, callee.name, true);
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
// `seen` (caller-owned Set) tracks binding names already in the resolution chain for
// cycle protection (`const f = () => g(); const g = () => f();`); pass an empty Set when
// recursion isn't possible at the call site
function resolveInlineCalleeFunction({ callNode, scope, adapter, path, seen, allowIdentityParam = false,
  usageNode = null, rejectConditional = false }) {
  // SE-bail (unwrapTransparentSeq), NOT peel-to-tail: recognizing a SE-callee IIFE (`(eff(), () => Array)()`)
  // makes the resolver inline it, but the emit layer cannot compose a receiver-less static
  // substitution over the SE-wrapped callee (transform-queue "could not locate inner needle" crash).
  // the SE-bail keeps the shape unresolved (native call survives) - the safe-from-crash outcome
  let callee = unwrapTransparentSeq(callNode.callee);
  // identifier hops follow transitively (`const f = () => X; const q = f; q()`), each hop
  // re-anchored at the alias's own declaration scope (per-hop advance like the key/global
  // alias walks) with the seen-set guarding cycles
  let hopScope = scope;
  while (callee.type === 'Identifier') {
    const { name } = callee;
    if (!adapter.hasBinding(hopScope, name, path) || seen.has(name)) return null;
    const binding = adapter.getBinding(hopScope, name, path);
    if (!binding) return null;
    if (adapter.getBindingNodeType(hopScope, name, path) === 'VariableDeclarator') {
      // binding shape differs per channel: detect adapters carry `.node`, the type-resolver
      // channel only `.path` (same duality the FunctionDeclaration arm below already covers)
      const initNode = (binding.node ?? binding.path?.node)?.init;
      if (!initNode) {
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
        return finishInlineCallee({ callee, allowIdentityParam });
      }
      // method-aware reassignment bail: usage-global keeps inlining the IIFE-callee when the binding's
      // reassignment does not dominate the use (init still live); pure / narrowing bail. `usageNode`
      // anchors the dominance at an alias-hop's read site so a write AFTER the capture (`const f = f0;
      // f0 = () => Map`) does not block the still-live declared init
      if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode })) return null;
      callee = unwrapTransparentSeq(initNode);
    } else {
      if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode })) return null;
      // a zero-param FunctionDeclaration is the same inline shape (`function g() { return X; }
      // const B = g();`) - the declaration node IS the callee function
      const declNode = binding.path?.node ?? binding.node;
      if (declNode?.type !== 'FunctionDeclaration') return null;
      callee = declNode;
    }
    seen.add(name);
    hopScope = binding.scope ?? hopScope;
  }
  return finishInlineCallee({ callee, allowIdentityParam });
}

// the shared callee-shape validation every proof arm funnels through
function finishInlineCallee({ callee, allowIdentityParam }) {
  if ((callee.type !== 'ArrowFunctionExpression' && callee.type !== 'FunctionExpression'
    && callee.type !== 'FunctionDeclaration')
    || (callee.params?.length && !identityParam({ callee, allowIdentityParam })) || callee.async || callee.generator) return null;
  return callee;
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
// are preserved at the call site via `inlineCallHasObservableEffects` + `meta.sideEffects`
export function inlineCallReturnExpression({ callNode, scope, adapter, seen, path, usageNode = null,
  rejectConditional = false }) {
  const callee = resolveInlineCalleeFunction({ callNode, scope, adapter, path, seen, allowIdentityParam: true,
    usageNode, rejectConditional });
  if (!callee) return null;
  const body = singleReturnBodyExpression(callee.body);
  if (!callee.params?.length) return body;
  // identity passthrough (`(x) => x` applied to one arg): the body IS the param, so the receiver is
  // the ARG - recovers a call/IIFE-rooted receiver (`((x)=>x)(globalThis).Symbol`, and the nested
  // `g(f()).Symbol` since the arg `f()` is itself resolved by the caller). an SE-bearing arg is
  // preserved by `inlineCallHasObservableEffects` (checks callNode.arguments), so return it as-is
  if (body?.type === 'Identifier' && body.name === callee.params[0].name) return callNode.arguments?.[0] ?? null;
  // a body that never READS the param yields the same value for every argument (`(x) => globalThis`),
  // so the call resolves to the body itself. bailing here on the param's mere PRESENCE left the shape
  // unproven: the guard test substituted the root while the static behind it kept reading native off
  // the memo. the param may still carry an effect in a prefix statement - that is the SE channel's
  // business, not the value's
  return identifierReferencedInSubtree(body, callee.params[0].name) ? null : body;
}

export function isCallShape(node) {
  return node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression';
}

// the identifier's name when it IS a proxy-global or a transitive alias of the BARE global
// (`const g = globalThis; const h = g;`), null otherwise - an alias whose init NAVIGATES
// (`const w = globalThis.window`) is an undefinable VALUE, not the global itself
export function bareProxyGlobalAliasName(node, aliasCtx) {
  let cur = node;
  let ctx = aliasCtx;
  for (let depth = 0; depth < MAX_KEY_DEPTH; depth++) {
    if (cur?.type !== 'Identifier') return null;
    if (POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) {
      return findProxyGlobal(node, aliasCtx) ? cur.name : null;
    }
    const followed = enterIdentifierBindingFollow({ node: cur, ...ctx, seen: new Set() });
    if (!followed?.init) {
      // a TERMINAL init-less identifier that is a plugin-minted pure import (`const g =
      // _globalThis` after the in-place rewrite walks here) names its source global through
      // the polyfillHint side-channel (binding field OR adapter hook - the canonical duality);
      // a plain init-less binding (`let n; n = nav;`) stays unproven - its value is the
      // write's, exactly what the guard exists for
      const hint = followed
        ? bindingPolyfillHint({ binding: followed.binding, scope: ctx.scope, name: cur.name, adapter: ctx.adapter }) : null;
      return asProxyGlobalName(hint);
    }
    cur = unwrapTransparentSeq(followed.init);
    if (followed.scope !== ctx.scope) ctx = { ...ctx, scope: followed.scope };
  }
  return null;
}

// the FULL `=` chain of a kept assignment, dug through transparent wrappers AND SE-bearing
// sequences at every level (`((se0(), q = (se1(), w = nav)))` - the assign-only peel refused
// the wrappers and a lowered `?.` memo hid its chain-assign exactly so). the AST emitter keeps
// the wrappers in the tree, so only a TEXT render needs the peeled prefix expressions back:
// they ride `seqAroundPrefix` in encounter order, which IS their source-eval order (each
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
export function storedUserAssignmentOf(path) {
  for (let p = path; p?.parentPath; p = p.parentPath) {
    const parent = p.parentPath.node;
    if (parent?.type === 'AssignmentExpression' && parent.operator === '=') {
      return parent.right === p.node && typeof parent.start === 'number' ? parent : null;
    }
    if (parent?.type === 'SequenceExpression') {
      if (parent.expressions.at(-1) !== p.node) return null;
      continue;
    }
    if (parent?.type !== 'MemberExpression' && parent?.type !== 'OptionalMemberExpression'
      && !SKIPPABLE_WRAPPER_TYPES.has(parent?.type)) return null;
  }
  return null;
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
  const stored = storedUserAssignmentOf(path);
  if (!stored) return false;
  return proxyReceiverValueCanBeUndefined(path.node.object, resolvePure, { scope, adapter, path })
    ? stored : false;
}

// resolve every computed hop's key to a pristine proxy-global name, harvesting an SE-bearing
// key's prefix expressions onto the hop (`[(c++, 'self')]` re-emits the `c++` with the render);
// false = a key that does not fold to a pristine name, or one whose effects have no re-emit
// shape - the whole plan bails on it
function resolveComputedHopKeys(hops, { scope, adapter, path, unwrap }) {
  for (const hop of hops) {
    if (hop.name !== null) continue;
    hop.name = resolveKey({ node: hop.node.property, computed: true, scope, adapter, seen: new Set(), path });
    if (!hop.name || !isPristineProxyGlobal(adapter, hop.name)) return false;
    const prop = unwrap(hop.node.property);
    if (prop.type === 'SequenceExpression' && prop.expressions.length > 1
      && prop.expressions.slice(0, -1).some(mayHaveSideEffects)) {
      hop.keySeExprs = prop.expressions.slice(0, -1);
    } else if (mayHaveSideEffects(prop)) return false;
  }
  return true;
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
// the RENDER-time read of a plan's key effects, off the LIVE key containers: a claim landing
// inside a kept computed key swaps the node in its PARENT slot (`path.replaceWith` /
// `replaceNodeInTree`), so the plan's eager `keySeExprs` references go stale by flush time.
// every renderer that re-emits the key effects reads THROUGH the plan's `liveKeySeExprs`
// instead - one liveness rule for both emitters (babel's re-read at flush == the ast
// engine's keep-live identity); the shape check falls back to the captured nodes when a
// rewrite reshaped the container
function liveHopKeySeExprs(hops, unwrap) {
  return hops.flatMap(hop => {
    if (!hop.keySeExprs?.length) return [];
    const prop = unwrap(hop.node.property);
    return prop?.type === 'SequenceExpression' && prop.expressions.length === hop.keySeExprs.length + 1
      ? prop.expressions.slice(0, -1) : hop.keySeExprs;
  });
}

export function planProvenNavGuardCollapse({
  rootNode, scope, adapter, path, resolvePure, unwrap = unwrapTransparentSeq, allowSequenceRoot = false,
  throughKeptAssign = false, descendSequenceTail = false,
}) {
  let core = unwrap(rootNode);
  const dug = digChainAssignSteps(core);
  const topAssign = dug?.steps[0] ?? null;
  const topAssignSteps = dug?.steps ?? [];
  const seqAroundPrefix = dug?.seqAroundPrefix ?? null;
  if (topAssign) core = unwrap(dug.value);
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
    return unwrap(node.object);
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
  // own queued rewrite (`arr.at(0)` in the prefix) has no slot in that re-emit - the text
  // emitter's guard callers thread no rescue range and the AST emitter's DEFERRED snapshot
  // clones the span before those claims land, so widening this walk unconditionally dropped
  // their polyfills in the guard channels. an IMMEDIATE value-position consumer renders live
  // nodes and opts in; everyone else keeps the root-substituted raw spelling for the shape
  const seqRootNode = allowSequenceRoot && n?.type === 'SequenceExpression' ? n : null;
  const seqRootEffects = !!seqRootNode && seqRootNode.expressions.slice(0, -1).some(mayHaveSideEffects);
  // the peel stops at the sequence's own tail unless the caller asks to DESCEND past it: below the
  // tail the hops are the nav's own, and owning them lets the plan render the whole thing - which
  // only a consumer that both re-emits the peeled prefix AND keeps the sealed read may ask for.
  // the probe is that consumer; a kept-nav flush is not, and letting it own the shape cost first the
  // prefix effect and then the read's throw
  if (seqRootNode) {
    n = descendSequenceTail ? descendHops(unwrap(peelReceiverSequenceTail(seqRootNode)))
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
    const below = outer ? unwrap(value) : n;
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
  const identRootName = call?.type === 'Identifier' ? bareProxyGlobalAliasName(call, aliasCtx) : null,
        identRoot = identRootName ? call : null;
  if (!identRoot && call?.type !== 'CallExpression' && call?.type !== 'OptionalCallExpression') return null;
  if (!resolveComputedHopKeys(hops, { scope, adapter, path, unwrap })) return null;
  const rootId = identRoot ?? inlineCallProxyGlobalRoot({ callNode: call, scope, adapter, path });
  // the AST emitter may have already rewritten the proven root INSIDE the callee to its pure
  // import (`() => _globalThis`); the import binding names its source global through the
  // polyfillHint side-channel - resolve through it exactly like the bare-alias walk
  const rootName = identRootName
    ?? (rootId && (asProxyGlobalName(rootId.name) ?? bareProxyGlobalAliasName(rootId, aliasCtx)));
  if (!rootName || !isPristineProxyGlobal(adapter, rootName)) return null;
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
  if (hops.some((hop, i) => hop.keySeExprs && i > collapseIdx)) return null;
  // a hop earns a GUARD only when its own read can genuinely be undefined - the positional rule the
  // value canon owns (`globalThis.window` is the environment probe; a DEEPER unresolvable hop is a
  // realm self-reference the collapse assumes present). keying on name-resolution alone built a
  // test for a value the same canon calls defined, and split the emitters on their own boundary
  let lastUnresolvableIdx = -1;
  for (let i = 0; i < collapseIdx; i++) {
    if (!resolvePure({ kind: 'global', name: hops[i].name })) lastUnresolvableIdx = i;
  }
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
  // it in. the 'sequence' and 'bare' renders spell it their own way (`assignHead`, the re-emitted
  // root), and reporting it here would make them drop it as already-spelled or print it twice
  const prefixHopNode = lastUnresolvableIdx === -1 ? null : hops[lastUnresolvableIdx].node;
  const assignWrap = chainAssign && prefixHopNode && chainAssign.start <= prefixHopNode.start
    && chainAssign.end >= prefixHopNode.end ? chainAssign : null;
  return {
    assignWrap: lastUnresolvableIdx !== -1 ? assignWrap : null,
    kind: lastUnresolvableIdx !== -1 ? 'nested' : rootEffects ? 'sequence' : 'bare',
    // whether the root below the hops does anything observable - a write, a sequence prefix, an
    // effect-bearing call. the base substitution of `navGuardTestBase` spells the whole prefix away,
    // so it is exactly this that decides whether it may
    rootEffects,
    // the WRITE the plan's own test spells (`null == (w = _globalThis).window`): a consumer replaying
    // the claim's side effects must skip it, or the source's single store runs twice - and the text
    // leg's replay spells it RAW (`w = globalThis`), a bare global in usage-pure output
    rootAssign: chainAssign ?? null,
    topAssign, topAssignSteps, topValue: dug?.value ?? null, hops, collapseIdx, lastUnresolvableIdx, keySeExprs,
    liveKeySeExprs: () => liveHopKeySeExprs(hops, unwrap), testKeySeCount,
    seqAroundPrefix,
    leafName: hops[collapseIdx].name, leafPure, rootValueNode: seqRootNode ?? n, seqRoot: !!seqRootNode,
    // the sequence's TAIL is part of what the hops navigate, so a render that descended past it
    // re-emits the PREFIX only: spelling the whole sequence puts the tail's ponyfill in twice
    // (`(k++, _globalThis, _self).window`)
    seqTailDescended: !!seqRootNode && descendSequenceTail,
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
  };
}

// resolve a call ROOT to the proxy-global it provably yields, walking NESTED single-return
// wrappers (`const f = () => g(); const g = () => globalThis`) - each layer inlines through the
// same canon; one `seen` set guards cycles across the whole walk
export function inlineCallProxyGlobalRoot({ callNode, scope, adapter, path, rejectConditional = false }) {
  const seen = new Set();
  let value = callNode;
  while (isCallShape(value)) {
    value = inlineCallReturnExpression({ callNode: value, scope, adapter, path, seen, rejectConditional });
    if (!value) return null;
  }
  return findProxyGlobal(value, { scope, adapter, path });
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
  return hasObservableEffectsRec({ callNode, scope, adapter, path, seen: new Set() });
}

function hasObservableEffectsRec({ callNode, scope, adapter, path, seen }) {
  while (true) {
    // the call's own ARGUMENTS run when the call runs; folding the call down to its inlined receiver
    // drops them, so a side-effecting argument (`(() => Array)(c++)`) must force SE preservation
    if (callNode.arguments?.some(mayHaveSideEffects)) return true;
    // `allowIdentityParam` MUST mirror the fold (`inlineCallReturnExpression`): the fold inlines an
    // identity-param IIFE (`((x) => { g(); return x; })(Array)`), so the effect gate has to inspect its
    // block body too - a stricter gate here misses the `g()` prefix and drops it at the source
    const callee = resolveInlineCalleeFunction({ callNode, scope, adapter, path, seen, allowIdentityParam: true });
    if (!callee) return false;
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
      callNode = peeled;
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
function isProxyGlobalIdentifier({ node, scope, adapter, seen, path, usageNode = null }) {
  // a mutated proxy SLOT (`window = fake`) holds the user's replacement: neither the direct
  // name nor an alias resolving to it re-enters the pristine global surface - what an alias
  // holds depends on capture order, which no span model covers, so both stay ungated raw
  return proxyGlobalRootName({ node, scope, adapter, path, seen, usageNode }) !== null;
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
      const entry = enterIdentifierBindingFollow({ node, scope, adapter, seen, path, usageNode });
      if (entry) {
        // a registered Symbol.X alias resolves the key regardless of the binding's (possibly mutated /
        // pattern) init: `const { iterator } = Symbol; obj[iterator]`. must run BEFORE the init branch -
        // following a destructure init resolves the WHOLE receiver (`Symbol`), losing the `.iterator` slot
        const aliasKey = bindingSymbolKey(entry.binding, adapter.packages);
        if (aliasKey) return aliasKey;
        if (entry.init) {
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
          const target = reachingValueOverDeadInit({ binding: entry.binding, adapter, path, scope, usageNode }) || entry.init;
          node = usageNode = target;
          seen = entry.nextSeen;
          scope = entry.scope;
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

// like `findProxyGlobal`, but returns the root WITH any wrapper directly around it (paren /
// TS-cast / pure-sequence) retained, so `.start` / `.end` span the wrapper bytes. the unplugin
// text-emit layer slices source on these offsets; using `findProxyGlobal`'s peeled-identifier
// offsets leaves an unbalanced paren - a partial-overlap throw (deletion starts inside the
// root substitution) or a dangling `(` - when the root is parenthesized (`(globalThis).self.X`).
// returns the bare identifier (same span as `findProxyGlobal`) when no wrapper sits directly
// around the root, including the parens-around-prefix shape (`(globalThis.self).X`)
export function proxyGlobalWrappedRoot(node, aliasCtx = null, throughChainAssign = false) {
  if (!findProxyGlobal(node, aliasCtx, throughChainAssign)) return null;
  // peelReceiverSequenceTail (not SE-bailing unwrapTransparentSeq): for a SE-prefix receiver
  // `(se(), globalThis.self.Array)` the bare root identifier sits in the SE tail - peeling to it
  // gives the correct deletion span. identical to unwrapTransparentSeq for the directly-wrapped-root case
  // (`(globalThis).self.X` still returns the paren-inclusive `(globalThis)`), so byte-spans are kept
  let wrapped = peelReceiverSequenceTail(node);
  let root = wrapped;
  while (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression') {
    wrapped = root.object;
    root = peelReceiverSequenceTail(wrapped);
  }
  return wrapped;
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
export function chainReadsThroughSeal(node, resolvePure, aliasCtx = null, { stopAt = null } = {}) {
  // a caller that RENDERS part of the chain asks only about the rest: a guard test spells its own
  // object, so a read INSIDE that object is performed there and throws exactly where the source
  // does - only a seal ABOVE it is swallowed. without a boundary the whole chain is the question
  const stop = stopAt ? unwrapRuntimeExpr(peelReceiverSequenceTail(stopAt)) : null;
  for (let cur = peelReceiverSequenceTail(node);
    cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';) {
    if (stop && cur === stop) return false;
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
// .window` - a native `self` read where its ponyfill is the point); the hops below the probe are
// resolvable by construction, so the deepest of them supplies the base and the test becomes
// `_self.window`. the price is deliberate and owner-decided: that base is always defined, so a host
// missing `self` gets the guard's `void 0` where the source threw. null keeps the source slice -
// no resolvable hop below the probe, a computed probe key, or a key effect the slice evaluates
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
export function chainSealedObjects(node) {
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

// a CLAIMLESS short-circuiting probe nav: a live `?.` in the chain - its own optional
// objects, plus any sealed layer's inner nav (`(window?.self).X` hides the live `?.` from the
// own-chain walk) - guards a value that can genuinely be undefined on-target, and NO member of
// the chain names a static with its own ponyfill entry. such a chain may not collapse: the
// erase runs the read where native short-circuits, and no claim render exists to carry the
// guard. a chain WITH a claimable static stays with the claim machinery, whose guard logic
// rides the canonized verdict. `resolvePure` answers both questions (`{ name }` spec).
// `widenDeep`: an OWN-`?.` object that is a DEEP pristine proxy nav with an unresolvable hop
// (`globalThis.window.self.window?.X`) counts as undefinable too - only for the callers that
// proved NO channel owns the chain (the fold gate, the ownerless callback render): a claim's
// receiver resolution keeps the narrow verdict, where the deep twin ERASES by the locked canon
export function claimlessOptionalNavGuardsUndefinable(node, resolvePure, aliasCtx = null, { widenDeep = false } = {}) {
  for (let cur = node; cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
    cur = unwrapRuntimeExpr(cur.object)) {
    const key = cur.computed ? null : cur.property?.name;
    if (key && !POSSIBLE_GLOBAL_OBJECTS.has(key) && resolvePure({ name: key })) return false;
  }
  // the deep widening applies to the chain's OWN live `?.` objects only; what a SEAL in the chain
  // owes is its own question, and the canon below answers it
  return ownChainOptionalObjects(node).some(object => claimlessGuardedObjectUndefinable(object, resolvePure, aliasCtx, { widenDeep }))
    || chainSealsAShortCircuit(node, resolvePure, aliasCtx);
}

// a guarded object of a CLAIMLESS probe chain that can genuinely be undefined: the shared
// receiver verdict, plus (under `widenDeep`) the DEEP pristine-nav receiver it deliberately
// answers false for (`globalThis.window.self.window?.X` - a CLAIMED chain over a deep nav
// ERASES by the locked canon, so `proxyReceiverValueCanBeUndefined` keeps its narrow root
// arms). callers prove the chain claimless first; a claimless probe over a pristine proxy nav
// with an unresolvable hop short-circuits exactly like the flat identifier-rooted twin
export function claimlessGuardedObjectUndefinable(object, resolvePure, aliasCtx = null, { widenDeep = false } = {}) {
  if (proxyReceiverValueCanBeUndefined(object, resolvePure, aliasCtx)) return true;
  if (!widenDeep) return false;
  const core = unwrapRuntimeExpr(peelReceiverSequenceTail(object));
  return (core?.type === 'MemberExpression' || core?.type === 'OptionalMemberExpression')
    && maximalProxyGlobalPrefix(core, aliasCtx, { throughChainAssign: true }) === core
    && navHasUnresolvableProxyHop(core, resolvePure);
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
export function navValueCanShortCircuit(navNode, resolvePure, aliasCtx = null, { throughChainAssign = false } = {}) {
  let cur = unwrapRuntimeExpr(peelReceiverSequenceTail(navNode));
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const raw = peelReceiverSequenceTail(cur.object);
    const object = unwrapRuntimeExpr(raw);
    if (cur.optional) {
      if (isCallShape(object)) return callValueCanBeUndefined(object, aliasCtx, resolvePure);
      // `throughChainAssign`: a write under the `?.` STORES the nav and hands the same value on
      // (`(q = globalThis.window)?.self`). only a caller asking about the VALUE reads through it -
      // the default verdict keeps the write opaque, because the emit channels key their routing on
      // it and flipping that globally strands a raw root in a guard memo
      if (navHasUnresolvableProxyHop(throughChainAssign
        ? peelChainAssignment(object).value ?? object : object, resolvePure)) return true;
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
  if (navValueCanShortCircuit(core, resolvePure, aliasCtx, { throughChainAssign })) return true;
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

// can the VALUE of a CALL be undefined? an opaque call is a genuine guard (the opaque-root
// canon keeps those `?.`); an inline-PROVEN proxy-global call yields a proxy global, which is not
// the same as yielding a DEFINED one - a body that navigates through a live `?.`
// (`() => globalThis.window?.self`) short-circuits, and only then is the `?.` above the call
// vestigial (the optional-count collapse canon). asking that needs `resolvePure`; a caller with
// none keeps the older, narrower verdict. a CONDITIONALLY proven callee
// (`let f; if (c) f = () => globalThis;`) proves no value at all - the unassigned path yields
// undefined through the call's own `?.()`, exactly what the outer `?.` guards
// the VALUE a proven inline call yields, walked through nested single-return wrappers - the shape
// `callValueCanBeUndefined` tests. null when the call does not inline
function inlineCallProxyGlobalNavValue(callNode, aliasCtx) {
  if (!aliasCtx) return null;
  const seen = new Set();
  let value = callNode;
  while (isCallShape(value)) {
    const next = inlineCallReturnExpression({ callNode: value, ...aliasCtx, seen, rejectConditional: true });
    if (!next) return null;
    value = unwrapRuntimeExpr(next);
  }
  return value;
}

// the NAME a proven-call source keys by: what makes its value undefinable, which is usually the same
// probe the hop above it reads (`(() => globalThis.window?.self)()?.window` - one source, one test)
function callSourceName(callNode, aliasCtx, resolvePure) {
  const body = inlineCallProxyGlobalNavValue(callNode, aliasCtx);
  return (body && deepestUnresolvableHopSource(body, aliasCtx, resolvePure)?.name) ?? '<call>';
}

function callValueCanBeUndefined(callNode, aliasCtx, resolvePure = null) {
  // an OPTIONAL call is a chain LINK, not a plain value: dropping the `?.` above it re-groups
  // the chain (the AST emitter has to parenthesize the link, `(oc?.()).window`, where the text
  // emitter's `oc?.().window` reads as one chain). the source spelling is the only one both
  // emitters can print, so the optional above such a link is never dead text
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
  const seen = new Set();
  let value = callNode;
  while (isCallShape(value)) {
    const next = inlineCallReturnExpression({ callNode: value, ...aliasCtx, seen, rejectConditional: true });
    if (!next) return false;
    value = unwrapRuntimeExpr(next);
  }
  // the same distinction one step further: a body that navigates PLAINLY to the environment probe
  // (`() => globalThis.window`) yields a value that is undefined off-window without short-circuiting
  // anywhere, so the `?.` above the call is the only thing standing between the collapse and a read
  // off `undefined` (`(() => globalThis.window)()?.self.window.Array` threw inside the ponyfill)
  return navValueCanShortCircuit(value, resolvePure, aliasCtx)
    || proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx);
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
    const value = peelChainAssignmentDeep(object);
    const undefinable = isCallShape(value)
      ? callValueCanBeUndefined(value, aliasCtx, resolvePure)
      : proxyReceiverValueCanBeUndefined(value, resolvePure, aliasCtx,
        value === object ? undefined : { observableRead: true });
    if (cur.optional && !undefinable) dead.push(cur);
  }
  return dead;
}

// true when ANY hop of a proxy-nav is a proxy-global name WITHOUT a pure entry (`globalThis.window` -
// no `_window`): the natural visitor leaves it raw off the pure root (`_globalThis.window`, undefined
// off-engine). both emitters' hop-collapse drives gate WRITE targets on this: a nav whose every hop
// resolves stays with the natural per-hop rewrite (`(a = globalThis).self.Set = v` -> `(a = _globalThis,
// _self).Set = v`), and claiming it here would conflict with that already-queued rewrite.
// `staticMemberKeyName` folds a SE-bearing computed hop key (`globalThis[(e++, 'window')]`) so it is
// detected
// is this proxy-hop key one the pure package cannot back at all (`window` - there is no `_window`)?
// the question is about the ENTRY EXISTING, never about the target asking for it: a hop the target
// already has natively (`self` on a modern browserslist) is still a name pure can spell, and reading
// it as "unresolvable" turns an erasable navigation into an environment probe - the two emitters
// then answer the same source differently, which is what the target-only spelling produced. the
// per-target resolver still leads, so a hop it answers needs no definitions lookup.
// the canon's near names decide a HOST SHAPE, not entry existence, so none of them subsumes this:
// `tryFlattenProxyHopHost` / `isProxyHopHostShape` classify a destructure host, `rebuildWrappedProxyChain`
// re-emits hops onto a binding. `navHasUnresolvableProxyHop` stays the owner of the question - this is
// its arm, lifted so `proxyReceiverValueCanBeUndefined` asks it in the same spelling
export function proxyHopLacksPureEntry(hop, resolvePure) {
  return !!hop && POSSIBLE_GLOBAL_OBJECTS.has(hop)
    && !resolvePure({ kind: 'global', name: hop })
    && !resolveBuiltInMeta({ kind: 'global', name: hop });
}

export function navHasUnresolvableProxyHop(navNode, resolvePure) {
  // peel transparent wrappers / SE tails at entry and at every hop, mirroring the sibling
  // walkers (`maximalProxyGlobalPrefix` / `findProxyGlobal`): a TS cast or a sequence
  // between the write host and its proxy sub-nav (`(globalThis.window as any).Set = fn`,
  // `(0, globalThis.window).Set = fn`) otherwise hides the unresolvable hop, the collapse
  // gate wrongly reports "all hops resolve" and the raw `.window` survives to an
  // off-engine write throw
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
  const rootCall = findChainRootCallExpression(node);
  return rootCall && inlineCallHasObservableEffects({ callNode: rootCall, scope, adapter, path })
    ? rootCall : null;
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
    const entry = enterIdentifierBindingFollow({ node, scope, adapter, seen, path });
    if (!entry) return false;
    // a registered Symbol.X alias resolves regardless of the binding's init (`const { iterator } =
    // Symbol; iterator in X`) - run before the init branch, which would follow the destructure init
    // to the whole receiver and lose the `.iterator` slot
    if (bindingSymbolKey(entry.binding, adapter.packages) !== null) return true;
    // alias indirection (`const k = Symbol.iterator; k in X`) else plugin-managed binding
    // (`polyfillHint` in-place mutation / real `core-js/.../symbol/X` import, incl.
    // user-aliased polyfill packages from `additionalPackages`)
    if (entry.init) {
      node = entry.init;
      seen = entry.nextSeen;
      scope = entry.scope;
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
// usage and no `kind:'global'` trigger on the alias root, so both emitters drive the hop collapse off this
// predicate. the hop key resolves binding-aware - a computed `g[k]` (`const k = 'self'`) or string-literal
// `g['self']` is caught like the dotted `g.self`; a side-effecting computed key bails (uncollapsible). a
// proxy-NAME root (`globalThis.self.X`) is EXCLUDED (it collapses via its own `kind:'global'` trigger, so
// this never double-fires). the cheap dotted check screens before any binding resolve. the caller peels to
// the root path and runs its per-emitter `collapseProxyHopRoot` (which self-gates on the hop again)
export function isAliasProxyHopChain(node, aliasCtx, allowSideEffectKeys = false) {
  if (!aliasCtx) return false;
  // peel the file's chain-walk canon at the entry AND at every hop (transparent wrappers +
  // SE-tails via the sequence peel, plus chain-assignments) - oxc preserves the wrapper nodes
  // babel strips, and an unpeeled walk left `(g).self.Array` stranded on one emitter only
  let cur = peelChainRootValue(node);
  if (cur?.type !== 'MemberExpression' && cur?.type !== 'OptionalMemberExpression') return false;
  let hasProxyHopKey = false;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    const { computed, property: key } = cur;
    // `allowSideEffectKeys`: recognize a SE-bearing hop key too (`g[(eff(), 'self')].X`); the collapse driver
    // this gates now harvests the dropped key SE, so the hop is collapsible, not a forced bail
    const hopName = computed
      ? resolveKey({ node: key, computed: true, bailOnSideEffectKey: !allowSideEffectKeys, ...aliasCtx })
      : key?.type === 'Identifier' && key.name;
    if (hopName && POSSIBLE_GLOBAL_OBJECTS.has(hopName)) hasProxyHopKey = true;
    cur = peelChainRootValue(cur.object);
  }
  return hasProxyHopKey && cur?.type === 'Identifier' && isAliasProxyRoot(cur, aliasCtx);
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
