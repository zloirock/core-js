import {
  callYieldCanBeUndefined, discardRescueNodes, inlineCallHasObservableEffects, inlineCallProxyGlobalRoot,
  aliasHeldClaimProbe,
  navGuardTestBase, navHasUnresolvableProxyHop, peelChainAssignmentDeep, storedNavHopClaimSuppressed,
  planProvenNavGuardCollapse, prependChainAssignmentEffect, proxyGlobalMemberCtorPureSwap,
  proxyHopLacksPureEntry, proxyReceiverValueCanBeUndefined,
  resolveKey, resolveObjectName, sealedChainBoundary, sealedClaimLeafGuardPlan, vestigialNavOptionals,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { planInExpression } from '@core-js/polyfill-provider/helpers/in-expression';
import {
  SYMBOL_ITERATOR_PURE_RESULT, isSourcedSymbolIteratorMeta, planGuardedStaticNarrow, planProxyReceiver,
  resolveSymbolIteratorEntry, symbolIteratorHint,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  POSSIBLE_GLOBAL_OBJECTS, SKIPPABLE_WRAPPER_TYPES, TS_EXPR_WRAPPERS, assignmentInStatementPosition,
  climbTransparentWrapperPath, deleteHostAboveChain,
  claimDeleteOperand,
  isMutatedGlobalSlot, isPristineProxyGlobal, isReusableReceiver,
  isDeoptedGlobalSlotRead,
  isTaggedTemplateTag, markRenderedStoredValue, mayHaveSideEffects, memberKeyName,
  mutatedSlotLeftNativeWarning,
  parenSealedCalleeAbove, peelParenAndTSParentPath, receiverCarriesLiveOptional,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { bindingPolyfillHint, remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import { ownEmittedNavClaim, ownOutputTests } from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  walkAstNodes,
} from '../plugin-helpers.js';
import {
  assignmentExpression, binaryExpression, callExpression, chainExpression, cloneNode, conditionalExpression,
  identifier, literal, logicalExpression, memberExpression, sequenceExpression, voidZero,
} from './builders.js';
import { mintedProxyGlobalName,
  discardedSequenceElement, memberFromKeyName, peelExpressionWrappers, proxyStoreIsSpellable,
  receiverCarriesOptional, renderProxyReceiverPlan, replaceNodeInTree } from './emit-shared.js';

// the AST engine's usage-pure emission - a STAGED port of the babel leg's
// `usagePureCallback` (the design's blueprint): the mainstream classes land first and every
// shape the port does not carry yet BAILS to the raw source, where the structural gate
// counts it against the babel baseline. the bail is the honest state: raw source plus a
// missing import is a visible divergence, never a silently wrong rewrite

// receivers whose evaluation CONSTRUCTS rather than reads: nothing observes their order
// against a computed key's effects
const LITERAL_RECEIVER_TYPES = new Set(['ArrayExpression', 'ObjectExpression', 'Literal', 'TemplateLiteral']);

// SE wrap: `(se1, se2, leaf)` - the sequence spelling both legs share
function withSideEffects(leaf, effects) {
  return effects?.length ? sequenceExpression([...effects.map(effect => cloneNode(effect)), leaf]) : leaf;
}

// a quiet COMPUTED key through the canonical resolver, in the folded shape the callers read (an
// EFFECT-bearing one is `foldSeqKeyLiteralTail`'s job - it owns the prefix that must ride along)
function foldedResolvedKey(property, metaPath, adapter) {
  const key = resolveKey({
    node: property, computed: true, scope: metaPath.scope, adapter, path: metaPath,
    bailOnSideEffectKey: true,
  });
  return typeof key === 'string' ? { key, effects: [] } : null;
}

// a SEQ-prefixed computed key folds to its literal-string tail, the prefix carried as
// effects (`[(c++, 'values')]` -> `values` plus the prefix); null when the tail is not
// a string literal
function foldSeqKeyLiteralTail(property) {
  let key = peelExpressionWrappers(property);
  const effects = [];
  if (key?.type === 'SequenceExpression') {
    effects.push(...key.expressions.slice(0, -1));
    key = peelExpressionWrappers(key.expressions.at(-1));
  }
  if (key?.type !== 'Literal' || typeof key.value !== 'string') return null;
  return { key: key.value, effects };
}

// is the node read as a member OBJECT above - asked THROUGH transparent wrappers and a
// sequence TAIL: `(se(), g[fold]).Array` reads the hop exactly like the bare spelling
function navigatedMemberAbove(metaPath) {
  let navUp = metaPath;
  for (let up = navUp.parentPath; up?.node; up = navUp.parentPath) {
    const upNode = up.node;
    const wraps = (upNode.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(upNode.type))
      && upNode.expression === navUp.node;
    if (!wraps && !(upNode.type === 'SequenceExpression' && upNode.expressions.at(-1) === navUp.node)) break;
    navUp = up;
  }
  return navUp.parentPath?.node?.type === 'MemberExpression' && navUp.parentPath.node.object === navUp.node;
}

// mark a whole subtree consumed: a replacement detaches the ORIGINAL nodes, but the
// traversal's queue may still hold them - a stale usage firing on a detached path would
// rewrite into nowhere or throw on the removed path
export function markSubtreeSkipped(skippedNodes, node, keepLive = null) {
  if (!node || typeof node !== 'object' || !node.type) return;
  // a subtree the render RE-EMITS by identity stays claim-live: later claims land on it in
  // place, exactly where the text emitter's nested edits survive an outer splice
  if (keepLive?.has(node)) return;
  skippedNodes.add(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) for (const item of value) markSubtreeSkipped(skippedNodes, item, keepLive);
    else markSubtreeSkipped(skippedNodes, value, keepLive);
  }
}

// does the subtree hold this exact node - the identity question a rescued effect asks
// (the receiver spelling already carries it, so a prepend would run it twice)
function subtreeContainsNode(root, target) {
  if (root === target) return true;
  if (!root || typeof root !== 'object' || !root.type) return false;
  for (const value of Object.values(root)) {
    if (Array.isArray(value)) {
      for (const item of value) if (subtreeContainsNode(item, target)) return true;
    } else if (subtreeContainsNode(value, target)) return true;
  }
  return false;
}

// clone a receiver with source parens peeled off its member/call SPINE: babel holds parens
// as printer trivia, so a memo respells without them, while TS casts stay - babel memoizes
// `(x satisfies string)?.includes(y)` as `_ref = x satisfies string`
function cloneSpinePeeled(node, inCallee = false) {
  let cur = node;
  while (cur?.type === 'ParenthesizedExpression') {
    // a paren around a CHAIN in CALLEE position is the seal that closes it, not printer trivia:
    // peeled, the short-circuit runs past the seal, where the source calls `undefined` and
    // throws (`(recv.m?.()?.n)(args)`). anywhere else the same paren is trivia the reprint drops
    if (inCallee && cur.expression?.type === 'ChainExpression') break;
    cur = cur.expression;
  }
  if (cur?.type === 'MemberExpression') {
    return { ...cloneNode(cur), object: cloneSpinePeeled(cur.object) };
  }
  if (cur?.type === 'CallExpression') {
    return { ...cloneNode(cur), callee: cloneSpinePeeled(cur.callee, true) };
  }
  return cloneNode(cur ?? node);
}

// ONE sequence level's tail, the value a bare `(eff(), x)` root hands on. a NESTED sequence
// returns null: that is where the baseline's own walk stops, keeping the whole root in its memo
// the value a sequence hands on. ONE level by default: a NESTED sequence is where the value canon
// stops for the routes that ask about a bare root, so its value stays unproven and the guard over
// it lives (`(d++, (c++, globalThis))?.Map.name`). through a kept WRITE the store makes the value
// known and the descent continues (`(k = (c++, (c++, globalThis.self)))?.self` erases)
function singleSequenceTail(node, { nested = false } = {}) {
  const core = peelExpressionWrappers(node);
  if (core?.type !== 'SequenceExpression' || !core.expressions?.length) return null;
  let tail = peelExpressionWrappers(core.expressions.at(-1));
  if (!nested) return tail?.type === 'SequenceExpression' ? null : tail;
  while (tail?.type === 'SequenceExpression' && tail.expressions?.length) {
    tail = peelExpressionWrappers(tail.expressions.at(-1));
  }
  return tail;
}

// an INSTANCE dispatch riding the absorbed tail (`....Set.name` -> `_nameMaybeFunction(_Set)`)
// memoizes the probe - babel's instance route always does, even when the alternate never reads the
// ref; a static tail keeps the plain spelling. a SEQ-prefixed computed key folds to its literal
// tail, and the dispatch above reads the same slot either way
// the nested-guard VALUE spelling: a nav whose unresolvable hop sits BELOW the collapse point
// (`(se(), globalThis).window.self` -> `null == (se(), _globalThis).window ? void 0 : _self`).
// the ident-rooted twin collapses whole through the plain swap - there the prefix read has no
// other reason to exist; a SEQUENCE root re-emits its prefix regardless, so the honest hop read
// stands and carries the guard the source's own semantics ask for. the prefix subtree is REUSED
// in place, so the claims queued inside it still land in the re-emit
function emitNestedGuardNavValue(metaPath, node, {
  adapter, resolvePure, injectPureImport, markRewrite, substituteProbeProxyRoot,
}) {
  function resolveHere(m) {
    return resolvePure(m, metaPath);
  }
  // only a STORED value takes it: the shared canon suppresses the hop claim exactly where the
  // collapse would change what the write holds. a plain read position keeps the realm collapse
  // (`const v = (n++, globalThis).window.self` stores `(n++, _self)`)
  if (!storedNavHopClaimSuppressed(metaPath, { scope: metaPath.scope, adapter, resolvePure: resolveHere })) {
    return false;
  }
  const plan = planProvenNavGuardCollapse({
    rootNode: node, scope: metaPath.scope, adapter, path: metaPath,
    resolvePure: resolveHere, allowSequenceRoot: true,
  });
  if (plan?.kind !== 'nested' || !plan.seqRoot || plan.topAssign || !plan.rootId || !plan.leafPure) return false;
  const prefixNode = plan.hops[plan.lastUnresolvableIdx].node;
  if (plan.rootId.start < prefixNode.start || plan.rootId.end > prefixNode.end) return false;
  substituteProbeProxyRoot(prefixNode);
  let built = identifier(injectPureImport(plan.leafPure.entry, plan.leafPure.hintName));
  const leafKeySe = plan.liveKeySeExprs().slice(plan.testKeySeCount).map(expr => cloneNode(expr));
  if (leafKeySe.length) built = sequenceExpression([...leafKeySe, built]);
  for (const hop of plan.hops.slice(plan.collapseIdx + 1)) {
    built = hop.node.computed
      ? memberExpression(built, cloneNode(hop.node.property), { computed: true, optional: !!hop.liveOptional })
      : memberFromKeyName(built, hop.name, { optional: !!hop.liveOptional });
  }
  markRewrite();
  metaPath.replaceWith(conditionalExpression(
    binaryExpression('==', literal(null), prefixNode), voidZero(), built));
  return true;
}

// pristine possible-global hops navigate into the SAME surface - they drop, and the root
// binding stands for the read (`globalThis.self` tests `_globalThis`, not the `self` ponyfill
// the hop's own claim would substitute)
function peelPristineProxyHops(node, { adapter, resolveGlobalPolyfill }) {
  let base = node;
  while (base?.type === 'MemberExpression' && !base.computed
    && POSSIBLE_GLOBAL_OBJECTS.has(base.property?.name)
    && isPristineProxyGlobal(adapter, base.property.name)
    && resolveGlobalPolyfill(base.property.name)) {
    base = peelExpressionWrappers(base.object);
  }
  return base;
}

// ... and a KEPT sequence navigates just the same: its TAIL drops them in place
function dropTailPristineProxyHops(node, ctx) {
  for (let seq = node; seq?.type === 'SequenceExpression';) {
    const tail = peelExpressionWrappers(seq.expressions.at(-1));
    if (tail?.type === 'SequenceExpression') {
      seq = tail;
      continue;
    }
    const peeled = peelPristineProxyHops(tail, ctx);
    if (peeled !== tail) seq.expressions[seq.expressions.length - 1] = peeled;
    return;
  }
}

// a DESTRUCTURE source reached through a value-OBSERVING carrier (`||`, `&&`, `??`, a ternary
// arm): on a realm without the hop the source reads an undefined step and THROWS before the
// fallback runs, so collapsing the hop would silently hand the pattern a value the source never
// produces (`const { x } = globalThis.self.Array || Set` keeps `.self`). a carrier that only
// PASSES the value on (a sequence tail) observes nothing and keeps the collapse
function valueObservingDestructureSource(metaPath, destructureEmit) {
  let child = metaPath.node;
  let observed = false;
  for (let up = metaPath.parentPath; up?.node; up = up.parentPath) {
    const { type } = up.node;
    let pattern = null;
    if (type === 'LogicalExpression' || type === 'ConditionalExpression') observed = true;
    else if (type === 'VariableDeclarator' && up.node.init === child) pattern = up.node.id;
    else if (type === 'AssignmentExpression' && up.node.right === child) pattern = up.node.left;
    else if (!SKIPPABLE_WRAPPER_TYPES.has(type) && type !== 'ChainExpression'
      && !((type === 'MemberExpression' || type === 'OptionalMemberExpression') && up.node.object === child)) {
      return false;
    }
    // ... and only where the pattern claims NOTHING: a claimed one re-renders its receiver
    // through its own channel, and that render is the collapse
    if (pattern) {
      return observed && (pattern.type === 'ObjectPattern' || pattern.type === 'ArrayPattern')
        && !destructureEmit.patternClaimed(pattern);
    }
    child = up.node;
  }
  return false;
}

function instanceTailMemoTest(test, metaPath, node, ctx) {
  const aboveNode = metaPath.parentPath?.node,
        aboveKey = aboveNode?.type === 'MemberExpression' && aboveNode.object === node
          ? (aboveNode.computed ? foldSeqKeyLiteralTail(aboveNode.property)?.key ?? null
            : aboveNode.property?.type === 'Identifier' ? aboveNode.property.name : null)
          : null;
  if (typeof aboveKey !== 'string'
    || ctx.resolvePure({ kind: 'property', key: aboveKey, placement: 'prototype' }, metaPath)?.kind !== 'instance') {
    return test;
  }
  return ctx.assignmentExpression('=', identifier(ctx.injector.generateDeclaredRef(metaPath)), test);
}

// a hop READ the pure package cannot back (`window` - there is no `_window`): a value past one
// is no longer the always-defined ponyfill. the key question is the canon's own
function unbackedProxyHopKey(node, resolveHere) {
  const key = node?.type === 'MemberExpression' && !node.computed ? node.property?.name : null;
  return !!key && proxyHopLacksPureEntry(key, resolveHere);
}

// the run of enclosing SEQUENCE levels a value tails, and the member READING that run:
// `(c++, (d++, X)).window` answers `.window` for `X`, with `c++` ahead of `d++` - the climb
// walks outward, so each level unshifts in front of the ones already collected. null when
// nothing reads the run
function sequenceTailRunAbove(seqPath) {
  const prefixes = [];
  let cur = seqPath;
  for (let up = cur.parentPath; up?.node; up = cur.parentPath) {
    if (SKIPPABLE_WRAPPER_TYPES.has(up.node.type) && up.node.expression === cur.node) {
      cur = up;
      continue;
    }
    if (up.node.type === 'SequenceExpression' && up.node.expressions.at(-1) === cur.node) {
      prefixes.unshift(...up.node.expressions.slice(0, -1));
      cur = up;
      continue;
    }
    if (up.node.type === 'MemberExpression' && up.node.object === cur.node) {
      return { top: cur, member: up.node, prefixes };
    }
    return null;
  }
  return null;
}

// the call host reached through the transparent wrappers a callee may wear
// (`(arr.at)(0)`, `(arr.at as any)(0)`): the paren-lookup CLASS - the dispatch must still
// bind `this`, so the wrapped spelling routes exactly like the bare one
function climbToCallerPath(metaPath) {
  let callerPath = metaPath.parentPath;
  while (callerPath && (callerPath.node?.type === 'ParenthesizedExpression' || callerPath.node?.type === 'ChainExpression'
    || TS_EXPR_WRAPPERS.has(callerPath.node?.type))) {
    callerPath = callerPath.parentPath;
  }
  return callerPath;
}

// an optional hop anywhere INSIDE a receiver: the arms that cannot consume it stay staged,
// the split and the guard helpers use it to route the `?.`-aware spellings
// does every `?.` in this receiver live under a SEAL? the chain walk stops at a paren / TS
// wrapper, so an optional below one is invisible to the read the member performs - that read is
// plain, and the dispatch may take the receiver whole with the seal's own guard inside it
function optionalsAreSealed(receiver) {
  for (let cur = receiver; ;) {
    if (cur?.type === 'ChainExpression') {
      cur = cur.expression;
      continue;
    }
    if (cur?.type !== 'MemberExpression' && cur?.type !== 'CallExpression') return true;
    if (cur.optional) return false;
    cur = cur.type === 'CallExpression' ? cur.callee : cur.object;
  }
}

// finish a hop rewrite: climb the plain tail a guard absorbs, consume the chain wrapper
// the rewrite's own optionality replaced, land the (possibly guarded) emission, and mark
// the detached original spine off the traversal queue.
// under a guard the plain tail hops above ride inside the alternate (`a?.b.at(0).c.d`
// keeps `.c.d` on the non-null branch - babel's shape); the climb stops at the next `?.`
// hop, which keeps its own short-circuit over the emitted ternary
// is this member a WRITE TARGET - an assignment / update / for-x LHS, or a slot inside a
// destructuring pattern? a write addresses the slot on the surface the source named, so the
// proxy collapse below it keeps the nav's own VALUE (`globalThis.self.x = 1` -> `_self.x`);
// a plain READ folds to the root instead, `delete` included (its own collapse canon)
function memberIsWriteTarget(hopPath) {
  let cursor = hopPath;
  for (let up = cursor.parentPath; up?.node; up = cursor.parentPath) {
    const upNode = up.node;
    if (upNode.type === 'AssignmentExpression') return upNode.left === cursor.node;
    if (upNode.type === 'UpdateExpression') return upNode.argument === cursor.node;
    if (upNode.type === 'ForOfStatement' || upNode.type === 'ForInStatement') return upNode.left === cursor.node;
    // pattern containers hand the question up - a Property or a default only when the
    // member fills its TARGET slot (a default's value side is an ordinary read)
    const climbs = upNode.type === 'ArrayPattern' || upNode.type === 'ObjectPattern'
      || upNode.type === 'RestElement' || upNode.type === 'ParenthesizedExpression'
      || TS_EXPR_WRAPPERS.has(upNode.type)
      || (upNode.type === 'Property' && upNode.value === cursor.node)
      || (upNode.type === 'AssignmentPattern' && upNode.left === cursor.node);
    if (!climbs) return false;
    cursor = up;
  }
  return false;
}

// does a run of PLAIN proxy hops sit directly above this root claim? false as soon as one
// carries a live `?.`: that hop is the environment probe (a hop pure cannot back answers
// `undefined` off-engine), so the whole run must stay spelled - and so must a run whose own
// consumer reads it optionally, where the hop claim's guard render owns the shape
// does a kept WRITE sit between the collapsed spine and a further proxy hop? returns the
// path the extension continues FROM (the write with its wrappers), null otherwise
function stepOverKeptWrite(up, target, { allowOptional, metaPath, proxyHopKey }) {
  const upNode = up.node;
  if (upNode.type !== 'AssignmentExpression' || upNode.operator !== '='
    || peelExpressionWrappers(upNode.right) !== peelExpressionWrappers(target.node)) return null;
  let over = up.parentPath;
  while (over?.node && (over.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(over.node.type))) {
    over = over.parentPath;
  }
  const overNode = over?.node;
  if (overNode?.type !== 'MemberExpression' || peelExpressionWrappers(overNode.object) !== upNode) return null;
  if (overNode.optional && !allowOptional) return null;
  if (!proxyHopKey(overNode, { allowOptional: true, metaPath })) return null;
  let step = up;
  while (step.parentPath?.node && (step.parentPath.node.type === 'ParenthesizedExpression'
    || TS_EXPR_WRAPPERS.has(step.parentPath.node.type))) step = step.parentPath;
  return step;
}

// is the plan's probe hop INSIDE the kept write's value (`(r = globalThis.window)?.self`:
// the undefinability is the held VALUE, not a nav hop)
// the value a probe span yields is INVOKED, not navigated: the source short-circuits the
// call away on a nullish root, so the span's own read must survive as the callee - dropping
// it would call the root's value instead (`((w = globalThis.window)?.self)(1)`)
function probeValueIsInvoked(path) {
  let top = path;
  while (top.parentPath?.node?.expression === top.node
    && (TS_EXPR_WRAPPERS.has(top.parentPath.node.type) || top.parentPath.node.type === 'ChainExpression'
      || top.parentPath.node.type === 'ParenthesizedExpression')) top = top.parentPath;
  const above = top.parentPath?.node;
  return (above?.type === 'CallExpression' || above?.type === 'NewExpression') && above.callee === top.node;
}

function probeHopInValue(plan, probeHop) {
  return !!plan.rootAssign && Number.isInteger(probeHop.node.start)
    && probeHop.node.start >= plan.rootAssign.start && probeHop.node.end <= plan.rootAssign.end;
}

function noteMutatedCtorHopDestructure(metaPath, node, { adapter, destructureEmit }) {
  // the claim may sit under the init's SE wrappers - the surface it names is the same one
  // (`(eff(), globalThis)`, `(q = globalThis)`), and so is the hop above it
  let up = metaPath.parentPath;
  while (up?.node && (up.node.type === 'SequenceExpression' || up.node.type === 'ParenthesizedExpression'
    // the chain wrapper an optional spine wears is transparent to the host climb too, and so is
    // a TS assertion: it says nothing about which host the surface is destructured from
    || up.node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(up.node.type)
    // a CHAIN assignment is transparent; an assignment holding a PATTERN is the host itself
    || (up.node.type === 'AssignmentExpression' && up.node.left?.type !== 'ObjectPattern'))) up = up.parentPath;
  const host = up?.node;
  const assignHost = host?.type === 'AssignmentExpression' && host.left?.type === 'ObjectPattern';
  const pattern = host?.type === 'VariableDeclarator' ? host.id : assignHost ? host.left : null;
  if (pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return;
  const [hop] = pattern.properties;
  // a COMPUTED key spelled as a STRING literal names the same slot as the dotted form, and the
  // re-anchor reads it the same way (`{ ['WeakSet']: { k } }` anchors like `{ WeakSet: { k } }`)
  // a slot DEFAULT on the hop is dead for a pristine proxy step - the hop navigates to the same
  // surface, so the pattern under it is what binds (`{ self: { a } = {} }` flattens like `{ a }`)
  const hopValue = hop.value?.type === 'AssignmentPattern' ? hop.value.left : hop.value;
  if (hop.type !== 'Property') return;
  // ... and a computed key BOUND to a constant string names it too, through the canonical
  // resolver (`const hopKey = 'Map'; { [hopKey]: { viaKey } }`); an EFFECT-bearing key spells
  // no slot the re-anchor may drop - its own effect has nowhere else to run
  const hopKey = hop.computed
    ? (mayHaveSideEffects(hop.key) ? null
      : resolveKey({ node: hop.key, computed: true, scope: metaPath.scope, adapter, path: metaPath }))
    : hop.key?.name ?? (typeof hop.key?.value === 'string' ? hop.key.value : null);
  if (typeof hopKey !== 'string') return;
  // a proxy hop bound to a NAME holds that surface whether or not pure backs it (`window` has
  // no `_window`): a later read classifies through the alias, and its own `?.` is as dead as
  // the direct spelling's (`const { window: w } = globalThis; w?.Object.values(...)`)
  if (hopValue?.type === 'Identifier' && !assignHost && host?.type === 'VariableDeclarator'
    && POSSIBLE_GLOBAL_OBJECTS.has(hopKey) && isPristineProxyGlobal(adapter, hopKey)) {
    destructureEmit.noteProxyHopAlias({
      metaPath, hopKey, localName: hopValue.name, declarationPath: up.parentPath,
    });
    return;
  }
  if (hopValue?.type !== 'ObjectPattern') return;
  // a PRISTINE proxy hop drops WHOLE, and at once: the flattened pattern is what registers
  // the ctor alias a later static read resolves through. every other whole-declarator hop
  // re-anchors on its own member read, at drain
  if (POSSIBLE_GLOBAL_OBJECTS.has(hopKey) && isPristineProxyGlobal(adapter, hopKey)) {
    destructureEmit.noteProxyCtorHopHost(host, metaPath, assignHost);
    return;
  }
  // a MUTATED slot's drain route speaks for a declarator only - an assignment residual has its
  // own channel and no slot for it; the UNTOUCHED re-anchor reads the drain's assignment view
  if (adapter.isMutatedStatic?.('globalThis', hopKey)) {
    if (!assignHost) destructureEmit.noteMutatedCtorHopHost(host);
    return;
  }
  // an assignment whose VALUE is consumed may not re-anchor: `({ Map: { k } } = globalThis)`
  // yields the GLOBAL, while the anchored `({ k } = _Map)` yields the ctor - only a statement
  // position discards that value and can take the rewrite
  if (assignHost && !assignmentInStatementPosition(up) && !discardedSequenceElement(up)) return;
  destructureEmit.noteUntouchedCtorHopHost(host, hopKey, assignHost);
}

// a kept WRITE holding the substituted binding, NAVIGATED further: the read re-reads the
// binding after the write (`(b = Map).keys()` -> `(b = _Map, _Map).keys()`, babel's
// kept-write canon). in VALUE position the write stands alone (`b = _Map`)
function reReadKeptWriteValue(targetPath, id, replacement, { adapter, resolveGlobalPolyfill, skippedNodes }) {
  const writePath = targetPath.parentPath;
  if (writePath?.node?.type !== 'AssignmentExpression' || writePath.node.operator !== '='
    || peelExpressionWrappers(writePath.node.right) !== replacement) return;
  let above = writePath.parentPath;
  while (above?.node && (above.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(above.node.type))) {
    above = above.parentPath;
  }
  const host = above?.node;
  if (host?.type !== 'MemberExpression' || peelExpressionWrappers(host.object) !== writePath.node) return;
  // the same two exclusions the spine collapse makes: a WRITE TARGET addresses the slot
  // on the surface the source named, and a MUTATED polyfillable slot must be read through
  // it so the user's patch wins - both keep the write standing alone
  if (memberIsWriteTarget(above)) return;
  if (!host.computed && isMutatedGlobalSlot(adapter, host.property?.name)
    && resolveGlobalPolyfill(host.property.name)) return;
  const consumedWrite = writePath.node;
  const seq = sequenceExpression([consumedWrite, identifier(id)]);
  writePath.replaceWith(seq);
  skippedNodes.add(seq);
  skippedNodes.add(consumedWrite);
}

// does this nav bottom out on a proxy-global IDENTIFIER (its own name or an alias)? that
// root is what the collapse family keys on; an opaque call root has no collapse to wait for
function navRootIsProxyIdentifier(node, metaPath, adapter, { requireBareName = false } = {}) {
  // writes, hops and sequence tails INTERLEAVE (`((a = globalThis.window) as any)?.self`),
  // so the peel alternates instead of running one kind to exhaustion
  let cur = peelExpressionWrappers(node.object);
  for (;;) {
    if (cur?.type === 'MemberExpression') {
      cur = peelExpressionWrappers(cur.object);
      continue;
    }
    if (cur?.type === 'AssignmentExpression') {
      cur = peelExpressionWrappers(cur.right);
      continue;
    }
    if (cur?.type === 'SequenceExpression') {
      cur = peelExpressionWrappers(cur.expressions.at(-1));
      continue;
    }
    break;
  }
  if (cur?.type !== 'Identifier') return false;
  if (POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) return cur.name;
  // ... an ALIAS binding names the surface but files no claim of its own, so nothing downstream
  // renders the nav for it - a caller standing down on that promise ships the claim raw
  if (requireBareName) return false;
  const aliased = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
  return aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) ? aliased : false;
}

// nothing to rewrite here: the claim is disabled, already consumed, type-only, or its span
// was DETACHED by an earlier emission in the same chain (that render happened above it)
// a `delete` operand names a property slot, never a read - and a claim INSIDE the
// operand's SPINE is owned by the delete too (`delete globalThis.self.Promise` - the hop
// claim must not read the slot the delete removes): the caller climb answers the deep
// case, the shared provider climb (`claimDeleteOperand`) the immediate one
function isDeleteOperand(metaPath) {
  const host = climbToCallerPath(metaPath)?.node;
  if (host?.type === 'UnaryExpression' && host.operator === 'delete') return true;
  return claimDeleteOperand(metaPath);
}

function claimIsMoot(metaPath, node, { isDisabled, skippedNodes, isInTypeAnnotation }) {
  for (let up = metaPath; up?.node; up = up.parentPath) {
    // a claim under a subtree a render RE-EMITS BY IDENTITY stays live: its rewrite lands on
    // the (possibly detached) original, which the re-emission carries into the output
    if (skippedNodes.keepLive?.has(up.node)) break;
    if (up.removed) return true;
  }
  return isDisabled(node) || skippedNodes.has(node) || node?.type === 'JSXIdentifier'
    || isInTypeAnnotation(metaPath);
}

// does this claim render INSIDE a guard memo's cloned value?
function insideMemoClone(metaPath, memoValueClones) {
  for (let up = metaPath; up?.node; up = up.parentPath) if (memoValueClones.has(up.node)) return true;
  return false;
}

// a rebuild from the root swallows a DEAD sequence wrapper above it - the wrapper carried
// nothing but the spelling that just folded (`(0, globalThis.window).Promise = f` ->
// `_globalThis.Promise = f`); an effectful prefix keeps its wrapper, and so does an alias
// base, which keeps the source spelling whole (the text leg's shape the sidecars record)
function swallowDeadSeqWrapper(targetPath) {
  let at = targetPath;
  for (;;) {
    const up = at.parentPath?.node;
    if (up?.type !== 'SequenceExpression' || up.expressions.at(-1) !== at.node
      || up.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr))) return at;
    at = at.parentPath;
  }
}

// receiver-only effects with a pristine proxy tail (`(n += 1, globalThis.self)[S]`):
// the [S] member NAV-consumes the spine - a verdict the tail's revisit cannot see once
// the member is the helper's own call - so the tail folds onto its ROOT here
// (`(n += 1, _globalThis)`, babel's nav collapse); null when the tail is not that shape
function foldPendingReceiverSpineRoot(object, metaPath, { collapseProxyHopSpine, injectPureImport }) {
  const seqValue = peelExpressionWrappers(object);
  const tail = seqValue?.type === 'SequenceExpression' ? peelExpressionWrappers(seqValue.expressions.at(-1)) : null;
  const collapsed = tail?.type === 'MemberExpression' ? collapseProxyHopSpine(tail, metaPath) : null;
  if (!collapsed?.entry || collapsed.aliasRoot || collapsed.keyEffects?.length) return null;
  return sequenceExpression([
    ...seqValue.expressions.slice(0, -1).map(expr => cloneNode(expr)),
    identifier(injectPureImport(collapsed.entry, collapsed.hintName)),
  ]);
}

function plainProxyHopRunAbove(metaPath, proxyHopKey, { allowOptional = false } = {}) {
  // a source PAREN - and the chain wrapper an `?.` wears - is transparent to the run and to
  // the read above it (`(g.window?.self)?.Array` navigates exactly like the bare twin)
  function stepWrappers(child, up) {
    while (up?.node && SKIPPABLE_WRAPPER_TYPES.has(up.node.type) && up.node.expression === child) {
      child = up.node;
      up = up.parentPath;
    }
    return [child, up];
  }
  let [child, up] = stepWrappers(metaPath.node, metaPath.parentPath);
  let sawHop = false;
  while (up?.node?.type === 'MemberExpression' && up.node.object === child) {
    if (up.node.optional && !allowOptional) return null;
    if (!proxyHopKey(up.node, { metaPath, allowOptional })) break;
    sawHop = true;
    [child, up] = stepWrappers(up.node, up.parentPath);
  }
  const consumer = up?.node ?? null;
  // the run's own consumer reading it OPTIONALLY keeps every hop spelled - that `?.` is the
  // environment probe the source asked for. under `allowOptional` the delete canon has
  // already answered for the whole navigation and the consumer is only reported back
  if (!allowOptional
    && ((consumer?.type === 'MemberExpression' && consumer.object === child && consumer.optional)
      || (consumer?.type === 'CallExpression' && consumer.callee === child && consumer.optional))) return null;
  return sawHop ? { consumer, child } : null;
}

// the `delete` verdict travels DOWN the spine. this emitter rewrites as it visits, so a claim
// deeper in the chain climbs into a scaffold an earlier emit already built (a guard test, a
// receiver memo) and can no longer reach the `delete` above it - the text leg, editing spans
// in place, always can. the OUTERMOST claim marks the spine it owns and the deeper visits read
// the verdict off the mark; only the spine is marked, so a computed KEY or a call ARGUMENT -
// which the delete does not navigate - keeps its own answer
function sourceSpanKey(node) {
  return Number.isInteger(node?.start) && Number.isInteger(node?.end) ? `${ node.start }:${ node.end }` : null;
}

// the harvested effects a THROW PROBE does not already run: the ones it consumed, and the ones its
// RENDER spells - a prefix copy of either would evaluate it twice
// (`(dheCombo(), (null == dheCombo().window ? ...).Array, _Array$of)`)
function effectsPastThrowProbe(effects, throwProbe) {
  const spans = collectSourceSpans(throwProbe.node);
  return (effects ?? []).filter(effect => !throwProbe.consumed.includes(effect)
    && !(sourceSpanKey(effect) && spans.has(sourceSpanKey(effect))));
}

// the SOURCE spans a rendered subtree holds: a clone carries the span of what it copied, so a
// harvested effect the render already spells is found by its own span
function collectSourceSpans(root) {
  const spans = new Set();
  walkAstNodes({
    root,
    visit(node) {
      const key = sourceSpanKey(node);
      if (key) spans.add(key);
    },
  });
  return spans;
}

function markDeleteHostedSpine(node, marks) {
  for (let cur = peelExpressionWrappers(node); cur;) {
    const key = sourceSpanKey(cur);
    if (key) marks.add(key);
    switch (cur.type) {
      case 'MemberExpression':
        cur = peelExpressionWrappers(cur.object);
        break;
      case 'CallExpression':
      case 'NewExpression':
        cur = peelExpressionWrappers(cur.callee);
        break;
      case 'AssignmentExpression':
        cur = peelExpressionWrappers(cur.right);
        break;
      default:
        return;
    }
  }
}

// is the PLAIN proxy run above this hop claim read OPTIONALLY by a consumer of its own?
// that `?.` is the only survivor of the source read, and the run's collapse would answer the
// always-defined ponyfill where the source throws - the claim's guard render owns the shape.
// a consumer that is itself a proxy hop is the probe-LEAF shape instead: pure cannot back it,
// so the whole run stays spelled and nothing here renders
function plainRunReadOptionally(metaPath, node, proxyHopKey) {
  let child = node;
  let up = metaPath.parentPath;
  while (up?.node?.type === 'MemberExpression' && up.node.object === child && !up.node.optional
    && proxyHopKey(up.node, { metaPath })) {
    child = up.node;
    up = up.parentPath;
  }
  const consumer = up?.node;
  if (consumer?.type !== 'MemberExpression' || consumer.object !== child || !consumer.optional) return false;
  return !proxyHopKey(consumer, { metaPath, allowOptional: true });
}

// does the receiver below a member hop end on an optional CALL (`arr.flat?.()`)? that segment
// renders as one inline `?.call` value, and the disjunct chain joins it with the hop above -
// a segment ending on an optional MEMBER memoizes its own guard instead
function optionalCallSegmentBelow(node) {
  for (let cur = peelExpressionWrappers(node); cur;) {
    if (cur.type === 'CallExpression') {
      if (cur.optional) return true;
      cur = peelExpressionWrappers(cur.callee);
      continue;
    }
    if (cur.type !== 'MemberExpression' || cur.optional) return false;
    cur = peelExpressionWrappers(cur.object);
  }
  return false;
}

// a probe that renders its OWN guard - a paren SEAL, or a SEQUENCE whose tail carries a live
// `?.` - hands the test that guard's source instead: the inner `?.`'s object. the prefix a
// sequence carried runs ahead of the whole render, where the source ran it. null when the probe
// spells no guard of its own
function descendIntoOwnGuard(probe, ctx) {
  const sealed = probe?.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(probe?.type);
  let inner = sealed ? peelExpressionWrappers(probe) : null;
  // a SEQUENCE - sealed or bare - hands its TAIL on
  for (let seqProbe = inner ?? peelExpressionWrappers(probe); seqProbe?.type === 'SequenceExpression';) {
    inner = peelExpressionWrappers(seqProbe.expressions.at(-1));
    seqProbe = inner;
  }
  if (!sealed && inner === null) return null;
  for (let hop = inner; hop?.type === 'MemberExpression'; hop = peelExpressionWrappers(hop.object)) {
    if (!hop.optional) continue;
    return guardProbeUndefinable(hop.object, ctx) ? hop.object : null;
  }
  return null;
}

// is this node the VALUE a plain assignment stores (through the parens it may wear)?
function assignmentHoldsValue(path) {
  let cur = path;
  for (let up = cur.parentPath; up?.node; up = cur.parentPath) {
    if (up.node.type === 'ParenthesizedExpression' && up.node.expression === cur.node) {
      cur = up;
      continue;
    }
    return up.node.type === 'AssignmentExpression' && up.node.operator === '=' && up.node.right === cur.node;
  }
  return false;
}

// the split's rebuilt `.call(...)` STANDS FOR the source call it replaces, so the source
// node's PRE-MUTATION type travels onto it - the receiver-id stamp's twin. without it a claim
// ABOVE resolves generic over the minted spelling (`arr.flat?.(0).at` reads the untyped `_at`
// where the array-typed `_atMaybeArray` is owed)
// the node-only type resolve is a TYPING REFINEMENT - a null answer degrades to the generic
// helper, never to a wrong rewrite. the resolver descends by PATH, so a shape whose descent
// leaves the node (a callee resolving through a binding) THROWS instead of answering, and a
// throw here would take the whole file down over a spelling nicety: that is a decline
function nodeTypeRefinement(node, scope, resolveNodeType) {
  try {
    return resolveNodeType({ node, scope }) ?? null;
  } catch {
    return null;
  }
}

// the RESULT type of a source METHOD CALL - the only receiver whose type the chain above needs
// off a memo (`arr.at(0)?.at(0).at(0)` - the middle dispatch owes `_atMaybeArray`). every other
// shape stands down: the resolver descends by PATH, and one the split rebuilt (or whose callee
// resolves through a binding) has no path to walk
function memoizedCallResultType(objectNode, metaPath, resolveNodeType) {
  const value = peelExpressionWrappers(objectNode);
  if (value?.type !== 'CallExpression' || value.optional
    || peelExpressionWrappers(value.callee)?.type !== 'MemberExpression'
    || !Number.isInteger(value.start)) return null;
  return nodeTypeRefinement(value, metaPath.scope, resolveNodeType);
}

function stampSourceCallType(built, sourceNode, metaPath, ctx) {
  const type = nodeTypeRefinement(sourceNode, metaPath.scope, ctx.resolveNodeType);
  if (type) ctx.resolvedType.set(built, type);
  return built;
}

// a deep clone must carry the resolved-type STAMPS with it: what lands in the tree is a CLONE
// of the built spelling, and a claim above resolves its receiver off that node - an unstamped
// copy resolves generic (babel's `seededRefClone`, over a whole subtree)
function cloneTyped(node, ctx) {
  const clone = cloneNode(node);
  (function restamp(source, copy) {
    if (Array.isArray(source)) {
      for (const [index, item] of source.entries()) restamp(item, copy[index]);
      return;
    }
    if (!source || typeof source !== 'object' || !copy) return;
    const type = ctx.resolvedType.get(source);
    if (type) ctx.resolvedType.set(copy, type);
    for (const [key, value] of Object.entries(source)) restamp(value, copy[key]);
  })(node, clone);
  return clone;
}

// an OPTIONAL member with a harvested SE key over a REUSABLE receiver: the receiver is its own
// null test - no memo is owed - and the key effects run INSIDE the branch, because native skips
// the property read entirely when the receiver is nullish (`arr?.[(probe(), 'includes')](42)`)
// the slot-deopt DIAGNOSTIC, the twin of the text emitter's `deoptMutatedSlotRead`: a global slot
// the file writes ITSELF keeps its reads native, and the debug report says so once per name
function noteDeoptedSlotRead(meta, { getDebugOutput, adapter, noted }) {
  const debug = getDebugOutput?.();
  if (!debug || noted.has(meta?.name) || !isDeoptedGlobalSlotRead(meta, adapter)) return;
  noted.add(meta.name);
  debug.warn?.(mutatedSlotLeftNativeWarning(meta.name));
}

// an OPTIONAL method call over a plain receiver: harvested effects (and a SOURCE sequence
// prefix) lift ahead of the plain `?.call` dispatch - babel's shape; a receiver the guard
// cannot spell twice memoizes ahead of them (`(_ref = <recv>, k2, _at(_ref)?.call(_ref, 0))`)
function emitOptionalCallWithLiftedSe({ node, parent, callerPath, metaPath, meta, entry, hintName }, ctx) {
  const seqRecvOpt = peelExpressionWrappers(node.object);
  const recvPrefix = seqRecvOpt?.type === 'SequenceExpression' && Number.isInteger(seqRecvOpt.start)
    ? seqRecvOpt.expressions.slice(0, -1) : [];
  const recvTail = seqRecvOpt?.type === 'SequenceExpression'
    ? peelExpressionWrappers(seqRecvOpt.expressions.at(-1)) : seqRecvOpt;
  const reusable = ctx.isReusableReceiver(recvTail);
  const ref = reusable ? null : ctx.injector.generateDeclaredRef(metaPath);
  function held() {
    return reusable ? cloneNode(recvTail) : identifier(ref);
  }
  const liftable = (meta.sideEffects ?? []).filter(effect => !recvPrefix.includes(effect));
  const lookup = callExpression(identifier(ctx.injectPureImport(entry, hintName)), [held()]);
  const dispatch = chainExpression(callExpression(
    memberExpression(lookup, identifier('call'), { optional: true }),
    [held(), ...parent.arguments.map(argument => cloneNode(argument))]));
  ctx.markRewrite();
  const optTarget = callerPath.parentPath?.node?.type === 'ChainExpression' ? callerPath.parentPath : callerPath;
  const consumed = optTarget.node;
  const memoLead = reusable ? [] : [ctx.assignmentExpression('=', identifier(ref), cloneNode(recvTail))];
  optTarget.replaceWith(withSideEffects(dispatch,
    [...memoLead, ...recvPrefix.map(expr => cloneNode(expr)), ...liftable]));
  markSubtreeSkipped(ctx.skippedNodes, consumed);
}

function emitBareOptionalSeDispatch({ node, parent, callerPath, metaPath, meta, entry, hintName }, ctx) {
  const bare = peelExpressionWrappers(node.object);
  // a receiver the guard cannot SPELL TWICE - the test reads it and so does the dispatch -
  // memoizes into the test itself, which is the one evaluation the source performs
  // (`(eff(), arr)?.flat()` -> `null == (_ref = (eff(), arr)) ? void 0 : _flat(_ref).call(_ref)`)
  const reusable = ctx.isReusableReceiver(bare);
  // a PAREN-SEALED lookup keeps the plain emitter's twin: the guard wraps ONLY the lookup -
  // the harvested key effects ride its alternate, where native runs them past the
  // short-circuit - and `.call` stays outside the ternary
  // (`(arr?.[(probe++, "includes")])(1)` -> `(arr == null ? void 0 : (probe++, _includes(arr))).call(arr, 1)`)
  if (ctx.calleeParenWrapped(parent)) {
    if (!reusable) return;
    const keyEffects = (meta.sideEffects ?? [])
      .filter(effect => !subtreeContainsNode(bare, effect))
      .map(effect => cloneNode(effect));
    const lookup = callExpression(identifier(ctx.injectPureImport(entry, hintName)), [cloneNode(bare)]);
    const sealedGuard = conditionalExpression(
      binaryExpression('==', cloneNode(bare), literal(null)), voidZero(),
      keyEffects.length ? sequenceExpression([...keyEffects, lookup]) : lookup);
    ctx.markRewrite();
    const consumed = callerPath.node;
    callerPath.replaceWith(callExpression(
      memberExpression(sealedGuard, identifier('call')),
      [cloneNode(bare), ...parent.arguments.map(argument => cloneNode(argument))]));
    markSubtreeSkipped(ctx.skippedNodes, consumed);
    return;
  }
  const ref = reusable ? null : ctx.injector.generateDeclaredRef(metaPath);
  const held = reusable ? cloneNode(bare) : identifier(ref);
  const optionalCall = parent.optional === true;
  let dispatch = callExpression(
    memberExpression(callExpression(identifier(ctx.injectPureImport(entry, hintName)), [cloneNode(held)]),
      identifier('call'), { optional: optionalCall }),
    [cloneNode(held), ...parent.arguments.map(argument => cloneNode(argument))],
  );
  if (optionalCall) dispatch = chainExpression(dispatch);
  // the memo SPELLS the receiver whole, its own sequence prefix included: an effect the test
  // already runs must not run a second time in the alternate - only the KEY's effects are left
  // for it (`(eff(), arr)?.[(k(), 'flat')]()` -> `... ? void 0 : (k(), _flat(_ref)...)`)
  const effects = (meta.sideEffects ?? [])
    .filter(effect => !subtreeContainsNode(bare, effect))
    .map(effect => cloneNode(effect));
  ctx.markRewrite();
  replaceGuardedHop({
    hopPath: callerPath,
    test: reusable
      ? binaryExpression('==', cloneNode(bare), literal(null))
      : binaryExpression('==', literal(null),
        ctx.assignmentExpression('=', identifier(ref), cloneNode(bare))),
    built: effects.length ? sequenceExpression([...effects, dispatch]) : dispatch,
    skippedNodes: ctx.skippedNodes,
  });
}

// a PAREN-SEALED callee / tag above a guarded hop: the call sits OUTSIDE the seal, so pulling
// its receiver into the alternate would hand the call a bare value and lose `this`. returns the
// FIRST tail member that must stay outside instead, taking the short-circuit the source owed it
// a READ form whose receiver's own evaluation is OBSERVABLE (a member get off a nullish-able
// value, a call): the substitution erases the key spelling, and ECMA runs the receiver BEFORE
// the key, so the memo leads and the harvested effects ride behind it
// (`probeHeld.Object[(k++, 'keys')]` -> `(_ref = probeHeld.Object, k++, _keys(_ref))`).
// a LITERAL receiver constructs unobservably and keeps the plain prefix instead
function emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, ctx) {
  const { injectPureImport, injector, markRewrite, skippedNodes } = ctx,
        receiver = peelExpressionWrappers(node.object),
        id = injectPureImport(entry, hintName),
        effects = meta.sideEffects.map(effect => cloneNode(effect));
  markRewrite();
  if (LITERAL_RECEIVER_TYPES.has(receiver?.type) && !mayHaveSideEffects(receiver)) {
    replaceGuardedHop({
      hopPath: metaPath, test: null,
      built: withSideEffects(callExpression(identifier(id), [cloneNode(receiver)]), effects),
      skippedNodes,
    });
    return;
  }
  const ref = injector.generateDeclaredRef(metaPath);
  replaceGuardedHop({
    hopPath: metaPath, test: null,
    built: sequenceExpression([
      ctx.assignmentExpression('=', identifier(ref), cloneNode(receiver)),
      ...effects,
      callExpression(identifier(id), [identifier(ref)]),
    ]),
    skippedNodes,
  });
}

function parenSealedCalleeTail(hopPath) {
  if (!parenSealedCalleeAbove(hopPath, hopPath.node, peelExpressionWrappers)) return null;
  // the tail the seal keeps outside starts at the FIRST plain member above the hop
  let first = null;
  for (let cur = hopPath, up = hopPath.parentPath; up?.node; up = cur.parentPath) {
    const upNode = up.node;
    if (upNode.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(upNode.type)) {
      cur = up;
      continue;
    }
    if (upNode.type === 'MemberExpression' && upNode.object === cur.node && !upNode.optional) {
      first ??= upNode;
      cur = up;
      continue;
    }
    // only SOURCE PARENS keep the tail outside: a TS cast erases at emit, so the fold stands
    return upNode.type === 'ParenthesizedExpression' && upNode.expression === cur.node ? first : null;
  }
  return null;
}

// the guard climb: how far above the replaced hop the alternate reaches, and which TS wrappers
// it swallowed on the way. extracted from `replaceGuardedHop` for its size
function climbAbsorbedTail(hopPath, { alwaysDefined, navAlternate, unbackedHopKey = null }) {
  const absorbedWrappers = [];
  // a transparent wrapper on the absorbed tail (a `!` non-null, a paren) rides along ONLY
  // when the chain continues above it (`a?.b.map(f)!.at(-1)` keeps `.at` on the branch);
  // a TERMINAL wrapper stays outside the guard (`a?.b.at(0)! + 5` wraps the ternary)
  let cursor = hopPath;
  let target = hopPath;
  // an ALWAYS-DEFINED emission absorbs one leaf-adjacent `?.` hop too - the vestigial
  // rule (`...?.self?.['window']` reads `_self['window']` inside the alternate)
  let pendingWrappers = [];
  let mayAbsorbOptional = alwaysDefined;
  // whether the leaf-adjacent slot already spent its erase: after that the NEXT live `?.`
  // is a step the ternary cannot answer for and stays outside
  let erasedOptional = false;
  let absorbedHop = false;
  // has the absorbed tail crossed a proxy hop pure cannot back? past one the alternate is no
  // longer the always-defined ponyfill and a live `?.` above it stays outside the ternary
  let crossedUnbacked = false;
  for (let up = cursor.parentPath; up?.node; up = cursor.parentPath) {
    const upNode = up.node;
    if (TS_EXPR_WRAPPERS.has(upNode.type)
      || (upNode.type === 'ParenthesizedExpression' && upNode.expression === cursor.node)) {
      if (TS_EXPR_WRAPPERS.has(upNode.type)) pendingWrappers.push(upNode);
      cursor = up;
      continue;
    }
    const memberCont = upNode.type === 'MemberExpression' && upNode.object === cursor.node;
    const callCont = upNode.type === 'CallExpression' && upNode.callee === cursor.node;
    if (!memberCont && !callCont) break;
    // an optional hop whose `?.` attaches DIRECTLY to the guard's result stays outside
    // (`(ternary)?.valueOf()`, `(ternary)?.([3])`); the always-defined leaf-adjacent
    // MEMBER absorbs with its `?.` ERASED (the vestigial rule), and an optional CALL of
    // an already-absorbed callee cannot split from it - it rides the alternate with its
    // `?.` kept (`.reduce?.(...)` inside the branch)
    if (upNode.optional) {
      // an optional MEMBER continuation rides the alternate whatever its base: only its
      // `?.` depends on the base, and the always-defined leaf erases it (the vestigial
      // rule - `...?.self?.['window']` reads `_self['window']`); a live base keeps it
      // (`...?.self.hostBox?.run()` -> `... : _self.hostBox?.run()`)
      if (memberCont) {
        // only the NAV route absorbs: its alternate is a plain spelling the source read
        // through. a DISPATCH result is the guard's own value, and a `?.` on it reads
        // past the guard - it stays outside (`(arr == null ? void 0 : _at(arr)...)?.x`)
        // `navAlternate` is that same route where the leaf is NOT provably defined (an
        // unresolved static off a pure ctor): the tail rides the branch with its `?.` KEPT
        if (!alwaysDefined && !navAlternate) break;
        // ... and an absorbed hop pure CANNOT BACK ends the alternate: the ternary's value is
        // that probe read, and the `?.` above it is the source's own short-circuit on it
        // (`(null == _globalThis.window ? void 0 : _self.window)?.BigInt`)
        if (crossedUnbacked) break;
        // an optional BEHIND an already-erased one is a second short-circuit the ternary
        // cannot answer for and stays OUTSIDE (`(null == p ? void 0 : _self.chrome)?.foo`);
        // reached over PLAIN steps only, it rides the branch with its `?.` kept
        // (`_self.hostBox?.run?.()`), and the nav-alternate route always keeps it
        if (!mayAbsorbOptional && erasedOptional && !navAlternate) break;
        if (mayAbsorbOptional) {
          upNode.optional = false;
          erasedOptional = true;
        }
      } else if (!absorbedHop) break;
    }
    if (memberCont && unbackedHopKey?.(upNode)) crossedUnbacked = true;
    // only on the NAV route, and only directly over the replaced hop: everywhere else the
    // wrapper asserts about a value the emission still produces - a dispatch RESULT keeps it
    // (`arr?.at(-1)!.toString()`), a plain nav spelling does not (`...?.self!.window`)
    if (alwaysDefined && !absorbedHop) absorbedWrappers.push(...pendingWrappers);
    pendingWrappers = [];
    mayAbsorbOptional = false;
    absorbedHop = true;
    cursor = up;
    target = up;
  }
  return { target, absorbedWrappers };
}

// the guard now yields `void 0` on the short-circuit branch, so the member left standing over it
// reads through a `?.` - the source spelling of the very short-circuit the ternary reproduces
function rehangGuardedTailOptional(target, inserted) {
  const up = target.parentPath;
  const above = up?.node;
  if (above?.type !== 'MemberExpression' || peelExpressionWrappers(above.object) !== inserted) return;
  above.optional = true;
  // the chain wrapper belongs at the TOP of the continuation, not on the hop that carries the
  // `?.`: sealed one step up it TERMINATES the chain and the tail above reads plainly
  // (`delete (guard?.chrome).missing` throws where `delete guard?.chrome.missing` short-circuits)
  let top = up;
  for (let cur = up.parentPath; cur?.node; cur = cur.parentPath) {
    const { node } = cur;
    if (!((node.type === 'MemberExpression' && node.object === top.node)
      || (node.type === 'CallExpression' && node.callee === top.node))) break;
    top = cur;
  }
  if (top.parentPath?.node?.type !== 'ChainExpression') top.replaceWith(chainExpression(top.node));
}

function replaceGuardedHop({
  hopPath, test, built, skippedNodes, returnType = null, resolvedType = null, alwaysDefined = false,
  deleteHostTail = false,
  navAlternate = false, leafKeySe = null, prefixSe = null, unbackedHopKey = null,
}) {
  // an earlier claim in the same chain may have replaced this span already (`arr.at?.(0)
  // [(eff(), 'flat')].name` - the split render detaches the caller the SE-key claim holds):
  // a stale path is a no-op, never a throw
  if (hopPath.removed) return;
  // TS wrappers the climb steps over end up INSIDE the absorbed tail: what they asserted about is
  // the substitution, so they go with the source spelling they wrapped
  // (`globalThis.window?.self!.window` -> `... : _self.window`)
  const sealedTail = test ? parenSealedCalleeTail(hopPath) : null,
        // a `delete` consumer needs the MEMBER itself: pulled into the alternate the ternary
        // deletes nothing, so the tail stays outside and re-hangs the short-circuit the guard
        // now owes it (`delete dl()?.window?.self.missing` ->
        // `delete (null == dl().window ? void 0 : _self)?.missing`)
        climbed = test && !sealedTail && !deleteHostTail
          ? climbAbsorbedTail(hopPath, { alwaysDefined, navAlternate, unbackedHopKey }) : null,
        absorbedWrappers = climbed?.absorbedWrappers ?? [];
  if (sealedTail) sealedTail.optional = true;
  let target = climbed?.target ?? hopPath;
  // did the climb take a TAIL along? a TS wrapper spanning one asserts about a read the render
  // KEEPS, so it stays; one spanning the substituted span alone asserts about nothing
  const tailAbsorbed = target !== hopPath;
  // the source `?.` arrived wrapped in a ChainExpression; the rewrite consumed that
  // optionality (the conditional / the rebuilt chain carries it), so the wrapper must go
  // with it - left in place it lends chain precedence to the conditional and the printed
  // form reassociates under a binary parent
  if (target.parentPath?.node?.type === 'ChainExpression') target = target.parentPath;
  // a TS wrapper over the replaced span is CONSUMED with it - an assertion about a value the
  // rewrite substituted asserts nothing, and the source spelling it wrapped is gone
  // (`(nav as any).Math` -> `(<render>).Math`). parens on the way are the printer's to re-derive
  for (let cursor = target, up = alwaysDefined ? target.parentPath : null;
    up?.node && up.node.expression === cursor.node; up = cursor.parentPath) {
    if (up.node.type === 'ParenthesizedExpression') cursor = up;
    else if (TS_EXPR_WRAPPERS.has(up.node.type)) [cursor, target] = [up, up];
    else break;
  }
  // a TS layer between the replaced span and the INVOCATION that consumes it goes with the
  // span: the call reads the guard's own value, and babel's path climbs through the layer
  // before replacing (`(g.window?.self as any)(1)` -> `(null == _globalThis.window ? void 0 : _self)(1)`).
  // every invoking position asks the same - a `new`, a template tag
  let calleeConsumedWrapper = false;
  for (let cursor = target, up = target.parentPath, outermost = null; up?.node; up = cursor.parentPath) {
    const upNode = up.node;
    if (upNode.expression === cursor.node
      && (TS_EXPR_WRAPPERS.has(upNode.type) || upNode.type === 'ParenthesizedExpression')) {
      if (TS_EXPR_WRAPPERS.has(upNode.type)) outermost = up;
      cursor = up;
      continue;
    }
    const invokes = (upNode.type === 'CallExpression' || upNode.type === 'NewExpression')
      ? upNode.callee === cursor.node : upNode.type === 'TaggedTemplateExpression' && upNode.tag === cursor.node;
    if (outermost && invokes) {
      target = outermost;
      calleeConsumedWrapper = true;
    }
    break;
  }
  // the climb may reach a path an earlier emission in the same chain already replaced
  if (target.removed) return;
  // the detached original spine must not re-fire from the traversal queue's stale entries
  // dropped-hop key effects ride as a sequence prefix around the WHOLE alternate - the
  // native order runs them past the guard, before the leaf read
  function withLeafKeySe(alternate) {
    return leafKeySe?.length ? sequenceExpression([...leafKeySe, alternate]) : alternate;
  }
  // non-probe effects prefix the WHOLE emission as a sequence
  function withPrefixSe(replacement) {
    return prefixSe?.length ? sequenceExpression([...prefixSe, replacement]) : replacement;
  }
  const consumed = hopPath.node;
  // effects the render RE-EMITTED BY IDENTITY (no clone) keep their claims live inside the
  // consumed span - the mark walks around them
  const keepLive = new Set([...leafKeySe ?? [], ...prefixSe ?? [], ...skippedNodes.keepLive ?? []]
    .filter(expr => subtreeContainsNode(consumed, expr)));
  if (target === hopPath) {
    // the guard IS the stored nav's rendered value: a later read of the binding classifies
    // through its defined branch, and without the mark the in-place collapse hides the nav
    // from those reads and their claims die
    const replacement = test
      ? markRenderedStoredValue(conditionalExpression(test, voidZero(), withLeafKeySe(built))) : built;
    if (test && returnType) resolvedType?.set(replacement, returnType);
    const inserted = withPrefixSe(replacement);
    target.replaceWith(inserted);
    if (deleteHostTail && test) rehangGuardedTailOptional(target, inserted);
  } else if (test) {
    // a tail (or the chain wrapper) was absorbed: swap the hop for its emission in place,
    // then wrap what the climb collected as the alternate
    // a MEMBER tail hangs OUTSIDE the dropped-hop key effects - they belong to the read the
    // substitution replaced (`(k++, _self).host.w`); a CALL tail keeps them around the whole
    // invocation, where the source spelled them (`(k++, _Array$of(1, 2))`)
    // a consumed TS wrapper spans the replacement but is NOT part of it: the alternate reads
    // through it, so the assertion goes with the source spelling it wrapped
    // a TS wrapper the climb ABSORBED as the target is consumed with the span: the alternate
    // reads through it, and an assertion about a value the rewrite substituted asserts nothing
    // (`(g.window?.self as any).Math` -> `(null == _globalThis.window ? void 0 : _self).Math`)
    function peelTailNode(node) {
      const inner = !tailAbsorbed && TS_EXPR_WRAPPERS.has(node?.type) ? node.expression : node;
      return inner?.type === 'ChainExpression' ? inner.expression : inner;
    }
    const tailCore = peelTailNode(target.node),
          memberTail = tailCore?.type === 'MemberExpression',
          builtCore = built.type === 'ChainExpression' ? built.expression : built;
    hopPath.replaceWith(memberTail ? withLeafKeySe(builtCore) : builtCore);
    for (const wrapper of absorbedWrappers) replaceNodeInTree(target.node, wrapper, wrapper.expression);
    // a TS wrapper the climb passed THROUGH rather than CONSUMED (the span is not always-defined,
    // so the guard is a real test) asserts about the value the ternary now produces - it wraps the
    // CONDITIONAL, not the branch (`(g.window?.self.tsBox as any).list`
    // -> `((null == _globalThis.window ? void 0 : _self.tsBox) as any).list`)
    const outerTsWrappers = [];
    if (tailAbsorbed && !absorbedWrappers.length && !calleeConsumedWrapper) {
      // parens between the layers are the printer's to re-derive - they carry no assertion,
      // so the walk steps over them and collects only the TS layers (`((x as any))!`)
      for (let cur = target.node; cur; cur = cur.expression) {
        if (TS_EXPR_WRAPPERS.has(cur.type)) outerTsWrappers.push(cur);
        else if (cur.type !== 'ParenthesizedExpression') break;
      }
    }
    let alternate = peelTailNode(outerTsWrappers.at(-1)?.expression ?? target.node);
    while (alternate?.type === 'ParenthesizedExpression') alternate = alternate.expression;
    // a `?.` surviving inside the alternate (an optional dispatch, an absorbed optional
    // tail) keeps chain semantics under a wrapper of its own once the guard consumed the
    // original one
    if (receiverCarriesOptional(alternate)) alternate = chainExpression(alternate);
    const replacement = markRenderedStoredValue(
      conditionalExpression(test, voidZero(), memberTail ? alternate : withLeafKeySe(alternate)));
    if (returnType) resolvedType?.set(replacement, returnType);
    let wrapped = replacement;
    for (const wrapper of outerTsWrappers.toReversed()) wrapped = { ...wrapper, expression: wrapped };
    target.replaceWith(withPrefixSe(wrapped));
  } else {
    target.replaceWith(built);
  }
  markSubtreeSkipped(skippedNodes, consumed, keepLive.size ? keepLive : null);
}

// does the member chain read a MUTATED static anywhere (`globalThis.Array.of = patched`
// above `...Array.of(5)`)? the deopt keeps every source `?.` spelled. node-DOWN spine twin
// of the provider's path-UP `chainNavigatesIntoMutatedStatic` (annotations.js) - different
// anchor and direction, and the erase-verdict here asks it of a DETACHED object node the
// path-up walk cannot reach
function chainContainsMutatedStatic(objectNode, { metaPath, adapter }) {
  for (let cur = peelExpressionWrappers(objectNode); ;) {
    if (cur?.type === 'CallExpression' && !cur.optional) {
      cur = peelExpressionWrappers(cur.callee);
      continue;
    }
    if (cur?.type !== 'MemberExpression') return false;
    const key = cur.computed
      ? (peelExpressionWrappers(cur.property)?.type === 'Literal' ? peelExpressionWrappers(cur.property).value : null)
      : cur.property?.name;
    if (typeof key === 'string') {
      const objName = resolveObjectName({
        objectNode: cur.object, scope: metaPath.scope, adapter, path: metaPath,
      });
      if (objName && adapter.isMutatedStatic?.(objName, key)) return true;
    }
    cur = peelExpressionWrappers(cur.object);
  }
}

// the sealed optional-lookup emission: the KEY effect rides its own nullish guard while the
// helper call stays unconditional (it throws on null like the native `(undefined)()`)
function emitSealedKeySeConsume({ id, object, metaPath, hopPath, callerPath, effects, methodCallConsume }, ctx) {
  // a MEMO'd receiver carries its own store as the leading effect: that store IS what the guard
  // tests (`null == (_ref = (mark(), _globalThis)) ? void 0 : (tag(), void 0)`), so it moves into
  // the test instead of running ahead of it
  const memoStore = object?.type === 'Identifier' && effects[0]?.type === 'AssignmentExpression'
    && effects[0].left?.type === 'Identifier' && effects[0].left.name === object.name ? effects[0] : null;
  const { disjuncts, makeBase } = memoStore
    ? { disjuncts: [binaryExpression('==', literal(null), memoStore)], makeBase: () => cloneNode(object) }
    : ctx.guardObject(object, metaPath);
  const guardedKeySe = conditionalExpression(ctx.composeGuardTest(disjuncts, null), voidZero(),
    sequenceExpression([...effects.slice(memoStore ? 1 : 0).map(effect => cloneNode(effect)), voidZero()]));
  const consumed = hopPath.node;
  hopPath.replaceWith(sequenceExpression([guardedKeySe, ctx.buildSymbolConsumeCore({
    id, object: makeBase(), methodCallConsume, callerPath, metaPath, receiverClone: () => makeBase(),
  })]));
  markSubtreeSkipped(ctx.skippedNodes, consumed);
}

// a probe that provably cannot be nullish ERASES its guard - only a genuinely
// undefinable value keeps one. an optional CALL short-circuits to undefined whenever
// its CALLEE is nullish, so any non-literal callee keeps it undefinable (`condFn?.()`);
// an inline function literal never is (`(() => Symbol)?.()`)
// is there a SEAL directly above this node? a paren makes the read through it OBSERVABLE, so the
// probe may be asked off the proxy SPINE below the hop. the chain wrapper oxc hangs on an optional
// spine is transparent to the climb, and each parser dialect spells the paren its own way
function sealedLayerAbove(metaPath, node) {
  if (node.extra?.parenthesized) return true;
  let up = metaPath.parentPath;
  while (up?.node?.type === 'ChainExpression') up = up.parentPath;
  return up?.node?.type === 'ParenthesizedExpression' || !!up?.node?.extra?.parenthesized;
}

// the walk's OWN collapse destroys the evidence a later guard needs: `const a = globalThis
// .window.self` already reads `_self` by the time `(w = a)?.Array.of` asks whether `a` can be
// absent, and the hop canon, blind through the binding, then calls the alias always-defined.
// record the verdict while the source spelling still stands. keyed by declarator node, so the
// module-scope table costs nothing across files
const unbackedHopAliasDecls = new WeakSet();

function noteUnbackedHopAliasInit(metaPath, node, resolvePure, hopNoteCtx = null) {
  // the hop-host note travels with a POSSIBLE-GLOBAL hop claim only - the same surface the
  // identifier arm speaks for; any other member read has its own host channels
  if (hopNoteCtx && node.type === 'MemberExpression' && !node.computed
    && !hopNoteCtx.meta?.sideEffects?.length && POSSIBLE_GLOBAL_OBJECTS.has(node.property?.name)) {
    noteMutatedCtorHopDestructure(metaPath, node, hopNoteCtx);
  }
  const host = metaPath.parentPath?.node;
  if (host?.type !== 'VariableDeclarator' || peelExpressionWrappers(host.init) !== node) return;
  if (navHasUnresolvableProxyHop(node, m => resolvePure(m, metaPath))) unbackedHopAliasDecls.add(host);
}

function aliasHoldsUnbackedHopNav(value, metaPath, adapter) {
  if (value?.type !== 'Identifier') return false;
  const binding = adapter.getBinding(metaPath.scope, value.name, metaPath);
  return unbackedHopAliasDecls.has(binding?.node ?? binding?.path?.node);
}

function guardProbeUndefinable(probe, {
  metaPath, adapter, resolvePure, observableRead = false, nestedSeqUnproven = false,
}) {
  if (probe?.type === 'CallExpression') {
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath },
          probeCallee = peelExpressionWrappers(probe.callee);
    function resolveHere(meta) {
      return resolvePure(meta, metaPath);
    }
    // an INLINE-resolvable call answers with its YIELD, not its callee: a body navigating to
    // an environment probe (`() => globalThis.window`) is absent-able however defined the
    // callee is, and the `?.` above the call is the only thing standing between the collapse
    // and a read off `undefined`. the canonical question, the one the detection itself asks
    if (inlineCallProxyGlobalRoot({ callNode: probe, ...aliasCtx, rejectConditional: true })) {
      return callYieldCanBeUndefined(probe, aliasCtx, resolveHere);
    }
    if (probeCallee?.type === 'ArrowFunctionExpression' || probeCallee?.type === 'FunctionExpression') return false;
    if (proxyReceiverValueCanBeUndefined(probeCallee, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true })) return true;
    // an INIT-LESS declaration (`let condFn;` + conditional assigns) is nullish on the
    // unassigned path - the callee canon only follows kept proxy writes
    if (probeCallee?.type === 'Identifier') {
      const calleeBinding = adapter.getBinding(metaPath.scope, probeCallee.name, metaPath);
      if (calleeBinding?.node?.type === 'VariableDeclarator' && !calleeBinding.node.init) return true;
    }
    return false;
  }
  // a KEPT WRITE holds its VALUE: the canon judges what the write yields, while the
  // test clones the write whole (`null == (w = _globalThis.window)`). the write makes
  // the read OBSERVABLE, so a proxy spine below the probe hop counts as one surface
  const peeledProbe = peelExpressionWrappers(probe);
  let probeValue = peelChainAssignmentDeep(peeledProbe);
  // effectful sequence tails peel manually - the SE-bailing canon stops at them
  // (`(s = (e++, globalThis.self))` proves through the tail)
  for (;;) {
    if (probeValue?.type === 'SequenceExpression') {
      // ... ONE level for the routes that ASK it: a NESTED sequence is where the value canon
      // stops, so its value stays unproven and the guard over it lives
      // (`(d++, (c++, globalThis))?.Map.name`). a whole-swap claim reads no value through the
      // sequence and keeps the ordinary peel (`(d++, (c++, globalThis))?.Array.of` erases)
      const tail = singleSequenceTail(probeValue);
      if (!tail) {
        const deepTail = singleSequenceTail(probeValue, { nested: true });
        // ... but a tail carrying its OWN `?.` renders that guard itself - already rendered by an
        // earlier claim or still spelled - and a second one over it tests a value the first
        // already answered for
        const selfGuarded = receiverCarriesOptional(deepTail)
          || (deepTail?.type === 'ConditionalExpression' && deepTail.consequent?.type === 'UnaryExpression'
            && deepTail.consequent.operator === 'void');
        if (nestedSeqUnproven && !selfGuarded) return true;
        probeValue = deepTail;
        continue;
      }
      probeValue = tail;
      continue;
    }
    const dechained = peelChainAssignmentDeep(probeValue);
    if (dechained === probeValue) break;
    probeValue = peelExpressionWrappers(dechained);
  }
  // a CHAIN-ASSIGN probe keeps its own locked rule, the one the detection's source count asks:
  // the captured value's undefinedness is HOP-based, because the write observes the raw read
  // (`(m = globalThis.window.self)?.x` guards - `.self` off an absent `window` never lands).
  // the value question below answers on the LEAF hop alone and would call it always-defined
  if (probeValue !== peeledProbe
    && (navHasUnresolvableProxyHop(probeValue, m => resolvePure(m, metaPath))
      || aliasHoldsUnbackedHopNav(probeValue, metaPath, adapter))) return true;
  // a bare ALIAS of a proxy surface is spelled, not read: the binding holds what the source
  // stored and the `?.` over it is as dead as the direct spelling's - even where the surface is
  // one pure cannot back (`const { window: w } = globalThis; w?.Object.values(...)`)
  if (probeValue === peeledProbe && probeValue?.type === 'Identifier') {
    const aliased = resolveObjectName({ objectNode: probeValue, scope: metaPath.scope, adapter, path: metaPath });
    if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) return false;
  }
  return proxyReceiverValueCanBeUndefined(
    probeValue, m => resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter, path: metaPath },
    { throughChainAssign: true, observableRead: observableRead || probeValue !== peeledProbe });
}

// an optional STATIC member whose object can genuinely be undefined keeps its guard routes
function optionalMemberStaysGuarded(node, { metaPath, adapter, resolvePure, observableRead = false }) {
  // the INSTANCE route reads a VALUE through the sequence, so a nested one leaves it unproven
  const seqOpts = { metaPath, adapter, resolvePure, nestedSeqUnproven: true };
  // a `?.` inside the receiver guards only when its PROBE can genuinely be undefined -
  // a chain of always-defined reads erases whole (`globalThis?.Array?.from` -> `_Array$from`).
  // the inner probe being defined answers only for the hops BELOW: the hop's own READ can
  // still be the environment probe, and that value is what OUR `?.` tests
  // (`globalThis?.window?.self` - `globalThis` is defined, `window` is not backed, the guard stays)
  let cur = peelExpressionWrappers(node.object);
  while (cur?.type === 'MemberExpression') {
    if (cur.optional) {
      if (guardProbeUndefinable(cur.object, seqOpts)) return true;
      // the extended value question fires only on a SOURCE proxy-global root: a rendered
      // span roots at a minted always-defined binding, and its vestigial `?.` keeps the
      // erase the re-emit spelled (the sealed respell owns the probe there)
      let root = cur;
      while (root?.type === 'MemberExpression') root = peelExpressionWrappers(root.object);
      if (root?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return false;
      return proxyReceiverValueCanBeUndefined(cur, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true, observableRead });
    }
    cur = peelExpressionWrappers(cur.object);
  }
  if (cur?.type === 'CallExpression' && cur.optional) return guardProbeUndefinable(cur, seqOpts);
  let probeObject = peelExpressionWrappers(node.object);
  let sawWrite = false;
  while (probeObject?.type === 'AssignmentExpression') {
    sawWrite = true;
    probeObject = peelExpressionWrappers(probeObject.right);
  }
  // a BARE call value guards even proven (the strict opaque-root canon: `(() =>
  // globalThis)()?.self...` keeps its test); a KEPT WRITE of it erases (the write observes)
  if (!sawWrite && probeObject?.type === 'CallExpression' && !probeObject.optional) return true;
  return proxyReceiverValueCanBeUndefined(probeObject, m => resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true, observableRead });
}

// will this receiver COLLAPSE into a spelling the source never wrote? a hop over a sequence
// always does, and a hop over a call does when the call yields a proxy global (an opaque one
// stays spelled and needs no memo). babel memoizes exactly that minted spelling
// the provider's `symbolReceiverProxyRoot`: a proxy-global receiver directly under the symbol hop
// resolves to its ROOT pure import ONCE, shared, so all three emitters render the same
// `_getIteratorMethod((droppedSe, _root))` instead of a dead leaf hop. a SUBSTITUTED root is always
// defined, so the erased span's `?.` dies with it; a KEPT root can be absent, so its guard re-hangs
// on the symbol member itself
function collapseSymbolProxyRoot(meta, metaPath, { resolvePure, injectPureImport, skippedNodes }) {
  const proxyRoot = meta.symbolReceiverProxyRoot;
  if (!proxyRoot) return false;
  const keptClone = proxyRoot.keepRoot ? cloneNode(proxyRoot.keepRoot) : null,
        rootPure = keptClone ? null : resolvePure({ kind: 'global', name: proxyRoot.rootName }, metaPath);
  if (!keptClone && !rootPure) return false;
  const { node } = metaPath,
        rootBinding = keptClone ?? identifier(injectPureImport(rootPure.entry, rootPure.hintName)),
        droppedSe = proxyRoot.droppedSe.map(effect => cloneNode(effect)),
        isOptional = !!proxyRoot.isOptionalAccess;
  // the collapse replaces the WHOLE receiver span with the root plus the harvested effects: every
  // other claim queued inside it composes against source that is gone
  markSubtreeSkipped(skippedNodes, node.object);
  // a following key SE would make the emit PEEL a sequence receiver and replay only the recorded
  // prefix, losing droppedSe - route it through the SE channel instead. the optional access
  // memoizes the whole receiver in its guard, so it keeps the tighter inline form
  if (droppedSe.length && meta.sideEffects?.length && !isOptional) {
    meta.sideEffects = [...droppedSe, ...meta.sideEffects];
    meta.receiverEffectCount = (meta.receiverEffectCount ?? 0) + droppedSe.length;
    node.object = rootBinding;
  } else node.object = droppedSe.length ? sequenceExpression([...droppedSe, rootBinding]) : rootBinding;
  if (keptClone && isOptional) node.optional = true;
  return true;
}

// the READ whose receiver spelling already carries every harvested effect. a KEPT WRITE
// anchors the prefix and the whole sequence rides INSIDE the dispatch (`((v = g)).Map.name`
// -> `_name((v = _globalThis, _Map))`); a plain SE prefix lifts OUT instead and the quiet
// tail is the receiver. a receiver reading THROUGH a sequence the source never wrote - a
// kept write anywhere in it, or a spelling an earlier render MINTED - memoizes into a ref
// the helper sees (`(_ref = (eff(), _Set), _name(_ref))`); only an author-written sequence
// lifts (a synthesized node carries no source span)
function emitSeCarryingReceiverRead({ node, metaPath, entry, hintName },
  { adapter, injector, injectPureImport, markRewrite, skippedNodes }) {
  const id = injectPureImport(entry, hintName);
  markRewrite();
  const seqRecv = peelExpressionWrappers(node.object),
        seqTail = seqRecv?.type === 'SequenceExpression'
          ? peelExpressionWrappers(seqRecv.expressions.at(-1)) : null;
  const seqWrites = seqRecv?.type === 'SequenceExpression'
          && seqRecv.expressions.slice(0, -1)
            .some(expr => {
              const stored = peelExpressionWrappers(expr);
              // a COMPOUND assignment is an ordinary effect, not a kept write: nothing
              // downstream reads what it stored (`(n += 100, _Promise).name` lifts)
              return stored?.type === 'AssignmentExpression' && stored.operator === '=';
            }),
        liftedPrefix = seqTail && seqTail.type !== 'AssignmentExpression' && !seqWrites
          && Number.isInteger(seqRecv.start)
          ? seqRecv.expressions.slice(0, -1) : null,
        hopOverSeq = seqWrites || receiverMintsSpelling(seqRecv, { adapter, metaPath })
          ? injector.generateDeclaredRef(metaPath) : null;
  replaceGuardedHop({
    hopPath: metaPath, test: null,
    built: liftedPrefix
      ? withSideEffects(callExpression(identifier(id), [cloneNode(seqTail)]), liftedPrefix)
      : hopOverSeq ? sequenceExpression([
        assignmentExpression('=', identifier(hopOverSeq), cloneNode(node.object)),
        callExpression(identifier(id), [identifier(hopOverSeq)]),
      ])
      : callExpression(identifier(id), [cloneNode(node.object)]),
    skippedNodes,
  });
}

function receiverMintsSpelling(objectNode, { adapter, metaPath }) {
  if (objectNode?.type !== 'MemberExpression') return false;
  // an effect-bearing computed KEY folds INTO the collapse the same way a sequence root does
  let below = objectNode;
  while (below?.type === 'MemberExpression') {
    if (below.computed && mayHaveSideEffects(below.property)) return true;
    below = peelExpressionWrappers(below.object);
  }
  // the hops above it collapse with the root, so the question is what the SPINE bottoms on
  if (below?.type === 'SequenceExpression') return true;
  return below?.type === 'CallExpression' && !!inlineCallProxyGlobalRoot({
    callNode: below, scope: metaPath.scope, adapter, path: metaPath,
  });
}

// the `?.()` of an inherited static resolves like its plain twin: the ponyfill is always
// defined, so nothing short-circuits and the split hands back a guard-less receiver. the key
// is passed EXPLICITLY - this path anchors on the trailing claim, not on `super.<key>` itself
function inheritedStaticCalleeSplit(node, callee, metaPath, ctx) {
  const calleeObject = peelExpressionWrappers(callee.object);
  // a COMPUTED key answers through the canonical resolver, but only when it carries NO
  // effect: this split has no slot that spells an effectful key exactly once, so the raw
  // guarded read stays the honest answer there
  // an EFFECT-FREE computed key answers through the canonical resolver; an SE-BEARING one
  // stays out - the claim ABOVE harvests those effects and spells them itself, so a copy
  // here runs them twice, and there is no channel to tell that harvest they were consumed
  const key = callee.computed
    ? resolveKey({
      node: callee.property, computed: true, scope: metaPath.scope,
      adapter: ctx.adapter, path: metaPath, bailOnSideEffectKey: true,
    })
    : callee.property?.type === 'Identifier' ? callee.property.name : null;
  if (typeof key !== 'string') return null;
  const thisReceiver = ctx.isThisReceiver(calleeObject);
  if (calleeObject?.type !== 'Super' && !thisReceiver) return null;
  // an own class member SHADOWS the inherited surface - `this.<key>` reads that one
  if (thisReceiver && ctx.isShadowedByClassOwnMember(metaPath, key)) return null;
  const inherited = ctx.resolveStaticInheritedMember(metaPath, key);
  const remapped = inherited && remapInheritedStaticMeta(ctx.injectorState,
    { kind: 'property', object: null, key, placement: 'static' }, inherited);
  const result = remapped && !ctx.isMutatedStatics(remapped) ? ctx.resolvePure(remapped, metaPath) : null;
  if (!result || result.kind === 'instance') return null;
  return {
    hopKind: 'call',
    disjuncts: [],
    receiver: callExpression(
      memberExpression(identifier(ctx.injectPureImport(result.entry, result.hintName)), identifier('call')),
      [{ type: 'ThisExpression' }, ...node.arguments.map(argument => cloneNode(argument))],
    ),
  };
}

// a probe's OWN spelling: the source read cloned, its proxy root substituted and the dead
// `?.` hops dropped (the shared vestigial verdict - a hop over the always-defined ponyfill
// reads plainly)
function probeSpelling(probeNode, { resolveHere, aliasCtx, substituteProbeProxyRoot, keepLive = null }) {
  // the probe rides the ORIGINAL spelling when a keep-live registry is handed in: claims
  // inside its kept computed keys (`(log.push('k'), 'window')`) fire later in the walk and
  // land in place - the caller's skip mark walks around them
  let probe = keepLive ? probeNode : cloneNode(probeNode);
  if (keepLive) for (const expr of navComputedKeyEffects(probeNode)) keepLive.add(expr);
  for (const hop of vestigialNavOptionals(probe, resolveHere, aliasCtx)) hop.optional = false;
  substituteProbeProxyRoot(probe);
  // seals whose every `?.` the drops erased are dead wrappers - peeled, or an assignment
  // left inside a ChainExpression prints without its required parens
  while (probe?.type === 'ChainExpression' && !receiverCarriesOptional(probe.expression)
    && probe.expression?.optional !== true) {
    probe = probe.expression;
  }
  return probe;
}

// the sequence PREFIXES of every kept computed key in a probe spine - the effect nodes whose
// claims must stay live inside the kept spelling
function navComputedKeyEffects(node) {
  const effects = [];
  for (let cur = peelExpressionWrappers(node); cur?.type === 'MemberExpression';
    cur = peelExpressionWrappers(cur.object)) {
    if (!cur.computed) continue;
    const key = peelExpressionWrappers(cur.property);
    if (key?.type === 'SequenceExpression') effects.push(...key.expressions.slice(0, -1));
  }
  return effects;
}

// a SEAL makes the read above it observable: the source performs it on a value that can be
// absent (`(globalThis.window?.self).Map` throws off-window), and the claim's swap erases it.
// rebuild that read as a THROW PROBE riding ahead of the ponyfill - the sealed value through
// the shared guard plan, the boundary key re-spelling the source read
// does a LOAD-BEARING seal below the claim own the render? the read it made observable rides
// back as a throw probe and the claim's own `?.` erases with the substitution - the guard
// routes would answer `void 0` where the source THROWS. the probe's own precondition, asked
// without building (or injecting) anything
function sealedThrowRidesTheClaim(node, metaPath, ctx) {
  const boundary = sealedChainBoundary(node);
  const key = boundary ? memberKeyName(boundary.member) : null;
  // a PRISTINE PROXY hop read through the seal is the same surface one level down: it
  // collapses with the nav and observes nothing the guard does not, so the guard route keeps
  // it (`((globalThis.window)).self?.Promise?.resolve` - babel spells only the test)
  if (key === null || (POSSIBLE_GLOBAL_OBJECTS.has(key) && isPristineProxyGlobal(ctx.adapter, key))) return false;
  return proxyReceiverValueCanBeUndefined(boundary.inner, m => ctx.resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath }, { throughChainAssign: true });
}

// RENDER half of the alias-held claim probe (the decision is the shared `aliasHeldClaimProbe`):
// the claim's own member read spelled verbatim - the alias binding IS the test, no guard needed.
// a SYNTHETIC member is a render, not a source read, and probing one would loop the visitor
function aliasHeldClaimProbeNode(member, aliasCtx, { resolveGlobalPolyfill, skippedNodes }) {
  if (!Number.isInteger(member?.start)) return null;
  const probe = aliasHeldClaimProbe(member, ({ name }) => resolveGlobalPolyfill(name), aliasCtx);
  if (!probe) return null;
  const read = probe.computed
    ? memberExpression(identifier(probe.object.name), literal(probe.key), { computed: true })
    : memberExpression(identifier(probe.object.name), identifier(probe.key));
  // the probe IS the source read spelled verbatim - a re-visit claiming it would substitute the
  // very ponyfill it stands ahead of
  markSubtreeSkipped(skippedNodes, read);
  return { node: read, consumed: [] };
}

// a PRISTINE proxy hop read through a SEAL names the same surface the seal produced: the hop
// DROPS and the read above it lands on the guard, where the source's own throw lives
// (`(g.window?.self).self.box.at(0)` -> `(null == _g.window ? void 0 : _self).box`). swapping the
// ponyfill in instead hands the read a never-nullish binding and the throw is lost
function sealedPristineHopCollapse(metaPath, node, { adapter, resolvePure, markRewrite }) {
  if (node?.type !== 'MemberExpression' || node.computed || node.optional) return false;
  const key = node.property?.name;
  if (!key || !POSSIBLE_GLOBAL_OBJECTS.has(key) || !isPristineProxyGlobal(adapter, key)) return false;
  const boundary = sealedChainBoundary(node);
  if (boundary?.member !== node) return false;
  // ... and only where the seal holds a value that can genuinely be ABSENT: that is what makes
  // the read above it throw, and what the guard render reproduces. a seal over a proven value
  // has no throw to keep and the ponyfill swap stands (`(bf()).self.Array` -> `_self.Array`)
  if (!proxyReceiverValueCanBeUndefined(boundary.inner, m => resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true })) return false;
  // ... only where something READS through it: in value position the drop would hand back the
  // seal instead of the surface the hop named
  const above = metaPath.parentPath?.node;
  if (above?.type !== 'MemberExpression' || peelExpressionWrappers(above.object) !== node) return false;
  markRewrite();
  metaPath.replaceWith(node.object);
  return true;
}

function sealedClaimThrowProbe(node, metaPath, ctx) {
  const { adapter, resolvePure, resolveGlobalPolyfill, injectPureImport, skippedNodes } = ctx;
  const boundary = sealedChainBoundary(node);
  const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
  if (!boundary) return aliasHeldClaimProbeNode(node, aliasCtx, { resolveGlobalPolyfill, skippedNodes });
  const key = memberKeyName(boundary.member);
  if (key === null) {
    return aliasHeldClaimProbeNode(boundary.member, aliasCtx, { resolveGlobalPolyfill, skippedNodes });
  }
  function resolveHere(m) {
    return resolvePure(m, metaPath);
  }
  if (!proxyReceiverValueCanBeUndefined(boundary.inner, resolveHere, aliasCtx, { throughChainAssign: true })) {
    return null;
  }
  const plan = planProvenNavGuardCollapse({
    rootNode: boundary.inner, scope: metaPath.scope, adapter, path: metaPath,
    resolvePure: resolveHere, throughKeptAssign: true, allowSequenceRoot: true, descendSequenceTail: true,
  });
  // the plan renders a guard whose LEAF is a proxy hop; a sealed nav that ends AT the claim
  // (`(globalThis.window?.Array).of`) has none, so the same shape builds from its two halves -
  // the erase verdict's `?.` object as the test, the claim's own ponyfill as the alternate.
  // that verdict is a GLOBAL question: a static resolvable in the chain does not answer
  // whether the sealed value can be absent (the spelling both other legs ask with)
  // a FOLDED computed key rides the alternate with its effects, where the source ran them - past
  // the guard, before the leaf read (`?.[(c++, 'self')]` -> `... ? void 0 : (c++, _self)`)
  const planRoute = !!plan && !plan.topAssign && plan.kind === 'nested' && !!plan.leafPure;
  const leafPlan = planRoute ? null
    : sealedClaimLeafGuardPlan(boundary.inner, ({ name }) => resolveGlobalPolyfill(name), aliasCtx);
  // the hops ABOVE the collapse are pure cannot back: they respell over the ponyfill leaf, each
  // keeping the `?.` the plan's own tail verdict gives it (`globalThis.window?.self.window` reads
  // `_self.window` off the guard, not the bare `_self`)
  const alternate = planRoute
    ? plan.hops.slice(plan.collapseIdx + 1).reduce(
      (base, hop) => memberFromKeyName(base, hop.name, { optional: !!hop.liveOptional }),
      withSideEffects(identifier(injectPureImport(plan.leafPure.entry, plan.leafPure.hintName)),
        plan.liveKeySeExprs().slice(plan.testKeySeCount)))
    : leafPlan?.leafPure ? identifier(injectPureImport(leafPlan.leafPure.entry, leafPlan.leafPure.hintName))
    : leafPlan?.leafName ? identifier(leafPlan.leafName) : null;
  // a seal the guard renders nothing for (a value-transparent layer over a bare alias -
  // `(held).of`) hides no short-circuit: the alias question stands
  if (!alternate) return aliasHeldClaimProbeNode(boundary.member, aliasCtx, { resolveGlobalPolyfill, skippedNodes });
  const test = planRoute ? ctx.buildNavGuardTest(plan, { metaPath, aliasCtx, resolveHere })
    : probeSpelling(leafPlan.guardObject, { resolveHere, aliasCtx, substituteProbeProxyRoot: ctx.substituteProbeProxyRoot });
  if (!planRoute) markSubtreeSkipped(skippedNodes, test);
  const guarded = conditionalExpression(binaryExpression('==', literal(null), test), voidZero(), alternate);
  const read = boundary.member.computed
    ? memberExpression(guarded, literal(key), { computed: true })
    : memberFromKeyName(guarded, key);
  // the test SPELLS the kept write, so the harvested copy of it must not run a second time -
  // the consumer filters its own effect list on this
  // the folded KEY effects are spelled INSIDE this render (test and alternate): a consumer
  // replaying the claim's own effect list must skip them, or the source's single run doubles
  return {
    node: read,
    consumed: [...planRoute ? plan.keySeExprs : [], ...planRoute && plan.rootAssign ? [plan.rootAssign] : []],
  };
}

// does the receiver SPELL its own harvested effects - the prefix of a sequence whose tail
// is the ctor the fallback resolves, the key's effects staying in the key's own subtree?
// then the swap has no erasure to compensate: it lands on the tail and everything else
// keeps running where the source wrote it
function fallbackSwapsSequenceTail(node, meta) {
  const receiver = peelExpressionWrappers(node.object);
  if (receiver?.type !== 'SequenceExpression'
    || peelExpressionWrappers(receiver.expressions.at(-1))?.type !== 'Identifier') return null;
  const effects = meta.sideEffects ?? [];
  const prefix = receiver.expressions.slice(0, -1);
  const recvHeld = effects.slice(0, meta.receiverEffectCount ?? 0)
    .every(effect => prefix.some(expr => subtreeContainsNode(expr, effect)));
  const keyHeld = effects.slice(meta.receiverEffectCount ?? 0)
    .every(effect => subtreeContainsNode(node.property, effect));
  return recvHeld && keyHeld ? receiver : null;
}

// a COMPUTED hop anywhere down the member spine - the read-form split arm keys on it
// (`navComputedKeyEffects` answers a different question: only the SEQ-keyed hops' effects)
function spineCarriesComputedHop(objectNode) {
  for (let cur = peelExpressionWrappers(objectNode); cur?.type === 'MemberExpression';
    cur = peelExpressionWrappers(cur.object)) if (cur.computed) return true;
  return false;
}

// the READ form of an SE-carrying claim over a LIVE-optional receiver: the guard owns the
// split, the read-form dispatch rides the alternate with the rebuilt receiver spelling -
// its kept key effects run inside it, where the source ran them (babel: `null == (_ref =
// t = gw) ? void 0 : _atMaybeArray(_ref[(k(), "Array")].prototype).call([5], 0)`)
function emitSeReadFormOverLiveOptional({ node, metaPath, entry, hintName }, ctx) {
  const readSplit = ctx.splitOptionalReceiver(node.object, metaPath);
  if (!readSplit || readSplit === ctx.stagedSplit) return;
  const id = ctx.injectPureImport(entry, hintName);
  ctx.markRewrite();
  replaceGuardedHop({ hopPath: metaPath, test: ctx.composeGuardTest(readSplit.disjuncts, null),
    built: callExpression(identifier(id), [readSplit.receiver]), skippedNodes: ctx.skippedNodes });
}

// a KEPT WRITE anywhere down the member spine (`((dw = gw) as any)?.self` - the write
// anchors the kept-root canon even buried under hops)
function spineHoldsKeptWrite(objectNode) {
  // ... and through a SEQUENCE tail: the write is the value the spine reads either way
  // (`(c++, e = globalThis.window)?.[k]` anchors on the same kept write as the bare twin)
  let value = peelExpressionWrappers(objectNode);
  for (;;) {
    if (value?.type === 'MemberExpression') {
      value = peelExpressionWrappers(value.object);
      continue;
    }
    if (value?.type === 'SequenceExpression') {
      value = peelExpressionWrappers(value.expressions.at(-1));
      continue;
    }
    break;
  }
  return value?.type === 'AssignmentExpression';
}

// did the source spell the callee through explicit parens (the paren-lookup class)?
function calleeParenWrapped(callNode) {
  for (let wrapper = callNode.callee; wrapper;) {
    if (wrapper.type === 'ParenthesizedExpression') return true;
    if (wrapper.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(wrapper.type)) wrapper = wrapper.expression;
    else return false;
  }
  return false;
}

// the sealed plainly-called lookup shape (`(arr?.[S])()`): zero args, no `?.` on the call
function isSealedDirectSymbolCall(metaPath) {
  const sealedCallerPath = climbToCallerPath(metaPath);
  const sealedCaller = sealedCallerPath !== metaPath.parentPath ? sealedCallerPath?.node : null;
  return !!sealedCaller && sealedCaller.type === 'CallExpression' && !sealedCaller.optional
    && peelExpressionWrappers(sealedCaller.callee) === metaPath.node && sealedCaller.arguments.length === 0;
}

function chainAssignStaged(meta) {
  return meta.chainAssignInsertAt !== null && meta.chainAssignInsertAt !== undefined;
}

// the source-global NAME of a minted pure import (`_self` -> 'self'), through the
// injector's pure-import registry; null for anything else

export default function createAstUsagePureCallback({
  adapter,
  destructureEmit,
  getDebugOutput = null,
  injector,
  injectorState,
  injectPureImport,
  isDisabled,
  isEntryAvailable,
  isInTypeAnnotation,
  isShadowedByClassOwnMember,
  isThisReceiver,
  isInheritedStaticLookup,
  isMutatedStatics,
  markRewrite,
  resolveStaticInheritedMember,
  memberWritePositionBails,
  resolveGlobalPolyfill,
  resolveNodeType,
  resolvedType,
  resolvePure,
  resolvePureOrGlobalFallback,
  semanticParentNode,
  skippedNodes,
  toHint,
}) {
  // a fold re-queues the membership test it keeps - without the mark it would wrap its
  // own wrap; and the split's comma memos (`(_r = X, _g = _r.m)`): when the raw method
  // read inside one RESOLVES, the lookup absorbs the receiver memo (`_g = _mMaybe(_r =
  // X)`) - the fusion in `replaceInstanceLike` keys on the second set
  // `memoValueClones`: the VALUE a guard memo holds - a claim rendering inside one is not
  // in a SOURCE value position (the memo re-reads it), so an alias root stays spelled
  const [foldedInTests, guardCommaMemos, resolvedClaimNodes, memoValueClones, probeTestClones] = [
          new WeakSet(), new WeakSet(), new WeakSet(), new WeakSet(), new WeakSet(),
        ],
        // the delete-hosted spine, keyed by SOURCE SPAN: a receiver memo clones the nodes it
        // holds, so identity does not reach the claims visited inside it - the span does
        deleteHostedSpines = new Set(),
        // the slot-deopt names the debug report already carries - one line per name, like both
        // other emitters. lives HERE, with the rest of the per-transform state: the factory
        // returns above the helper that reads it, so a `const` beside that helper never runs
        deoptNotedNames = new Set(),
        // ... and what the module-scope slot-deopt note needs from this closure
        deoptCtx = { getDebugOutput, adapter, noted: deoptNotedNames },
        // an optional-spine shape whose babel spelling is not ported yet
        STAGED_SPLIT = Symbol('staged'),
        // what the module-scope sealed-probe render needs from this closure
        sealedProbeCtx = {
          adapter, resolvePure, resolveGlobalPolyfill, injectPureImport, skippedNodes,
          buildNavGuardTest, substituteProbeProxyRoot,
        },
        // ... and what the module-scope inherited-static split needs from it
        inheritedCtx = {
          adapter, isThisReceiver, isShadowedByClassOwnMember, resolveStaticInheritedMember,
          injectorState, isMutatedStatics, resolvePure, injectPureImport,
        },
        // ... and what the module-scope type-stamp pair needs
        typeStampCtx = { resolveNodeType, resolvedType },
        // ... and what the module-scope bare-optional SE dispatch needs
        bareOptionalCtx = {
          isReusableReceiver, injectPureImport, markRewrite, skippedNodes, calleeParenWrapped, injector,
          assignmentExpression,
        },
        // ... and what the module-scope SE-key read memo needs (the builder rides along:
        // the assignment builder is the one slot this closure owns)
        seKeyReadCtx = {
          injectPureImport, injector, markRewrite, skippedNodes, assignmentExpression, resolvePure,
        },
        // ... and what the module-scope pristine-hop peel needs
        hopPeelCtx = { adapter, resolveGlobalPolyfill },
        // ... and what the module-scope nested-guard value render needs
        nestedGuardCtx = {
          adapter, resolvePure, injectPureImport, markRewrite, substituteProbeProxyRoot,
        };
  // the destructure drain owes the same probe reads this callback spells on its claims, and its
  // own emitter has no path to this closure - hand it the bound renders

  // `'at' in arr` - the provider plan decides, four spellings apply it (babel-blueprint arms)
  function handleInExpression(meta, metaPath) {
    if (foldedInTests.has(metaPath.node)) return;
    const plan = planInExpression({
      meta,
      left: metaPath.node.left,
      right: metaPath.node.right,
      isEntryNeeded: isEntryAvailable,
      resolveFallback: m => resolvePureOrGlobalFallback(m, metaPath),
      receiverHint: !meta.object && meta.key && !meta.symbolSourced
        ? toHint(resolveNodeType(metaPath.get('right'))) : null,
      parent: metaPath.parentPath?.node ?? null,
    });
    if (plan.kind === 'noop') return;
    const lhsSe = plan.leadingSe.map(effect => cloneNode(effect));
    function withLhsSe(core) {
      return lhsSe.length ? sequenceExpression([...lhsSe, core]) : core;
    }
    // keep the membership test live (it carries the throw) and answer `true` after it; the
    // clone is re-visited by replaceWith, so the receiver inside still gets its own rewrite
    if (plan.kind === 'fold-after-test') {
      const test = cloneNode(metaPath.node);
      foldedInTests.add(test);
      metaPath.replaceWith(sequenceExpression([test, literal(true)]));
      markRewrite();
      return;
    }
    if (plan.kind === 'symbol') {
      const id = injectPureImport(plan.entry, plan.hint);
      if (plan.call) {
        // the helper CONSUMES the operand the way `in` did - it throws on a nullish one
        metaPath.replaceWith(withLhsSe(callExpression(identifier(id), [cloneNode(plan.right)])));
      } else {
        // swap only the LHS in place so the RHS keeps its visited state
        metaPath.get('left').replaceWith(identifier(id));
        if (lhsSe.length) metaPath.replaceWith(sequenceExpression([...lhsSe, metaPath.node]));
      }
      markRewrite();
      return;
    }
    // the polyfill is always defined, so the membership test is constantly true
    metaPath.replaceWith(withLhsSe(literal(true)));
    markRewrite();
  }

  // `x[S]?.(args)` - the method memo dispatches with its `this` kept:
  // `_getIteratorMethod(x)?.call(x, args)`, receiver memoized when not reusable; the own
  // chain wrapper appears only when the source chain does not continue above
  function emitSymbolIteratorOptionalCall({ metaPath, id, object, parent, memberOptional = false }) {
    // the doubly-optional spelling (`arr?.[S]?.()`) guards the ROOT and keeps the dispatch
    // `?.call` inside the alternate - reusable receivers only, the memo twin is staged
    if (memberOptional && !isReusableReceiver(object)) return;
    let lookupArg;
    let callReceiver;
    if (isReusableReceiver(object)) {
      lookupArg = cloneNode(object);
      callReceiver = cloneNode(object);
    } else {
      const ref = injector.generateDeclaredRef(metaPath);
      lookupArg = assignmentExpression('=', identifier(ref), cloneNode(object));
      callReceiver = identifier(ref);
    }
    const dispatch = callExpression(
      memberExpression(callExpression(identifier(id), [lookupArg]), identifier('call'), { optional: true }),
      [callReceiver, ...parent.arguments.map(argument => cloneNode(argument))],
    );
    const callPath = metaPath.parentPath;
    const upNode = callPath.parentPath?.node;
    const chainContinues = upNode
      && ((upNode.type === 'MemberExpression' && upNode.object === parent)
        || (upNode.type === 'CallExpression' && upNode.callee === parent));
    if (memberOptional) {
      const check = binaryExpression('==', cloneNode(object), literal(null));
      replaceGuardedHop({ hopPath: callPath, test: check, built: dispatch, skippedNodes });
      return;
    }
    let target = callPath;
    if (!chainContinues && target.parentPath?.node?.type === 'ChainExpression') target = target.parentPath;
    const consumed = callPath.node;
    target.replaceWith(chainContinues ? dispatch : chainExpression(dispatch));
    markSubtreeSkipped(skippedNodes, consumed);
  }

  // `obj[Symbol.iterator]()` -> `_getIterator(obj)`; the read form -> `_getIteratorMethod(obj)`.
  // proxy-root collapse, SE threading and the optional spellings are staged
  // a proxy-nav symbol receiver collapses through the shared plan: redundant hops drop, a
  // kept chain-assign root re-emits itself, harvested effects ride the collapsed spine
  // (`(a = globalThis.window).self[S]` -> `_gim(a = _globalThis.window)`), a dropped hop's
  // `?.` re-hangs as the member's own, and dropped-hop key effects precede the root
  function collapseSymbolReceiver(meta, metaPath, state) {
    const { node } = metaPath;
    const { object } = state;
    if (!object || (object.type !== 'MemberExpression' && object.type !== 'SequenceExpression'
      && object.type !== 'ParenthesizedExpression' && object.type !== 'AssignmentExpression')) return;
    const proxyPlan = planProxyReceiver(node, {
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      throughChainAssign: true, resolvePure: m => resolvePure(m, metaPath),
    });
    const rendered = proxyPlan?.kind === 'collapse' ? renderProxyReceiverPlan(proxyPlan, injectPureImport) : null;
    if (!rendered) return;
    let base = rendered.object;
    if (proxyPlan.keyPrefixSE?.length) {
      base = sequenceExpression([...proxyPlan.keyPrefixSE.map(expr => cloneNode(expr)),
        ...base.type === 'SequenceExpression' ? base.expressions : [base]]);
    }
    state.object = base;
    state.memberOptional ||= !!proxyPlan.optional;
    state.proxyPlanFired = true;
    // effects the plan spelled into its render are consumed; the LEAF key's own effects
    // still route through the SE channel over the collapsed receiver
    const planConsumed = new Set([...proxyPlan.keyPrefixSE ?? [], ...proxyPlan.harvestedSE ?? []]);
    state.pendingEffects = state.pendingEffects.filter(effect => !planConsumed.has(effect));
    state.pendingReceiverOnly = false;
  }

  // SE channel: harvested key / receiver effects re-run as a sequence prefix while the
  // dispatch runs on the peeled reusable tail - `(a(), recv)[S]()` -> `(a(), _getIterator(recv))`.
  // returns false when the shape stays staged
  function routeSymbolReceiverEffects(metaPath, state) {
    const { pendingEffects, pendingReceiverOnly, proxyPlanFired } = state;
    if (state.callOptional) return false; // an optional CALL under SE - staged
    // the member's own `?.` splits the effects by side: the KEY's run inside the alternate,
    // where native order puts them, and the RECEIVER's stay spelled in the memo the guard
    // test builds (`(r(), recv)?.[(k(), S)]()` -> `null == (_ref = (r(), recv)) ? void 0 :
    // (k(), _getIterator(_ref))`). a receiver effect the spelling does NOT carry has no
    // slot before the test - staged
    if (state.memberOptional) {
      const peeled = peelExpressionWrappers(state.object);
      const recvSe = pendingEffects.filter(effect => state.receiverSe.has(effect));
      if (!recvSe.length && isReusableReceiver(peeled)) state.object = peeled;
      else if (recvSe.some(effect => !subtreeContainsNode(state.object, effect))) return false;
      state.effects = pendingEffects.filter(effect => !state.receiverSe.has(effect));
      return true;
    }
    let receiver = proxyPlanFired ? state.object : peelExpressionWrappers(state.object);
    if (!proxyPlanFired && receiver?.type === 'SequenceExpression') receiver = receiver.expressions.at(-1);

    // a reusable / pure tail rides the helper argument behind the hoisted effects
    if (isReusableReceiver(receiver) || (!pendingReceiverOnly && !mayHaveSideEffects(receiver))) {
      state.effects = pendingEffects;
      state.object = receiver;
    } else if (pendingReceiverOnly) {
      // a PROXY-NAV tail keeps the sequence inside the helper argument: its own claim
      // substitutes in place and the nav collapse renders `(n += 1, _globalThis)`. every
      // other tail hoists the effects ahead of the helper and rides the argument bare
      // (`(n++, [1, 2, 3])[S]()` -> `(n++, _getIterator([1, 2, 3]))`) - receiver-only
      // effects already run first in source order, so no memo is owed
      if (!holdsProxySurface(receiver, metaPath)) {
        state.effects = pendingEffects;
        state.object = receiver;
      }
    } else {
      // a COLLAPSED spine hands its prefix to the effect channel instead: that prefix IS the
      // dropped hop's own effect, it runs ahead of the key effects exactly as native ran it, and
      // the always-defined tail is re-readable, so no memo is owed (`globalThis[(hop(), 'self')]
      // [(key(), S)]` -> `(hop(), key(), _getIterator(_globalThis))`)
      const seqTail = !state.liveOptionalReceiver && receiver?.type === 'SequenceExpression'
        ? peelExpressionWrappers(receiver.expressions.at(-1)) : null;
      if (seqTail && isReusableReceiver(seqTail)) {
        state.effects = [...receiver.expressions.slice(0, -1), ...pendingEffects];
        state.object = seqTail;
      } else {
        // an effectful receiver evaluates FIRST (source order): memo ahead of the key
        // effects - `(_ref = getObj(), p(), _getIterator(_ref))`
        const seRef = injector.generateDeclaredRef(metaPath);
        state.effects = [assignmentExpression('=', identifier(seRef), cloneNode(receiver)), ...pendingEffects];
        state.object = identifier(seRef);
      }
    }
    return true;
  }

  function handleSymbolIterator(meta, metaPath) {
    const { node } = metaPath;
    if (node.object?.type === 'Super') return;
    // asked of the PROVIDER, before the collapse erases the span that carried the `?.` - the
    // same flag-based verdict the other two emitters read, so all three route alike
    const proxyRootOptional = meta.symbolReceiverProxyRoot?.isOptionalAccess;
    const proxyRootFired = collapseSymbolProxyRoot(meta, metaPath,
      { resolvePure, injectPureImport, skippedNodes });
    const parent = metaPath.parentPath?.node;
    const state = {
      object: node.object,
      memberOptional: node.optional === true,
      callOptional: parent?.type === 'CallExpression' && parent.callee === node && parent.optional,
      proxyPlanFired: proxyRootFired,
      pendingEffects: meta.sideEffects ?? [],
      pendingReceiverOnly: !!meta.sideEffects?.length && meta.receiverEffectCount === meta.sideEffects.length,
      // asked BEFORE the collapse: a live `?.` anywhere in the receiver keeps the memo (the
      // null-guard replays the hop effect from it), a sealed or absent one takes the flat route
      liveOptionalReceiver: proxyRootFired ? !!proxyRootOptional : receiverCarriesLiveOptional(node.object),
      receiverSe: new Set((meta.sideEffects ?? []).slice(0, meta.receiverEffectCount ?? 0)),
      effects: null,
    };
    if (!proxyRootFired) collapseSymbolReceiver(meta, metaPath, state);
    if (state.pendingEffects.length || (!state.proxyPlanFired && meta.receiverEffectCount)) {
      if (!state.pendingEffects.length) return;
      if (!routeSymbolReceiverEffects(metaPath, state)) return;
    }
    const { callOptional, memberOptional, effects } = state;
    let { object } = state;
    // a PAREN SEAL makes the `?.` moot for the entry decision: a plainly-called sealed
    // lookup (`(arr?.[S])()` / `(x?.y?.[S])()`) consumes as the direct get-iterator, the
    // receiver's own `?.` riding inside the helper argument
    const sealedDirectCall = isSealedDirectSymbolCall(metaPath);
    // inner optional hops: the receiver splits at its last-evaluated `?.` MEMBER hop and
    // the whole consumed shape rides the guard (`foo?.bar[S]()` -> `foo == null ? void 0 :
    // _getIterator(foo.bar)`); call-hop receivers and doubly-optional forms stay staged
    let splitDisjuncts = null;
    if (receiverCarriesOptional(object) && !sealedDirectCall && !optionalsAreSealed(object)) {
      if (callOptional || effects) return;
      // the member's own `?.` guards on the MEMO of the carrier receiver instead of a
      // split (`x?.y?.[S]().next()` -> `null == (_ref = x?.y) ? void 0 : _getIterator(_ref)
      // .next()`) - emitGuardedSymbolConsume's guardObject keeps the inner short-circuit
      if (!memberOptional) {
        const split = splitOptionalReceiver(object, metaPath);
        if (!split || split === STAGED_SPLIT || split.hopKind !== 'member') return;
        splitDisjuncts = split.disjuncts;
        object = split.receiver;
      }
    }
    const entry = sealedDirectCall ? 'get-iterator' : resolveSymbolIteratorEntry(node, parent);
    if (!isEntryAvailable(entry)) return;
    // the computed `Symbol.iterator` key must not ALSO take the plain static swap - the
    // helper consumes the whole member
    if (node.computed) markSubtreeSkipped(skippedNodes, node.property);
    const id = injectPureImport(entry, symbolIteratorHint(entry));
    markRewrite();
    if (state.pendingReceiverOnly) {
      object = foldPendingReceiverSpineRoot(object, metaPath, { collapseProxyHopSpine, injectPureImport }) ?? object;
    }
    if (callOptional) return emitSymbolIteratorOptionalCall({ metaPath, id, object, parent, memberOptional });
    const consumesCall = entry === 'get-iterator';
    // extracted from its chain, a carrier receiver takes a wrapper of its own for the print
    function receiverClone() {
      return receiverCarriesOptional(object) ? chainExpression(cloneNode(object)) : cloneNode(object);
    }
    // a PAREN SEAL between the member and its call (`(arr?.[S])()`): the lookup value is
    // read plainly, so the `?.` produces no guard - a nullish receiver throws through the
    // helper exactly like the native `(undefined)()`
    const callerPath = climbToCallerPath(metaPath);
    // a SEAL is a real paren / TS wrapper - the member's own ChainExpression wrapper is the
    // chain itself, not a seal (`x?.[S]` alone must keep its guard)
    let wrapWalk = metaPath.parentPath;
    if (wrapWalk?.node?.type === 'ChainExpression' && wrapWalk.node.expression === node) wrapWalk = wrapWalk.parentPath;
    const sealed = !!wrapWalk?.node
      && (wrapWalk.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(wrapWalk.node.type));
    // the METHOD form consumed by a plain call keeps `this`: `x[S](42)` dispatches
    // `_getIteratorMethod(x).call(x, 42)`; a non-reusable receiver memoizes into the
    // helper argument (`_getIteratorMethod(_ref = getObj()).call(_ref, arg)`)
    const methodCallConsume = !consumesCall
      && callerPath?.node?.type === 'CallExpression' && !callerPath.node.optional
      && peelExpressionWrappers(callerPath.node.callee) === node;
    const hopPath = consumesCall || (sealed && memberOptional) || methodCallConsume ? callerPath : metaPath;
    // a SEALED optional lookup with a KEY effect: native short-circuits the `?.` before the key
    // runs, so the effect rides a guard of its own while the helper call stays unconditional -
    // it throws on null exactly like `(undefined)()` (`(arr?.[(log(), S)])()` ->
    // `(arr == null ? void 0 : (log(), void 0), _getIterator(arr))`)
    if (sealedDirectCall && (memberOptional || state.liveOptionalReceiver) && effects?.length) {
      return emitSealedKeySeConsume({ id, object, metaPath, hopPath, callerPath, effects, methodCallConsume }, {
        guardObject, composeGuardTest, buildSymbolConsumeCore, skippedNodes,
      });
    }
    const core = buildSymbolConsumeCore({ id, object, methodCallConsume, callerPath, metaPath, receiverClone });
    const built = withSideEffects(core, effects);
    if (memberOptional && !sealed) {
      emitGuardedSymbolConsume({ metaPath, id, object, effects, methodCallConsume, callerPath, hopPath });
      return;
    }
    if (splitDisjuncts) {
      replaceGuardedHop({ hopPath, test: composeGuardTest(splitDisjuncts, null), built, skippedNodes });
      return;
    }
    const consumed = hopPath.node;
    hopPath.replaceWith(built);
    markSubtreeSkipped(skippedNodes, consumed);
  }

  // `x?.[S]` / `x?.[S]()` - the null test guards the whole consumed shape; a non-reusable
  // receiver memoizes through the shared guard
  // the consume CORE: the helper call, and for the method form its `.call` dispatch -
  // a non-reusable receiver memoizes into the helper argument
  function buildSymbolConsumeCore({ id, object, methodCallConsume, callerPath, metaPath, receiverClone }) {
    if (methodCallConsume && !isReusableReceiver(object)) {
      const recvRef = injector.generateDeclaredRef(metaPath);
      return callExpression(memberExpression(
        callExpression(identifier(id), [assignmentExpression('=', identifier(recvRef), receiverClone())]),
        identifier('call'),
      ), [identifier(recvRef), ...callerPath.node.arguments.map(argument => cloneNode(argument))]);
    }
    let core = callExpression(identifier(id), [receiverClone()]);
    if (methodCallConsume) {
      core = callExpression(memberExpression(core, identifier('call')),
        [cloneNode(object), ...callerPath.node.arguments.map(argument => cloneNode(argument))]);
    }
    return core;
  }

  function emitGuardedSymbolConsume({ metaPath, id, object, effects, methodCallConsume, callerPath, hopPath }) {
    const guard = guardObject(object, metaPath);
    let guardedCore = callExpression(identifier(id), [guard.makeBase()]);
    if (methodCallConsume) {
      guardedCore = callExpression(memberExpression(guardedCore, identifier('call')),
        [guard.makeBase(), ...callerPath.node.arguments.map(argument => cloneNode(argument))]);
    }
    const [check] = guard.disjuncts;
    // the shared climb absorbs the plain tail into the alternate
    // (`x?.[S]().next()` -> `x == null ? void 0 : _getIterator(x).next()`)
    replaceGuardedHop({ hopPath, test: check, built: withSideEffects(guardedCore, effects), skippedNodes });
  }

  // guard for the OBJECT of a chain's last optional hop: a reusable single token spells
  // `X == null` and is re-read; anything else memoizes - KEEPING its own inner `?.` (that
  // short-circuit routes into this guard), wrapped back into a chain of its own when the
  // extraction strands it outside the original ChainExpression
  function guardObject(objectNode, metaPath, { bareMemo = false } = {}) {
    if (isReusableReceiver(objectNode)) {
      return {
        disjuncts: [binaryExpression('==', cloneNode(objectNode), literal(null))],
        makeBase: () => cloneNode(objectNode),
      };
    }
    const ref = injector.generateDeclaredRef(metaPath);
    // a memo holding a PROXY SURFACE registers as a global alias - the rebuilt spine's
    // claims must resolve through `_ref` exactly like the source root (babel's
    // `tagProxyGlobalMemoRef`); trusted: the ref is plugin-minted, user code cannot rebind
    const surface = proxySurfaceNameOf(objectNode, metaPath);
    if (surface) injectorState?.registerGlobalAlias?.(ref, surface, { trusted: true, minted: true });
    // under a PROXY hop the memo respells bare - babel's hop-drop rebuild starts from the
    // kept write, the TS wrappers drop (`((a = gw) as any)?.self...` -> `_ref = a =
    // _globalThis.window`); every other memo keeps its cast (the `satisfies` canon, and a
    // ctor hop above - `((v = gw) as any)?.Array...` keeps `as any`)
    let memoSource = objectNode;
    if (surface) {
      // trailing ERASABLE hops drop from a SURFACE memo - the surface below them IS the
      // memo's value (`(v = gw)?.self` memoizes `_ref = v = _globalThis.window`); a hop
      // pure cannot back (`window`) is the probe the test must read and stays
      for (let peeledVal = peelExpressionWrappers(memoSource);
        peeledVal?.type === 'MemberExpression' && !peeledVal.computed
          && POSSIBLE_GLOBAL_OBJECTS.has(peeledVal.property?.name)
          && isPristineProxyGlobal(adapter, peeledVal.property.name)
          && resolveGlobalPolyfill(peeledVal.property.name);
        peeledVal = peelExpressionWrappers(memoSource)) {
        // a dropped hop that carried a LIVE `?.` owed a short-circuit of its own: the memo
        // holds that RENDER, not the bare probe below it (`window?.window?.self` memoizes
        // `null == _globalThis.window?.window ? void 0 : _self`). over a KEPT WRITE the memo
        // IS the stored value and the drop stands (`(v = gw)?.self` memoizes `v = _gw.window`)
        const droppedBase = peelExpressionWrappers(peeledVal.object);
        if (peeledVal.optional && peelChainAssignmentDeep(droppedBase) === droppedBase) {
          const dropped = resolveGlobalPolyfill(peeledVal.property.name);
          memoSource = conditionalExpression(
            binaryExpression('==', literal(null), cloneNode(peeledVal.object)),
            voidZero(), identifier(injectPureImport(dropped.entry, dropped.hintName)));
          break;
        }
        memoSource = peeledVal.object;
      }
      // a NAMED pure proven call at the bottom folds onto the surface's pure spelling
      // (`dh().self` memoizes `_ref = _self`); a LITERAL IIFE keeps its source spelling
      const bottomCall = peelExpressionWrappers(memoSource);
      if (bottomCall?.type === 'CallExpression' && !bottomCall.optional
        && peelExpressionWrappers(bottomCall.callee)?.type === 'Identifier'
        && !inlineCallHasObservableEffects({ callNode: bottomCall, scope: metaPath.scope, adapter, path: metaPath })) {
        const surfacePure = resolveGlobalPolyfill(surface);
        if (surfacePure) memoSource = identifier(injectPureImport(surfacePure.entry, surfacePure.hintName));
      }
    }
    const peeled = bareMemo ? cloneNode(peelExpressionWrappers(memoSource)) : cloneSpinePeeled(memoSource);
    // a `?.` sitting directly on a KEPT WRITE whose stored value is provably defined is dead
    // in the memo spelling too - babel writes the read plain (`(h = globalThis)?.window`
    // memoizes `(h = _globalThis).window`). only that hop: every other `?.` in the spelling
    // belongs to a probe the test still owes
    // a rendered dropped hop carries the same spine inside its TEST - deoptionalize there too
    const rendered = peeled.type === 'ConditionalExpression';
    const spine = rendered ? peelExpressionWrappers(peeled.test?.right) : peeled;
    for (let hop = spine; hop?.type === 'MemberExpression'; hop = peelExpressionWrappers(hop.object)) {
      let base = peelExpressionWrappers(hop.object);
      // a PLAIN erasable hop between the `?.` and a kept write already throws on a nullish
      // stored value, so the `?.` above it can never fire and erases with the collapse
      // (`(w = globalThis.window).self?.Array` memoizes `(w = _globalThis.window).Array`)
      let crossedHop = false;
      while (base?.type === 'MemberExpression' && !base.computed && !base.optional
        && POSSIBLE_GLOBAL_OBJECTS.has(base.property?.name) && isPristineProxyGlobal(adapter, base.property.name)
        && resolveGlobalPolyfill(base.property.name)) {
        base = peelExpressionWrappers(base.object);
        crossedHop = true;
      }
      // inside a RENDERED drop the whole prefix is the test's OWN read, and a proven inline
      // call proves there the way a kept write proves everywhere (`dr()?.window` reads plain);
      // a bare probe memo keeps its `?.` - the test is the source's short-circuit itself
      // a kept write of a CALL YIELD proves nothing about definedness - proving WHICH global a
      // call yields is not proving it yields a defined one (the strict opaque-root canon), so
      // the memo keeps the `?.` the source spelled (`(held = ca())?.window`)
      const writtenValue = base?.type === 'AssignmentExpression'
        ? peelExpressionWrappers(peelChainAssignmentDeep(base)) : null;
      const provenBase = (writtenValue ? rendered || writtenValue.type !== 'CallExpression' : false)
        || (rendered && base?.type === 'CallExpression' && !base.optional && !!inlineCallProxyGlobalRoot({
          callNode: base, scope: metaPath.scope, adapter, path: metaPath, rejectConditional: true,
        }));
      if (hop.optional && provenBase
        && (crossedHop || !guardProbeUndefinable(base, { metaPath, adapter, resolvePure }))) hop.optional = false;
    }
    memoValueClones.add(peeled);
    const memoized = receiverCarriesOptional(peeled) ? chainExpression(peeled) : peeled;
    // the base REF stands for the guarded object's VALUE, so it carries that type - a claim
    // rebuilt onto it resolves its typed entry instead of falling generic (`arr.at(0)?.at(0)
    // .at(0)` - the middle dispatch owes `_atMaybeArray`). a MINTED object has no path to
    // descend, so its stamp is the only channel. a PROXY-SURFACE memo stands down: it
    // registers as a global alias and its claims resolve through that table, not the type
    // ... a SOURCE receiver with no stamp still refines through the resolver directly - a
    // literal receiver is a KNOWN type, and losing it under the memo minted a generic Maybe
    // dispatch over a certain receiver (`"abcde"?.slice(1)` kept `.slice` native on the
    // other emitters)
    const baseType = surface ? null
      : resolvedType.get(objectNode)
        ?? memoizedCallResultType(objectNode, metaPath, resolveNodeType)
        ?? nodeTypeRefinement(peelExpressionWrappers(objectNode), metaPath.scope, resolveNodeType);
    return {
      disjuncts: [binaryExpression('==', literal(null), assignmentExpression('=', identifier(ref), memoized))],
      makeBase() {
        const base = identifier(ref);
        if (baseType) resolvedType.set(base, baseType);
        return base;
      },
    };
  }

  // the possible-global SURFACE a receiver's value denotes (`globalThis.window` -> 'window',
  // a bare pristine root -> its own name), or null when the value is not that shape
  function proxySurfaceNameOf(objectNode, metaPath = null) {
    let value = peelExpressionWrappers(objectNode);
    // the value flows out of a sequence TAIL and through a kept write's stored value, and the
    // two interleave (`(eff(), q = globalThis.window)`) - so the peel alternates
    for (;;) {
      if (value?.type === 'SequenceExpression') {
        value = peelExpressionWrappers(value.expressions.at(-1));
        continue;
      }
      if (value?.type !== 'AssignmentExpression') break;
      value = peelExpressionWrappers(value.right);
    }
    // a PROVEN call yields the surface too (`(() => self)()` - the inline canon)
    if (value?.type === 'CallExpression' && !value.optional && metaPath) {
      const called = resolveObjectName({ objectNode: value, scope: metaPath.scope, adapter, path: metaPath });
      return called && POSSIBLE_GLOBAL_OBJECTS.has(called) && isPristineProxyGlobal(adapter, called) ? called : null;
    }
    if (value?.type === 'MemberExpression' && !value.computed
      && POSSIBLE_GLOBAL_OBJECTS.has(value.property?.name) && holdsProxySurface(objectNode, metaPath)) {
      return value.property.name;
    }
    if (value?.type === 'Identifier') {
      if (POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
        return isPristineProxyGlobal(adapter, value.name) ? value.name : null;
      }
      const minted = mintedProxyGlobalName(value.name, injectorState);
      if (minted) return minted;
      // an ALIAS resolves through the canon (`const w = globalThis.window; (a = w)`)
      const aliased = metaPath && resolveObjectName({
        objectNode: value, scope: metaPath.scope, adapter, path: metaPath,
      });
      if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) return aliased;
    }
    return null;
  }

  // split a receiver chain at its LAST-evaluated optional hop: the guard disjuncts hoist
  // into the caller's ternary test and the returned receiver is the de-optionalized spine
  // rebuilt over the guarded base. hops the split leaves RAW inside a memo (`_g = arr.flat`)
  // are the walker's descent problem: it re-visits the replacement and polyfills them in
  // place, which is what composes `null == (_ref = _flatMaybeArray(arr)) ? ...` without any
  // chain orchestration. returns null when the spine carries no optional (an args-only `?.`
  // or a paren-sealed sub-chain: the standalone path treats those receivers as opaque)
  // the OPTIONAL-CALL arm of the split (`X.m?.(...)`), extracted for its size: the
  // callee spelling decides the guard shape
  // the DOUBLY-optional arm (`X?.m?.()` / `X.m?.()` with an optional method hop): the
  // probe decides between the guarded-disjunct shape and the kept-`?.` memo
  function splitDoublyOptionalCall({ node, metaPath, callee, split }) {
    const { reusabilityView, superReceiver, reusableThisArg, cloneReceiverValue } = split;
    // the stand-down mirrors the single-`?.` arm: a resolvable STATIC claim over a
    // provably DEFINED object erases BOTH `?.` once substituted (`Array?.from?.(x)` ->
    // `_Array$from(x)`; the result's own `?.` still guards above)
    if (!callee.computed && callee.property?.type === 'Identifier') {
      const dCalleeObject = peelExpressionWrappers(callee.object);
      const dObjName = dCalleeObject?.type === 'Identifier' && !adapter.getBinding?.(metaPath.scope, dCalleeObject.name)
        ? dCalleeObject.name
        : resolveObjectName({ objectNode: callee.object, scope: metaPath.scope, adapter, path: metaPath });
      if (dObjName && !proxyReceiverValueCanBeUndefined(dCalleeObject, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true })) {
        const dClaim = resolvePure(
          { kind: 'property', object: dObjName, key: callee.property.name, placement: 'static' }, metaPath);
        if (dClaim && dClaim.kind !== 'instance') return null;
      }
    }
    const { result: optionalCalleeProbe } = resolvePureOrGlobalFallback({
      kind: 'property', object: splitReceiverTypeHint(callee.object, metaPath),
      key: callee.computed ? null : callee.property?.name, placement: 'prototype',
    }, metaPath);
    if (!optionalCalleeProbe) {
      // an UNRESOLVABLE optional method keeps its `?.` in the read and memoizes in the
      // same test (`(_r = recv, _m = _r?.notPoly)`); a reusable receiver reads directly
      let refMethod;
      let disjuncts;
      let thisArg;
      if (isReusableReceiver(reusabilityView) || superReceiver) {
        refMethod = injector.generateDeclaredRef(metaPath);
        disjuncts = [binaryExpression('==', literal(null),
          assignmentExpression('=', identifier(refMethod), chainExpression(cloneNode(callee))))];
        thisArg = reusableThisArg();
      } else {
        // refs mint in EVALUATION order (receiver memo, then method) - the babel push
        // order the function-host declaration preserves
        const refRecv = injector.generateDeclaredRef(metaPath);
        refMethod = injector.generateDeclaredRef(metaPath);
        const recvClone = cloneReceiverValue();
        const optRead = memberExpression(identifier(refRecv), cloneNode(callee.property),
          { computed: callee.computed, optional: true });
        disjuncts = [binaryExpression('==', literal(null), sequenceExpression([
          assignmentExpression('=', identifier(refRecv),
            receiverCarriesOptional(callee.object) ? chainExpression(recvClone) : recvClone),
          assignmentExpression('=', identifier(refMethod), chainExpression(optRead)),
        ]))];
        thisArg = identifier(refRecv);
      }
      return {
        hopKind: 'call',
        disjuncts,
        receiver: stampSourceCallType(
          callExpression(memberExpression(identifier(refMethod), identifier('call')),
            [thisArg, ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
      };
    }
    // `X?.m?.()`: the root guards first, the method memo joins as a second disjunct
    // and the call keeps `this` through the shared base (`_ref2.call(_ref)`)
    const rootGuard = guardObject(callee.object, metaPath);
    const ref = injector.generateDeclaredRef(metaPath);
    const methodRead = memberExpression(rootGuard.makeBase(), cloneNode(callee.property), { computed: callee.computed });
    return {
      hopKind: 'call',
      disjuncts: [...rootGuard.disjuncts,
        binaryExpression('==', literal(null), assignmentExpression('=', identifier(ref), methodRead))],
      receiver: stampSourceCallType(
        callExpression(memberExpression(identifier(ref), identifier('call')),
          [rootGuard.makeBase(), ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
    };
  }

  // the receiver's RESOLVED TYPE names the typed instance entry for the split's own
  // method resolution (`[].at?.(1)` -> `_atMaybeArray`, babel's typed probe); null when
  // the type does not resolve - the bare prototype meta then keeps the generic entry
  function splitReceiverTypeHint(receiverNode, metaPath) {
    const value = peelExpressionWrappers(receiverNode);
    if (!value) return null;
    return toHint(nodeTypeRefinement(value, metaPath.scope, resolveNodeType)) ?? null;
  }

  // a callee that spells a resolvable STATIC claim is always defined once substituted -
  // the `?.()` erases with it (extracted from the split for its size)
  function staticCalleeStandsDown({ callee, calleeObject, metaPath }) {
    // a `this` / `super` STATIC lookup resolves through the class's INHERITED chain, not
    // through an object name: its own emitter owns the call, so the split stands down
    // (`this[(k++, 'from')]?.([1, 2])` inside `class C extends Array`)
    if (calleeObject?.type === 'ThisExpression' || calleeObject?.type === 'Super') {
      // the key answers through the same canon the object-named arm uses; the class context is
      // asked off THIS path (a sibling read in the same static member sees the same class)
      const inheritedKey = callee.computed
        ? foldSeqKeyLiteralTail(callee.property)?.key
          ?? resolveKey({
            node: callee.property, computed: true, scope: metaPath.scope,
            adapter, path: metaPath, bailOnSideEffectKey: true,
          })
        : callee.property?.name;
      const shadowed = calleeObject.type === 'ThisExpression'
        && isShadowedByClassOwnMember(metaPath, inheritedKey);
      const inherited = typeof inheritedKey === 'string' && !shadowed
        ? remapInheritedStaticMeta(injectorState, null, resolveStaticInheritedMember(metaPath, inheritedKey)) : null;
      // a MUTATED slot keeps the live read, and an inherited INSTANCE member is no static claim
      const inheritedClaim = inherited && !isMutatedStatics(inherited) ? resolvePure(inherited, metaPath) : null;
      if (inheritedClaim && inheritedClaim.kind !== 'instance') return true;
    }
    // the `?.()` erases with it and babel keeps NO guard (`Array.from?.([1]).at(-1)` ->
    // `_atMaybeArray(_ref = _Array$from([1])).call(_ref, -1)`) - stand down, the memo
    // clone's descent claim owns the call
    const calleeObjectName = calleeObject?.type === 'Identifier'
      ? (adapter.getBinding?.(metaPath.scope, calleeObject.name) ? null : calleeObject.name)
      : resolveObjectName({ objectNode: calleeObject, scope: metaPath.scope, adapter, path: metaPath });
    if (calleeObjectName) {
      // a SEQ-prefixed key folds to its literal tail - the claim's own render carries
      // the effects (`?.[(c++, 'from')]` stands down like `.from`)
      // ... and every other computed spelling answers through the canonical key resolver (a
      // const alias, a folded concatenation): only the KEY decides the stand-down. an
      // EFFECT-bearing key bails - it owns a slot the erased spelling would drop
      const staticKey = callee.computed
        ? foldSeqKeyLiteralTail(callee.property)?.key
          ?? resolveKey({
            node: callee.property, computed: true, scope: metaPath.scope,
            adapter, path: metaPath, bailOnSideEffectKey: true,
          })
        : callee.property?.name;
      if (typeof staticKey === 'string') {
        const staticClaim = resolvePure(
          { kind: 'property', object: calleeObjectName, key: staticKey, placement: 'static' }, metaPath);
        if (staticClaim && staticClaim.kind !== 'instance') return true;
      }
    }
    return false;
  }

  function splitOptionalCallReceiver(node, metaPath) {
    const callee = peelExpressionWrappers(node.callee);
    // a BARE callee's `?.()` guards on the callee value itself: reusable re-reads
    // (`a == null ? void 0 : _at(_ref = a()).call(_ref, 0)`); a COMPLEX or non-reusable
    // callee memoizes, the disjunct guards the memo and the call reads it exactly once
    // (`pick(1)?.()` -> `null == (_ref = pick(1)) || ... _ref()`, babel's callee-split)
    if (callee?.type !== 'MemberExpression') {
      if (callee?.type === 'Super') return STAGED_SPLIT;
      if ((callee?.type === 'Identifier' || callee?.type === 'ThisExpression') && isReusableReceiver(callee)) {
        return {
          hopKind: 'call',
          disjuncts: [binaryExpression('==', cloneNode(callee), literal(null))],
          receiver: callExpression(cloneNode(callee), node.arguments.map(argument => cloneNode(argument))),
        };
      }
      // SOURCE-authored callees only: a plugin-built callee (no source span - a rewritten
      // inner dispatch on re-visit) belongs to the chain-threading route, and memoizing it
      // here would freeze a half-threaded chain
      if (typeof callee?.start !== 'number') return STAGED_SPLIT;
      const calleeRef = injector.generateDeclaredRef(metaPath);
      return {
        hopKind: 'call',
        disjuncts: [binaryExpression('==', literal(null),
          assignmentExpression('=', identifier(calleeRef), cloneNode(callee)))],
        receiver: callExpression(identifier(calleeRef), node.arguments.map(argument => cloneNode(argument))),
      };
    }
    // an INHERITED STATIC callee substitutes to an always-defined binding, so its `?.()`
    // erases with it and the call binds `this` (the subclass) - the dispatch above needs no
    // guard at all (`super.from?.().at(0)` -> `_at(_ref = _Array$from.call(this)).call(_ref, 0)`)
    const inheritedSplit = inheritedStaticCalleeSplit(node, callee, metaPath, inheritedCtx);
    if (inheritedSplit) return inheritedSplit;
    // the repeated receiver respells on the fully-peeled view (`(globalThis).flat?.()`
    // reuses `_globalThis` bare), but REUSABILITY peels parens only - a TS cast keeps
    // babel memoizing (`(globalThis as any).flat?.()` -> `_ref2 = _globalThis`), and the
    // SEAL semantics of the live-optional test read the unpeeled spelling
    const calleeObject = peelExpressionWrappers(callee.object);
    let reusabilityView = callee.object;
    while (reusabilityView?.type === 'ParenthesizedExpression') reusabilityView = reusabilityView.expression;
    // `super` cannot memoize (`_ref = super` does not parse) - the method memoizes whole
    // and the call runs on `this`, babel's dedicated super-call spelling
    const superReceiver = calleeObject?.type === 'Super';
    function reusableThisArg() {
      return superReceiver ? { type: 'ThisExpression' } : cloneNode(calleeObject);
    }
    // a proxy-surface receiver memoizes as a VALUE: the hops stay spelled (babel keeps
    // the original node, whose hop claims detection already marked handled) - suppress
    // the clone's hop claims so only the root substitutes (`_ref2 = _globalThis.self`)
    // the memo VALUE clones unpeeled: a TS cast stays spelled unless a claim on the
    // clone consumes it (`(() => _globalThis)() as any` keeps the cast, a pristine
    // global's claim eats its wrapper)
    function cloneReceiverValue() {
      const clone = cloneNode(callee.object);
      if (holdsProxySurface(callee.object, metaPath)) {
        for (let hop = peelExpressionWrappers(clone); hop?.type === 'MemberExpression' && !hop.computed
          && POSSIBLE_GLOBAL_OBJECTS.has(hop.property?.name); hop = peelExpressionWrappers(hop.object)) {
          skippedNodes.add(hop);
        }
      }
      return clone;
    }
    const split = { reusabilityView, superReceiver, reusableThisArg, cloneReceiverValue };
    if (callee.optional) {
      return splitDoublyOptionalCall({ node, metaPath, callee, split });
    }
    if (staticCalleeStandsDown({ callee, calleeObject, metaPath })) return null;
    if (!isReusableReceiver(reusabilityView) && !superReceiver) {
      const refRecv = injector.generateDeclaredRef(metaPath);
      const refMethod = injector.generateDeclaredRef(metaPath);
      const recvIdForRead = identifier(refRecv);
      // the memo ref carries the RECEIVER's resolved type: the re-visited method read
      // resolves its typed instance entry off it (`[].at?.(1)...` -> `_atMaybeArray`)
      const recvType = nodeTypeRefinement(peelExpressionWrappers(callee.object), metaPath.scope, resolveNodeType);
      if (recvType) resolvedType.set(recvIdForRead, recvType);
      const methodRead = memberExpression(recvIdForRead, cloneNode(callee.property), { computed: callee.computed });
      const methodAssign = assignmentExpression('=', identifier(refMethod), methodRead);
      let disjuncts;
      if (receiverCarriesLiveOptional(callee.object)) {
        // X's own short-circuit must run before the method read. a RESOLVING method
        // guards as its own disjunct (the descent swaps the read for the lookup); an
        // unresolvable one keeps the comma memo with an OPTIONALIZED read - the memo can
        // be nullish and the plain read would throw where native short-circuits
        const { result: probe } = resolvePureOrGlobalFallback({
          kind: 'property', object: splitReceiverTypeHint(callee.object, metaPath),
          key: callee.computed ? null : callee.property?.name, placement: 'prototype',
        }, metaPath);
        if (!probe) {
          const optRecvId = identifier(refRecv);
          if (recvType) resolvedType.set(optRecvId, recvType);
          const optRead = memberExpression(optRecvId, cloneNode(callee.property),
            { computed: callee.computed, optional: true });
          disjuncts = [binaryExpression('==', literal(null), sequenceExpression([
            assignmentExpression('=', identifier(refRecv), chainExpression(cloneReceiverValue())),
            assignmentExpression('=', identifier(refMethod), chainExpression(optRead)),
          ]))];
        } else {
          disjuncts = [
            binaryExpression('==', literal(null),
              assignmentExpression('=', identifier(refRecv), chainExpression(cloneReceiverValue()))),
            binaryExpression('==', literal(null), methodAssign),
          ];
        }
      } else {
        // a plain receiver evaluates in the same test: the comma memo
        const memo = sequenceExpression([
          assignmentExpression('=', identifier(refRecv), cloneReceiverValue()), methodAssign,
        ]);
        guardCommaMemos.add(memo);
        disjuncts = [binaryExpression('==', literal(null), memo)];
      }
      return {
        hopKind: 'call',
        disjuncts,
        receiver: stampSourceCallType(
          callExpression(memberExpression(identifier(refMethod), identifier('call')),
            [identifier(refRecv), ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
      };
    }
    const ref = injector.generateDeclaredRef(metaPath);
    // a proxy-surface receiver blocks the descent's instance claim on the memoized read
    // (`_ref = _globalThis.flat` would stay raw), so the split resolves the method itself -
    // babel's chain-combine canon: a bare prototype extraction, receiver reused as `this`
    let methodRead = cloneNode(callee);
    if (!callee.computed && callee.property?.type === 'Identifier' && holdsProxySurface(calleeObject, metaPath)) {
      const { result: probe } = resolvePureOrGlobalFallback({
        kind: 'property', object: splitReceiverTypeHint(calleeObject, metaPath),
        key: callee.property.name, placement: 'prototype',
      }, metaPath);
      if (probe?.kind === 'instance') {
        methodRead = callExpression(identifier(injectPureImport(probe.entry, probe.hintName)),
          [cloneNode(calleeObject)]);
      }
    }
    return {
      hopKind: 'call',
      disjuncts: [binaryExpression('==', literal(null), assignmentExpression('=', identifier(ref), methodRead))],
      receiver: stampSourceCallType(
        callExpression(memberExpression(identifier(ref), identifier('call')),
          [reusableThisArg(), ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
    };
  }

  // one OPTIONAL member hop of the split: the guard, the proxy-surface drop, the
  // proven chains - extracted from the recursion for its size
  function splitOptionalMemberHop(node, metaPath) {
    // the `?.` tests a value that COLLAPSES to a pure CTOR binding - the polyfill makes it
    // always-defined, so the guard is dead and the hop reads straight off the ponyfill
    // (`globalThis.Map?.list.at(0)` -> `_at(_ref = _Map.list).call(_ref, 0)`, babel's
    // flatten). effect-bearing navigation keeps the guard - its rescue nodes have no slot
    // here, and the memo the guard mints is what carries them
    const deadCtorSwap = proxyGlobalMemberCtorPureSwap({
      receiver: node.object,
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      resolvePure: meta => resolvePure(meta, metaPath),
    });
    // ... unless the navigation still owes an ENVIRONMENT PROBE: a live `?.` over a hop pure
    // cannot back short-circuits the whole read off-engine, and swapping the always-defined
    // ponyfill in its place answers a value where the source answers undefined
    // (`globalThis.window?.self?.Array.of(1)` must keep `null == _globalThis.window`)
    const probedNav = receiverCarriesLiveOptional(node.object)
      && navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath));
    if (deadCtorSwap && !deadCtorSwap.se.length && !probedNav) {
      const pureId = identifier(injectPureImport(deadCtorSwap.pure.entry, deadCtorSwap.pure.hintName));
      return {
        hopKind: 'member',
        disjuncts: [],
        receiver: memberExpression(pureId, cloneNode(node.property), { computed: node.computed }),
      };
    }
    const surfaceHeld = holdsProxySurface(node.object, metaPath);
    const surfaceHop = surfaceHeld ? proxyHopKey(node, { allowOptional: true }) : null;
    const { disjuncts, makeBase } = guardObject(node.object, metaPath, { bareMemo: !!surfaceHop });
    // a pristine hop read off a guarded PROXY-surface value drops - `(q = gw)?.self
    // .Array` reads `_ref.Array` (window.self is the same surface, babel's kept canon);
    // an SE-bearing key's effects MIGRATE into the next surviving key (native order:
    // the key evaluates past the guard, before the next read)
    if (surfaceHeld) {
      const hop = surfaceHop;
      // SE-key migration is the KEPT-root canon (the write anchors the prefix, buried
      // under hops included); a plain memoized nav keeps its SE-keyed hop reading off
      // the memo instead
      if (hop && (!hop.effects.length || spineHoldsKeptWrite(node.object))) {
        return {
          hopKind: 'member', disjuncts, receiver: makeBase(), proxySurface: true,
          pendingKeySe: hop.effects,
        };
      }
    }
    // a guarded base holding a PROVEN global through an ALIAS surfaces its statics: the
    // hops above are the same claim they were before the memo (`(w = g)?.Array.of(1)` -
    // babel requeues the memo and resolves `_Array$of`). the DIRECT spellings belong to
    // the older guarded-nav routes - only the alias gap rides the chain up
    // a SEQ-wrapped base rides the chain too: the older guarded-nav routes stage
    // sequence wrappers out, so nothing else resolves its statics
    if (!node.computed && node.property?.type === 'Identifier'
      && (!holdsProxySurface(node.object, metaPath)
        || peelExpressionWrappers(node.object)?.type === 'SequenceExpression')) {
      // the base VALUE folds through effectful sequence tails and kept writes - the
      // memo test keeps their spelling, the chain only needs the surface they yield
      let baseValue = peelExpressionWrappers(node.object);
      for (;;) {
        if (baseValue?.type === 'SequenceExpression') {
          baseValue = peelExpressionWrappers(baseValue.expressions.at(-1));
          continue;
        }
        const dechained = peelChainAssignmentDeep(baseValue);
        if (dechained === baseValue) break;
        baseValue = peelExpressionWrappers(dechained);
      }
      const aliasName = resolveObjectName({ objectNode: baseValue, scope: metaPath.scope, adapter, path: metaPath });
      if (aliasName && POSSIBLE_GLOBAL_OBJECTS.has(aliasName) && isPristineProxyGlobal(adapter, aliasName)) {
        return {
          hopKind: 'member', disjuncts, receiver: makeBase(),
          provenChain: [node.property.name], provenBase: makeBase,
        };
      }
    }
    // a resolvable CTOR read off the guarded SURFACE base substitutes its pure
    // (`(n = gw)?.WeakSet` -> `_WeakSet` in the alternate - babel's requeue resolves
    // it off the memo); a MUTATED slot keeps the live read off the memo (`_ref.Set`)
    if (surfaceHeld && !node.computed && node.property?.type === 'Identifier'
      && !POSSIBLE_GLOBAL_OBJECTS.has(node.property.name)
      && !isMutatedGlobalSlot(adapter, node.property.name)) {
      const ctorPure = resolveGlobalPolyfill(node.property.name);
      if (ctorPure) {
        return {
          hopKind: 'member', disjuncts,
          receiver: identifier(injectPureImport(ctorPure.entry, ctorPure.hintName)),
        };
      }
    }
    const receiver = memberExpression(makeBase(), cloneNode(node.property), { computed: node.computed });
    return { hopKind: 'member', disjuncts, receiver };
  }

  function splitOptionalReceiver(node, metaPath) {
    const split = splitOptionalReceiverInner(node, metaPath);
    // a proven chain nothing above consumed respells its hops off the memo base
    // (`(w = g)?.Array` terminal - the `.Array` read must survive)
    if (split && split !== STAGED_SPLIT && split.provenChain) {
      let spelled = split.provenBase();
      for (const key of split.provenChain) spelled = memberFromKeyName(spelled, key);
      return { hopKind: split.hopKind, disjuncts: split.disjuncts, receiver: spelled };
    }
    return split;
  }

  function splitOptionalReceiverInner(node, metaPath) {
    // a TS wrapper MID-CHAIN (`arr?.b!.c.d`) is transparent to the walk, and the rebuilt
    // receiver keeps it - the assertion is source text babel carries into the memo
    if (TS_EXPR_WRAPPERS.has(node.type)) {
      const wrapped = splitOptionalReceiverInner(node.expression, metaPath);
      if (!wrapped || wrapped === STAGED_SPLIT) return wrapped;
      return { ...wrapped, receiver: { ...cloneNode(node), expression: wrapped.receiver } };
    }
    if (node.type === 'CallExpression') {
      if (node.optional) return splitOptionalCallReceiver(node, metaPath);
      const inner = splitOptionalReceiverInner(node.callee, metaPath);
      if (!inner || inner === STAGED_SPLIT) return inner;
      let callee = inner.receiver;
      if (inner.provenChain) {
        // an unconsumed proven chain respells its hops before the call reads them
        callee = inner.provenBase();
        for (const key of inner.provenChain) callee = memberFromKeyName(callee, key);
      }
      return {
        hopKind: inner.hopKind,
        disjuncts: inner.disjuncts,
        receiver: callExpression(callee, node.arguments.map(argument => cloneNode(argument))),
      };
    }
    if (node.type === 'MemberExpression') {
      if (node.optional) {
        // a SECOND `?.` over the same surface folds into the first probe instead of
        // nesting a guard of its own (`(w)?.self?.self.Array` - both hops read the memo's
        // value, which the outer test already proved)
        // ... but only while the INNER probe is the live one: over a provably defined object
        // its guard is dead, and folding into it drops the hop this `?.` actually tests
        // (`globalThis?.window?.self.box` must test `_globalThis.window`, not `_globalThis`)
        // the hop KEY is asked through the canonical resolver, so an SE-bearing computed
        // spelling folds like its dotted twin and its effects MIGRATE into the surviving key
        // (`(w = gw)?.[(c++, 'self')]?.[(c++, 'self')].Array` -> `_ref[c++, c++, 'Array']`)
        const foldKey = receiverCarriesOptional(node.object)
          ? proxyHopKey(node, { allowOptional: true, metaPath }) : null;
        const innerHop = foldKey ? peelExpressionWrappers(node.object) : null;
        // ... and only while the inner probe's own value stays SPELLABLE off the memo: a PLAIN
        // proxy nav collapses to a ponyfill, leaving no member read to re-run off the memo base,
        // so the inner hop renders its own guard and THAT is what the memo holds
        // (`globalThis.window?.self?.self.Array` memoizes `null == _globalThis.window ? void 0
        // : _self`). a write or an effect-bearing sequence has a spelling that MUST be kept
        // whole in the memo, and the hops fold onto it as before (`(sc++, p = globalThis.window)
        // ?.self?.self.Array`)
        const innerNav = peelExpressionWrappers(innerHop?.object);
        if (innerHop && !(innerNav?.type === 'MemberExpression' && holdsProxySurface(innerNav, metaPath))
          && (innerHop.type !== 'MemberExpression' || !innerHop.optional
            || guardProbeUndefinable(innerHop.object, { metaPath, adapter, resolvePure }))) {
          const surfaced = splitOptionalReceiverInner(node.object, metaPath);
          if (surfaced && surfaced !== STAGED_SPLIT && surfaced.proxySurface) {
            const pendingKeySe = [...surfaced.pendingKeySe ?? [], ...foldKey.effects];
            if (!pendingKeySe.length) return surfaced;
            return { ...surfaced, pendingKeySe };
          }
        }
        return splitOptionalMemberHop(node, metaPath);
      }
      const inner = splitOptionalReceiverInner(node.object, metaPath);
      if (!inner || inner === STAGED_SPLIT) return inner;
      if (inner.proxySurface && !inner.pendingKeySe?.length
        && !node.computed && isPristineProxyGlobal(adapter, node.property?.name)) {
        return inner;
      }
      // a resolvable CTOR read off the surface memo substitutes its own pure inside the
      // alternate (`(o = gw)?.self.Map.prototype.has.name` -> `_Map.prototype.has`), the
      // same requeue the hop split does one level down; a MUTATED slot keeps the live read
      // a COMPUTED key folds the same way the proven-chain route already does: an SE-bearing
      // spelling keeps its prefix around the substituted ctor (`[(c += 1, 'Set')]` ->
      // `(c += 1, _Set)`), a quiet one resolves through the canonical key resolver
      const surfaceKey = inner.proxySurface && !inner.pendingKeySe?.length
        ? (node.computed
          ? foldSeqKeyLiteralTail(node.property) ?? foldedResolvedKey(node.property, metaPath, adapter)
          : node.property?.type === 'Identifier' ? { key: node.property.name, effects: [] } : null)
        : null;
      if (surfaceKey && typeof surfaceKey.key === 'string'
        && !POSSIBLE_GLOBAL_OBJECTS.has(surfaceKey.key) && !isMutatedGlobalSlot(adapter, surfaceKey.key)) {
        const ctorPure = resolveGlobalPolyfill(surfaceKey.key);
        if (ctorPure) {
          return {
            hopKind: inner.hopKind, disjuncts: inner.disjuncts,
            receiver: withSideEffects(identifier(injectPureImport(ctorPure.entry, ctorPure.hintName)),
              surfaceKey.effects),
          };
        }
      }
      if (inner.provenChain) {
        // two hops in: `<ctor>.<static>` resolves as the claim it spells - a SEQ-prefixed
        // computed key folds to its literal tail, the prefix riding the substitution
        // (`[(k++, 'values')]` -> `(k++, _Object$values)`, babel's requeue); an
        // unresolved pair falls back to the spelled members off the memo base
        const folded = node.computed ? foldSeqKeyLiteralTail(node.property)
          : node.property?.type === 'Identifier' ? { key: node.property.name, effects: [] } : null;
        if (folded && inner.provenChain.length === 1) {
          const claim = resolvePure({
            kind: 'property', object: inner.provenChain[0], key: folded.key, placement: 'static',
          }, metaPath);
          if (claim && claim.kind !== 'instance') {
            return {
              hopKind: inner.hopKind,
              disjuncts: inner.disjuncts,
              receiver: withSideEffects(identifier(injectPureImport(claim.entry, claim.hintName)), folded.effects),
            };
          }
        }
        let spelled = inner.provenBase();
        for (const key of inner.provenChain) spelled = memberFromKeyName(spelled, key);
        return {
          hopKind: inner.hopKind,
          disjuncts: inner.disjuncts,
          receiver: memberExpression(spelled, cloneNode(node.property), { computed: node.computed }),
        };
      }
      if (inner.pendingKeySe?.length) {
        // the migrated key effects respell the surviving key computed (`[c++, "Array"]`);
        // a computed STRING-LITERAL key respells the same way - only a dynamic computed
        // key (whose own read the prefix would reorder against) stays staged
        const computedTail = node.computed ? peelExpressionWrappers(node.property) : null;
        const surviving = !node.computed && node.property?.type === 'Identifier'
          ? literal(node.property.name)
          : computedTail?.type === 'Literal' && typeof computedTail.value === 'string'
            ? literal(computedTail.value)
            : computedTail?.type === 'SequenceExpression'
              && peelExpressionWrappers(computedTail.expressions.at(-1))?.type === 'Literal'
              ? cloneNode(computedTail)
              : null;
        if (!surviving) return STAGED_SPLIT;
        return {
          hopKind: inner.hopKind,
          disjuncts: inner.disjuncts,
          receiver: memberExpression(inner.receiver,
            sequenceExpression([...inner.pendingKeySe.map(expr => cloneNode(expr)),
              ...surviving.type === 'SequenceExpression' ? surviving.expressions : [surviving]]),
            { computed: true }),
        };
      }
      return {
        hopKind: inner.hopKind,
        disjuncts: inner.disjuncts,
        receiver: memberExpression(inner.receiver, cloneNode(node.property), { computed: node.computed }),
      };
    }
    return null;
  }

  // does this receiver hold a pristine proxy-global SURFACE (the value of `q = globalThis
  // .window` is the window global itself) - the question the pristine-hop drop above asks
  function holdsProxySurface(objectNode, metaPath = null) {
    // writes interleave with the hops (`((dw = gw) as any)?.self` holds the surface too),
    // so the peel alternates instead of running write-then-members once
    let value = peelExpressionWrappers(objectNode);
    for (;;) {
      // ... and the value of a SEQUENCE is its tail, which the hops read through
      if (value?.type === 'SequenceExpression') {
        value = peelExpressionWrappers(value.expressions.at(-1));
        continue;
      }
      if (value?.type === 'AssignmentExpression') {
        value = peelExpressionWrappers(value.right);
        continue;
      }
      if (value?.type === 'MemberExpression' && !value.computed
        && POSSIBLE_GLOBAL_OBJECTS.has(value.property?.name)
        && isPristineProxyGlobal(adapter, value.property.name)) {
        value = peelExpressionWrappers(value.object);
        continue;
      }
      break;
    }
    // a PROVEN call yields the surface too (`(() => globalThis)()` - the inline canon)
    if (value?.type === 'CallExpression' && !value.optional && metaPath) {
      const called = resolveObjectName({ objectNode: value, scope: metaPath.scope, adapter, path: metaPath });
      return !!called && POSSIBLE_GLOBAL_OBJECTS.has(called) && isPristineProxyGlobal(adapter, called);
    }
    if (value?.type !== 'Identifier') return false;
    if (POSSIBLE_GLOBAL_OBJECTS.has(value.name)) return isPristineProxyGlobal(adapter, value.name);
    // an ALIAS root resolves through the canon (`const w = globalThis.window; (a = w)`
    // holds the window surface exactly like the direct spelling)
    const aliased = metaPath && resolveObjectName({
      objectNode: value, scope: metaPath.scope, adapter, path: metaPath,
    });
    return !!aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased);
  }

  // `recv.at(args)` -> `_at(recv).call(recv, args)`; `recv.at` -> `_at(recv)`; the receiver
  // memoizes through `var _ref;` when repeating it would re-run effects. the `?.` directly
  // at the member becomes the null-check conditional (`arr == null ? void 0 : ...` for a
  // reusable receiver, `null == (_ref = make()) ? void 0 : ...` for a memoized one - the
  // operand order is the legs' shared spelling), an optional CALL keeps its `?.` on `.call`
  // guard-comma fusion: the split's `(_r = X, _g = _r.m)` memo with a RESOLVING method -
  // the lookup absorbs the receiver memo (`_g = _mMaybe(_r = X)`), babel's nesting
  function fuseGuardCommaMemo({ metaPath, id }) {
    const assignUp = metaPath.parentPath?.node;
    const seqPath = metaPath.parentPath?.parentPath;
    if (assignUp?.type !== 'AssignmentExpression' || assignUp.right !== metaPath.node
      || !seqPath?.node || !guardCommaMemos.has(seqPath.node)) return false;
    const [recvAssign] = seqPath.node.expressions;
    markRewrite();
    const consumed = seqPath.node;
    const recvClone = cloneNode(recvAssign);
    // the memo build may have claim-suppressed the receiver's proxy-surface hops (the memo
    // holds the VALUE, babel keeps the hops spelled) - the fresh clone inherits those marks
    for (let orig = peelExpressionWrappers(recvAssign.right), copy = peelExpressionWrappers(recvClone.right);
      orig?.type === 'MemberExpression' && copy?.type === 'MemberExpression';
      orig = peelExpressionWrappers(orig.object), copy = peelExpressionWrappers(copy.object)) {
      if (skippedNodes.has(orig)) skippedNodes.add(copy);
    }
    seqPath.replaceWith(assignmentExpression('=', cloneNode(assignUp.left),
      callExpression(identifier(id), [recvClone])));
    markSubtreeSkipped(skippedNodes, consumed);
    return true;
  }

  // one guard test out of split disjuncts and the member-optional check: inside a disjunct
  // CHAIN every test spells `null == X` (babel's uniform chain spelling); the ident-first
  // `X == null` form is the single-test spelling only
  function composeGuardTest(guardDisjuncts, check) {
    // an EMPTY disjunct list is a split that proved its receiver always-defined - nothing
    // of its own to test, so only the member's own check survives
    if (!guardDisjuncts?.length) return check;
    let disjuncts = [...guardDisjuncts, ...check ? [check] : []];
    if (disjuncts.length > 1) {
      disjuncts = disjuncts.map(item => {
        if (item.type === 'BinaryExpression' && item.operator === '=='
          && item.right?.type === 'Literal' && item.right.value === null) {
          return binaryExpression('==', item.right, item.left);
        }
        return item;
      });
    }
    return disjuncts.reduce((left, right) => logicalExpression('||', left, right));
  }

  // the receiver / guard spelling of one instance dispatch: how the lookup argument and the
  // `this` slot re-read or memoize the receiver, and where the member-optional null test
  // lands (its memo joins split disjuncts when the split ran)
  function resolveDispatchSpelling({ metaPath, effObject, memberOptional, isCall, guardDisjuncts }) {
    // source parens are printer trivia - the reusability question and the re-spelled
    // receiver both read through them (`(arr).at(0)` -> `_at(arr).call(arr, 0)`); TS
    // casts stay (the `satisfies` memo canon)
    while (effObject?.type === 'ParenthesizedExpression') effObject = effObject.expression;
    // a MINTED pure import at the receiver memoizes anyway - babel's dispatch renders
    // from the source member and never re-reads the substituted binding verbatim
    // (`_toFixedMaybeNumber(_ref = _Number$MAX_SAFE_INTEGER).call(_ref, 2)`)
    const mintedImport = effObject.type === 'Identifier' && !!bindingPolyfillHint({
      binding: adapter.getBinding(metaPath.scope, effObject.name, metaPath),
      scope: metaPath.scope, name: effObject.name, adapter,
    });
    const reusable = isReusableReceiver(effObject) && !mintedImport;
    let check = null;
    let lookupArg;
    let callReceiver;
    if (memberOptional) {
      if (reusable) {
        check = binaryExpression('==', cloneTyped(effObject, typeStampCtx), literal(null));
        lookupArg = cloneTyped(effObject, typeStampCtx);
        callReceiver = cloneTyped(effObject, typeStampCtx);
      } else {
        const ref = injector.generateDeclaredRef(metaPath);
        // the memo keeps the receiver's own inner `?.` (its short-circuit routes into this
        // guard), rewrapped for the print once extracted from the original chain; type-only
        // wrappers peel off the memoized spine
        const peeledMemo = cloneSpinePeeled(effObject);
        const memoized = receiverCarriesOptional(effObject) ? chainExpression(peeledMemo) : peeledMemo;
        check = binaryExpression('==', literal(null), assignmentExpression('=', identifier(ref), memoized));
        if (guardDisjuncts) {
          guardDisjuncts = [...guardDisjuncts, check];
          check = null;
        }
        lookupArg = identifier(ref);
        callReceiver = identifier(ref);
      }
    } else if (reusable) {
      lookupArg = cloneTyped(effObject, typeStampCtx);
      callReceiver = cloneTyped(effObject, typeStampCtx);
    } else if (isCall) {
      const ref = injector.generateDeclaredRef(metaPath);
      lookupArg = assignmentExpression('=', identifier(ref), cloneTyped(effObject, typeStampCtx));
      callReceiver = identifier(ref);
    } else {
      lookupArg = cloneTyped(effObject, typeStampCtx);
    }
    return { check, lookupArg, callReceiver, guardDisjuncts };
  }

  // dead `?.` hops erase before the split (the shared vestigial verdict), inside three
  // boundaries: the hop's OBJECT spine is pristine proxy down to a resolvable root, no
  // MUTATED static sits in the chain, and only a LITERAL IIFE proves through a call
  function eraseVestigialReceiverOptionals({ memberOptional, object, metaPath }) {
    if (memberOptional || !receiverCarriesOptional(object)) return;
    function surfaceObject(node) {
      // a KEPT WRITE is transparent to the verdict: what flows is its VALUE
      // (`(w = globalThis)?.Array` - the erased `?.` reads the always-defined global)
      // a SEQUENCE root hands its TAIL value on, and the prefix effects fold into the
      // substituted spine (`(e++, globalThis)?.Set` erases, `e++` rides the collapsed read).
      // a tail that is itself a WRITE stays wrapped: the guard then answers over the write's
      // own subject, which is the non-sequence shape below (`(c++, p = globalThis.window)`)
      const seqTail = singleSequenceTail(node);
      const peeled = seqTail && peelChainAssignmentDeep(seqTail) === seqTail
        ? seqTail : peelExpressionWrappers(node);
      let cur = peelChainAssignmentDeep(peeled);
      const throughWrite = cur !== peeled;
      // a SEQUENCE stored BY the write hands its tail on the same way a bare one does - the
      // value the write keeps is that tail (`(s = (e++, globalThis.self))?.self`)
      if (throughWrite) cur = singleSequenceTail(cur, { nested: true }) ?? cur;
      const rootBeforeHops = cur;
      while (cur?.type === 'MemberExpression') {
        if (!proxyHopKey(cur, { allowOptional: true, metaPath })) return false;
        // a kept write UNDER the hops is as transparent as one above them
        // (`((r = globalThis).self)?.Array` - the erased `?.` reads the pure root)
        cur = peelChainAssignmentDeep(peelExpressionWrappers(cur.object));
      }
      if (cur?.type === 'Identifier') {
        if (POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) return isPristineProxyGlobal(adapter, cur.name);
        // an ALIAS binding answers the same as the direct spelling - but only as the BARE
        // root: neither a kept write nor a hop above it may sit in between, which is where
        // babel's own erase stops (`(e++, gw)?.` erases, `(a = gw)?.` and `(e++, g.self)?.` keep)
        if (!throughWrite && cur === rootBeforeHops) {
          const aliased = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
          if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) return true;
        }
        // a RESOLVABLE global ctor substitutes to its always-defined pure - the `?.`
        // over it is dead (`Promise?.X.flat?.()` reads `_Promise.X`)
        return !adapter.getBinding?.(metaPath.scope, cur.name)
          && !isMutatedGlobalSlot(adapter, cur.name) && !!resolveGlobalPolyfill(cur.name);
      }
      if (cur?.type === 'CallExpression' && !cur.optional) {
        // a LITERAL IIFE proves through the call; a NAMED callee proves only inside a
        // kept write (`(u = g())?.Array` erases, bare `dh().self?.` keeps its guard -
        // babel's erase stops at named bindings outside the write shape), and its yield
        // must be a defined proxy global (const-arrow followed by the call canon)
        const callee = peelExpressionWrappers(cur.callee);
        const literalCallee = callee?.type === 'ArrowFunctionExpression' || callee?.type === 'FunctionExpression';
        if (literalCallee) {
          const rootName = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
          return !!rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName) && isPristineProxyGlobal(adapter, rootName);
        }
        return throughWrite
          && !!inlineCallProxyGlobalRoot({
            callNode: cur, scope: metaPath.scope, adapter, path: metaPath, rejectConditional: true,
          })
          && !guardProbeUndefinable(cur, { metaPath, adapter, resolvePure });
      }
      return false;
    }
    // the walk stops at a call; the `?.` under its CALLEE is the same navigation
    // (`(w = globalThis)?.Array.of(5)` - the hop sits below `.of`), so descend there
    let navNode = object;
    for (let peeled = peelExpressionWrappers(navNode); peeled?.type === 'CallExpression' && !peeled.optional;
      peeled = peelExpressionWrappers(navNode)) navNode = peeled.callee;
    const deadHops = vestigialNavOptionals(navNode, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath });
    // a dead hop erases only when PROVABLE (its object collapses to a defined surface or
    // the hop itself is a resolvable claim); any optional hop that is not both dead and
    // provable is LIVE, and a live hop keeps the memo's source spelling whole - the dead
    // `?.` rides it un-erased (`(Promise?.foo)?.bar` memoizes `_ref = _Promise?.foo`)
    function hopProvable(hop) {
      // through a kept WRITE only a DIRECT global spelling proves: babel's erase stops at a
      // BINDING there however it resolves (`(n = gw)?.self` keeps its guard, `(n = globalThis)
      // ?.self` erases) - the same boundary the hop-guard verdict draws
      const written = peelExpressionWrappers(hop.object);
      if (written?.type === 'AssignmentExpression') {
        const stored = peelExpressionWrappers(peelChainAssignmentDeep(written));
        if (stored?.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(stored.name)) return false;
      }
      // a `?.` whose probe IS a bare call keeps its guard - proving WHICH global a call
      // yields is not proving it yields a DEFINED one (the strict opaque-root canon);
      // only a KEPT WRITE of the call value erases (`(u = g())?.` - the write observes)
      if (peelExpressionWrappers(hop.object)?.type === 'CallExpression') return false;
      const hopKeyName = !hop.computed && hop.property?.name;
      if (hopKeyName && POSSIBLE_GLOBAL_OBJECTS.has(hopKeyName) && !isPristineProxyGlobal(adapter, hopKeyName)) return false;
      if (chainContainsMutatedStatic(hop.object, { metaPath, adapter })) return false;
      // a hop that ITSELF resolves as a static claim substitutes to an always-defined
      // import - its `?.` is as dead as the call-twin's (`Array?.from(x).at(0)` erases)
      if (hopKeyName && hop.property?.type === 'Identifier') {
        const hopObjName = resolveObjectName({
          objectNode: hop.object, scope: metaPath.scope, adapter, path: metaPath,
        });
        if (hopObjName && !adapter.isMutatedStatic?.(hopObjName, hopKeyName)) {
          const hopClaim = resolvePure({
            kind: 'property', object: hopObjName, key: hopKeyName, placement: 'static',
          }, metaPath);
          if (hopClaim && hopClaim.kind !== 'instance') return true;
        }
      }
      return surfaceObject(hop.object);
    }
    const provable = new Set(deadHops.filter(hop => hopProvable(hop)));
    let liveHops = false;
    for (let cur = peelExpressionWrappers(navNode); cur?.type === 'MemberExpression';
      cur = peelExpressionWrappers(cur.object)) {
      if (cur.optional && !provable.has(cur)) liveHops = true;
    }
    if (!liveHops) for (const hop of provable) hop.optional = false;
  }

  function replaceInstanceLike({ metaPath, id }) {
    const memberNode = metaPath.node;
    if (fuseGuardCommaMemo({ metaPath, id })) return true;
    if (isDeleteOperand(metaPath)) return false;
    // the caller past transparent wrappers; `calleeIsMember` holds when the call's callee
    // unwraps to exactly this member (the paren-lookup class included)
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    const isCall = (parent?.type === 'CallExpression' ? peelExpressionWrappers(parent.callee) : null) === memberNode;
    const callOptional = isCall && parent.optional;
    // the member's own `?.` is DEAD over a value the polyfill makes always-defined - a pure CTOR
    // binding: it erases with the substitution, and a guard there would test a binding that
    // cannot be nullish (`globalThis.WeakMap?.name` -> `_nameMaybeFunction(_WeakMap)`)
    const deadCtorOptional = memberNode.optional === true && proxyGlobalMemberCtorPureSwap({
            receiver: memberNode.object,
            aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
            resolvePure: m => resolvePure(m, metaPath),
          }),
          memberOptional = memberNode.optional === true
            && !(deadCtorOptional && !deadCtorOptional.se.length),
          { object } = memberNode,
          // a DEAD ctor optional means a SECOND `?.` sits in the chain: the tail collapses to
          // the pure ctor either way, so babel calls the whole nav vestigially defined and the
          // receiver's own guard drops with it (`(call)?.self.WeakMap?.name` -> `_name(_WeakMap)`)
          deadCtorSwap = deadCtorOptional && !deadCtorOptional.se.length
            && receiverCarriesOptional(object) ? deadCtorOptional.pure : null;
    eraseVestigialReceiverOptionals({ memberOptional, object, metaPath });
    const { splitSource, rewrapNonNull } = peelNonNullWraps(object);
    let guardDisjuncts = null;
    let effObject = deadCtorSwap
      ? identifier(injectPureImport(deadCtorSwap.entry, deadCtorSwap.hintName)) : object;
    if (deadCtorSwap) markSubtreeSkipped(skippedNodes, object);
    else if (!memberOptional) {
      const split = splitOptionalReceiver(splitSource, metaPath);
      if (split === STAGED_SPLIT) return false;
      if (split) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = rewrapNonNull(split.receiver);
      }
    } else if (receiverCarriesOptional(object)) {
      // a receiver whose LAST optional hop is a CALL splits (the dispatch memo guards as its
      // own disjunct, the member-optional memo joins it); one ending on an optional MEMBER
      // stays whole - its memo IS the guard (`null == (_ref = a?.b)`), and the descent
      // recursion builds the nesting inside it
      // ... unless a DEEPER optional segment sits below that member: the memo would hold that
      // segment's own rendered guard, where the disjunct chain joins both in ONE test
      // (`arr.flat?.()?.flatMap(f)?.at(0)`)
      const split = splitOptionalReceiver(splitSource, metaPath);
      if (split === STAGED_SPLIT) return false;
      const splitCall = peelExpressionWrappers(splitSource),
            splitHop = splitCall?.type === 'CallExpression'
              ? peelExpressionWrappers(splitCall.callee) : null,
            splitHopKey = splitHop?.type === 'MemberExpression'
              ? (splitHop.computed ? foldSeqKeyLiteralTail(splitHop.property)?.key ?? null
                : splitHop.property?.type === 'Identifier' ? splitHop.property.name : null)
              : null,
            // ... and only where THIS hop is a claim of its own: a raw member read has no
            // dispatch to hold the disjunct, so its whole segment memoizes as one value
            splitHopClaim = typeof splitHopKey === 'string'
              && resolvePure({ kind: 'property', key: splitHopKey, placement: 'prototype' },
                metaPath)?.kind === 'instance',
            deeperSegment = splitHopClaim && optionalCallSegmentBelow(splitHop.object),
            // a `?.()` that IS the receiver's root segment - nothing optional below its
            // callee spine and the callee is no claim of its own - memoizes as WRITTEN
            // (babel: `null == (_ref = box.get?.())`); every other call shape threads its
            // disjuncts as before (an inner optional segment, a rewritten dispatch callee)
            splitCallCallee = splitCall?.type === 'CallExpression' && splitCall.optional === true
              ? peelExpressionWrappers(splitCall.callee) : null,
            soleRootOptCall = !!splitCallCallee && !splitHopClaim
              && !receiverCarriesOptional(splitCallCallee) && !optionalCallSegmentBelow(splitCallCallee);
      // ... and a PAREN-SEALED lookup keeps its whole segment in ONE memo: the `.call` rides
      // outside the ternary and reads `this` off that memo, so the split's second disjunct has
      // no reader (`(getArr().flat?.()?.flatMap)(f)` -> `_ref = _flat(_ref2 = getArr())?.call(_ref2)`)
      if (split && ((split.hopKind === 'call' && !soleRootOptCall) || deeperSegment)
        && !(isCall && !callOptional && calleeParenWrapped(parent))) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = rewrapNonNull(split.receiver);
      }
    }
    const spelling = resolveDispatchSpelling({ metaPath, effObject, memberOptional, isCall, guardDisjuncts });
    const { check, lookupArg, callReceiver } = spelling;
    ({ guardDisjuncts } = spelling);
    let built;
    // the paren-lookup twin under a guard: `(X?.nav.m)(args)` keeps the native throw on the
    // void branch - the guard wraps only the LOOKUP and `.call` rides the ternary
    // (`(test ? void 0 : _mMaybe(_ref = nav)).call(_ref, args)`)
    const parenWrapped = isCall && calleeParenWrapped(parent);
    const test = composeGuardTest(guardDisjuncts, check);
    if (isCall && parenWrapped && test && !callOptional) {
      const lookup = callExpression(identifier(id), [lookupArg]);
      built = callExpression(
        memberExpression(conditionalExpression(test, voidZero(), lookup), identifier('call')),
        [callReceiver, ...parent.arguments.map(argument => cloneNode(argument))],
      );
      const returnTypePl = resolveNodeType(callerPath);
      if (returnTypePl) resolvedType.set(built, returnTypePl);
      markRewrite();
      replaceGuardedHop({ hopPath: callerPath, test: null, built, skippedNodes });
      return true;
    }
    if (isCall) {
      const lookup = callExpression(identifier(id), [lookupArg]);
      const dispatch = callExpression(
        memberExpression(lookup, identifier('call'), { optional: callOptional }),
        [callReceiver, ...parent.arguments.map(argument => cloneNode(argument))],
      );
      // the `?.call` needs a chain wrapper of its own ONLY when the original chain does not
      // continue above: a continuing hop keeps riding the source ChainExpression, and sealing
      // the dispatch under a nested wrapper would cut the short-circuit off from the tail
      const upNode = callerPath.parentPath?.node;
      const chainContinues = upNode
        && ((upNode.type === 'MemberExpression' && upNode.object === parent)
          || (upNode.type === 'CallExpression' && upNode.callee === parent));
      built = callOptional && !chainContinues ? chainExpression(dispatch) : dispatch;
    } else {
      built = callExpression(identifier(id), [lookupArg]);
    }
    // the ORIGINAL node's resolved type travels to the replacement: a member ABOVE reads off
    // it, and untyped there the next claim resolves generic (`.name` off an array value
    // pulled the function-name ponyfill on this leg alone) - babel's resolvedType stamp
    const returnType = resolveNodeType(isCall ? callerPath : metaPath);
    if (returnType) resolvedType.set(built, returnType);
    markRewrite();
    replaceGuardedHop({ hopPath: isCall ? callerPath : metaPath, test, built, skippedNodes, returnType, resolvedType });
    return true;
  }

  // `(fn(), arr).at(0)` / `arr[(k(), 'at')](0)`: the harvested SE PEELS off - the dispatch
  // runs on the bare receiver tail and the effects re-run as a sequence prefix around it,
  // in source order. optional / memo-worthy shapes under SE are staged
  function emitInstanceWithPeeledSe(meta, metaPath, entry, hintName) {
    // an OPTIONAL SE-keyed member combines with its split receiver below - the memo joins
    // the disjuncts; a BARE reusable receiver is its own test, and nothing else carries one
    const { node } = metaPath,
          memberOptional = node.optional === true,
          callerPath = climbToCallerPath(metaPath),
          parent = callerPath?.node;
    // the climb finds the enclosing expression, which is a CALL only when this claim is its
    // CALLEE - an argument-position claim (`_name(x[(eff(), 'flat')])`, a sibling render's
    // own call) reads like the plain form, and rewriting the call would consume a span this
    // claim does not own
    const methodCall = parent?.type === 'CallExpression' && peelExpressionWrappers(parent.callee) === node;
    // the READ form (an SE computed key folding to a member read - the split's memo, a bare
    // read): `arr[(eff(), 'flat')]` -> `(eff(), _flatMaybeArray(arr))`
    // effects the receiver spelling ALREADY carries (a rescued chain-assign the earlier
    // claim spliced in) ride with it whole - `((v = g))?.Map.name` reads the rewritten
    // `(v = _globalThis, _Map)` once: `_nameMaybeFunction((v = _globalThis, _Map))`.
    // a receiver still carrying a live `?.` goes to the SPLIT below - its guard owns
    // the render and the write rides the memo test
    if (!memberOptional && !methodCall && meta.sideEffects?.length
      && !receiverCarriesLiveOptional(node.object)
      && meta.sideEffects.every(effect => subtreeContainsNode(node.object, effect))) {
      return emitSeCarryingReceiverRead({ node, metaPath, entry, hintName },
        { adapter, injector, injectPureImport, markRewrite, skippedNodes });
    }
    if (!memberOptional && !methodCall && isReusableReceiver(peelExpressionWrappers(node.object))) {
      const receiver = peelExpressionWrappers(node.object),
            id = injectPureImport(entry, hintName);
      markRewrite();
      replaceGuardedHop({
        hopPath: metaPath, test: null,
        built: withSideEffects(callExpression(identifier(id), [cloneNode(receiver)]), meta.sideEffects),
        skippedNodes,
      });
      return;
    }
    if (!memberOptional && !methodCall && meta.sideEffects?.length && !meta.receiverEffectCount
      && !receiverCarriesOptional(node.object)) {
      emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, seKeyReadCtx);
      return;
    }
    // an OPTIONAL method call lifts its harvested effects - and a SOURCE sequence prefix on
    // the receiver - ahead of the plain `?.call` dispatch, babel's shape:
    // `(a(), arr)[(k(), 'flat')]?.()` -> `(a(), k(), _flatMaybeArray(arr)?.call(arr))`
    if (methodCall && parent.optional && !memberOptional && !receiverCarriesOptional(node.object)) {
      return emitOptionalCallWithLiftedSe({ node, parent, callerPath, metaPath, meta, entry, hintName },
        { isReusableReceiver, injectPureImport, markRewrite, skippedNodes, injector, assignmentExpression });
    }
    if (!methodCall && !memberOptional && receiverCarriesLiveOptional(node.object)
      && spineHoldsKeptWrite(node.object)
      && guardProbeUndefinable(node.object, { metaPath, adapter, resolvePure })
      && spineCarriesComputedHop(node.object)) {
      return emitSeReadFormOverLiveOptional({ node, metaPath, entry, hintName },
        { splitOptionalReceiver, stagedSplit: STAGED_SPLIT, injectPureImport, markRewrite, composeGuardTest, skippedNodes });
    }
    if (!methodCall || (parent.optional && !memberOptional)) return;
    let receiver = peelExpressionWrappers(node.object);
    if (receiver?.type === 'SequenceExpression') receiver = receiver.expressions.at(-1);
    // ... and THROUGH nested sequences whose prefixes the harvest carries: a memo of the
    // nested tail would run the inner effect once in the memo and again in the replay
    // (`(a(), (b(), arr)).flat()` ran b, a, b)
    for (let seq = peelExpressionWrappers(receiver); seq?.type === 'SequenceExpression'
      && seq.expressions.slice(0, -1).every(expr => meta.sideEffects?.includes(expr));
      seq = peelExpressionWrappers(receiver)) {
      receiver = seq.expressions.at(-1);
    }
    if (!memberOptional && isReusableReceiver(receiver)) {
      const id = injectPureImport(entry, hintName);
      const dispatch = callExpression(
        memberExpression(callExpression(identifier(id), [cloneNode(receiver)]), identifier('call')),
        [cloneNode(receiver), ...parent.arguments.map(argument => cloneNode(argument))],
      );
      markRewrite();
      callerPath.replaceWith(withSideEffects(dispatch, meta.sideEffects));
      return;
    }
    // a non-reusable receiver memoizes FIRST, then the harvested key SE, then the dispatch
    // on the memo - ECMA receiver-before-key; an optional-carrying receiver splits into the
    // guard and the memo seq rides the alternate:
    // `a.flat?.()[(eff(), 'k')](2)` -> `null == (_r = _flat(a)) ? void 0 :
    // (_r2 = _r.call(a), eff(), _k(_r2).call(_r2, 2))`
    let guardDisjuncts = null,
        effReceiver = node.object;
    if (receiverCarriesOptional(node.object)) {
      const split = splitOptionalReceiver(node.object, metaPath);
      if (!split || split === STAGED_SPLIT) return;
      ({ disjuncts: guardDisjuncts, receiver: effReceiver } = split);
    } else if (memberOptional) {
      emitBareOptionalSeDispatch({ node, parent, callerPath, metaPath, meta, entry, hintName }, bareOptionalCtx);
      return;
    }
    // the receiver's own SEQUENCE prefix IS the harvested effect list: memoizing the whole
    // sequence would spell it TWICE - once inside the memo, once in the prefix. the memo takes
    // the tail and the effects keep their single slot (`(se(), [1, 2]).at(-1)` ->
    // `(se(), _at(_ref = [1, 2]).call(_ref, -1))`)
    const id = injectPureImport(entry, hintName),
          ref = injector.generateDeclaredRef(metaPath);
    for (let seq = peelExpressionWrappers(effReceiver); seq?.type === 'SequenceExpression'
      && seq.expressions.slice(0, -1).every(expr => meta.sideEffects?.includes(expr));
      seq = peelExpressionWrappers(effReceiver)) {
      effReceiver = peelExpressionWrappers(seq.expressions.at(-1));
    }
    const memo = assignmentExpression('=', identifier(ref), cloneNode(effReceiver));
    // a LITERAL receiver's memo fuses into the lookup argument and the harvested key SE
    // hoists ahead - constructing it observes nothing, so the order is unobservable
    // (`[3, 4][(k(), 'at')](0)` -> `(k(), _at(_ref = [3, 4]).call(_ref, 0))`). every other
    // receiver READS (a member's getter, a call), and ECMA evaluates the receiver BEFORE
    // the key: the memo leads the sequence (`(_ref = box.list, k++, _at(_ref)...)`). under
    // a split's guard the alternate keeps the memo-first seq too (the disjuncts' own canon)
    const fusableReceiver = LITERAL_RECEIVER_TYPES.has(peelExpressionWrappers(effReceiver)?.type),
          fuseMemo = !memberOptional && !guardDisjuncts && fusableReceiver && !mayHaveSideEffects(effReceiver);
    const dispatch = callExpression(
      memberExpression(callExpression(identifier(id), [fuseMemo ? memo : identifier(ref)]), identifier('call')),
      [identifier(ref), ...parent.arguments.map(argument => cloneNode(argument))],
    );
    const effects = (meta.sideEffects ?? []).map(effect => cloneNode(effect));
    let built,
        test;
    if (memberOptional) {
      // the member's own `?.` folds into the guard: the receiver memo is its null test
      // (`... || null == (_ref2 = _ref.call(arr, 0)) ? void 0 : (eff(), _k(_ref2)...)`)
      test = composeGuardTest(guardDisjuncts, binaryExpression('==', literal(null), memo));
      built = effects.length ? sequenceExpression([...effects, dispatch]) : dispatch;
    } else {
      test = composeGuardTest(guardDisjuncts, null);
      built = fuseMemo
        ? (effects.length ? sequenceExpression([...effects, dispatch]) : dispatch)
        : sequenceExpression([memo, ...effects, dispatch]);
    }
    markRewrite();
    replaceGuardedHop({ hopPath: callerPath, test, built, skippedNodes });
  }

  // `this.from(x)` / `super.of(x)` in static context resolve against the super class's
  // static surface: `_Array$from.call(this, x)` - the receiver stays the live constructor
  function emitInheritedStatic(meta, metaPath) {
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    if (metaPath.node.optional) return;
    // a VALUE-position read swaps the member for the binding itself, dropping the `this`
    // bind with the read - babel's shape (`const f = this.from` -> `const f = _Array$from`);
    // a harvested effect has no slot in the bare swap, and `super`'s dispatch spelling
    // stays with the call form
    if (parent?.type !== 'CallExpression') {
      if (meta.receiverEffectCount || meta.sideEffects?.length
        || metaPath.node.object?.type === 'Super') return;
      const { result: valueResult } = resolvePureOrGlobalFallback(meta, metaPath);
      if (!valueResult) return;
      markRewrite();
      if (metaPath.node.computed) markSubtreeSkipped(skippedNodes, metaPath.node.property);
      metaPath.replaceWith(identifier(injectPureImport(valueResult.entry, valueResult.hintName)));
      return;
    }
    // a harvested KEY effect rides as a sequence prefix around the whole dispatch - the swap
    // erases the key spelling, and this is the slot that runs it exactly once, before the call
    // (`super[(fn(), 'try')](f)` -> `(fn(), _Promise$try.call(this, f))`). a RECEIVER effect
    // has no such slot here: `this` is the receiver and nothing else evaluates
    if (meta.receiverEffectCount) return;
    const { result } = resolvePureOrGlobalFallback(meta, metaPath);
    if (!result) return;
    const id = injectPureImport(result.entry, result.hintName);
    markRewrite();
    // an optional CALL of the substituted binding erases with it - the ponyfill is always
    // defined, so the short-circuit can never fire (`super.from?.([1])` reads the same as
    // its plain twin); the chain wrapper goes with the `?.` it carried
    const target = parent.optional && callerPath.parentPath?.node?.type === 'ChainExpression'
      ? callerPath.parentPath : callerPath;
    target.replaceWith(withSideEffects(callExpression(
      memberExpression(identifier(id), identifier('call')),
      [{ type: 'ThisExpression' }, ...parent.arguments.map(argument => cloneNode(argument))],
    ), meta.sideEffects));
  }

  // a postfix `!` is chain-TRANSPARENT (`a?.b!.c` keeps one short-circuit): the split sees
  // through it, and the rebuilt receiver puts the wrapper back on the spine
  function peelNonNullWraps(object) {
    let splitSource = object;
    const nonNullWraps = [];
    while (splitSource.type === 'TSNonNullExpression') {
      nonNullWraps.push(splitSource);
      splitSource = splitSource.expression;
    }
    function rewrapNonNull(receiver) {
      let wrapped = receiver;
      for (let i = nonNullWraps.length - 1; i >= 0; i--) wrapped = { ...nonNullWraps[i], expression: wrapped };
      return wrapped;
    }
    return { splitSource, rewrapNonNull };
  }

  // one guard branch per candidate ctor, innermost-last - both legs chain the same plan list
  function guardChainNode(plan, rawBranch) {
    return plan.branches.reduceRight((alternate, branch) => conditionalExpression(
      binaryExpression('===', identifier(plan.recvIdent.name),
        identifier(branch.ctorPure ? injectPureImport(branch.ctorPure.entry, branch.ctorPure.hintName) : branch.ctorName)),
      identifier(injectPureImport(branch.staticPure.entry, branch.staticPure.hintName)),
      alternate,
    ), rawBranch);
  }

  // runtime ctor guard render, the text leg's twin: the DECISION is the shared provider plan,
  // this only composes nodes - `M === _Map ? _Map$groupBy : M.groupBy`, a callee raw branch
  // binding `this` via `.bind(M)`
  function emitGuardedStaticNarrow(meta, metaPath, parent) {
    const memberNode = metaPath.node;
    const plan = planGuardedStaticNarrow({ memberNode, parent, meta, path: metaPath, resolvePure });
    if (!plan) return false;
    if (plan.bail) return true;
    // an effectful sequence prefix on the receiver runs ONCE, ahead of the test - the raw
    // branch reads off the bare identifier
    const memberClone = plan.seqPrefix.length
      ? { ...cloneNode(memberNode), object: identifier(plan.recvIdent.name) }
      : cloneNode(memberNode);
    const rawBranch = plan.isCallee
      ? callExpression(memberExpression(memberClone, identifier('bind')), [identifier(plan.recvIdent.name)])
      : memberClone.optional || receiverCarriesOptional(memberClone) ? chainExpression(memberClone) : memberClone;
    let replacement = guardChainNode(plan, rawBranch);
    if (plan.seqPrefix.length) replacement = sequenceExpression([...plan.seqPrefix.map(expr => cloneNode(expr)), replacement]);
    // the source `?.` arrived wrapped in a ChainExpression; the conditional replaces the whole
    // wrapper, the raw branch carries its own
    let target = metaPath;
    if (target.parentPath?.node?.type === 'ChainExpression' && target.parentPath.node.expression === memberNode) {
      target = target.parentPath;
    }
    const consumed = target.node;
    markRewrite();
    target.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    // the WHOLE replacement: the raw branch respells the member, and a revisit re-claiming
    // it would guard the guard (the text leg skip-marks the same span)
    markSubtreeSkipped(skippedNodes, replacement);
    return true;
  }

  // the DESTRUCTURED spelling of the same read (`const { groupBy: g } = M`): the guard renders
  // as the declarator's value - on a nullish receiver the raw branch dereferences it exactly as
  // the pattern would. only the receiver identifier slot is swapped, so a sequence prefix
  // around it keeps its own claims
  function emitGuardedDestructureNarrow(meta, metaPath) {
    const prop = metaPath.node;
    const pattern = metaPath.parentPath?.node;
    if (pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1 || prop.computed) return false;
    const binding = prop.value;
    if (binding?.type !== 'Identifier') return false;
    // two hosts collapse to a plain binding: a declarator, and the SOLE-ASSIGNMENT form in
    // STATEMENT position (the expression's value, natively the RHS object, is unobservable
    // there); a value-consuming assignment keeps the raw read
    const hostPath = metaPath.parentPath.parentPath;
    const host = hostPath?.node;
    const isDeclarator = host?.type === 'VariableDeclarator' && !!host.init;
    let stmtUp = hostPath?.parentPath;
    while (stmtUp?.node && peelExpressionWrappers(stmtUp.node) !== stmtUp.node) stmtUp = stmtUp.parentPath;
    const isSoleAssignment = host?.type === 'AssignmentExpression' && host.operator === '='
      && host.left === pattern;
    const inStatement = isSoleAssignment && stmtUp?.node?.type === 'ExpressionStatement';
    if (!isDeclarator && !isSoleAssignment) return false;
    const hostInit = isDeclarator ? host.init : host.right;
    const plan = planGuardedStaticNarrow({
      memberNode: {
        type: 'MemberExpression', object: hostInit,
        property: { type: 'Identifier', name: meta.key }, computed: false, optional: false,
      },
      parent: null, meta, path: metaPath, resolvePure,
    });
    if (!plan || plan.bail) return false;
    const chain = guardChainNode(plan, memberExpression(identifier(plan.recvIdent.name), identifier(meta.key)));
    markRewrite();
    markSubtreeSkipped(skippedNodes, pattern);
    markSubtreeSkipped(skippedNodes, chain);
    if (isDeclarator) {
      host.id = identifier(binding.name);
      if (host.init === plan.recvIdent) host.init = chain;
      else replaceNodeInTree(host.init, plan.recvIdent, chain);
    } else {
      host.left = identifier(binding.name);
      if (host.right === plan.recvIdent) host.right = chain;
      else replaceNodeInTree(host.right, plan.recvIdent, chain);
      // the VALUE-CONSUMING host keeps its native value - the RHS object - as a sequence tail
      if (!inStatement) {
        const tail = identifier(plan.recvIdent.name);
        markSubtreeSkipped(skippedNodes, tail);
        replaceNodeInTree(hostPath.parentPath.node, host, sequenceExpression([host, tail]));
      }
    }
    return true;
  }

  // the staged top bails: a conditional / logical destructure receiver routes to the
  // per-branch mirror; a chain-assignment splice point inside the harvested SE stays raw
  // (the effects must interleave at the recorded slot, not append)
  function earlyStagedBail(meta, metaPath) {
    // a HOP prop whose ARRAY-WRAPPED element SELECTS: the meta funnel resolves no receiver
    // for a positional element, so the mirror is reachable only by the host's own shape
    if (metaPath.node.type === 'Property' && metaPath.node.value?.type === 'ObjectPattern' && !meta.fromFallback
      && (destructureEmit.arrayWrappedSelectingHost(metaPath)
        || destructureEmit.inlineCallYieldingProxyHost(metaPath))) {
      destructureEmit.handlePerBranch({ metaPath, meta });
      return true;
    }
    if (meta.fromFallback) {
      if (metaPath.node.type === 'Property') {
        // an ALL-proxy selecting receiver extracts like a plain proxy one - fall through to
        // the ordinary destructure dispatch instead of the per-branch mirror. the ASSIGNMENT
        // host reads it the same way: its own channels own the write
        let host = metaPath.parentPath;
        while (host?.node && (host.node.type === 'ObjectPattern' || host.node.type === 'Property')) {
          host = host.parentPath;
        }
        const selecting = host?.node?.type === 'VariableDeclarator' ? host.node.init
          : host?.node?.type === 'AssignmentExpression' && host.node.operator === '=' ? host.node.right : null;
        if (selecting && destructureEmit.isAllProxySelectingInit(selecting)) return false;
        // a DECLINED mirror leaves the key untouched, and which branch runs then decides whether
        // the polyfill applies at all - the shared diagnostic both other emitters emit
        if (!destructureEmit.handlePerBranch({ metaPath, meta })) {
          destructureEmit.warnConditionalFallbackUntouched(meta, metaPath);
        }
      }
      return true;
    }
    return false;
  }

  // a chain-assignment splice point inside the harvested SE: the static claim interleaves
  // it through the canonical prepend; every other arm stays staged on it
  // walk a proxy-hop member spine down to its root: every hop must be a plain (or
  // string-literal computed) POSSIBLE-GLOBAL key, the root a POSSIBLE-GLOBAL identifier
  // with a pure binding. computed-key sequence prefixes are the hops' effects, collected
  // per hop and re-ordered to evaluation order (inner hop first)
  // one hop's key view: the POSSIBLE-GLOBAL name plus the computed-key sequence prefix
  // (its effects); null when the hop is not a pristine proxy step
  function proxyHopKey(node, { allowOptional = false, metaPath = null } = {}) {
    if (node.type !== 'MemberExpression' || (node.optional && !allowOptional)) return null;
    if (!node.computed) {
      const keyName = node.property?.name;
      return keyName && isPristineProxyGlobal(adapter, keyName) ? { keyName, effects: [] } : null;
    }
    let key = peelExpressionWrappers(node.property);
    const effects = [];
    // sequence levels NEST (`[(f++, (g++, 'window'))]`): every prefix is an effect of this
    // hop's key, so the peel runs to the quiet tail
    while (key?.type === 'SequenceExpression') {
      effects.push(...key.expressions.slice(0, -1));
      key = peelExpressionWrappers(key.expressions.at(-1));
    }
    if (key?.type === 'Literal' && typeof key.value === 'string' && isPristineProxyGlobal(adapter, key.value)) {
      return { keyName: key.value, effects };
    }
    // a VARIABLE key folding to a proxy-global name (`g[k]`, `const k = "self"`) is the
    // same pristine hop - the fold is pure, so no extra effects join
    if (metaPath && key && key.type !== 'Literal' && !effects.length && !mayHaveSideEffects(key)) {
      const folded = resolveKey({ node: key, computed: true, scope: metaPath.scope, adapter, path: metaPath });
      if (typeof folded === 'string' && isPristineProxyGlobal(adapter, folded)) return { keyName: folded, effects };
    }
    return null;
  }

  function collapseProxyHopSpine(node, metaPath, { allowOptional = false } = {}) {
    const hopEffects = [];
    // sequence PREFIXES on the object spine harvest in evaluation order - the root (and
    // any seq around it) evaluates before every hop key (`(eff(), globalThis).self` ->
    // `(eff(), _globalThis)`); collected top-down, which IS that order
    const rootPrefix = [];
    let cur = node;
    // a kept WRITE inside the spine re-emits WHOLE as an effect and the walk continues
    // through its STORED value to find the root (`(q = globalThis).self` -> `(q =
    // _globalThis, _self)`); only the outermost one is collected - everything below it is
    // already spelled inside its own text, so effects there would run twice
    let keptWrite = null;
    while (cur.type === 'MemberExpression') {
      const hop = proxyHopKey(cur, { metaPath, allowOptional });
      if (!hop) return null;
      if (!keptWrite) hopEffects.push(hop.effects);
      cur = peelExpressionWrappers(cur.object);
      for (;;) {
        if (cur?.type === 'SequenceExpression') {
          if (!keptWrite) rootPrefix.push(...cur.expressions.slice(0, -1));
          cur = peelExpressionWrappers(cur.expressions.at(-1));
          continue;
        }
        if (cur?.type === 'AssignmentExpression' && cur.operator === '=') {
          keptWrite ??= cur;
          cur = peelExpressionWrappers(cur.right);
          continue;
        }
        break;
      }
    }
    if (cur.type !== 'Identifier') return null;
    const keyEffects = hopEffects.toReversed().flat();
    const effects = [...rootPrefix, ...keptWrite ? [keptWrite] : [], ...keyEffects];
    // can the STORED value spell a pure of its own? a spine ending on a backed hop can
    // (`q = globalThis.self` holds `_self`), a window-terminated one cannot - and there the
    // navigation keeps the WRITE as its base instead of re-reading the root
    const writeStoreSpellable = !keptWrite || proxyStoreIsSpellable(keptWrite.right, resolveGlobalPolyfill);
    if (!POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) {
      // an ALIAS of the surface (`const g = globalThis; g.self.Array`) collapses the hops
      // onto the alias itself - the local binding stays spelled, nothing injects (`g.Array`)
      // a MINTED root (`_globalThis` inside an emitted guard test) is not an alias to
      // collapse onto - its hops are the emission's own live reads (the probe semantics)
      if (metaPath && adapter.getBinding(metaPath.scope, cur.name)?.polyfillHint) return null;
      const aliased = metaPath && resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
      if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) {
        // the kept write travels with the alias arm too: its stored value decides the base
        // exactly as it does off a pure root (`(t = g.window).self.Array` reads off the write).
        // a write storing the ALIAS ITSELF spells that name, so the base re-reads it instead
        // (`(d = g).self.Atomics` -> `(d = g, g).Atomics`)
        return {
          aliasRoot: cur, effects, keyEffects, keptWrite,
          writeStoreSpellable: writeStoreSpellable || peelExpressionWrappers(keptWrite?.right) === cur,
        };
      }
      return null;
    }
    const pure = resolveGlobalPolyfill(cur.name);
    // a root pure cannot back (`window` - there is no `_window`) collapses to nothing: the
    // shape is still known, so the caller decides by POSITION (a value resolves its own
    // claim, a navigation stays raw)
    if (!pure) return { unbackedRoot: cur, effects, keyEffects };
    return { entry: pure.entry, hintName: pure.hintName, effects, keyEffects, keptWrite, writeStoreSpellable };
  }

  // the delete verdict for THIS claim: the live climb while the chain above is still the
  // source's, the spine mark once an earlier emit has rebuilt it
  // `forFold` asks the second half: may that consumer FOLD the navigation's guards? a `delete`
  // reads nothing, so the canon takes the whole nav - EXCEPT where a live `?.` guards the
  // ENVIRONMENT PROBE read itself. that guard is not over a read, it is over whether the delete
  // HAPPENS, and folding it removes a slot off the ponyfill the source never touches
  // (`delete ut()?.window?.self?.chrome` leaves `globalThis.chrome` alone on a realm with no
  // `window`; the folded spelling deletes it). a `?.` over a hop pure CAN spell reads an
  // always-defined ponyfill and folds like its plain twin (`(globalThis.window).self?.Array`)
  function deleteHostForClaim(metaPath, node, { forFold = false } = {}) {
    if (!(deleteHostedSpines.has(sourceSpanKey(node))
      || deleteHostAboveChain(metaPath, node, peelExpressionWrappers))) return false;
    if (!forFold) return true;
    for (let cur = peelExpressionWrappers(node.object); cur?.type === 'MemberExpression';
      cur = peelExpressionWrappers(cur.object)) {
      if (cur.optional && unbackedProxyHopKey(cur, m => resolvePure(m, metaPath))) return false;
    }
    return true;
  }

  return function astUsagePureCallback(meta, metaPath) {
    const { node } = metaPath;
    // the hop-host note is taken BEFORE any render: a guard replaces the whole nav, and the root
    // identifier that would otherwise carry the note lands inside a detached test clone
    // (`{ Math: { floor } } = globalThis.window?.self`)
    noteUnbackedHopAliasInit(metaPath, node, resolvePure, { meta, adapter, destructureEmit });

    // the shadow-alias guard's kept raw read (`h === Ctor ? _X : h.of`) is already ours -
    // and so is a nav whose SE spells a minted pure call (a prior pass's spent claim)
    if (claimIsMoot(metaPath, node, { isDisabled, skippedNodes, isInTypeAnnotation })
      || (node.type === 'MemberExpression' && ownEmittedNavClaim(node, metaPath, ownOutputTests(injectorState)))) return;
    if (node.type === 'MemberExpression' && !deleteHostedSpines.has(sourceSpanKey(node))
      && deleteHostAboveChain(metaPath, node, peelExpressionWrappers)) {
      markDeleteHostedSpine(node, deleteHostedSpines);
    }
    const parent = semanticParentNode(metaPath);

    if (meta.kind === 'in') return handleInExpression(meta, metaPath);
    if (meta.guardedAliasHint && (node.type === 'Property'
      ? emitGuardedDestructureNarrow(meta, metaPath)
      : emitGuardedStaticNarrow(meta, metaPath, parent))) return;
    // a guarded alias clouds only the STATIC surface - WHICH object the binding holds. an
    // INSTANCE claim reads off the runtime value either way, so it takes the ordinary
    // dispatch instead of staying raw (`({ Map: M } = globalThis); M = user; M.at(0)`)
    if (meta.guardedAliasHint && !(node.type === 'MemberExpression' && meta.placement === 'prototype')) return;
    // OUR rest sentinel from a prior pass never re-routes - ahead of every claim route
    if ((node.type === 'Property' && (destructureEmit.sentinelAlreadyProcessed({
      metaPath, meta, symbolIterator: isSourcedSymbolIteratorMeta(meta),
    }) || destructureEmit.overwriteRebindEmitted({ metaPath }))) || earlyStagedBail(meta, metaPath)) return;

    if (meta.kind === 'property') {
      if (node.type === 'Property') {
        // ... and a user-mutated slot wins over the ponyfill in a DESTRUCTURE too: the
        // pattern keeps reading the live binding, as the member path's gate decides for a read
        // - except the SOURCED well-known-symbol prop, whose render (`_getIteratorMethod`)
        // reads THROUGH the receiver and sees the patched slot
        if (chainAssignStaged(meta)
          || (!isSourcedSymbolIteratorMeta(meta) && mutatedSlotWinsOverClaim(meta, node))) return;
        // the destructure pipeline: resolved claims route to the staged emitter, everything
        // else stays raw. a `[Symbol.iterator]` prop resolves to null - its pure resolution
        // IS the shared triple (`_getIteratorMethod`), gated on symbol provenance
        const { result } = resolvePureOrGlobalFallback(meta, metaPath);
        if (result) destructureEmit.handleObjectPropertyResult({ metaPath, meta, ...result });
        else if (isSourcedSymbolIteratorMeta(meta)) {
          destructureEmit.handleObjectPropertyResult({ metaPath, meta, ...SYMBOL_ITERATOR_PURE_RESULT });
        }
        return;
      }
      if (node.type !== 'MemberExpression') return;
      if (memberWritePositionBails(node, parent, metaPath)) return;
      // the iterator-method read outranks the inherited-static machinery on a `this`
      // receiver (`this[Symbol.iterator]` in a static block -> `_getIteratorMethod(this)`);
      // `super` still bails inside the handler
      if (isSourcedSymbolIteratorMeta(meta) && isThisReceiver(node.object)) {
        if (chainAssignStaged(meta)) return;
        return handleSymbolIterator(meta, metaPath);
      }
      if (isThisReceiver(node.object) || node.object?.type === 'Super') {
        if (isThisReceiver(node.object) && isShadowedByClassOwnMember(metaPath, meta.key)) return;
        if (isInheritedStaticLookup(metaPath)) {
          meta = remapInheritedStaticMeta(injectorState, meta, resolveStaticInheritedMember(metaPath));
          if (!meta || isMutatedStatics(meta)) return;
          return emitInheritedStatic(meta, metaPath);
        }
        // outside a static lookup `this` is an ordinary INSTANCE receiver, reusable like a
        // name (`this.at(0)` -> `_at(this).call(this, 0)`); `super` never is - its dispatch
        // has its own spelling and stays staged
        if (node.object?.type === 'Super') return;
      }
      // a TAGGED-TEMPLATE tag is a plain binding swap for a STATIC claim (`String.raw\`x\``
      // -> `_String$raw\`x\``); an INSTANCE one would need a `.call` dispatch the tag position
      // has no room for, so that stays raw - through the wrappers the tag may wear
      if (isTaggedTemplateTag(peelParenAndTSParentPath(metaPath)?.node, node, meta.placement)) return;
      // a string-spelled key (`arr['Symbol.iterator']`) is a plain property read and stays raw
      if (isSourcedSymbolIteratorMeta(meta)) {
        if (chainAssignStaged(meta)) return;
        return handleSymbolIterator(meta, metaPath);
      }
    }

    // a user-mutated slot wins over the ponyfill everywhere: the claim stays raw and the
    // read keeps flowing through the live binding - the text emitter's central meta gate
    // (a replaced ctor poisons its statics AND its `.prototype` twin; a written global
    // slot poisons the bare identifier read)
    const { result, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
    // ... but a mutated SLOT wins over a static BIND only: an instance dispatch reads through its
    // receiver, never off the named slot, so a container the file deletes from (`delete box.at`)
    // keeps the ponyfill its receiver still needs
    // ... and the slot-deopt DIAGNOSTIC rides the gate that acts on it: the report names the
    // written slot once, the gate keeps its reads native (the text emitter's own pairing)
    if (result?.kind !== 'instance' && mutatedSlotWinsOverClaim(meta, node)) return noteDeoptedSlotRead(meta, deoptCtx);
    // the traversal is pre-order, so by the time a hop fires every ancestor has had its own
    // verdict: a consumer that resolved will own the render, one that did not renders
    // nothing and must not silence this claim
    if (result) resolvedClaimNodes.add(node);
    if (!result) return handleUnresolvedClaim({ meta, metaPath, node, fallback });
    const { kind, entry, hintName } = result;
    if (kind === 'instance') {
      if (node.type !== 'MemberExpression') return;
      // a chain-assign living INSIDE the receiver rides its memo whole - the split keeps
      // the write in the guard test (`(n = gw)?.WeakSet.name` -> `null == (_ref = n = gw)
      // ? void 0 : ...`); only a HARVESTED assign the render has no slot for stays staged
      if (chainAssignStaged(meta) && meta.sideEffects?.length
        && meta.sideEffects.some(effect => !subtreeContainsNode(node.object, effect))) return;
      if (meta.sideEffects?.length || meta.receiverEffectCount) {
        return emitInstanceWithPeeledSe(meta, metaPath, entry, hintName);
      }
      // a computed key only reaches here FOLDED (the meta resolved through it) with its
      // effects already harvested - the emission consumes the member whole, so the dead key
      // spelling (a discarded `(globalThis, "fl") + "at"`) must not fire its own claims
      if (node.computed) markSubtreeSkipped(skippedNodes, node.property);
      const id = injectPureImport(entry, hintName);
      replaceInstanceLike({ metaPath, id });
      return;
    }
    // an OPTIONAL static member (`X.Promise?.resolve`) substitutes like the plain spelling:
    // the claimed binding is always defined, so the `?.` erases with the member; an object
    // that can genuinely be undefined (an environment probe) keeps its guard routes
    if (node.type === 'MemberExpression' && node.optional
      && optionalMemberStaysGuarded(node, { metaPath, adapter, resolvePure })
      && !sealedThrowRidesTheClaim(node, metaPath, sealedProbeCtx)
      && emitOwnOptionalGuardedClaim({ meta, metaPath, node, parent, kind, entry, hintName })) return;
    // a guarded-nav static under an OPTIONAL call: the `?.()` rides the ternary outside
    // (`(null == (sp = _globalThis.window) ? void 0 : (c++, _Array$from))?.([3])`)
    // (a claimed callee under a plain-receiver `?.()` falls through: the substituted
    // binding is always defined, so the `?.()` erases - `globalThis.Map?.()` -> `_Map()`)
    // ... and a DECLINED plan falls through to the ordinary claim routes, which own the
    // shapes the nav plan cannot model (an opaque call root under two `?.` hops)
    if (parent?.type === 'CallExpression' && parent.optional && parent.callee === node
      && kind !== 'instance' && node.type === 'MemberExpression'
      && receiverCarriesLiveOptional(node.object)
      && emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return;
    emitStaticGlobalClaim({ meta, metaPath, node, kind, entry, hintName });
  };

  // the kept-root hop collapse first, then the plain static / global claim swap
  // a static / global claim whose receiver navigates a LIVE `?.` over an environment
  // probe (`(held = globalThis)?.window?.self.Array.of(5)`): the erase would drop the
  // source's short-circuit, so the claim rides a guard - the plan's probe read as the
  // test, the substituted binding (with its consumed plain tail) as the alternate
  // the claim's own `?.` over a genuinely undefinable probe renders as a guard
  // (`(w = gw)?.Map` -> `null == (w = gw) ? void 0 : _Map`) - but only TERMINAL: a
  // continuation above owns the render (`...?.self.box.list?.at(0)` rides the later
  // dispatch whole), and a shape the guard routes cannot spell stays raw either
  function emitOwnOptionalGuardedClaim({ meta, metaPath, node, parent, kind, entry, hintName }) {
    // the consumer is found by CLIMBING the path through transparent wrappers - the
    // semantic-parent helper answers a different question and misses a chain-wrapped hop
    let child = node;
    let up = metaPath.parentPath;
    while (up?.node && (up.node.type === 'ChainExpression' || up.node.type === 'ParenthesizedExpression'
      || TS_EXPR_WRAPPERS.has(up.node.type))) {
      child = up.node;
      up = up.parentPath;
    }
    const host = up?.node ?? parent;
    // ... and over an OPAQUE root only a RESOLVED consumer consumes: an unresolvable read
    // above renders nothing, so the guard belongs to this claim (`nr().window?.self
    // .navBox.list` -> `null == nr().window ? void 0 : _self.navBox.list`). over a proxy
    // IDENTIFIER root the collapse family owns the whole nav and this arm stands down
    const proxyRootName = navRootIsProxyIdentifier(node, metaPath, adapter, { requireBareName: true });
    const rootIsProxyIdentifier = typeof proxyRootName === 'string'
      ? !!resolveGlobalPolyfill(proxyRootName) : proxyRootName;
    // ... and a CALL of this claim is not a consumer at all: it INVOKES the binding the
    // claim substitutes and renders nothing of its own, so standing down there shipped the
    // static raw (`(globalThis.window?.self)?.Array?.of(5)`). only a call the resolution
    // already claimed owns a render
    const consumedAbove = (rootIsProxyIdentifier || resolvedClaimNodes.has(host))
      && ((host?.type === 'MemberExpression'
      && (host.object === child || peelExpressionWrappers(host.object) === node))
      || (host?.type === 'CallExpression' && resolvedClaimNodes.has(host)
        && (host.callee === child || peelExpressionWrappers(host.callee) === node)));
    if (kind === 'instance' || consumedAbove) return true;
    if (emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return true;
    // both guard renders declining is not a verdict to ship the claim RAW: the ordinary swap
    // owns those shapes (`delete f?.()?.Map.groupBy` - a `delete` reads nothing over the nav,
    // so the call rides as a discarded prefix and the ctor still substitutes)
    return !!emitLiveOptionalProbeGuard({
      metaPath, node, entry, hintName, effects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
    });
  }

  function emitStaticOverGuardedNav({
    meta = null, metaPath, node, entry, hintName, planNode = null, declineValueProbe = false,
    sealedRead = false, deleteHost = false,
  }) {
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    function resolveHere(m) {
      return resolvePure(m, metaPath);
    }
    // the plan models PROXY hops - claim-adjacent keys (`.Array` under `.of`) peel off
    // first; the claim's own substitution consumes their spelling. a possible-global HOP
    // claim (`.self`) plans over its own node - the claimed hop is the plan's leaf
    let navRoot = planNode ?? node.object;
    let plan;
    for (;;) {
      plan = planProvenNavGuardCollapse({
        rootNode: navRoot, scope: metaPath.scope, adapter, path: metaPath,
        resolvePure: resolveHere, throughKeptAssign: true,
      });
      if (plan) break;
      if (navRoot?.type !== 'MemberExpression' || navRoot.computed
        || navRoot.property?.type !== 'Identifier' || navRoot.optional) return false;
      navRoot = peelExpressionWrappers(navRoot.object);
    }
    if (plan.kind !== 'nested') return false;
    // undefinability living in the KEPT VALUE belongs to the root route's in-place drop -
    // but only for the claimless HOP entry; a REAL static claim keeps its guard
    if (declineValueProbe && probeHopInValue(plan, plan.hops[plan.lastUnresolvableIdx])) return false;
    // a provably-defined probe stands the whole guard down (babel erases it and rescues
    // the kept write as a comma prefix instead - the plain-swap tail renders that)
    {
      let probe = node.optional ? node.object : null;
      for (let cur = probe ? null : peelExpressionWrappers(node.object); cur?.type === 'MemberExpression';
        cur = peelExpressionWrappers(cur.object)) {
        if (cur.optional) {
          probe = cur.object;
          break;
        }
      }
      if (probe && !guardProbeUndefinable(probe,
        { metaPath, adapter, resolvePure, observableRead: sealedRead })) return false;
    }
    // staged corners: sequence wrappers, multi-step chain assigns
    if (plan.seqAroundPrefix?.length || plan.seqRoot
      || plan.topAssignSteps.length > 1 || (plan.topAssign && plan.topAssign !== plan.rootAssign)) return false;
    // harvested claim effects must be the plan's own (its key SE, its kept write) - an
    // effect the render has no slot for would be dropped
    if (meta?.sideEffects?.length) {
      const planOwned = new Set([...plan.keySeExprs, plan.rootAssign].filter(Boolean));
      if (meta.sideEffects.some(effect => !planOwned.has(effect))) return false;
    }
    let test = buildNavGuardTest(plan, { metaPath, aliasCtx, resolveHere });
    test = instanceTailMemoTest(test, metaPath, node, seKeyReadCtx);
    const id = injectPureImport(entry, hintName);
    markRewrite();
    replaceGuardedHop({
      hopPath: metaPath, test: binaryExpression('==', literal(null), test),
      built: identifier(id), skippedNodes, alwaysDefined: true, deleteHostTail: deleteHost,
      // the ORIGINAL key-effect nodes ride by IDENTITY: a claim inside them fires later in
      // the walk and lands in place (the keep-live carve above the consumed mark)
      leafKeySe: plan.liveKeySeExprs().slice(plan.testKeySeCount),
      unbackedHopKey: hop => unbackedProxyHopKey(hop, resolveHere),
    });
    return true;
  }

  // the guard TEST of a nav plan: the resolvable-base probe read when one exists, else the
  // probe hop's source spelling - root substituted, dead `?.` dropped (the shared
  // vestigial verdict: a hop over the always-defined ponyfill reads plainly)
  function buildNavGuardTest(plan, { aliasCtx, resolveHere }) {
    const base = navGuardTestBase(plan);
    if (base) {
      const pureId = identifier(injectPureImport(base.basePure.entry, base.basePure.hintName));
      const test = memberExpression(plan.rootAssign
        ? sequenceExpression([cloneNode(plan.rootAssign), pureId]) : pureId, identifier(base.probeName));
      if (plan.rootAssign) substituteProbeProxyRoot(test);
      return test;
    }
    // an UNDEFINABLE call below the probe hop is the deeper source: its own value is
    // what the `?.` tests, and the hop above drops from the test (`(() => globalThis
    // .window?.self)()?.window?...` tests `null == <call>` alone)
    let probeNode = plan.hops[plan.lastUnresolvableIdx].node;
    const probeBelow = peelExpressionWrappers(probeNode.object);
    // ... but a call whose OWN `?.()` is the undefinable part is not that source: its spelling
    // already carries that test, and the hop above is the environment probe the source asked
    // for (`oc?.()?.window?.self.Array.of` tests `oc?.()?.window`) - the same exclusion the
    // live-probe descent makes
    if (probeBelow?.type === 'CallExpression' && !probeBelow.optional) {
      // the body may already be REWRITTEN into its guard ternary - that shape is the
      // undefinability proof itself
      const probeCalleeFn = peelExpressionWrappers(probeBelow.callee);
      const fnBody = (probeCalleeFn?.type === 'ArrowFunctionExpression' && probeCalleeFn.expression)
        ? peelExpressionWrappers(probeCalleeFn.body) : null;
      const guardShapedBody = fnBody?.type === 'ConditionalExpression'
        && fnBody.consequent?.type === 'UnaryExpression' && fnBody.consequent.operator === 'void';
      if (guardShapedBody || proxyReceiverValueCanBeUndefined(
        probeBelow, resolveHere, aliasCtx, { throughChainAssign: true })) {
        probeNode = probeBelow;
      }
    }
    let probe = probeSpelling(probeNode,
      { resolveHere, aliasCtx, substituteProbeProxyRoot, keepLive: skippedNodes.keepLive });
    // a kept write WRAPPING the probe hop rebuilds around the test (`(fh = _globalThis.window)`)
    if (plan.assignWrap) {
      probe = assignmentExpression(plan.assignWrap.operator, cloneNode(plan.assignWrap.left), probe);
    }
    // the probe is a FINISHED spelling: a re-visited claim on it must not re-collapse the
    // load-bearing read (`null == g.window` keeps its hop) - only the kept computed keys'
    // effect claims stay live and land in place
    markSubtreeSkipped(skippedNodes, probe, skippedNodes.keepLive?.size ? skippedNodes.keepLive : null);
    return probe;
  }

  // the ROOT identifier claim of a proxy-hop chain that navigates a LIVE `?.` over an
  // environment probe (`globalThis.window?.self.assignBox.n`): the climb finds the deepest
  // all-proxy member, the plan guards it, and the leaf ponyfill rides the alternate with
  // the plain tail (`null == _globalThis.window ? void 0 : _self.assignBox.n`)
  function emitRootGuardedNavCollapse(metaPath) {
    const climbed = [];
    let cursor = metaPath;
    for (let up = metaPath.parentPath; up?.node; up = up.parentPath) {
      const upNode = up.node;
      // step through the kept write and its wrappers (`(held = globalThis)?.window`):
      // the plan's chain-assign dig owns the store, the climb only finds the leaf
      if ((upNode.type === 'ParenthesizedExpression' && upNode.expression === cursor.node)
        || (upNode.type === 'AssignmentExpression' && upNode.right === cursor.node)) {
        cursor = up;
        continue;
      }
      // a computed hop climbs too (`[(c++, 'self')]`) - the plan's own key resolution
      // validates the fold; a hop it rejects falls back to a shallower leaf below
      if (upNode.type === 'MemberExpression'
        && (upNode.object === cursor.node || peelExpressionWrappers(upNode.object) === cursor.node)
        && (upNode.computed || POSSIBLE_GLOBAL_OBJECTS.has(upNode.property?.name))) {
        climbed.push(up);
        cursor = up;
        continue;
      }
      break;
    }
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    function resolveHere(m) {
      return resolvePure(m, metaPath);
    }
    // deepest leaf first; a plan the leaf's key spelling rejects retries one hop down
    for (let at = climbed.length - 1; at >= 0; at--) {
      const leafPath = climbed[at];
      if (!leafPath.node.optional && !receiverCarriesOptional(leafPath.node)) continue;
      const plan = planProvenNavGuardCollapse({
        rootNode: leafPath.node, scope: metaPath.scope, adapter, path: metaPath,
        resolvePure: resolveHere, throughKeptAssign: true,
      });
      if (!plan || plan.kind !== 'nested' || !plan.leafPure) continue;
      if (plan.seqAroundPrefix?.length || plan.seqRoot
        || plan.topAssignSteps.length > 1 || (plan.topAssign && plan.topAssign !== plan.rootAssign)) continue;
      // undefinability living in the KEPT VALUE (not in a nav hop): the source `?.` already
      // guards it - drop the pristine hop in place and transfer the `?.` to the surviving
      // read (`(r = globalThis.window)?.self.Array...` -> `(r = _globalThis.window)?.Array...`);
      // the root identifier keeps its own ordinary swap
      const probeHop = plan.hops[plan.lastUnresolvableIdx];
      // ... except where that value is INVOKED: the source short-circuits the call away on
      // a nullish root, so the hop's read must survive as the callee and the guard renders
      if (probeHopInValue(plan, probeHop) && !probeValueIsInvoked(leafPath)) {
        dropValueProbeNavHops(plan, climbed);
        return false;
      }
      const test = buildNavGuardTest(plan, { aliasCtx, resolveHere });
      // the leaf's key effects wrap the PURE binding, the absorbed tail hangs outside
      // (`(c++, _self).Array` - the nav-collapse leaf shape); nav hops ABOVE the collapse
      // hang back on in their SOURCE spelling (`_self['window']`, a raw `.window` read)
      let built = identifier(injectPureImport(plan.leafPure.entry, plan.leafPure.hintName));
      const leafKeySe = plan.liveKeySeExprs().slice(plan.testKeySeCount).map(expr => cloneNode(expr));
      if (leafKeySe.length) built = sequenceExpression([...leafKeySe, built]);
      for (const hop of plan.hops.slice(plan.collapseIdx + 1)) {
        built = hop.node.computed
          ? memberExpression(built, cloneNode(hop.node.property), { computed: true, optional: !!hop.liveOptional })
          : memberFromKeyName(built, hop.name, { optional: !!hop.liveOptional });
      }
      markRewrite();
      replaceGuardedHop({
        hopPath: leafPath, test: binaryExpression('==', literal(null), test), built, skippedNodes, alwaysDefined: true,
      });
      return true;
    }
    return false;
  }

  // undefinability living in the KEPT VALUE: the source `?.` already guards it - drop the
  // pristine nav hops in place, transfer the `?.` to the surviving read, MIGRATE dropped SE
  // key effects into its key (`?.[(c++, 'self')]?.Array` -> `?.[c++, "Array"]`); the root
  // identifier keeps its own ordinary swap - it renders nothing itself
  function dropValueProbeNavHops(plan, climbed) {
    const outside = climbed.filter(path => !(Number.isInteger(path.node.start)
      && path.node.start >= plan.rootAssign.start && path.node.end <= plan.rootAssign.end));
    // the climb reaches PAST the proxy run (a computed hop rides along for the plan's own
    // key resolution): only the leading run of real proxy hops drops, the first read the
    // fold rejects is the SURVIVOR (`?.self["Array"]` -> `?.["Array"]`)
    const effects = [];
    const navClimbed = [];
    for (const path of outside) {
      const hop = proxyHopKey(path.node, { allowOptional: true });
      if (!hop) break;
      effects.push(...hop.effects);
      navClimbed.push(path);
    }
    if (!navClimbed.length) return;
    // a TS wrapper on the dropped span is consumed with it (`((d = gw)?.self as any).Array`
    // -> `(d = _globalThis.window).Array`) - the substituted spelling needs no assertion
    let top = navClimbed.at(-1);
    // a SEAL (parens, a TS wrapper) ends the chain: the read above it is unconditional, so
    // the dropped hop's `?.` does NOT travel to the survivor - the wrapper itself is
    // consumed with the span it sealed (`((d = gw)?.self as any).Array` -> `(d =
    // _globalThis.window).Array`)
    let crossedSeal = false;
    while (top.parentPath?.node?.expression === top.node
      && (TS_EXPR_WRAPPERS.has(top.parentPath.node.type) || top.parentPath.node.type === 'ChainExpression'
        || top.parentPath.node.type === 'ParenthesizedExpression')) {
      crossedSeal ||= top.parentPath.node.type !== 'ChainExpression';
      top = top.parentPath;
    }
    const above = top.parentPath?.node;
    // the survivor takes the migrated key effects in either spelling: a dotted key becomes the
    // literal the sequence ends on, a COMPUTED one keeps its own expression there
    // (`?.[(c++, 'self')]['Array']` -> `?.[c++, 'Array']`)
    const survivorTakesKey = above?.type === 'MemberExpression'
      && (above.computed ? !!above.property : above.property?.type === 'Identifier');
    if (effects.length && !survivorTakesKey) return;
    const wasOptional = !crossedSeal && navClimbed.some(path => path.node.optional);
    markRewrite();
    top.replaceWith(navClimbed[0].node.object);
    if (above?.type === 'MemberExpression' && wasOptional) above.optional = true;
    if (effects.length) {
      above.property = sequenceExpression([...effects.map(expr => cloneNode(expr)),
        above.computed ? above.property : literal(above.property.name)]);
      above.computed = true;
    }
  }

  // substitute the pristine proxy root inside a cloned guard test - the clone detaches
  // from the walk before its own claim would land
  function substituteProbeProxyRoot(root) {
    let spine = root;
    while (spine && typeof spine === 'object') {
      if (spine.type === 'AssignmentExpression') {
        spine = peelExpressionWrappers(spine.right);
        continue;
      }
      if (spine.type === 'MemberExpression') {
        spine = peelExpressionWrappers(spine.object);
        continue;
      }
      if (spine.type === 'SequenceExpression') {
        spine = peelExpressionWrappers(spine.expressions.at(-1));
        continue;
      }
      // an IIFE ROOT spells its proxy global inside the body the call yields - the probe is a
      // finished clone the walk never revisits, so the root must substitute here or a raw
      // `globalThis` reaches the output (`(() => globalThis)()?.window` tests the ponyfill)
      if (spine.type === 'CallExpression' && !spine.optional) {
        const callee = peelExpressionWrappers(spine.callee);
        if (callee?.type === 'ArrowFunctionExpression' && callee.expression) {
          spine = peelExpressionWrappers(callee.body);
          continue;
        }
      }
      break;
    }
    if (spine?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(spine.name)
      && isPristineProxyGlobal(adapter, spine.name)) {
      const pure = resolveGlobalPolyfill(spine.name);
      if (pure) spine.name = injectPureImport(pure.entry, pure.hintName);
    }
  }

  // does an optional member's OBJECT keep the guard routes - a live `?.` inside it, or a
  // value that can genuinely be undefined (read THROUGH a kept write)
  // a claim with NO pure result: the ctor-fallback receiver swap, then the alias-spine
  // drop for hops the declined meta subsumed
  function handleUnresolvedClaim({ meta, metaPath, node, fallback }) {
    // a SEQUENCE receiver spells its own effects, so the static-FALLBACK swap below needs no
    // erasure budget: it replaces the TAIL and the prefix keeps running in place
    const sequenceReceiver = fallback && node.type === 'MemberExpression'
      && node.object?.type !== 'Super' && meta.placement !== 'prototype' && meta.sideEffects?.length
      ? fallbackSwapsSequenceTail(node, meta) : null;
    if (sequenceReceiver) {
      const tail = sequenceReceiver.expressions.at(-1);
      if (!discardRescueNodes({ node: tail, scope: metaPath.scope, adapter, path: metaPath }).length) {
        markRewrite();
        sequenceReceiver.expressions[sequenceReceiver.expressions.length - 1] =
          identifier(injectPureImport(fallback.entry, fallback.hintName));
        markSubtreeSkipped(skippedNodes, tail);
        return;
      }
    }
    // static-FALLBACK swap: a member that is NOT itself polyfilled but whose receiver
    // resolves to a pure ctor (`Promise.noSuchStatic` -> `_Promise.noSuchStatic`).
    // the guarded/prototype/SE-bearing shapes are staged - raw source stays there
    if (fallback && node.type === 'MemberExpression'
      && node.object?.type !== 'Super' && meta.placement !== 'prototype'
      && !meta.sideEffects?.length && !meta.receiverEffectCount
      // the object swap ERASES the receiver spelling - an observable buried in it (a
      // chain-assignment, an SE-bearing root call) has no slot in this shape yet: staged
      && !discardRescueNodes({ node: node.object, scope: metaPath.scope, adapter, path: metaPath }).length) {
      const id = injectPureImport(fallback.entry, fallback.hintName);
      // a LIVE `?.` over an undefinable probe keeps its guard, the fallback riding the
      // alternate (`...window?.self?.Promise.noSuchStatic` -> `null == _globalThis.window
      // ? void 0 : _Promise.noSuchStatic`, babel's guarded fallback)
      if (receiverCarriesLiveOptional(node.object)) {
        let probe = null;
        for (let cur = peelExpressionWrappers(node.object); cur?.type === 'MemberExpression';
          cur = peelExpressionWrappers(cur.object)) {
          if (!cur.optional) continue;
          // the descent stops at the SHALLOWEST hop whose own object can actually be absent:
          // a deeper one over a provably DEFINED value is not the source of the undefinedness
          // (`f()?.window?.Promise` with `f = () => globalThis` tests `f().window`, not `f()`)
          if (!guardProbeUndefinable(cur.object, { metaPath, adapter, resolvePure })) break;
          probe = cur.object;
        }
        // a provably DEFINED probe leaves the `?.` dead - the plain swap below erases it
        if (probe) {
          markRewrite();
          const probeInner = cloneNode(peelExpressionWrappers(probe));
          // the dead `?.` inside the probe spelling erases with it - the canonical verdict
          for (const hop of vestigialNavOptionals(probeInner, m => resolvePure(m, metaPath),
            { scope: metaPath.scope, adapter, path: metaPath })) hop.optional = false;
          const test = binaryExpression('==', literal(null),
            receiverCarriesOptional(probeInner) ? chainExpression(probeInner) : probeInner);
          replaceGuardedHop({
            hopPath: metaPath, test,
            built: memberExpression(identifier(id), cloneNode(node.property), { computed: node.computed }),
            skippedNodes, navAlternate: true,
          });
          return;
        }
      }
      markRewrite();
      // the read a load-bearing SEAL made observable is the source's own, and this swap
      // erases the receiver spelling - it rides back as a throw probe ahead of the ponyfill.
      const objectProbe = sealedClaimThrowProbe(node.object, metaPath, sealedProbeCtx);
      metaPath.get('object').replaceWith(objectProbe
        ? sequenceExpression([objectProbe.node, identifier(id)]) : identifier(id));
      return;
    }
    // a DECLINED claim over an alias-rooted pristine spine: the hop claims were subsumed
    // under this meta, so the drop lands here - the alias stays spelled and the dead leaf
    // keeps reading through it (`s.window.Array` -> `s.Array`, babel's kept shape)
    // an OPTIONAL member reading this hop owns its probe - the alias drop would eat the
    // load-bearing read (`g.window?.self?.Map` tests `null == g.window`)
    const optionalReader = metaPath.parentPath?.node?.type === 'ChainExpression'
      ? metaPath.parentPath.parentPath?.node : metaPath.parentPath?.node;
    if (optionalReader?.type === 'MemberExpression' && optionalReader.optional
      && peelExpressionWrappers(optionalReader.object) === node) return;
    if (node.type === 'MemberExpression' && !meta.sideEffects?.length && !meta.receiverEffectCount) {
      // the node that is ITSELF a pristine hop (`g.self.window`, `.window` claimless)
      // collapses whole; a dead leaf (`.Array`) collapses its object spine under it
      const spineNode = proxyHopKey(node, { metaPath }) ? node
        : node.object?.type === 'MemberExpression' ? node.object : null;
      const collapsed = spineNode && collapseProxyHopSpine(spineNode, metaPath);
      // ... and only where something READS through the hop: in VALUE position the drop would
      // change what the expression yields (`t = g.window` stores the window object, not `g`).
      // a dead leaf above the spine is that reader itself
      const navigatedSpine = spineNode !== node || spineIsNavigated(metaPath).navigated;
      if (collapsed?.aliasRoot && !collapsed.effects.length && navigatedSpine) {
        markRewrite();
        const consumed = spineNode;
        (spineNode === node ? metaPath : metaPath.get('object')).replaceWith(cloneNode(collapsed.aliasRoot));
        markSubtreeSkipped(skippedNodes, consumed);
      }
    }
  }

  function mutatedSlotWinsOverClaim(meta, node) {
    if (isMutatedStatics(meta)) return true;
    return meta.kind === 'global' && node.type === 'Identifier'
      && isMutatedStatics({ kind: 'property', object: 'globalThis', key: meta.name, placement: 'static' });
  }

  // the live-`?.` probe guard of the generic static claim, extracted for its size; true
  // when the guard rendered (the caller returns)
  function emitLiveOptionalProbeGuard({ metaPath, node, entry, hintName, effects, receiverEffectCount }) {
    // the collapse owns the shape wherever a `delete` may still fold it
    if (deleteHostForClaim(metaPath, node, { forFold: true })) return false;
    let cur = peelExpressionWrappers(node.object),
        plainHops = true;
    // the claim's OWN `?.` probes its object directly (`(w = gw)?.Map` -> the write is
    // the probe); otherwise the deepest optional hop inside the receiver carries it
    let probe = node.optional ? node.object : null;
    while (!probe && cur?.type === 'MemberExpression') {
      if (cur.optional) {
        probe = cur.object;
        break;
      }
      // a LITERAL STRING key is the same plain read in its computed spelling
      // (`...?.self['Array'].from` folds like `.Array` - the guard survives either)
      const literalKey = cur.computed && peelExpressionWrappers(cur.property)?.type === 'Literal'
        && typeof peelExpressionWrappers(cur.property).value === 'string';
      if (!literalKey && (cur.computed || cur.property?.type !== 'Identifier')) plainHops = false;
      cur = peelExpressionWrappers(cur.object);
    }
    if (!probe && cur?.type === 'CallExpression' && cur.optional) probe = cur;
    // the harvested receiver effect may BE the probe (the chain-root call detection
    // collected) - it moves into the test, not a seq prefix
    // a SEQ-prefixed computed KEY spells effects the substitution drops - the harvest
    // re-emits them around the alternate, where the native order runs them: past the
    // guard, before the leaf read (`... ? void 0 : (k++, _Object$values({ b: 2 }))`)
    const keySe = mayHaveSideEffects(node.property) ? (effects ?? []).slice(receiverEffectCount ?? 0) : null,
          navSe = keySe ? (effects ?? []).slice(0, receiverEffectCount ?? 0) : effects;
    const effectsAreProbe = !navSe?.length
            || (navSe.length === 1
              && (navSe[0] === probe || peelExpressionWrappers(navSe[0]) === peelExpressionWrappers(probe ?? {}))),
          // a claim NAVIGATED further reads a value THROUGH the probe, and a nested sequence
          // leaves that value unproven (`(d++, (c++, globalThis))?.Map.name` keeps its guard);
          // a whole-swap leaf reads nothing through it (`....Array.of` erases)
          navigatedAbove = metaPath.parentPath?.node?.type === 'MemberExpression'
            && peelExpressionWrappers(metaPath.parentPath.node.object) === node,
          // ... and a BARE call value stays unproven for an INSTANCE dispatch reading it: that
          // dispatch takes the value THROUGH its receiver, so babel memoizes the call into the
          // guard test (`(call)?.self.Map.name` keeps `null == (_ref = call())`)
          instanceReadAbove = navigatedAbove && peelExpressionWrappers(probe)?.type === 'CallExpression'
            && !peelExpressionWrappers(probe).optional
            && resolvePure({
              kind: 'property', object: 'function', placement: 'prototype',
              key: metaPath.parentPath.node.computed ? null : metaPath.parentPath.node.property?.name,
            }, metaPath)?.kind === 'instance',
          probeUndefinable = !!probe && (instanceReadAbove || guardProbeUndefinable(probe,
            { metaPath, adapter, resolvePure, nestedSeqUnproven: navigatedAbove }));
    // a deeper `?.` under a CTOR-keyed hop is the real source - the ctor key is not a
    // probe (`(globalThis.window.self)?.Promise?.resolve(1)` tests the seal's own read);
    // the claim's OWN ctor key descends too (`...self?.Array?.of` - `Array` has no pure
    // ctor entry but IS the claim's object)
    const claimCtor = hintName?.includes('$') ? hintName.split('$', 1)[0] : null;
    // a hop whose OBJECT is an undefinable CALL descends - there the call is the source and
    // the test reads it alone (`<short-circuit call>?.window?...`). a MEMBER object stays:
    // the plan canon tests the DEEPER PREFIX (`lastUnresolvableIdx`'s own node), so stacked
    // unresolvable hops keep the source's `?.` inside the test (`_globalThis.window?.window`,
    // babel's spelling) instead of descending to the bottom probe
    function deeperSourceUndefinable(objNode) {
      const objValue = peelExpressionWrappers(objNode);
      if (objValue?.type !== 'CallExpression' || objValue.optional) return false;
      const fnCallee = peelExpressionWrappers(objValue.callee);
      const fnBody = (fnCallee?.type === 'ArrowFunctionExpression' && fnCallee.expression)
        ? peelExpressionWrappers(fnCallee.body) : null;
      if (fnBody?.type === 'ConditionalExpression'
        && fnBody.consequent?.type === 'UnaryExpression' && fnBody.consequent.operator === 'void') return true;
      return proxyReceiverValueCanBeUndefined(objValue, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true });
    }
    for (let inner = probe && peelExpressionWrappers(probe);
      inner?.type === 'MemberExpression' && inner.optional && !inner.computed
        && (resolveGlobalPolyfill(inner.property?.name) || inner.property?.name === claimCtor
          || deeperSourceUndefinable(inner.object));
      inner = peelExpressionWrappers(probe)) {
      probe = inner.object;
    }
    // a PAREN-SEALED probe renders as a guard of its OWN, and the test reads that guard's
    // source - the inner `?.`'s object - not the whole rendered value
    // (`(globalThis.window?.self.window)?.Array.of(9)` tests `_globalThis.window`)
    const descended = descendIntoOwnGuard(probe, { metaPath, adapter, resolvePure }),
          sealedDescent = !!descended;
    if (descended) probe = descended;
    if (probe && probeUndefinable && plainHops && (!keySe || keySe.length)) {
      const id = injectPureImport(entry, hintName);
      markRewrite();
      // the memoized probe respells bare: parens and TS wrappers around the write drop
      // (`((a = gw) as any)?.self...` -> `null == (_ref = a = _globalThis.window)`);
      // trailing ERASABLE hops drop too - the test reads at most the probe hop itself
      let probeSource = peelExpressionWrappers(probe);
      // a KEPT WRITE anchors the prefix: the sequence stays whole inside the test beside it
      // (`null == (eff(), t = _self.window) ? void 0 : ...`, the kept-root canon). without
      // one the harvested prefix was lifted and the clone reads the quiet tail
      const probeSeqTail = probeSource?.type === 'SequenceExpression'
        ? peelExpressionWrappers(probeSource.expressions.at(-1)) : null;
      // ... except where the probe was reached by descending INTO a SEAL: the seal renders its
      // own value, and the prefix it carried runs ahead of the whole guard there
      // ... and a NESTED sequence keeps its whole spelling too: the value canon stopped there,
      // so the test reads what the source wrote (`(d++, (c++, globalThis))?.Map.name`)
      const keepSeqInTest = !sealedDescent
              && (probeSeqTail?.type === 'AssignmentExpression' || probeSeqTail?.type === 'SequenceExpression'),
            droppedSeqPrefix = [];
      for (;;) {
        if (probeSource?.type === 'SequenceExpression' && !keepSeqInTest) {
          droppedSeqPrefix.push(...probeSource.expressions.slice(0, -1));
          probeSource = peelExpressionWrappers(probeSource.expressions.at(-1));
          continue;
        }
        const peeled = peelPristineProxyHops(probeSource, hopPeelCtx);
        if (peeled !== probeSource) {
          probeSource = peeled;
          continue;
        }
        break;
      }
      // the un-memoized probe respells its DEAD `?.` plain - a proven root subsumes the
      // hop's own nullish check into the test (`null == ignores(1).window`, babel's
      // spelling); the split's memoized probe keeps the source `?.` instead
      // effects that are NOT the probe still have a slot: they prefix the WHOLE ternary
      // (`(n++, null == _globalThis.window ? void 0 : _Promise$resolve(1))`, babel's
      // wrap) - unless the probe's own spelling CARRIES them (a root call with an
      // effectful argument reads once in the test; a prefix would run it twice)
      // effects the probe's FINAL spelling carries stay with it - a prefix would run them
      // twice (a root call with an effectful argument reads once in the test)
      const prefixSe = [
        ...!effectsAreProbe && navSe?.length
          && navSe.some(effect => !subtreeContainsNode(probeSource, effect)) ? navSe : [],
        // a sequence prefix the test peeled away has no other slot: it runs ahead of the guard,
        // where the source ran it - before the probe read. a QUIET one observes nothing and
        // dies with the spelling it prefixed (`(1, globalThis.window)`)
        ...droppedSeqPrefix.filter(effect => mayHaveSideEffects(effect) && !(navSe ?? []).includes(effect)),
      ];
      const probeInner = cloneNode(probeSource);
      // a sequence KEPT whole still navigates: its tail drops the same pristine hops the peeled
      // spelling does, so the test reads the root binding and not the hop's own ponyfill
      if (keepSeqInTest) dropTailPristineProxyHops(probeInner, hopPeelCtx);
      // the clone IS the guard test: a claim re-visited inside it renders the read the test
      // performs, so an unbacked hop in it stays load-bearing instead of folding away
      probeTestClones.add(probeInner);
      for (const hop of vestigialNavOptionals(probeInner, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath })) hop.optional = false;
      const probeClone = receiverCarriesOptional(probeInner) || probeInner.optional === true
        ? chainExpression(probeInner) : probeInner;
      const test = binaryExpression('==', literal(null),
        instanceTailMemoTest(probeClone, metaPath, node, seKeyReadCtx));
      replaceGuardedHop({
        hopPath: metaPath, test, built: identifier(id), skippedNodes,
        // the NAV route: the alternate is the claim's own pure over the collapsed spine, and the
        // source read THROUGH it - so an optional tail rides the branch with its `?.` kept
        // (`p()?.window?.Promise.resolve(4)?.then?.(f)`), exactly as a plain tail already does
        navAlternate: true,
        prefixSe: prefixSe.length ? prefixSe.map(effect => cloneNode(effect)) : null,
        leafKeySe: keySe?.length ? keySe.map(effect => cloneNode(effect)) : null,
      });
      return true;
    }
    return false;
  }

  // is a proxy spine NAVIGATED further (a claim key above - `globalThis.self.Array` - or a
  // destructure pattern reading its slots)? then it folds onto the ROOT binding, babel's nav
  // collapse; wrappers and sequence TAILS are transparent to the question (`(n++,
  // globalThis.self)[k]` navigates). every other consumer - an argument slot, a write's
  // right side, a bare statement, a clean-spine pattern init - holds the VALUE and spells
  // the claim's own pure. the same verdict decides an unbacked root: a value resolves it,
  // a navigation stays raw
  // the positional verdict: `navigated` decides root-vs-value, `mutatedAbove` says the read
  // above must reach the user's patch and so keeps the NEAREST surface as its base
  function spineIsNavigated(targetPath, keptTail = [], keptWrite = null, { deadOptional = false } = {}) {
    let child = targetPath.node;
    let navHost = targetPath.parentPath;
    while (navHost?.node) {
      const wrap = navHost.node;
      const transparent = wrap.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(wrap.type)
        || wrap.type === 'ChainExpression'
        || (wrap.type === 'SequenceExpression' && wrap.expressions.at(-1) === child);
      if (!transparent) break;
      child = wrap;
      navHost = navHost.parentPath;
    }
    const host = navHost?.node;
    // a DESTRUCTURE reads slots off the spine: with unresolvable hops KEPT it must fold to
    // the root (`const { x } = globalThis.self.window` - a value render would read
    // `.window` off the ponyfill)
    const patternHost = (host?.type === 'VariableDeclarator' && host.init === child
      && (host.id?.type === 'ObjectPattern' || host.id?.type === 'ArrayPattern'))
      || (host?.type === 'AssignmentExpression' && host.right === child
        && (host.left?.type === 'ObjectPattern' || host.left?.type === 'ArrayPattern'));
    // a MUTATED slot READ above keeps the VALUE spelling: the read must reach the user's
    // patch through the nearest proxy hop's ponyfill (`globalThis.self.Set.name` ->
    // `_self.Set`, the mutated-static receiver canon). a `delete` names the slot without
    // reading it, so its nav collapses whole like any other - the canon's own rule
    // ... and only where the slot is POLYFILLABLE: substituting there would answer the
    // ponyfill instead of the patch. a plain user key has no ponyfill to lose, so its nav
    // folds to the root like any other read
    // the WRITE TARGET arm is computed first: a write does not READ the patched slot, so
    // the mutated rule never applies to it (same reasoning as `delete`)
    const writeTargetAbove = host?.type === 'MemberExpression' && host.object === child
      && memberIsWriteTarget(navHost);
    const mutatedAbove = host?.type === 'MemberExpression' && host.object === child && !host.computed
      && isMutatedGlobalSlot(adapter, host.property?.name) && !!resolveGlobalPolyfill(host.property.name)
      && !isDeleteOperand(navHost) && !writeTargetAbove;
    // a `delete` performs no read, so its nav collapses whole; with a kept WRITE spelled
    // in the way, the surface after it is the claim's OWN pure rather than a root re-read
    // (`delete (d = globalThis.window).self.k` -> `delete (d = _globalThis.window, _self).k`)
    if (keptWrite && isDeleteOperand(navHost)) {
      return { navigated: false, mutatedAbove: false, writeTargetAbove: false, patternHost: false };
    }
    // a WRITE TARGET keeps the VALUE spelling - except over a KEPT TAIL, which the value
    // render would respell off the ponyfill (`_self.window.WeakSet = f` reads `.window` on
    // an engine that has none): there it folds to the root like any read
    // a LIVE `?.` above reads the KEPT TAIL's own value - that read is the environment probe
    // the source wrote (`globalThis.self.window?.WeakRef` tests `_self.window`), so the tail
    // stays spelled and this is not a plain fold
    // ... unless the guards are already DEAD (a `delete` reads nothing over its navigation):
    // there the tail folds away like any other hop (`delete globalThis.window?.frames.k`)
    const optionalOverKeptTail = !deadOptional && !!keptTail.length && host?.type === 'MemberExpression'
      && host.object === child && host.optional;
    const navigated = (host?.type === 'MemberExpression' && host.object === child
      && !writeTargetAbove && !mutatedAbove && !optionalOverKeptTail)
      || (!!keptTail.length && (patternHost || writeTargetAbove));
    return { navigated, mutatedAbove, writeTargetAbove, patternHost };
  }

  // the extension stepped over a kept WRITE: the write re-emits carrying the spine's own
  // VALUE spelling, and the base beside it is the outer run's own verdict
  function renderCollapseOverKeptWrite({
    target, consumed, writeStep, innerKeptTail, keptTail, outerHopName, outerEffects,
    collapsed, entry, hintName, navigated,
  }) {
    const innerBase = innerKeptTail.reduce((spelling, keyName) => memberFromKeyName(spelling, keyName),
      identifier(injectPureImport(entry, hintName)));
    const outerPure = resolveGlobalPolyfill(navigated || !outerHopName ? collapsed.hintName : outerHopName);
    // an unresolvable tail respells over the base only in VALUE position - a navigation
    // folds it away, exactly as the plain (write-less) collapse does
    const base = (navigated ? [] : keptTail).reduce(
      (spelling, keyName) => memberFromKeyName(spelling, keyName),
      identifier(injectPureImport(outerPure.entry, outerPure.hintName)));
    const write = assignmentExpression('=', cloneNode(writeStep.left), withSideEffects(innerBase, collapsed.effects));
    // an unbacked TAIL in VALUE position reads off the WRITE itself: re-reading it off the
    // ponyfill root would spell a `.window` the engine may not have, and the value the source
    // yields is the one the write stored (`(k = globalThis.self).window` -> `(k = _self).window`)
    const readsOffWrite = !navigated && keptTail.length && !outerEffects.length;
    target.replaceWith(readsOffWrite
      ? keptTail.reduce((spelling, keyName) => memberFromKeyName(spelling, keyName), write)
      : sequenceExpression([write, ...outerEffects.map(effect => cloneNode(effect)), base]));
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(target.node);
  }

  // the collapse render of a possible-global hop claim, extracted for its size: the
  // upward extension, the navigation verdict and the base spelling live here
  // the collapse EXTENDS UP through enclosing pristine hops and, once, over a kept WRITE:
  // it returns the widened target plus what the climb collected
  function extendCollapseUpward(metaPath, { allowOptional }) {
    let target = metaPath;
    const outerEffects = [];
    // an enclosing SEQUENCE whose TAIL the spine is: its prefix evaluates ahead of everything
    // the spine spells, so it leads the rebuilt effects. the climb walks OUTWARD, so each
    // level unshifts in front of the ones already collected (`(c++, (d++, globalThis.self))
    // .window` runs `c++` first)
    const seqPrefixEffects = [];
    // hops pure cannot back (`window`) are swallowed too, but remembered: in VALUE
    // position they respell over the collapsed base, in navigation they fold away
    let keptTail = [];
    // a kept WRITE between the collapsed spine and further proxy hops: the write keeps the
    // spine's own VALUE spelling and the hops above it fold on around it
    // (`delete (d = globalThis.window)?.self.k` -> `delete (d = _globalThis.window, _self).k`)
    let writeStep = null;
    let innerKeptTail = null;
    let outerHopName = null;
    for (let up = target.parentPath; up?.node; up = target.parentPath) {
      if (!writeStep) {
        const over = stepOverKeptWrite(up, target, { allowOptional, metaPath, proxyHopKey });
        if (over) {
          writeStep = up.node;
          innerKeptTail = keptTail;
          keptTail = [];
          target = over;
          continue;
        }
      }
      // a TS wrapper sitting on the collapsed span is consumed WITH it - the substituted
      // spelling needs no assertion (`((d = globalThis.window)?.self as any).Array` ->
      // `(d = _globalThis.window).Array`), the same rule the plain claim swap follows
      if (TS_EXPR_WRAPPERS.has(up.node.type) && up.node.expression === target.node) {
        // only a fully SUBSTITUTED span consumes its wrapper: with an unresolvable hop still
        // respelled from source below it, the assertion is about that source read and stays
        // (`(k = globalThis.window!)` keeps its `!`, `((d = gw)?.self as any).Array` does not)
        if (keptTail.length) break;
        // ... and a wrapper the KEPT WRITE holds belongs to the STORED spelling this collapse
        // re-emits as its own effect (`(k = globalThis.self as any).Math.trunc(1)` keeps the cast)
        if (assignmentHoldsValue(up)) break;
        target = up;
        continue;
      }
      // ... and only where a proxy hop actually reads the run: without one there is no collapse
      // to extend, and consuming the span would respell it for nothing
      if (up.node.type === 'SequenceExpression' && up.node.expressions.at(-1) === target.node) {
        const run = sequenceTailRunAbove(up);
        if (!run || !proxyHopKey(run.member, { allowOptional: true, metaPath })) break;
        seqPrefixEffects.unshift(...run.prefixes, ...up.node.expressions.slice(0, -1));
        target = run.top;
        continue;
      }
      if (up.node.object !== target.node) break;
      // a `?.` over the ALWAYS-DEFINED collapsed prefix is vestigial and erases with the
      // respell (`(k = globalThis.self?.window)` -> `k = _self.window`); once a kept
      // unresolvable hop sits below, the base is undefinable and the `?.` stands
      const hop = proxyHopKey(up.node, { allowOptional: allowOptional || !keptTail.length });
      if (!hop) break;
      if (!hop.effects.length && !resolveGlobalPolyfill(hop.keyName)) keptTail.push(hop.keyName);
      else keptTail = [];
      if (writeStep && resolveGlobalPolyfill(hop.keyName)) outerHopName = hop.keyName;
      outerEffects.push(...hop.effects);
      target = up;
    }
    return { target, outerEffects, seqPrefixEffects, keptTail, writeStep, innerKeptTail, outerHopName };
  }

  function renderProxySpineCollapse({ metaPath, collapsed, entry, hintName, allowOptional = false }) {
    // the collapse EXTENDS UP through enclosing pristine hops: an outer `['window']`
    // step has no pure claim of its own, yet its key effect folds into the same root
    // sequence, after the inner ones (evaluation order)
    const { target, outerEffects, seqPrefixEffects, keptTail, writeStep, innerKeptTail, outerHopName } =
      extendCollapseUpward(metaPath, { allowOptional });
    const { navigated, mutatedAbove, writeTargetAbove, patternHost } = spineIsNavigated(
      target, keptTail, collapsed.keptWrite ?? writeStep, { deadOptional: allowOptional });

    markRewrite();
    const consumed = target.node;
    // a NAVIGATION rebuilds from the root, so a dead prefix has nothing to carry and drops
    // (`(0, globalThis.window).Promise = f` -> `_globalThis.Promise = f`); a VALUE keeps the
    // source spelling whole (`(0, globalThis.self).Map = f` -> `(0, _self).Map = f`)
    const collectedEffects = [...seqPrefixEffects, ...collapsed.effects, ...outerEffects];
    // in navigation, with folded KEY effects or onto an alias the ROOT binding spells
    // the base - the kept-root canon (`globalThis[(eff(), 'self')]` -> `(eff(),
    // _globalThis)`); a plain VALUE position substitutes the claim's OWN pure instead
    // (`globalThis.self` -> `_self`), unresolvable swallowed hops respelled above it
    // (`(v = globalThis.self.window)` -> `v = _self.window`). a bare seq ROOT PREFIX is
    // not a key effect and keeps the positional verdict (`(q = (eff(), globalThis).self)`
    // -> `q = (eff(), _self)`)
    const foldedKeyEffects = [...collapsed.keyEffects, ...outerEffects];
    const foldedEffects = navigated
      ? collectedEffects.filter(effect => mayHaveSideEffects(effect)) : collectedEffects;
    // an ALIAS root follows the same positional canon: a NAVIGATION keeps the local
    // binding spelled (`g.self.Array` -> `g.Array`, nothing injects), a VALUE spells the
    // claim's own pure (`(k = g.window.self)` -> `k = _self`). folded KEY effects push a
    // READ onto the root (the kept-root canon), but a WRITE TARGET addresses the slot on
    // the surface it named (`globalThis[(e++, 'self')].Set = f` -> `(e++, _self).Set = f`)
    // ... and a DESTRUCTURE PATTERN addresses slots on the surface it named exactly as a write
    // target does (`const { other } = globalThis[(d++, 'self')]` reads `(d++, _self)`)
    const valuePosition = !navigated && (!foldedKeyEffects.length || writeTargetAbove || patternHost);
    if (writeStep) {
      return renderCollapseOverKeptWrite({
        target, consumed, writeStep, innerKeptTail, keptTail, outerHopName, outerEffects,
        collapsed, entry, hintName, navigated,
      });
    }
    // a NAVIGATED spine whose kept write stores an UNSPELLABLE surface keeps the write
    // itself as the base - the stored value IS the surface, so re-reading the root would
    // only respell it (`(q = globalThis.window).self.self.Array` -> `(q =
    // _globalThis.window).Array`, the hops dropping around it)
    if (navigated && collapsed.keptWrite && !collapsed.writeStoreSpellable) {
      const writeBase = cloneNode(collapsed.keptWrite);
      // the dropped hop's KEY effect runs after the write, so it rides the key that SURVIVES
      // above it, not a prefix ahead of the write - which would run it first
      // (`(u = _globalThis.window)[c++, 'Array']`, babel's key fold)
      const keyHost = foldedKeyEffects.length ? target.parentPath?.node : null;
      if (keyHost?.type === 'MemberExpression' && peelExpressionWrappers(keyHost.object) === target.node
        && (keyHost.computed || keyHost.property?.type === 'Identifier')) {
        keyHost.property = sequenceExpression([
          ...foldedKeyEffects.map(effect => cloneNode(effect)),
          keyHost.computed ? keyHost.property : literal(keyHost.property.name),
        ]);
        keyHost.computed = true;
        target.replaceWith(writeBase);
      } else target.replaceWith(withSideEffects(writeBase, foldedKeyEffects));
      markSubtreeSkipped(skippedNodes, consumed);
      skippedNodes.add(target.node);
      return;
    }
    // a MUTATED read above keeps the NEAREST surface as its base: the alias binding when
    // the spine has one (`_l.self.Set` -> `_l.Set`), else this claim's own pure. inside a
    // guard MEMO the alias stays too - the memo holds the value, this is not the source's
    // own value position
    const sourceValuePosition = valuePosition && !mutatedAbove && !insideMemoClone(metaPath, memoValueClones);
    const rootSpelling = collapsed.aliasRoot && !sourceValuePosition
      ? cloneNode(collapsed.aliasRoot)
      : identifier(valuePosition || mutatedAbove ? injectPureImport(entry, hintName)
        : injectPureImport(collapsed.entry, collapsed.hintName));
    // the harvested effects wrap the ROOT, and an unresolvable tail respells OVER that wrap
    // (`(q = (eff(), globalThis).self.window)` -> `q = (eff(), _self).window`): the read
    // happens past the effects either way, and this is the spelling babel prints
    let replacement = withSideEffects(rootSpelling, foldedEffects);
    if (valuePosition) {
      for (const keyName of keptTail) replacement = memberFromKeyName(replacement, keyName);
    }
    const replaceAt = navigated && !collapsed.aliasRoot ? swallowDeadSeqWrapper(target) : target;
    replaceAt.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(replaceAt.node);
    // the substituted binding is always defined: a `?.` the fold left reading directly off
    // it is vestigial (`delete globalThis.window?.frames?.customZ` -> `_globalThis.frames
    // ?.customZ`) - only where no guard was owed, which is what allowOptional marks
    if (allowOptional && rootSpelling.type === 'Identifier' && !foldedEffects.length) {
      deoptionalizeOverSubstituted({ metaPath: target, node: consumed, replacement: rootSpelling, proxyRoot: true });
    }
  }

  // the POSSIBLE-GLOBAL hop claim over a pristine proxy spine: it collapses to the spine's
  // ROOT binding, the hops' computed-key effects folding in evaluation order - the
  // kept-root canon (`globalThis[(eff(), 'self')]` -> `(eff(), _globalThis)`). true when
  // this arm rendered
  function emitProxyHopClaim({ meta, metaPath, node, entry, hintName }) {
    // a MUTATED possible-global slot read DIRECTLY above keeps this hop's own claim (the
    // seal: the read observes the user's replacement through the closest surface binding)
    // through the wrappers a source PAREN (and the chain wrapper its `?.` wears) puts between
    // the hop and its consumer: every verdict below is about what READS this hop, and
    // `(g.window?.self)?.Array` reads it exactly like the bare twin
    const above = climbTransparentWrapperPath(metaPath).parentPath?.node;
    const aboveKey = above?.type === 'MemberExpression' && peelExpressionWrappers(above.object) === node
      && !above.computed ? above.property?.name : null;
    const sealedAbove = !!aboveKey && POSSIBLE_GLOBAL_OBJECTS.has(aboveKey) && !isPristineProxyGlobal(adapter, aboveKey);
    // a `delete` consumer performs no READ, so no `?.` over its navigation is load-bearing
    // (the canon's own verdict): the hops fold with their guards
    const deleteTail = deleteHostForClaim(metaPath, node);
    const deleteHost = deleteHostForClaim(metaPath, node, { forFold: true });
    // a DEAD `?.` on this hop (its probe provably defined) is no barrier to the spine
    // collapse - the vestigial verdict, so the run folds onto its root exactly like the
    // plain twin (`globalThis.self.window?.self.Box` -> `_globalThis.Box`)
    // ... but a probe living BELOW a kept value is the in-place drop's own shape - the write
    // must survive, and folding the run onto the root would drop it. the write standing AS
    // the probe is the other shape: its value is what the test reads, and the collapse
    // re-emits it as the sequence prefix (`(w = globalThis)?.self[0]` -> `(w = _globalThis,
    // _globalThis)[0]`, exactly the plain twin's render)
    const sealedRead = sealedLayerAbove(metaPath, node),
          probeIsKeptWrite = peelExpressionWrappers(node.object)?.type === 'AssignmentExpression',
          deadOwnOptional = node.optional && (probeIsKeptWrite || !spineHoldsKeptWrite(node.object))
            && !optionalMemberStaysGuarded(node,
              { metaPath, adapter, resolvePure, observableRead: sealedRead });
    // a nav rendered INSIDE a guard test is the read that test performs: folding an UNBACKED
    // hop away there would test a value the source never reads (`(m = globalThis.window.self)
    // ?.x` stores `null == _globalThis.window ? void 0 : _self`, not a bare `_self`)
    const probeTestUnbackedHop = insideMemoClone(metaPath, probeTestClones)
      && navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath));
    if (probeTestUnbackedHop
      && emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName, planNode: node })) return true;
    let collapsed = sealedAbove ? null
      : collapseProxyHopSpine(node, metaPath, { allowOptional: deleteHost || deadOwnOptional });
    if (collapsed?.unbackedRoot) {
      // navigated over a root pure cannot back: substituting here would read the ponyfill
      // off a host the engine may not have (`window.self.Array` stays raw)
      if (spineIsNavigated(metaPath).navigated) return true;
      collapsed = null;
    }
    // an OPTIONAL member above will split and absorb this hop with its own guard - a
    // standalone render here would nest a second test inside that split's memo
    // (`(dw = gw)?.self?.[k]...` folds to ONE probe in babel)
    // ... but only a claim ABOVE can absorb it. with an ENVIRONMENT PROBE below this hop and
    // no claim above to carry it, standing down here erases the short-circuit outright
    // (`ut()?.window?.self?.chrome.foo` - nothing claims `chrome`)
    const probedReceiver = !deleteHost && receiverCarriesLiveOptional(node.object)
      && navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath));
    const optionalAbove = above?.type === 'MemberExpression'
      && peelExpressionWrappers(above.object) === node && above.optional && !probedReceiver;
    // a `delete` consumer reads nothing over its navigation, so no `?.` in it is load-bearing
    // and the guarded render owes nothing (`delete dl()?.window?.self.missing` -> `delete
    // _self.missing`) - the same verdict the spine collapse takes through `allowOptional`
    // harvested effects ride along when the PLAN owns them (its own key SE) - the render
    // decides that, so a claim carrying one is not turned away here
    // (`ckr()?.window?.[(k++, 'self')]?.a` keeps `null == ckr().window ? void 0 : (k++, _self).a`)
    // an ERASABLE hop whose own `?.` probes a KEPT-WRITE UNDEFINABLE value - and that no
    // claim above absorbs - drops in place: the stored surface IS the hop's surface when
    // present, so the read above keeps the short-circuit and no import lands
    // (`(se(), t = gw)?.self.Array.prototype.some...` -> `(se(), t = _gw)?.Array...`,
    // babel's fold)
    if (!collapsed && !sealedAbove && !optionalAbove && !deleteHost && node.optional
      && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && resolveGlobalPolyfill(hintName)
      && above?.type === 'MemberExpression' && peelExpressionWrappers(above.object) === node) {
      let probeStore = peelExpressionWrappers(node.object);
      if (probeStore?.type === 'SequenceExpression') probeStore = peelExpressionWrappers(probeStore.expressions.at(-1));
      const storeValue = peelExpressionWrappers(peelChainAssignmentDeep(probeStore));
      const storeUndefinable = peelChainAssignmentDeep(probeStore) !== probeStore
        && storeValue?.type === 'MemberExpression' && !storeValue.computed
        && POSSIBLE_GLOBAL_OBJECTS.has(storeValue.property?.name)
        && !resolveGlobalPolyfill(storeValue.property?.name);
      if (storeUndefinable) {
        markRewrite();
        above.optional = true;
        replaceNodeInTree(above, above.object, node.object);
        skippedNodes.add(node);
        return true;
      }
    }
    if (!collapsed && !sealedAbove && !optionalAbove && !deleteHost
      && (node.optional || receiverCarriesLiveOptional(node.object))
      && emitStaticOverGuardedNav({
        meta, metaPath, node, entry, hintName, planNode: node, declineValueProbe: true, sealedRead,
        deleteHost: deleteTail,
      })) {
      return true;
    }
    // ... and the same verdict where the `?.` sits ABOVE a plain run: the spine's probe is
    // what the guard tests, the collapse rides the alternate with the run as its tail
    // (`globalThis.window.self.window?.BigInt` -> `(null == _globalThis.window ? void 0 :
    // _self.window)?.BigInt`)
    if (collapsed && !deleteHost && !sealedAbove
      && navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath))
      && plainRunReadOptionally(metaPath, node, proxyHopKey)
      && emitStaticOverGuardedNav({
        meta, metaPath, node, entry, hintName, planNode: node, deleteHost: deleteTail,
      })) return true;
    if (!collapsed) return false;
    // ... and a DESTRUCTURE source under a value-observing carrier keeps the hops the source
    // wrote - but only where the run harvests NOTHING: an effect-bearing one has no other slot
    // to re-emit from, so it collapses like any other (`(c++, globalThis)[(e++, 'self')].X`)
    if (!collapsed.effects.length && !collapsed.keyEffects.length
      && valueObservingDestructureSource(metaPath, destructureEmit)) return true;
    const aboveScope = metaPath.scope;
    renderProxySpineCollapse({ metaPath, collapsed, entry, hintName, allowOptional: deleteHost });
    // the collapse lands the root's own binding, so a `?.` left standing on the SURVIVING
    // connector is vestigial - the root rewrite spells the `.` itself (`globalThis?.self
    // ?.Array` -> `_globalThis.Array`). the canonical judge decides per hop, so a probe
    // whose value can still be undefined keeps its guard
    if (above?.type === 'MemberExpression') {
      // under a FOLDED `delete` the canon has spoken for the whole navigation: the collapse
      // landed the root binding, and a `?.` over it guards a read that never happens
      if (deleteHost && above.optional) above.optional = false;
      for (const hop of vestigialNavOptionals(above, m => resolvePure(m, metaPath),
        { scope: aboveScope, adapter, path: metaPath })) hop.optional = false;
    }
    return true;
  }

  function emitStaticGlobalClaim({ meta, metaPath, node, kind, entry, hintName }) {
    // a POSSIBLE-GLOBAL hop claim over a pristine proxy spine collapses to the spine's
    // ROOT binding, the hops' computed-key effects folding in evaluation order - the
    // kept-root canon (`globalThis[(eff(), 'self')]` -> `(eff(), _globalThis)`)
    if (node.type === 'MemberExpression' && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)) {
      // ... unless an unresolvable hop sits BELOW the collapse point: the spine render spells the
      // leaf unconditionally, where the source's own read short-circuits
      if (emitNestedGuardNavValue(metaPath, node, nestedGuardCtx)) return;
      const hopArm = emitProxyHopClaim({ meta, metaPath, node, entry, hintName });
      if (hopArm) return;
    }
    // an OPTIONAL member above will split and absorb this claim - see the hop branch;
    // found by climbing through transparent wrappers (a chain wrapper sits between)
    let omaChild = node,
        omaUp = metaPath.parentPath;
    while (omaUp?.node && (omaUp.node.type === 'ChainExpression' || omaUp.node.type === 'ParenthesizedExpression'
      || TS_EXPR_WRAPPERS.has(omaUp.node.type))) {
      omaChild = omaUp.node;
      omaUp = omaUp.parentPath;
    }
    const optionalMemberAbove = omaUp?.node?.type === 'MemberExpression'
      && omaUp.node.object === omaChild && omaUp.node.optional;
    if (node.type === 'MemberExpression' && !optionalMemberAbove
      && (node.optional || receiverCarriesLiveOptional(node.object))
      && !sealedThrowRidesTheClaim(node, metaPath, sealedProbeCtx)
      && emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return;
    if (node.type === 'Identifier' && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(node.name)
      && !meta.sideEffects?.length) {
      // a destructure off this surface whose sole hop is a MUTATED ctor has no claim of
      // its own to drive the flatten - note the host so the drain re-anchors its residual
      noteMutatedCtorHopDestructure(metaPath, node, { adapter, destructureEmit });
      // a `delete` reads nothing over its navigation, so the guarded route stands down and
      // the hops fold with their `?.` (`delete globalThis.window?.self.k` -> `delete
      // _globalThis.k`) - the canon's erase verdict, spelled here
      const rootDeleteHost = deleteHostForClaim(metaPath, node);
      if (!rootDeleteHost && emitRootGuardedNavCollapse(metaPath)) return;
      // a bare ROOT navigated through PLAIN hops pure cannot back takes the same spine
      // render: the hops fold away under navigation and respell in value position
      // (`globalThis.window.Array` -> `_globalThis.Array`, `globalThis.window` kept). a
      // live `?.` anywhere in that run keeps every hop - it IS the environment probe the
      // source asked for, and folding it away would drop the test
      const proxyRun = plainProxyHopRunAbove(metaPath, proxyHopKey, { allowOptional: rootDeleteHost });
      // ... and the same stand-down as the hop claim's: a value-observing carrier over a
      // destructure source keeps every hop the source wrote
      if (proxyRun && !valueObservingDestructureSource(metaPath, destructureEmit)) {
        renderProxySpineCollapse({ metaPath, collapsed: { entry, hintName, effects: [], keyEffects: [] },
          entry, hintName, allowOptional: rootDeleteHost });
        // ... and no `?.` on the read ABOVE the run is load-bearing either - but only where the
        // collapse landed the ROOT BINDING itself. an UNBACKED hop left spelled off it
        // (`_globalThis.window`, a sealed run's stop) is still the environment probe, and the
        // read above it keeps its guard
        if (rootDeleteHost && proxyRun.consumer?.type === 'MemberExpression'
          && proxyRun.consumer.object?.type === 'Identifier') proxyRun.consumer.optional = false;
        return;
      }
    }
    // static / global claim: the member (or bare identifier) becomes the import binding;
    // harvested SE (a computed key, a sequence receiver) re-runs ahead of it in source order.
    // with nothing harvested the swap still ERASES the receiver spelling - the canonical
    // discard rescue keeps what that would observably drop (a chain-assignment rescued
    // whole, an SE-bearing root call), and a provably pure root call falls away
    let effects = meta.sideEffects;
    // a receiver whose spine carries a LIVE `?.` gates the claim: the probe (the deepest
    // optional hop's own spelling) becomes the null test, the claim rides the alternate
    // (`condFn?.()?.Array.of(12)` -> `null == condFn?.() ? void 0 : _Array$of(12)`) - a
    // seq rescue would erase the short-circuit
    if (node.type === 'MemberExpression' && !optionalMemberAbove
      && (node.optional || receiverCarriesLiveOptional(node.object))
      && !sealedThrowRidesTheClaim(node, metaPath, sealedProbeCtx)
      && emitLiveOptionalProbeGuard({ metaPath, node, entry, hintName, effects, receiverEffectCount: meta.receiverEffectCount })) return;
    if (!effects?.length && sealedPristineHopCollapse(metaPath, node, { adapter, resolvePure, markRewrite })) return;
    if (node.type === 'MemberExpression') {
      if (!effects?.length) {
        effects = discardRescueNodes({ node: node.object, scope: metaPath.scope, adapter, path: metaPath });
        // the discard rescue owns the chain-assigns already; the canonical prepend below is
        // for the harvested-SE shape only
      } else {
        // the swap erases the receiver spelling: its chain-assignments splice into the SE
        // prelude at the recorded receiver/key boundary - ECMA receiver-before-key
        effects = prependChainAssignmentEffect(node.object, effects, meta.chainAssignInsertAt ?? meta.receiverEffectCount);
      }
    }
    // a pristine hop reading a KEPT-WRITE surface re-reads the ROOT after the write
    // (`(a = _globalThis).self` -> `(a = _globalThis, _globalThis)`, babel's re-read canon)
    // - but only TERMINAL: navigated further, the hop keeps its OWN pure
    // (`(p = _globalThis).self.Set` -> `(p = _globalThis, _self).Set`)
    const navigatedAbove = navigatedMemberAbove(metaPath);
    let redirected = null;
    // a folded computed KEY's effects under NAVIGATION keep the ROOT binding - the
    // kept-root canon (`globalThis[(eff(), 'se') + 'lf'].Array` -> `(eff(),
    // _globalThis).Array`); `proxyHopKey` cannot see a concat fold, so the spine
    // collapse never ran and the swap re-roots here
    // ... and never a hop a `?.` PROBES: the guard's test must keep READING the hop (`g[(k,
    // 'window')]?.self` tests the window slot - folding it to the root erases the probe)
    const probedAbove = metaPath.parentPath?.node?.type === 'MemberExpression'
      && metaPath.parentPath.node.object === node && metaPath.parentPath.node.optional;
    if (!redirected && navigatedAbove && !probedAbove && kind === 'global'
      && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
      && node.type === 'MemberExpression' && node.computed && effects?.length) {
      const rootName = resolveObjectName({ objectNode: node.object, scope: metaPath.scope, adapter, path: metaPath });
      if (rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName) && isPristineProxyGlobal(adapter, rootName)) {
        redirected = resolveGlobalPolyfill(rootName);
      }
    }
    const id = injectPureImport(redirected?.entry ?? entry, redirected?.hintName ?? hintName);
    markRewrite();
    // a TS wrapper (a cast, a non-null, their paren skins) around the claimed spelling is
    // consumed with it - the substituted binding needs no assertion (`(Map as any)` -> `_Map`)
    let target = metaPath;
    for (let up = target.parentPath; up?.node; up = target.parentPath) {
      const upType = up.node.type;
      // NOT `TSInstantiationExpression`: its type args are value-adjacent source text babel
      // keeps on the substituted binding (`new (Map<string, number>)()` -> `new _Map<string, number>()`)
      if (upType === 'TSInstantiationExpression') break;
      if (!TS_EXPR_WRAPPERS.has(upType)
        && !(upType === 'ParenthesizedExpression' && TS_EXPR_WRAPPERS.has(up.parentPath?.node?.type))) break;
      target = up;
    }
    const consumed = target.node;
    // the read a load-bearing SEAL made observable is the source's own - the swap erases it,
    // so it rides back as a throw probe ahead of the ponyfill
    const throwProbe = node.type === 'MemberExpression'
      ? sealedClaimThrowProbe(node, metaPath, sealedProbeCtx) : null;
    // the harvested effects run where the source runs them - ahead of the read the probe
    // reproduces (`(seq++, <probe>, _Array$of)(11)`); one the probe already spells drops
    // the probe node rides UNCLONED - it carries its own skip mark, and a copy would be
    // re-visited and claimed into the very ponyfill it stands ahead of
    // ... and one the probe's RENDER already spells runs there: a prefix copy would evaluate it
    // twice (`(dheCombo(), (null == dheCombo().window ? ...).Array, _Array$of)`). the render holds
    // clones, which carry their source spans - the span is what identifies the effect in it
    const replacement = throwProbe
      ? sequenceExpression([
        ...effectsPastThrowProbe(effects, throwProbe).map(effect => cloneNode(effect)),
        throwProbe.node, identifier(id),
      ])
      : withSideEffects(identifier(id), effects);
    target.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(replacement);
    // walk up from TARGET: a consumed TS wrapper sat between the claim and its `?.` parent
    // (`(Map as any)?.()` - the call reads the replacement directly after the climb)
    deoptionalizeOverSubstituted({
      metaPath: target, node, replacement,
      proxyRoot: kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(redirected?.hintName ?? hintName),
    });
    // the PROXY-global family has its own collapse canon (the spine render decides where
    // the root re-reads); this one serves a substituted CTOR binding
    if (!POSSIBLE_GLOBAL_OBJECTS.has(redirected?.hintName ?? hintName)) {
      reReadKeptWriteValue(target, id, replacement, { adapter, resolveGlobalPolyfill, skippedNodes });
    }
  }

  // the substituted binding is always defined: a `?.` reading directly off it collapses to
  // `.`, an optional call of it loses its `?.()`, and the chain wrapper drops once no `?.`
  // survives inside
  function deoptionalizeOverSubstituted({ metaPath, node, replacement, proxyRoot = false }) {
    // surviving transparent wrappers (a paren skin the climb could not consume) sit between
    // the replacement and its `?.` parent - peel upward before testing it
    let upPath = metaPath.parentPath;
    while (upPath?.node && (upPath.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(upPath.node.type))) {
      upPath = upPath.parentPath;
    }
    const upNode = upPath?.node;
    let chainDropped = false;
    function dropChainAt(chainPath) {
      if (chainDropped || chainPath?.node?.type !== 'ChainExpression'
        || receiverCarriesOptional(chainPath.node)) return;
      chainDropped = true;
      chainPath.replaceWith(chainPath.node.expression);
    }
    // a harvested effect prefix does not revive the `?.`: the sequence hands its TAIL on, and
    // that tail is the always-defined binding (`(n++, _Symbol)?.iterator` reads plainly)
    const substituted = replacement.type === 'SequenceExpression'
      ? peelExpressionWrappers(replacement.expressions.at(-1)) : replacement;
    if (upNode?.type === 'MemberExpression' && upNode.optional && peelExpressionWrappers(upNode.object) === replacement
      && substituted?.type === 'Identifier') {
      // a SEAL below a live `?.` keeps the memo's source spelling whole - the dead `?.`
      // rides it un-erased (`(Promise?.foo)?.bar` memoizes `_ref = _Promise?.foo`); the
      // unsealed chain erases the root-adjacent `?.` as usual (`globalThis?.foo?.bar` ->
      // `_globalThis.foo?.bar`)
      let liveAbove = false;
      let sawSeal = false;
      for (let livePath = upPath.parentPath; livePath?.node; livePath = livePath.parentPath) {
        const liveNode = livePath.node;
        if (liveNode.type === 'ParenthesizedExpression') {
          // a seal shields a CTOR substitution only: the proxy-global nav collapses like
          // its unsealed twin (`((globalThis?.X)?.Y)` respells `_globalThis.X?.Y`)
          sawSeal = !proxyRoot;
          continue;
        }
        if (liveNode.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(liveNode.type)) continue;
        if (liveNode.type !== 'MemberExpression' && liveNode.type !== 'CallExpression') break;
        if (liveNode.optional) {
          liveAbove = sawSeal;
          break;
        }
      }
      if (!liveAbove) {
        upNode.optional = false;
        dropChainAt(upPath.parentPath);
      }
    }
    // the same rule for an optional CALL of the substituted binding (`_Map?.()` -> `_Map()`)
    if (upNode?.type === 'CallExpression' && upNode.optional && peelExpressionWrappers(upNode.callee) === replacement) {
      upNode.optional = false;
      dropChainAt(upPath.parentPath);
    }
    // the substitution consumed the member's own `?.` (`X.Promise?.resolve` erased with the
    // member); the chain wrapper drops once no `?.` survives inside
    if (node.optional && !chainDropped) {
      let chainPath = metaPath.parentPath;
      while (chainPath?.node && chainPath.node.type !== 'ChainExpression') chainPath = chainPath.parentPath;
      dropChainAt(chainPath);
    }
  }
}
