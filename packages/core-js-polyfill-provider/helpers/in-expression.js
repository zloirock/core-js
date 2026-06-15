// Normalized decision for a polyfillable `key in obj` expression, shared by both emitters so the
// branch selection and side-effect harvest live in one place and cannot diverge. The caller
// renders the returned node references its own way (babel cloneNode / unplugin nodeSrc); a text
// emitter additionally marks the discarded operand skipped, while an AST emitter drops it
// implicitly by replacing the node.
import {
  collectFoldedReceiverSideEffects,
  unwrapRuntimeExpr,
  visitSymbolInLhsSe,
} from './ast-patterns.js';
import { resolveSymbolInEntry } from '../detect-usage/members.js';

export function planInExpression({ meta, left, right, isEntryNeeded, resolveFallback }) {
  // symbol-sourced LHS (`Symbol.X in obj` / alias binding): polyfill the symbol entry.
  // Symbol.iterator rewrites to a get-iterator call (`call` shape); any other symbol keeps the
  // membership test with the binding swapped in. LHS may carry SE (computed-key sequence /
  // wrapped receiver) the rewrite would otherwise drop, so harvest it to re-prepend
  const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
  if (symbolIn && isEntryNeeded(symbolIn.entry)) {
    const leadingSe = [];
    // a folded chain root (IIFE) harvested at detection (`handleBinaryIn`, where scope/adapter live) runs
    // FIRST in source order; `visitSymbolInLhsSe` then adds any parens/sequence prefix SE the LHS carries
    if (meta.sideEffects?.length) leadingSe.push(...meta.sideEffects);
    visitSymbolInLhsSe(left, e => leadingSe.push(e));
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
  // call), appended last so it keeps its RHS-tail position after the structural RHS effects.
  // `skip` names the discarded operand a text emitter marks skipped (an AST emitter drops it by
  // replacing the node); the rescued SE subtrees stay visitable, re-emitted by the replacement
  if (meta.object) {
    if (!resolveFallback(meta).result) return { kind: 'noop' };
    const leadingSe = [
      ...collectFoldedReceiverSideEffects(unwrapRuntimeExpr(left)),
      ...collectFoldedReceiverSideEffects(unwrapRuntimeExpr(right)),
    ];
    if (meta.sideEffects?.length) leadingSe.push(...meta.sideEffects);
    return { kind: 'fold', leadingSe, skip: right };
  }
  return { kind: 'noop' };
}
