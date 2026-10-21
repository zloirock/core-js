// guard rendering for claims over undefinable receivers: the null-probe tests, seals,
// absorbed tails and the guarded-hop replacement every channel spells through
import {
  directClaimProbePlan,
  callYieldCanBeUndefined,
  deleteHostAboveCarriedChain,
  descendToChainRoot,
  guardTailPullCount,
  inlineCallProxyGlobalRoot,
  proxyGlobalRootName,
  proxyReceiverValueCanBeUndefined,
  realmRootIsSpellable,
  sealedChainBoundary,
  unbackedProxyHopKey,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  CHAIN_HOP_WRAPPER_TYPES,
  claimDeleteOperand,
  deleteHostAboveChain,
  deleteOverOpenContinuation,
  invocationCalleeOf,
  isPristineProxyGlobal,
  memberKeyName,
  parenSealedCalleeAbove,
  POSSIBLE_GLOBAL_OBJECTS,
  singleSequenceTail,
  stepOverChainWrappers,
  subtreeContainsNode,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
  peelChainAssignmentDeep,
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

// a probe that renders its OWN guard - a paren SEAL, or a SEQUENCE whose tail carries a live
// `?.` - hands the test that guard's source instead: the inner `?.`'s object. the prefix a
// sequence carried runs ahead of the whole render, where the source ran it. null when the probe
// spells no guard of its own
export function descendIntoOwnGuard(probe, ctx) {
  const sealed = TRANSPARENT_EXPR_WRAPPER_TYPES.has(probe?.type);
  let inner = sealed ? unwrapRuntimeExpr(probe) : null;
  // a SEQUENCE - sealed or bare - hands its TAIL on
  for (let seqProbe = inner ?? unwrapRuntimeExpr(probe); seqProbe?.type === 'SequenceExpression';) {
    inner = unwrapRuntimeExpr(seqProbe.expressions.at(-1));
    seqProbe = inner;
  }
  if (!sealed && inner === null) return null;
  for (let hop = inner; hop?.type === 'MemberExpression'; hop = unwrapRuntimeExpr(hop.object)) {
    if (!hop.optional) continue;
    return guardProbeUndefinable(hop.object, ctx) ? hop.object : null;
  }
  return null;
}

function parenSealedCalleeTail(hopPath) {
  if (!parenSealedCalleeAbove(hopPath, hopPath.node, unwrapRuntimeExpr)) return null;
  // the tail the seal keeps outside starts at the FIRST plain member above the hop
  let first = null;
  for (let cur = hopPath, up = hopPath.parentPath; up?.node; up = cur.parentPath) {
    const upNode = up.node;
    if (CHAIN_HOP_WRAPPER_TYPES.has(upNode.type)) {
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

// one step of a NAV COLLAPSE's tail: the run of realm hops standing right over the always-defined leaf
// folds onto it where the climb's fold verdict says so, and a hop that stays spelled leaves the value
// no longer provably defined. every step past the run takes the shared pull rule (`guardTailPullCount`)
// in turn - the count babel's nav render takes - and the first one the rule leaves outside ends the
// alternate. a realm-named key past that run is a plain read, never a fold (`_self.box.window`)
function navCollapseTailStepper(alwaysDefined, { unbackedHopKey, realmHopFolds }) {
  const pulled = [];
  let inRealmRun = alwaysDefined;
  let definedAtLeaf = alwaysDefined;
  return function navTailStep(up, { memberCont, callCont }) {
    const upNode = up.node;
    inRealmRun &&= memberCont && !!unbackedHopKey?.(upNode);
    if (inRealmRun) {
      const folds = realmHopFolds(up, !!upNode.optional);
      // a realm hop right over the leaf reads that leaf, so its own `?.` is dead text either way
      upNode.optional = false;
      if (folds) return 'fold';
      inRealmRun = false;
      definedAtLeaf = false;
      return 'take';
    }
    pulled.push({ optional: !!upNode.optional, isCall: callCont });
    if (guardTailPullCount(pulled, definedAtLeaf) < pulled.length) return 'stop';
    // the first step reads the always-defined leaf, so its `?.` is the vestigial one
    if (upNode.optional && memberCont && definedAtLeaf && pulled.length === 1) upNode.optional = false;
    return 'take';
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
  // does the climb fold this unbacked realm hop onto the always-defined value below it? a folded hop
  // leaves the alternate on the ponyfill it started from, so what reads next still reads an
  // always-defined value - and its own `?.` folds with it, since the only realm where that
  // short-circuit fires is the one the collapse already answers for. the read whose `?.` was just
  // erased stays where the source reads on past it, and a COMPUTED key stays: folding it would fold
  // its key effect away with it
  function realmHopFolds(up, sourceOptional) {
    const { reader, readsMember, readsThrough } = realmHopReader(up);
    const sourceReadContinues = preserveOptionalHops && !sourceOptional && readsThrough
      && (!readsMember || reader.optional || !POSSIBLE_GLOBAL_OBJECTS.has(memberKeyName(reader)));
    return !sourceReadContinues && (!sourceOptional || !preserveOptionalHops)
      && !up.node.computed && (alwaysDefined || navAlternate);
  }
  const navStep = navCollapse ? navCollapseTailStepper(alwaysDefined, { unbackedHopKey, realmHopFolds }) : null;
  // the realm hops the alternate reads THROUGH: over an always-defined ponyfill each of them names
  // that same ponyfill (the plan folds them for the same reason), so the alternate drops them
  // instead of spelling a slot the ponyfill carries only in a browser
  const foldedHops = [];
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
    // an optional hop whose `?.` attaches DIRECTLY to the guard's result stays outside
    // (`(ternary)?.valueOf()`, `(ternary)?.([3])`); the always-defined leaf-adjacent
    // MEMBER absorbs with its `?.` ERASED (the vestigial rule), and an optional CALL of
    // an already-absorbed callee cannot split from it - it rides the alternate with its
    // `?.` kept (`.reduce?.(...)` inside the branch)
    const sourceOptional = !!upNode.optional;
    const navVerdict = navStep?.(up, { memberCont, callCont });
    if (navVerdict === 'stop') break;
    if (!navStep && upNode.optional) {
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
    let folded = navVerdict === 'fold';
    if (folded) foldedHops.push(upNode);
    else if (!navStep && memberCont && unbackedHopKey?.(upNode)) {
      if (realmHopFolds(up, sourceOptional)) {
        foldedHops.push(upNode);
        folded = true;
        // the `?.` goes with the hop, so the erase it just spent is RETURNED: the step above is
        // leaf-adjacent again, reading the same always-defined ponyfill
        erasedOptional = false;
      } else crossedUnbacked = true;
    }
    // only on the NAV route, and only directly over the replaced hop: everywhere else the
    // wrapper asserts about a value the emission still produces - a dispatch RESULT keeps it
    // (`arr?.at(-1)!.toString()`), a plain nav spelling does not (`...?.self!.window`)
    if (alwaysDefined && !absorbedHop) absorbedWrappers.push(...pendingWrappers);
    pendingWrappers = [];
    mayAbsorbOptional = folded && alwaysDefined;
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
  // TS wrappers the climb steps over end up INSIDE the absorbed tail: what they asserted about is
  // the substitution, so they go with the source spelling they wrapped
  // (`globalThis.window?.self!.window` -> `... : _self.window`)
  let sealedTail = test ? parenSealedCalleeTail(hopPath) : null;
  // ... and a sealed tail that is itself a realm hop FOLDS like any other read through this
  // emission: the ponyfill is what it names, and the read OUTSIDE the seal keeps the source's own
  // throw on the short-circuit (`(g?.window?.self.window).Array` -> `(<guard>).Array`)
  if (sealedTail && alwaysDefined && !sealedTail.computed && hopIsUnbacked?.(sealedTail)) sealedTail = null;
  // a `delete` consumer needs the MEMBER itself: pulled into the alternate the ternary
  // deletes nothing, so the tail stays outside the climb and the operator takes the guard whole
  // (`delete dl()?.window?.self.missing` -> `null == dl().window ? true : delete _self.missing`).
  // ONE home for that question - asked of the hop the render replaces, carriers included, instead
  // of each NAV channel that renders here remembering to hand it in: the ones that forgot absorbed
  // the member and the delete then deleted nothing. a DISPATCH alternate asks it too: the value
  // below the member is this render's to mint, but the member itself is one the source names to delete
  const deleteHostTail = deleteHostAboveChain(hopPath, hopPath.node, unwrapRuntimeExpr)
    || deleteHostAboveCarriedChain(hopPath);
  const climbed = test && !sealedTail && !deleteHostTail
          ? climbAbsorbedTail(hopPath, {
            alwaysDefined, navAlternate, navCollapse, unbackedHopKey: hopIsUnbacked, preserveOptionalHops,
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

// does a nav (or bare identifier) bottom out on a realm root the binding-aware canon proves -
// a pristine proxy-global name or an alias of one, shadow bail included
function realmRootProves(node, aliasCtx) {
  let cur = unwrapRuntimeExpr(node);
  for (;;) {
    if (cur?.type === 'MemberExpression') {
      cur = unwrapRuntimeExpr(cur.object);
      continue;
    }
    if (cur?.type === 'SequenceExpression' && cur.expressions?.length) {
      cur = unwrapRuntimeExpr(cur.expressions.at(-1));
      continue;
    }
    if (cur?.type === 'AssignmentExpression') {
      cur = unwrapRuntimeExpr(cur.right);
      continue;
    }
    break;
  }
  if (cur?.type !== 'Identifier') return false;
  const name = proxyGlobalRootName({ node: cur, ...aliasCtx });
  return !!name && POSSIBLE_GLOBAL_OBJECTS.has(name);
}

// a probe that provably cannot be nullish ERASES its guard - only a genuinely
// undefinable value keeps one. an optional CALL short-circuits to undefined whenever
// its CALLEE is nullish, so any non-literal callee keeps it undefinable (`condFn?.()`);
// an inline function literal never is (`(() => Symbol)?.()`)
export function guardProbeUndefinable(probe, {
  metaPath,
  adapter,
  resolvePure,
  observableRead = false,
  nestedSeqUnproven = false,
}) {
  if (probe?.type === 'CallExpression') {
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    const probeCallee = unwrapRuntimeExpr(probe.callee);
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
      const calleeBinding = adapter.getBinding({ scope: metaPath.scope, name: probeCallee.name, path: metaPath });
      if (calleeBinding?.node?.type === 'VariableDeclarator' && !calleeBinding.node.init) return true;
    }
    return false;
  }
  // a KEPT WRITE holds its VALUE: the canon judges what the write yields, while the
  // test clones the write whole (`null == (w = _globalThis.window)`). the write makes
  // the read OBSERVABLE, so a proxy spine below the probe hop counts as one surface
  const peeledProbe = unwrapRuntimeExpr(probe);
  let probeValue = peelChainAssignmentDeep(peeledProbe);
  // ... and it is the WRITE that makes it observable, not the peel: a sequence hands its tail's
  // value on and observes nothing, so a plain nav under one is judged by the value canon exactly
  // like its bare twin (`(eff(), globalThis.window.self)?.Promise.k` folds where the bare form does)
  let storeObserved = probeValue !== peeledProbe;
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
        // ... and the boundary speaks only for a spine the realm canon owns: a root the
        // binding-aware canon cannot prove (a SHADOWED realm name, a user binding) is the
        // user's value, and this verdict may not call it a probe - the ordinary walk decides
        if (nestedSeqUnproven && !selfGuarded
          && realmRootProves(deepTail, { scope: metaPath.scope, adapter, path: metaPath })) return true;
        probeValue = deepTail;
        continue;
      }
      probeValue = tail;
      continue;
    }
    const dechained = peelChainAssignmentDeep(probeValue);
    if (dechained === probeValue) break;
    storeObserved = true;
    probeValue = unwrapRuntimeExpr(dechained);
  }
  // a bare ALIAS answers through the value canon like every other probe: an alias of an
  // entry-backed surface (`const g = globalThis`) holds the realm object and proves defined
  // there, an alias of a probe read (`const w = globalThis.window`) or of a rendered guard
  // (`null == _globalThis.window ? void 0 : _self`) holds a value that can be absent and keeps
  // its `?.`. asked of the NAME the alias resolves to instead, the guard render's alias read as
  // `self` - the defined branch the value canon classifies through - and the guard over a value
  // the other leg still tests was dropped
  return proxyReceiverValueCanBeUndefined(
    probeValue, m => resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter, path: metaPath },
    { throughChainAssign: true, observableRead: observableRead || storeObserved });
}

// an optional STATIC member keeps its guard routes when its OBJECT can genuinely be undefined -
// a live `?.` inside it, or a value read THROUGH a kept write
export function optionalMemberStaysGuarded(node, { metaPath, adapter, resolvePure, observableRead = false }) {
  // the INSTANCE route reads a VALUE through the sequence, so a nested one leaves it unproven
  const seqOpts = { metaPath, adapter, resolvePure, nestedSeqUnproven: true };
  // a `?.` inside the receiver guards only when its PROBE can genuinely be undefined -
  // a chain of always-defined reads erases whole (`globalThis?.Array?.from` -> `_Array$from`).
  // the inner probe being defined answers only for the hops BELOW: the hop's own READ can
  // still be the environment probe, and that value is what OUR `?.` tests
  // (`globalThis?.window?.self` - `globalThis` is defined, `window` is not backed, the guard stays)
  let cur = unwrapRuntimeExpr(node.object);
  while (cur?.type === 'MemberExpression') {
    if (cur.optional) {
      if (guardProbeUndefinable(cur.object, seqOpts)) return true;
      // the extended value question fires only on a SOURCE proxy-global root: a rendered
      // span roots at a minted always-defined binding, and its vestigial `?.` keeps the
      // erase the re-emit spelled (the sealed respell owns the probe there)
      const { root } = descendToChainRoot(cur);
      if (root?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return false;
      // ... asked of the RECEIVER, which is the value OUR `?.` tests - not of this link. hops
      // standing between them are realm self-references the collapse assumption defines, so the
      // link's own verdict guarded a run whose plain twin folds whole
      // (`globalThis?.window.window?.self` reads the realm exactly like `globalThis.window.window?.self`)
      break;
    }
    cur = unwrapRuntimeExpr(cur.object);
  }
  if (cur?.type === 'CallExpression' && cur.optional) return guardProbeUndefinable(cur, seqOpts);
  let probeObject = unwrapRuntimeExpr(node.object);
  let sawWrite = false;
  while (probeObject?.type === 'AssignmentExpression') {
    sawWrite = true;
    probeObject = unwrapRuntimeExpr(probeObject.right);
  }
  // a BARE call value guards even proven (the strict opaque-root canon: `(() =>
  // globalThis)()?.self...` keeps its test); a KEPT WRITE of it erases (the write observes)
  if (!sawWrite && probeObject?.type === 'CallExpression' && !probeObject.optional) return true;
  return proxyReceiverValueCanBeUndefined(probeObject, m => resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true, observableRead });
}

// does a LOAD-BEARING seal below the claim own the render? the read it made observable rides
// back as a throw probe and the claim's own `?.` erases with the substitution - the guard
// routes would answer `void 0` where the source THROWS. the probe's own precondition, asked
// without building (or injecting) anything
export function sealedThrowRidesTheClaim(node, metaPath, ctx) {
  const boundary = sealedChainBoundary(node);
  const key = boundary ? memberKeyName(boundary.member) : null;
  // a PRISTINE PROXY hop read through the seal is the same surface one level down: it
  // collapses with the nav and observes nothing the guard does not, so the guard route keeps
  // it (`((globalThis.window)).self?.Promise?.resolve` - babel spells only the test)
  if (key === null || (POSSIBLE_GLOBAL_OBJECTS.has(key) && isPristineProxyGlobal(ctx.adapter, key))) return false;
  return proxyReceiverValueCanBeUndefined(boundary.inner, m => ctx.resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath }, { throughChainAssign: true });
}

// a PRISTINE proxy hop read through a SEAL names the same surface the seal produced: the hop
// DROPS and the read above it lands on the guard, where the source's own throw lives
// (`(g.window?.self).self.box.at(0)` -> `(null == _g.window ? void 0 : _self).box`). swapping the
// ponyfill in instead hands the read a never-nullish binding and the throw is lost
export function sealedPristineHopCollapse(metaPath, node, { adapter, resolvePure, markRewrite }) {
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
  // ... and never onto a RAW realm read this build cannot spell: with the root's entry out of the
  // build nothing substitutes what the drop lands on, and the hop's own ponyfill was the one
  // spelling available (`(globalThis).self.window` without the global-this entry is `_self.window`)
  if (!realmRootIsSpellable(node, m => resolvePure(m, metaPath))) return false;
  // ... only where something READS through it: in value position the drop would hand back the
  // seal instead of the surface the hop named
  const above = metaPath.parentPath?.node;
  if (above?.type !== 'MemberExpression' || unwrapRuntimeExpr(above.object) !== node) return false;
  markRewrite();
  metaPath.replaceWith(node.object);
  return true;
}

// a SEAL makes the read above it observable: the source performs it on a value that can be
// absent (`(globalThis.window?.self).Map` throws off-window), and the claim's swap erases it.
// rebuild that read as a THROW PROBE riding ahead of the ponyfill - the sealed value through
// the shared guard plan, the boundary key re-spelling the source read
export function sealedClaimThrowProbe(node, metaPath, ctx) {
  const { adapter, resolveGlobalPolyfill, injectPureImport } = ctx;
  const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
  const decision = directClaimProbePlan(node, ({ name }) => resolveGlobalPolyfill(name), aliasCtx);
  return decision ? {
    node: renderClaimProbe(decision, { injectImport: injectPureImport }),
    decision,
    consumed: decision.consumed,
    navStart: decision.navStart,
  } : null;
}

// did the source spell the callee through explicit parens (the paren-lookup class)?
export function calleeParenWrapped(callNode) {
  for (let wrapper = callNode.callee; wrapper;) {
    if (wrapper.type === 'ParenthesizedExpression') return true;
    if (CHAIN_HOP_WRAPPER_TYPES.has(wrapper.type)) wrapper = wrapper.expression;
    else return false;
  }
  return false;
}
