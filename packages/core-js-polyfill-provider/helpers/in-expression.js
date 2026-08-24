// Normalized decision for a polyfillable `key in obj` expression, shared by both emitters so the
// branch selection and side-effect harvest live in one place and cannot diverge. The caller
// renders the returned node references its own way; the unplugin marks the discarded
// operands skipped, babel drops them implicitly by replacing the node.
import {
  collectFoldedReceiverSideEffects,
  unwrapRuntimeExpr,
  valueMayBeNullish,
  walkAstChildren,
} from './ast-patterns.js';
import { resolveSymbolInEntry } from '../detect-usage/members.js';

// does the operand the fold would DISCARD carry an `in` of its own? that one THROWS on a bad right
// operand, and the harvest replays calls and structural effects - not a nested throw. erasing it
// would swallow the very error the inner test exists to raise, so the outer keeps its test instead
function discardedOperandOwnsInTest(node) {
  const stack = [node];
  for (let cur = stack.pop(); cur; cur = stack.pop()) {
    if (cur !== node && cur.type === 'BinaryExpression' && cur.operator === 'in') return true;
    walkAstChildren(cur, child => stack.push(child));
  }
  return false;
}

// `true` under either parser spelling (babel `BooleanLiteral`, ESTree `Literal` with a true value)
function isTrueLiteralNode(node) {
  return node?.type === 'BooleanLiteral' ? node.value === true : node?.type === 'Literal' && node.value === true;
}

// the fold discards BOTH operands whole (each replayed only through the structural SE harvest),
// shared by the static-receiver and typed-instance-receiver branches below
function foldPlan({ meta, left, right }) {
  // BOTH receiver branches ask this before folding, so it lives with the fold itself: the operand
  // the constant would DISCARD must not be able to hand `in` something it throws on (a value that
  // short-circuits, whatever the resolved type hint claims) and must not carry an `in` of its own
  // (its throw is not among the effects the harvest replays). either way the test stays live and
  // the constant answers after it
  if (valueMayBeNullish(right) || discardedOperandOwnsInTest(right)) {
    return { kind: 'fold-after-test', leadingSe: [], skip: null };
  }
  const rescue = new Set(meta.sideEffects);
  const leadingSe = [
    ...collectFoldedReceiverSideEffects(unwrapRuntimeExpr(left)),
    ...collectFoldedReceiverSideEffects(unwrapRuntimeExpr(right), [], rescue),
  ];
  // defensive: a chain-root call the structural walk could not position (shape mismatch) keeps the
  // old append slot rather than being dropped
  for (const e of meta.sideEffects ?? []) if (rescue.has(e)) leadingSe.push(e);
  return { kind: 'fold', leadingSe, skip: [left, right] };
}

export function planInExpression({ meta, left, right, isEntryNeeded, resolveFallback, receiverHint = null, parent = null }) {
  // the kept-test spelling re-enters on a SECOND pass - the unplugin emitter runs before AND after babel
  // in the sandwich, and the test it keeps still reads as a foldable probe. recognising our own
  // output by shape is what stops the wrap from wrapping itself. a hand-written `(k in o, true)`
  // matches too: it folds to itself, so declining is the same answer
  if (parent?.type === 'SequenceExpression' && parent.expressions?.length === 2
    && parent.expressions[0]?.type === 'BinaryExpression' && parent.expressions[0].operator === 'in'
    && isTrueLiteralNode(parent.expressions[1])) {
    return { kind: 'noop' };
  }
  // symbol-sourced LHS (`Symbol.X in obj` / alias binding): polyfill the symbol entry.
  // Symbol.iterator rewrites to a get-iterator call (`call` shape); any other symbol keeps the
  // membership test with the binding swapped in. LHS may carry SE (computed-key sequence /
  // wrapped receiver) the rewrite would otherwise drop, so harvest it to re-prepend
  const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
  if (symbolIn && isEntryNeeded(symbolIn.entry)) {
    // the rewrite REPLACES the LHS value with the symbol import, so EVERY side effect around the symbol
    // must be harvested to re-prepend - not just a top sequence prefix but its nested tails, computed
    // keys, `+`/template key concats and assignment receivers. that is exactly the structural harvest the
    // fold path uses (`collectFoldedReceiverSideEffects`); a non-recursive prefix-only walk dropped a
    // nested-sequence tail (`(g(), (h(), Symbol)).iterator` lost `h()`). the chain-root receiver CALL
    // (`meta.sideEffects`, harvested scope-aware at detection so a provably-pure inline call is dropped)
    // threads in as `rescue` so it INTERLEAVES at its true source position - a lexical prefix runs before
    // it (`(p(), IIFE()).Symbol.iterator` -> source order [p, IIFE]) - with any unplaced rescue appended
    const rescue = new Set(meta.sideEffects);
    const leadingSe = collectFoldedReceiverSideEffects(unwrapRuntimeExpr(left), [], rescue);
    for (const e of meta.sideEffects ?? []) if (rescue.has(e)) leadingSe.push(e);
    // the rewrite REPLACES the LHS value (`Symbol.iterator in x` -> `_isIterable(x)`), so the LHS is
    // discarded whole - the unplugin emitter must mark it (and any polyfillable subtree it buries, e.g. a
    // sequence-prefix proxy-global `(globalThis, Symbol.iterator) in x`) skipped or that rewrite has no
    // target in the replacement. the RHS survives, re-emitted verbatim, so it is NOT in `skip`
    return {
      kind: 'symbol', call: meta.key === 'Symbol.iterator',
      entry: symbolIn.entry, hint: symbolIn.hint, leadingSe, right, skip: [left],
    };
  }
  // bare-name LHS with a statically-known polyfilled key (`'from' in Array`) folds to `true` (the
  // polyfill is always defined). BOTH operands still evaluate their side effects even though the
  // result is constant, in source-eval order (`a in b` runs the key `a` then the object `b`).
  // because the fold DISCARDS each operand whole, nothing survives to carry a trailing value, so a
  // sequence tail and a computed key are side effects too - `collectFoldedReceiverSideEffects` is the
  // structural harvest (peeling parens / chain / TS wrappers like `(y = Map) as any`), closing the
  // prior prefix-only gap that dropped SE sequence-tails and computed keys. a value-position bare
  // RECEIVER call is left to detection's `meta.sideEffects` (scope-aware: drops a provably-pure inline
  // call); it is threaded into the RHS harvest as `rescue` so it INTERLEAVES at its true source
  // position (the object terminus) - `'k' in mk()[(eff(), 'K')]` runs `mk()` before the key effect,
  // which a fixed append/prepend slot could not reproduce when the object also has its own SE prefix.
  // `skip` names the discarded operand the emitters mark skipped; the rescued SE subtrees
  // stay visitable, re-emitted by the replacement
  // the fold replaces the WHOLE node with `true`, so BOTH operands are discarded - each must
  // be marked skipped or a polyfillable subtree left in the LHS key (`(globalThis, 'from') in Array`)
  // stays visitable and its rewrite lands inside the replaced region (the replacement drops both by
  // replacing the node). rescued leadingSe subtrees are excluded from the skip - they are re-emitted
  if (meta.object) {
    if (!resolveFallback(meta).result) return { kind: 'noop' };
    return foldPlan({ meta, left, right });
  }
  // an UNAMBIGUOUSLY typed receiver folds like a static host: every actual use of the probed
  // method is substituted by the pure transform, so the polyfilled world's answer is `true`
  // (`'flat' in []` mirrors `'from' in Array`). gates: a single resolved string key (branch /
  // dynamic keys carry null), non-symbol provenance, an emitter-resolved receiver TYPE hint,
  // and the (type, key) pair resolving to a needed pure entry. an UNKNOWN receiver must not
  // fold off the Maybe-dispatch resolution - its runtime truth is genuinely engine-dependent
  if (meta.key && !meta.symbolSourced && receiverHint
    && resolveFallback({ kind: 'property', object: receiverHint, key: meta.key, placement: 'prototype' }).result) {
    return foldPlan({ meta, left, right });
  }
  return { kind: 'noop' };
}
