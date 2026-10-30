// guard rendering for claims over undefinable receivers: the null-probe tests, seals,
// absorbed tails and the guarded-hop replacement every channel spells through
import {
  guardProbeUndefinable as probeValueCanBeUndefined,
  planGuardedClaimTail,
} from '@core-js/polyfill-provider/detect-usage/guard-preparation';
import { directClaimProbePlan, createGuardTailPlanner, unbackedProxyHopKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  CHAIN_HOP_WRAPPER_TYPES,
  claimDeleteOperand,
  deleteOverOpenContinuation,
  invocationCalleeOf,
  stepOverChainWrappers,
  subtreeContainsNode,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  chainExpression,
  sequenceExpression,
  renderDeleteShortCircuitGuard,
  renderShortCircuitGuard,
  renderClaimProbe,
} from '@core-js/polyfill-provider/render';
import { receiverCarriesOptional, replaceNodeInTree, stampReplacementSpan } from './emit-shared.js';
import { markSubtreeSkipped, optionalHeirAbove } from './nav-spine.js';

// does the receiver below a member hop end on an optional CALL (`arr.flat?.()`)? that segment
// renders as one inline `?.call` value, and the disjunct chain joins it with the hop above -
// a segment ending on an optional MEMBER memoizes its own guard instead
export function optionalCallSegmentBelow(node) {
  for (let cur = unwrapRuntimeExpr(node); cur;) {
    if (cur.type === 'CallExpression') {
      if (cur.optional) return true;
      cur = unwrapRuntimeExpr(cur.callee);
      continue;
    }
    if (cur.type !== 'MemberExpression' || cur.optional) return false;
    cur = unwrapRuntimeExpr(cur.object);
  }
  return false;
}

// what reads a realm hop the climb stands on, through the chain wrappers between - and whether that
// read takes the hop's value on: a member, a call, a stored value. a paren between them is a seal the
// climb keeps, so the walk crosses the TS and chain wrappers only, never `stepOverChainWrappers`' set
function realmHopReader(hopPath) {
  let slot = hopPath;
  let readerPath = hopPath.parentPath;
  while (readerPath?.node && CHAIN_HOP_WRAPPER_TYPES.has(readerPath.node.type) && readerPath.node.expression === slot.node) {
    slot = readerPath;
    readerPath = readerPath.parentPath;
  }
  const reader = readerPath?.node;
  const readsMember = reader?.type === 'MemberExpression' && reader.object === slot.node;
  return {
    reader,
    readsMember,
    readsThrough: readsMember || (reader?.type === 'CallExpression' && reader.callee === slot.node)
      || (reader?.type === 'AssignmentExpression' && reader.right === slot.node),
  };
}

// the guard climb: how far above the replaced hop the alternate reaches, and which TS wrappers
// it swallowed on the way. extracted from `replaceGuardedHop` for its size. `preserveOptionalHops`
// (a probe the source reads on past the replaced hop) keeps a `?.` the climb would otherwise fold
// with its always-defined value, so the read above still short-circuits where the source did
function climbAbsorbedTail(hopPath, {
  alwaysDefined, navAlternate, navCollapse, unbackedHopKey = null, preserveOptionalHops,
}) {
  const absorbedWrappers = [];
  const planStep = createGuardTailPlanner({ alwaysDefined, navAlternate, navCollapse, preserveOptionalHops });
  // the realm hops the alternate reads THROUGH: over an always-defined ponyfill each of them names
  // that same ponyfill (the plan folds them for the same reason), so the alternate drops them
  // instead of spelling a slot the ponyfill carries only in a browser
  const foldedHops = [];
  // a transparent wrapper on the absorbed tail (a `!` non-null, a paren) rides along ONLY
  // when the chain continues above it (`a?.b.map(f)!.at(-1)` keeps `.at` on the branch);
  // a TERMINAL wrapper stays outside the guard (`a?.b.at(0)! + 5` wraps the ternary)
  let cursor = hopPath;
  let target = hopPath;
  let pendingWrappers = [];
  let absorbedHop = false;
  for (let up = cursor.parentPath; up?.node; up = cursor.parentPath) {
    const upNode = up.node;
    // no canon set answers this: each layer is peeled under a rule of its own - a TS assertion
    // wherever it stands, a paren only while it wraps THIS cursor, the chain marker only while a
    // live `?.` above the seal reads the replaced hop
    if (TS_EXPR_WRAPPERS.has(upNode.type)
      || (upNode.type === 'ParenthesizedExpression' && upNode.expression === cursor.node)
      // a CHAIN wrapper SEALING the replaced nav is stepped over only when a LIVE `?.` reads it:
      // that optional is the vestigial one an always-defined alternate erases, and the seal is what
      // hid it from this climb. over a PLAIN tail the same wrapper seals a read that stays outside
      // ... and only while the seal wraps the replaced hop ITSELF: a read absorbed on the way
      // (`(nav.userBox)?.list`) ends the alternate on a value that can be absent, and the `?.`
      // above it is the source's own short-circuit on THAT read
      || (upNode.type === 'ChainExpression' && upNode.expression === cursor.node
        && !absorbedHop && liveOptionalAboveSeal(up))) {
      if (TS_EXPR_WRAPPERS.has(upNode.type)) pendingWrappers.push(upNode);
      cursor = up;
      continue;
    }
    const memberCont = upNode.type === 'MemberExpression' && upNode.object === cursor.node;
    const callCont = upNode.type === 'CallExpression' && upNode.callee === cursor.node;
    if (!memberCont && !callCont) break;
    const realmHop = memberCont && !!unbackedHopKey?.(upNode);
    const step = planStep({
      optional: !!upNode.optional,
      isCall: callCont,
      realmHop,
      computed: !!upNode.computed,
      property: upNode.property,
      ...realmHop ? realmHopReader(up) : null,
    });
    if (!step) break;
    upNode.optional = step.optional;
    if (step.folded) foldedHops.push(upNode);
    if (step.absorbWrappers) absorbedWrappers.push(...pendingWrappers);
    pendingWrappers = [];
    absorbedHop = true;
    cursor = up;
    target = up;
  }
  return { target, absorbedWrappers, foldedHops };
}

// does a live `?.` read the value this chain wrapper seals? the wrappers the seal wears - source
// parens, a TS cast - sit between them, so the walk peels those before asking: one step up answers
// the wrapper and the climb then stops on a tail it was meant to absorb
function liveOptionalAboveSeal(chainPath) {
  let cur = chainPath;
  for (let up = chainPath.parentPath; up?.node; cur = up, up = up.parentPath) {
    const { node } = up;
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type) && node.expression === cur.node) continue;
    return (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && node.object === cur.node && !!node.optional;
  }
  return false;
}

// the guard now yields `void 0` on the short-circuit branch, so the member left standing over it - a
// read the `delete` above it never reaches, ended by a carrier first (`delete ('x', w?.self.box).n`) -
// reads through a `?.`, the source spelling of the very short-circuit the ternary reproduces. that
// member is the READER past the wrappers over the guard: a `!` continues the chain, and the heir rule
// refuses the seal a paren makes
function rehangGuardedTailOptional(target, inserted, up = target.parentPath) {
  const [, reader] = stepOverChainWrappers(inserted, up);
  const above = optionalHeirAbove(reader?.node, inserted);
  if (!above) return;
  above.optional = true;
  // the chain wrapper belongs at the TOP of the continuation, not on the hop that carries the
  // `?.`: sealed one step up it TERMINATES the chain and the tail above reads plainly
  // (`delete (guard?.chrome).missing` throws where `delete guard?.chrome.missing` short-circuits).
  // a `!` between two links of the continuation is part of it too
  let top = reader;
  for (let cur = reader, step = reader.parentPath; step?.node; step = cur.parentPath) {
    const { node } = step;
    if (TS_EXPR_WRAPPERS.has(node.type)) {
      cur = step;
      continue;
    }
    if (!((node.type === 'MemberExpression' && node.object === cur.node)
      || (node.type === 'CallExpression' && node.callee === cur.node))) break;
    cur = step;
    top = step;
  }
  if (top.parentPath?.node?.type !== 'ChainExpression') top.replaceWith(chainExpression(top.node));
}

// finish a hop rewrite: climb the plain tail a guard absorbs, consume the chain wrapper
// the rewrite's own optionality replaced, land the (possibly guarded) emission, and mark
// the detached original spine off the traversal queue - the queue still holds entries pointing into
// that spine, and an unmarked one re-fires the emission on a subtree the rewrite has already replaced.
// under a guard the plain tail hops above ride inside the alternate (`a?.b.at(0).c.d`
// keeps `.c.d` on the non-null branch - babel's shape); the climb stops at the next `?.`
// hop, which keeps its own short-circuit over the emitted ternary
// eslint-disable-next-line max-statements -- sequential emission steps of one guarded hop
export function replaceGuardedHop({
  hopPath,
  test,
  built,
  skippedNodes,
  returnType = null,
  resolvedType = null,
  alwaysDefined = false,
  navAlternate = false,
  navCollapse = false,
  preserveOptionalHops = false,
  leafKeySe = null,
  prefixSe = null,
  resolveHere = null,
}) {
  // ONE home for the realm-hop question: a caller hands its resolver and the climb asks the canon,
  // instead of each nav route remembering to pass a predicate of its own (three routes render a nav
  // alternate here, and only one of them used to ask - the other two folded nothing)
  const hopIsUnbacked = resolveHere ? hop => unbackedProxyHopKey(hop, resolveHere) : null;
  // an earlier claim in the same chain may have replaced this span already (`arr.at?.(0)
  // [(eff(), 'flat')].name` - the split render detaches the caller the SE-key claim holds):
  // a stale path is a no-op, never a throw
  if (hopPath.removed) return;
  const continuation = test ? planGuardedClaimTail(hopPath, { alwaysDefined, resolvePure: resolveHere }) : null;
  const sealedTail = continuation?.sealedTail;
  const deleteHostTail = continuation?.deleteHost;
  const climbed = continuation?.absorb
    ? climbAbsorbedTail(hopPath, {
      alwaysDefined,
      navAlternate,
      navCollapse,
      unbackedHopKey: hopIsUnbacked,
      preserveOptionalHops,
    }) : null;
  const absorbedWrappers = climbed?.absorbedWrappers ?? [];
  const foldedHops = climbed?.foldedHops ?? [];
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
    else if (TS_EXPR_WRAPPERS.has(up.node.type)) {
      cursor = up;
      target = up;
    } else break;
  }
  // a TS layer between the replaced span and the INVOCATION that consumes it goes with the
  // span: the call reads the guard's own value, and babel's path climbs through the layer
  // before replacing (`(g.window?.self as any)(1)` -> `(null == _globalThis.window ? void 0 : _self)(1)`).
  // every invoking position asks the same - a `new`, a template tag
  let calleeConsumedWrapper = false;
  for (let cursor = target, up = target.parentPath, outermost = null; up?.node; up = cursor.parentPath) {
    const upNode = up.node;
    if (upNode.expression === cursor.node
      && TRANSPARENT_EXPR_WRAPPER_TYPES.has(upNode.type)) {
      if (TS_EXPR_WRAPPERS.has(upNode.type)) outermost = up;
      cursor = up;
      continue;
    }
    const invokes = invocationCalleeOf(upNode) === cursor.node;
    if (outermost && invokes) {
      target = outermost;
      calleeConsumedWrapper = true;
    }
    break;
  }
  // the climb may reach a path an earlier emission in the same chain already replaced
  if (target.removed) return;
  // supported static-leaf key effects ride as a sequence prefix around the WHOLE alternate - the
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
  // A consumed call's annotations lead its whole replacement, before a guard or dispatch
  // can print the receiver it reuses. Non-call hops retain their existing source ownership.
  function land(path, replacement) {
    path.replaceWith(consumed.type === 'CallExpression' ? stampReplacementSpan(replacement, consumed) : replacement);
  }
  if (target === hopPath) {
    const deleteTail = deleteHostTail && test;
    // under a `delete` the realm hops between the render and the deleted member read the always-defined
    // alternate and fold like any read through a ponyfill - the tail climb's own fold, which a delete
    // consumer skipped to keep its member outside: spliced out, each parent reads what stood below
    // (`delete (dh()?.self?.window).k` -> `delete (<guard>).k`)
    const folds = [];
    let up = target.parentPath;
    if (deleteTail && (alwaysDefined || navAlternate)) {
      let below = target.node;
      while (up?.node?.type === 'MemberExpression' && up.node.object === below && !up.node.computed
        && hopIsUnbacked?.(up.node) && !claimDeleteOperand(up) && up.parentPath?.node) {
        folds.push(up);
        below = up.node;
        up = up.parentPath;
      }
    }
    // ... and the operator the chain runs on into takes its WHOLE act into the guard, the value landing
    // bare in the operand
    const deleteHost = deleteTail ? deleteOverOpenContinuation(folds.at(-1)?.node ?? target.node, up) : null;
    const value = test ? withLeafKeySe(built) : built;
    const replacement = test && !deleteHost ? renderShortCircuitGuard(test, value) : value;
    if (test && !deleteHost && returnType) resolvedType?.set(replacement, returnType);
    const inserted = deleteHost ? value : withPrefixSe(replacement);
    land(target, inserted);
    for (const fold of folds) replaceNodeInTree(fold.parentPath.node, fold.node, inserted);
    if (deleteHost) land(deleteHost, withPrefixSe(renderDeleteShortCircuitGuard(test, deleteHost.node.argument)));
    else if (deleteTail) rehangGuardedTailOptional(target, inserted, up);
  } else if (test) {
    // a tail (or the chain wrapper) was absorbed: swap the hop for its emission in place,
    // then wrap what the climb collected as the alternate
    // a MEMBER tail hangs OUTSIDE the leaf-key effects - they belong to the read the
    // substitution replaced (`(k++, _Array).host.w`); a CALL tail keeps them around the whole
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
    const tailCore = peelTailNode(target.node);
    const memberTail = tailCore?.type === 'MemberExpression';
    const builtCore = built.type === 'ChainExpression' ? built.expression : built;
    land(hopPath, memberTail ? withLeafKeySe(builtCore) : builtCore);
    for (const wrapper of absorbedWrappers) replaceNodeInTree(target.node, wrapper, wrapper.expression);
    // ... and the realm hops the climb folded: the alternate reads the ponyfill they name, so each
    // is spliced out and its parent reads what stood below it. the OUTERMOST one has no parent
    // inside the tail - it moves the tail's own root instead
    let tailNode = target.node;
    for (const hop of foldedHops) {
      if (hop === tailNode) tailNode = hop.object;
      else replaceNodeInTree(tailNode, hop, hop.object);
    }
    // a TS wrapper the climb passed THROUGH rather than CONSUMED (the span is not always-defined,
    // so the guard is a real test) asserts about the value the ternary now produces - it wraps the
    // CONDITIONAL, not the branch (`(g.window?.self.tsBox as any).list`
    // -> `((null == _globalThis.window ? void 0 : _self.tsBox) as any).list`)
    const outerTsWrappers = [];
    if (tailAbsorbed && !absorbedWrappers.length && !calleeConsumedWrapper) {
      // parens between the layers are the printer's to re-derive - they carry no assertion,
      // so the walk steps over them and collects only the TS layers (`((x as any))!`)
      for (let cur = tailNode; cur; cur = cur.expression) {
        if (TS_EXPR_WRAPPERS.has(cur.type)) outerTsWrappers.push(cur);
        else if (cur.type !== 'ParenthesizedExpression') break;
      }
    }
    let alternate = peelTailNode(outerTsWrappers.at(-1)?.expression ?? tailNode);
    while (alternate?.type === 'ParenthesizedExpression') alternate = alternate.expression;
    // a `?.` surviving inside the alternate (an optional dispatch, an absorbed optional
    // tail) keeps chain semantics under a wrapper of its own once the guard consumed the
    // original one
    if (receiverCarriesOptional(alternate)) alternate = chainExpression(alternate);
    const replacement = renderShortCircuitGuard(test, memberTail ? alternate : withLeafKeySe(alternate));
    if (returnType) resolvedType?.set(replacement, returnType);
    let wrapped = replacement;
    for (const wrapper of outerTsWrappers.toReversed()) wrapped = { ...wrapper, expression: wrapped };
    land(target, withPrefixSe(wrapped));
  } else {
    land(target, built);
  }
  markSubtreeSkipped(skippedNodes, consumed, keepLive.size ? keepLive : null);
}

// is there a SEAL directly above this node? a paren makes the read through it OBSERVABLE, so the
// probe may be asked off the proxy SPINE below the hop. what stands BETWEEN the hop and the seal is
// the chain-hop canon's set - the marker oxc hangs on an optional spine, and TS assertions, which
// erase and seal nothing of their own (`(x?.y as any).z` seals exactly like its cast-less twin;
// climbing only the marker read it as unsealed). only the ANSWER is outside a set: the paren is not
// a layer to peel, and one dialect spells it as a flag on the node below rather than a node at all
export function sealedLayerAbove(metaPath, node) {
  if (node.extra?.parenthesized) return true;
  let up = metaPath.parentPath;
  while (CHAIN_HOP_WRAPPER_TYPES.has(up?.node?.type)) up = up.parentPath;
  return up?.node?.type === 'ParenthesizedExpression' || !!up?.node?.extra?.parenthesized;
}

// Bind the shared value question to the caller's native scope and entry resolver.
export function guardProbeUndefinable(probe, { metaPath, adapter, resolvePure, ...options }) {
  return probeValueCanBeUndefined(probe, {
    path: metaPath, adapter, resolvePure: meta => resolvePure(meta, metaPath), ...options,
  });
}

// Bind the shared erased-read decision to this source site and injector. Consumers retain
// the decision alongside its rendered probe so effects are never recovered from emitted AST.
export function sealedClaimThrowProbe(node, metaPath, ctx) {
  const { adapter, resolveGlobalPolyfill, injectPureImport } = ctx;
  const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
  const decision = directClaimProbePlan(node, ({ name }) => resolveGlobalPolyfill(name), aliasCtx);
  return decision ? { node: renderClaimProbe(decision, { injectImport: injectPureImport }), decision } : null;
}
