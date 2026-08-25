// spine navigation over proxy-global hops: climbs, peels, kept writes, the fold/keep
// verdicts of unbacked hops - the position questions the usage-pure emitters ask
import {
  inlineCallProxyGlobalRoot,
  navHasUnresolvableProxyHop,
  planProvenNavGuardCollapse,
  proxyHopLacksPureEntry,
  resolveKey,
  resolveObjectName,
  storedNavHopClaimSuppressed,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  SKIPPABLE_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  assignmentInStatementPosition,
  claimDeleteOperand,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  mayHaveSideEffects,
  memberProxyHopName,
  staticMemberKeyName,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { walkAstNodes } from './plugin-helpers.js';
import {
  binaryExpression,
  cloneNode,
  conditionalExpression,
  identifier,
  literal,
  memberExpression,
  sequenceExpression,
  voidZero,
} from './builders.js';
import { discardedSequenceElement, memberFromKeyName, peelExpressionWrappers } from './emit-shared.js';

// is the node read as a member OBJECT above - asked THROUGH transparent wrappers and a
// sequence TAIL: `(se(), g[fold]).Array` reads the hop exactly like the bare spelling
export function navigatedMemberAbove(metaPath) {
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

// clone a receiver with source parens peeled off its member/call SPINE: babel holds parens
// as printer trivia, so a memo respells without them, while TS casts stay - babel memoizes
// `(x satisfies string)?.includes(y)` as `_ref = x satisfies string`
export function cloneSpinePeeled(node, inCallee = false) {
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
export function singleSequenceTail(node, { nested = false } = {}) {
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
export function emitNestedGuardNavValue(metaPath, node, {
  adapter,
  resolvePure,
  injectPureImport,
  markRewrite,
  substituteProbeProxyRoot,
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
    rootNode: node,
    scope: metaPath.scope,
    adapter,
    path: metaPath,
    resolvePure: resolveHere,
    allowSequenceRoot: true,
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

// a kept-tail hop's respelling: dotted for a plain name, a computed SE-carrying key for
// the seq-keyed spelling - the one member shape every tail consumer spells
export function respellKeptHop(spelling, { keyName, keySe }) {
  return keySe.length
    ? memberExpression(spelling,
      sequenceExpression([...keySe.map(expr => cloneNode(expr)), literal(keyName)]), { computed: true })
    : memberFromKeyName(spelling, keyName);
}

// does a TERMINAL run of unbacked pristine hops ride ABOVE the claim - `window` reads
// that end the spine without another backed hop or claimable member folding them. the
// reference emitters keep the WHOLE spine spelled there (`(v = globalThis.self.window)`
// stays `_globalThis.self.window`): substituting the claim would erase the throw a
// hop-less realm owes the read. a backed hop above RESETS the run (deep-nav folds), and
// a claimable member above collapses the receiver through its own plan either way
export function unbackedTailRidesAbove(metaPath, resolveGlobalPolyfill) {
  let sawUnbacked = false;
  let cur = metaPath;
  for (let up = cur.parentPath; up?.node; up = cur.parentPath) {
    if (SKIPPABLE_WRAPPER_TYPES.has(up.node.type) || up.node.type === 'ChainExpression') {
      cur = up;
      continue;
    }
    if (up.node.type !== 'MemberExpression' || up.node.object !== cur.node) {
      // a NULL-PROBE test reading the run (`null == <run>`, a rendered guard or the
      // source's own lowered spelling) is an environment probe: the below-probe collapse
      // owns it (the owner-decided price - `undefined` where the raw read throws)
      if (up.node.type === 'BinaryExpression' && (up.node.operator === '==' || up.node.operator === '!=')
        && [up.node.left, up.node.right].some(side => side?.type === 'Literal' && side.value === null)) return false;
      break;
    }
    // a LIVE `?.` anywhere in the run is the source's own environment probe - the guarded
    // collapse channel owns that spine, not this stand-down
    if (up.node.optional) return false;
    const key = memberProxyHopName(up.node);
    // a real member READ above NAVIGATES the run - the deep-nav collapse owns it
    // (`globalThis.self.window.k` collapses whole); the stand-down is for a run whose
    // VALUE flows out (a store, a bare read) with the unbacked hop terminal
    if (key === null) return false;
    sawUnbacked = !resolveGlobalPolyfill(key);
    cur = up;
  }
  return sawUnbacked;
}

// pristine possible-global hops navigate into the SAME surface - they drop, and the root
// binding stands for the read (`globalThis.self` tests `_globalThis`, not the `self` ponyfill
// the hop's own claim would substitute)
export function peelPristineProxyHops(node, { adapter, resolveGlobalPolyfill }) {
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
export function dropTailPristineProxyHops(node, ctx) {
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

export function instanceTailMemoTest(test, metaPath, node, ctx) {
  const aboveNode = metaPath.parentPath?.node;
  const aboveKey = aboveNode?.type === 'MemberExpression' && aboveNode.object === node
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
// is no longer the always-defined ponyfill. both questions are the canon's own -
// `staticMemberKeyName` folds the dotted, static-computed and SE-seq-keyed spellings alike
// (a hand-rolled `!computed` read left the seq-keyed `[eff(), 'window']` hop looking backed,
// and the value collapse rode one hop past what the realm can prove)
export function unbackedProxyHopKey(node, resolveHere) {
  const key = node?.type === 'MemberExpression' ? staticMemberKeyName(node) : null;
  return !!key && proxyHopLacksPureEntry(key, resolveHere);
}

// the run of enclosing SEQUENCE levels a value tails, and the member READING that run:
// `(c++, (d++, X)).window` answers `.window` for `X`, with `c++` ahead of `d++` - the climb
// walks outward, so each level unshifts in front of the ones already collected. null when
// nothing reads the run
export function sequenceTailRunAbove(seqPath) {
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
export function climbToCallerPath(metaPath) {
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
export function optionalsAreSealed(receiver) {
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
export function memberIsWriteTarget(hopPath) {
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
export function stepOverKeptWrite(up, target, { allowOptional, metaPath, proxyHopKey }) {
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
export function probeValueIsInvoked(path) {
  let top = path;
  while (top.parentPath?.node?.expression === top.node
    && (TS_EXPR_WRAPPERS.has(top.parentPath.node.type) || top.parentPath.node.type === 'ChainExpression'
      || top.parentPath.node.type === 'ParenthesizedExpression')) top = top.parentPath;
  const above = top.parentPath?.node;
  return (above?.type === 'CallExpression' || above?.type === 'NewExpression') && above.callee === top.node;
}

export function probeHopInValue(plan, probeHop) {
  return !!plan.rootAssign && Number.isInteger(probeHop.node.start)
    && probeHop.node.start >= plan.rootAssign.start && probeHop.node.end <= plan.rootAssign.end;
}

// a kept WRITE holding the substituted binding, NAVIGATED further: the read re-reads the
// binding after the write (`(b = Map).keys()` -> `(b = _Map, _Map).keys()`, babel's
// kept-write canon). in VALUE position the write stands alone (`b = _Map`)
export function reReadKeptWriteValue(targetPath, id, replacement, { adapter, resolveGlobalPolyfill, skippedNodes }) {
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
export function navRootIsProxyIdentifier(node, metaPath, adapter, { requireBareName = false } = {}) {
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

// a rebuild from the root swallows a DEAD sequence wrapper above it - the wrapper carried
// nothing but the spelling that just folded (`(0, globalThis.window).Promise = f` ->
// `_globalThis.Promise = f`); an effectful prefix keeps its wrapper, and so does an alias
// base, which keeps the source spelling whole
export function swallowDeadSeqWrapper(targetPath) {
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
export function foldPendingReceiverSpineRoot(object, metaPath, { collapseProxyHopSpine, injectPureImport }) {
  const seqValue = peelExpressionWrappers(object);
  const tail = seqValue?.type === 'SequenceExpression' ? peelExpressionWrappers(seqValue.expressions.at(-1)) : null;
  const collapsed = tail?.type === 'MemberExpression' ? collapseProxyHopSpine(tail, metaPath) : null;
  if (!collapsed?.entry || collapsed.aliasRoot || collapsed.keyEffects?.length) return null;
  return sequenceExpression([
    ...seqValue.expressions.slice(0, -1).map(expr => cloneNode(expr)),
    identifier(injectPureImport(collapsed.entry, collapsed.hintName)),
  ]);
}

export function plainProxyHopRunAbove(metaPath, proxyHopKey, { allowOptional = false } = {}) {
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

// is the PLAIN proxy run above this hop claim read OPTIONALLY by a consumer of its own?
// that `?.` is the only survivor of the source read, and the run's collapse would answer the
// always-defined ponyfill where the source throws - the claim's guard render owns the shape.
// a consumer that is itself a proxy hop is the probe-LEAF shape instead: pure cannot back it,
// so the whole run stays spelled and nothing here renders
export function plainRunReadOptionally(metaPath, node, proxyHopKey) {
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

// the walk's OWN collapse destroys the evidence a later guard needs: `const a = globalThis
// .window.self` already reads `_self` by the time `(w = a)?.Array.of` asks whether `a` can be
// absent, and the hop canon, blind through the binding, then calls the alias always-defined.
// record the verdict while the source spelling still stands. keyed by declarator node, so the
// module-scope table costs nothing across files
const unbackedHopAliasDecls = new WeakSet();

export function noteUnbackedHopAliasInit(metaPath, node, resolvePure, hopNoteCtx = null) {
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

export function aliasHoldsUnbackedHopNav(value, metaPath, adapter) {
  if (value?.type !== 'Identifier') return false;
  const binding = adapter.getBinding(metaPath.scope, value.name, metaPath);
  return unbackedHopAliasDecls.has(binding?.node ?? binding?.path?.node);
}

// the sequence PREFIXES of every kept computed key in a probe spine - the effect nodes whose
// claims must stay live inside the kept spelling
export function navComputedKeyEffects(node) {
  const effects = [];
  for (let cur = peelExpressionWrappers(node); cur?.type === 'MemberExpression';
    cur = peelExpressionWrappers(cur.object)) {
    if (!cur.computed) continue;
    const key = peelExpressionWrappers(cur.property);
    if (key?.type === 'SequenceExpression') effects.push(...key.expressions.slice(0, -1));
  }
  return effects;
}

// a COMPUTED hop anywhere down the member spine - the read-form split arm keys on it
// (`navComputedKeyEffects` answers a different question: only the SEQ-keyed hops' effects)
export function spineCarriesComputedHop(objectNode) {
  for (let cur = peelExpressionWrappers(objectNode); cur?.type === 'MemberExpression';
    cur = peelExpressionWrappers(cur.object)) if (cur.computed) return true;
  return false;
}

// a KEPT WRITE anywhere down the member spine (`((dw = gw) as any)?.self` - the write
// anchors the kept-root canon even buried under hops)
export function spineHoldsKeptWrite(objectNode) {
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

// a SEQ-prefixed computed key folds to its literal-string tail, the prefix carried as
// effects (`[(c++, 'values')]` -> `values` plus the prefix); null when the tail is not
// a string literal
export function foldSeqKeyLiteralTail(property) {
  let key = peelExpressionWrappers(property);
  const effects = [];
  if (key?.type === 'SequenceExpression') {
    effects.push(...key.expressions.slice(0, -1));
    key = peelExpressionWrappers(key.expressions.at(-1));
  }
  if (key?.type !== 'Literal' || typeof key.value !== 'string') return null;
  return { key: key.value, effects };
}

export function noteMutatedCtorHopDestructure(metaPath, node, { adapter, destructureEmit }) {
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
      metaPath,
      hopKey,
      localName: hopValue.name,
      declarationPath: up.parentPath,
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

// mark a whole subtree consumed: a replacement detaches the ORIGINAL nodes, but the
// traversal's queue may still hold them - a stale usage firing on a detached path would
// rewrite into nowhere or throw on the removed path
export function markSubtreeSkipped(skippedNodes, node, keepLive = null) {
  if (!node || typeof node !== 'object' || !node.type) return;
  // a subtree the render RE-EMITS by identity stays claim-live: later claims still land
  // on it in place
  if (keepLive?.has(node)) return;
  skippedNodes.add(node);
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) for (const item of value) markSubtreeSkipped(skippedNodes, item, keepLive);
    else markSubtreeSkipped(skippedNodes, value, keepLive);
  }
}

// does the subtree hold this exact node - the identity question a rescued effect asks
// (the receiver spelling already carries it, so a prepend would run it twice)
export function subtreeContainsNode(root, target) {
  if (root === target) return true;
  if (!root || typeof root !== 'object' || !root.type) return false;
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in root) {
    const value = root[key];
    if (Array.isArray(value)) {
      for (const item of value) if (subtreeContainsNode(item, target)) return true;
    } else if (subtreeContainsNode(value, target)) return true;
  }
  return false;
}

// the `delete` verdict travels DOWN the spine. this emitter rewrites as it visits, so a claim
// deeper in the chain climbs into a scaffold an earlier emit already built (a guard test, a
// receiver memo) and can no longer reach the `delete` above it. the OUTERMOST claim marks
// the spine it owns and the deeper visits read
// the verdict off the mark; only the spine is marked, so a computed KEY or a call ARGUMENT -
// which the delete does not navigate - keeps its own answer
export function sourceSpanKey(node) {
  return Number.isInteger(node?.start) && Number.isInteger(node?.end) ? `${ node.start }:${ node.end }` : null;
}

// the SOURCE spans a rendered subtree holds: a clone carries the span of what it copied, so a
// harvested effect the render already spells is found by its own span
export function collectSourceSpans(root) {
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

// receivers whose evaluation CONSTRUCTS rather than reads: nothing observes their order
// against a computed key's effects
export const LITERAL_RECEIVER_TYPES = new Set(['ArrayExpression', 'ObjectExpression', 'Literal', 'TemplateLiteral']);

export function receiverMintsSpelling(objectNode, { adapter, metaPath }) {
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
    callNode: below,
    scope: metaPath.scope,
    adapter,
    path: metaPath,
  });
}

// does this claim render INSIDE a guard memo's cloned value?
export function insideMemoClone(metaPath, memoValueClones) {
  for (let up = metaPath; up?.node; up = up.parentPath) if (memoValueClones.has(up.node)) return true;
  return false;
}

// nothing to rewrite here: the claim is disabled, already consumed, type-only, or its span
// was DETACHED by an earlier emission in the same chain (that render happened above it)
// a `delete` operand names a property slot, never a read - and a claim INSIDE the
// operand's SPINE is owned by the delete too (`delete globalThis.self.Promise` - the hop
// claim must not read the slot the delete removes): the caller climb answers the deep
// case, the shared provider climb (`claimDeleteOperand`) the immediate one
export function isDeleteOperand(metaPath) {
  const host = climbToCallerPath(metaPath)?.node;
  if (host?.type === 'UnaryExpression' && host.operator === 'delete') return true;
  return claimDeleteOperand(metaPath);
}

// is this node the VALUE a plain assignment stores (through the parens it may wear)?
export function assignmentHoldsValue(path) {
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

// a DESTRUCTURE source reached through a value-OBSERVING carrier (`||`, `&&`, `??`, a ternary
// arm): on a realm without the hop the source reads an undefined step and THROWS before the
// fallback runs, so collapsing the hop would silently hand the pattern a value the source never
// produces (`const { x } = globalThis.self.Array || Set` keeps `.self`). a carrier that only
// PASSES the value on (a sequence tail) observes nothing and keeps the collapse
export function valueObservingDestructureSource(metaPath, destructureEmit) {
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

// does the member chain read a MUTATED static anywhere (`globalThis.Array.of = patched`
// above `...Array.of(5)`)? the deopt keeps every source `?.` spelled. node-DOWN spine twin
// of the provider's path-UP `chainNavigatesIntoMutatedStatic` (annotations.js) - different
// anchor and direction, and the erase-verdict here asks it of a DETACHED object node the
// path-up walk cannot reach
export function chainContainsMutatedStatic(objectNode, { metaPath, adapter }) {
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
        objectNode: cur.object,
        scope: metaPath.scope,
        adapter,
        path: metaPath,
      });
      if (objName && adapter.isMutatedStatic?.(objName, key)) return true;
    }
    cur = peelExpressionWrappers(cur.object);
  }
}

// the frame a node evaluates in, keyed by the node itself. an IIFE call-ARG runs at the CALL SITE,
// not inside the function whose parameter the pattern is, and a same-named parameter shadows its
// bindings there - so every scope-aware answer about it (binding resolution, purity, what a discard
// may erase) has to be taken at the call site. babel needs no registry: `findTargetPath` hands back
// a PATH and the frame rides with it; this channel passes NODES, so the frame is stamped on them
const nodeSites = new WeakMap();

// stamp the whole SUBTREE, not just its root: a branch, a hop or a computed key deep inside the
// acquired receiver evaluates in the same foreign frame, and each is asked about on its own
export function stampNodeSite(node, site) {
  if (node && site?.path) walkAstNodes({ root: node, visit: child => { nodeSites.set(child, site); } });
  return node;
}

// the frame to ask about `node` in: its stamp when the channel pulled it in from elsewhere, the
// pattern's own frame otherwise. every scope-aware question in the destructure channel goes
// through here - a free-floating `metaPath` cannot tell the two apart
export function nodeSite(node, metaPath) {
  return nodeSites.get(node) ?? { scope: metaPath?.scope, path: metaPath };
}

// a deep clone carries EVERY per-node stamp this leg keeps beside the tree: the resolved TYPE a
// claim above resolves its receiver off (babel's `seededRefClone`, over a whole subtree) and the
// FRAME an acquired receiver evaluates in. what lands in the tree is a COPY, and an unstamped one
// resolves generic / answers in the wrong scope. `ctx` is optional - a caller with no type table
// still gets the frame carried
export function cloneStamped(node, ctx = null) {
  const clone = cloneNode(node);
  const site = nodeSites.get(node);
  (function restamp(source, copy) {
    if (Array.isArray(source)) {
      for (const [index, item] of source.entries()) restamp(item, copy[index]);
      return;
    }
    if (!source || typeof source !== 'object' || !copy) return;
    const type = ctx?.resolvedType?.get(source);
    if (type) ctx.resolvedType.set(copy, type);
    if (site) nodeSites.set(copy, site);
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in source) restamp(source[key], copy[key]);
  })(node, clone);
  return clone;
}

// a quiet COMPUTED key through the canonical resolver, in the folded shape the callers read (an
// EFFECT-bearing one is `foldSeqKeyLiteralTail`'s job - it owns the prefix that must ride along)
export function foldedResolvedKey(property, metaPath, adapter) {
  const key = resolveKey({
    node: property,
    computed: true,
    scope: metaPath.scope,
    adapter,
    path: metaPath,
    bailOnSideEffectKey: true,
  });
  return typeof key === 'string' ? { key, effects: [] } : null;
}

// the RESULT type of a source METHOD CALL - the only receiver whose type the chain above needs
// off a memo (`arr.at(0)?.at(0).at(0)` - the middle dispatch owes `_atMaybeArray`). every other
// shape stands down: the resolver descends by PATH, and one the split rebuilt (or whose callee
// resolves through a binding) has no path to walk
export function memoizedCallResultType(objectNode, metaPath, resolveNodeType) {
  const value = peelExpressionWrappers(objectNode);
  if (value?.type !== 'CallExpression' || value.optional
    || peelExpressionWrappers(value.callee)?.type !== 'MemberExpression'
    || !Number.isInteger(value.start)) return null;
  return nodeTypeRefinement(value, metaPath.scope, resolveNodeType);
}

// the split's rebuilt `.call(...)` STANDS FOR the source call it replaces, so the source
// node's PRE-MUTATION type travels onto it - the receiver-id stamp's twin. without it a claim
// ABOVE resolves generic over the minted spelling (`arr.flat?.(0).at` reads the untyped `_at`
// where the array-typed `_atMaybeArray` is owed)
// the node-only type resolve is a TYPING REFINEMENT - a null answer degrades to the generic
// helper, never to a wrong rewrite. the resolver descends by PATH, so a shape whose descent
// leaves the node (a callee resolving through a binding) THROWS instead of answering, and a
// throw here would take the whole file down over a spelling nicety: that is a decline
export function nodeTypeRefinement(node, scope, resolveNodeType) {
  try {
    return resolveNodeType({ node, scope }) ?? null;
  } catch {
    return null;
  }
}

export function stampSourceCallType(built, sourceNode, metaPath, ctx) {
  const type = nodeTypeRefinement(sourceNode, metaPath.scope, ctx.resolveNodeType);
  if (type) ctx.resolvedType.set(built, type);
  return built;
}
