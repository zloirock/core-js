// Normalized decision for a polyfillable `key in obj` expression, shared by both emitters so the
// branch selection and side-effect harvest live in one place and cannot diverge. The caller
// renders the returned node references its own way (babel cloneNode / unplugin nodeSrc); a text
// emitter additionally marks the discarded operand skipped, while an AST emitter drops it
// implicitly by replacing the node.
import {
  collectFoldedReceiverSideEffects,
  unwrapRuntimeExpr,
} from './ast-patterns.js';
import { resolveSymbolInEntry } from '../detect-usage/members.js';

export function planInExpression({ meta, left, right, isEntryNeeded, resolveFallback }) {
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
    return { kind: 'symbol', call: meta.key === 'Symbol.iterator', entry: symbolIn.entry, hint: symbolIn.hint, leadingSe, right };
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
  // `skip` names the discarded operand a text emitter marks skipped (an AST emitter drops it by
  // replacing the node); the rescued SE subtrees stay visitable, re-emitted by the replacement
  if (meta.object) {
    if (!resolveFallback(meta).result) return { kind: 'noop' };
    const rescue = new Set(meta.sideEffects);
    const leadingSe = [
      ...collectFoldedReceiverSideEffects(unwrapRuntimeExpr(left)),
      ...collectFoldedReceiverSideEffects(unwrapRuntimeExpr(right), [], rescue),
    ];
    // defensive: a chain-root call the structural walk could not position (shape mismatch) keeps the
    // old append slot rather than being dropped
    for (const e of meta.sideEffects ?? []) if (rescue.has(e)) leadingSe.push(e);
    return { kind: 'fold', leadingSe, skip: right };
  }
  return { kind: 'noop' };
}
