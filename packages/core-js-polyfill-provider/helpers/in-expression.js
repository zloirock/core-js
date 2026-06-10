// Normalized decision for a polyfillable `key in obj` expression, shared by both emitters so the
// branch selection and side-effect harvest live in one place and cannot diverge. The caller
// renders the returned node references its own way (babel cloneNode / unplugin nodeSrc); a text
// emitter additionally marks the discarded operand skipped, while an AST emitter drops it
// implicitly by replacing the node.
import { sequencePrefixWithSideEffects, unwrapRuntimeExpr, visitSymbolInLhsSe } from './ast-patterns.js';
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
  // bare-name LHS with a statically-known polyfilled key (`'from' in Array`) folds to `true`
  // (the polyfill is always defined). BOTH operands still evaluate their SE even though the
  // result is constant: a SequenceExpression keeps its SE-bearing prefix and drops the consumed
  // tail; an AssignmentExpression RHS is kept whole (rescues the assignment + binding update);
  // SE buried deeper in the discarded RHS chain (an SE-bearing chain-root call, a buried
  // chain-assignment) arrives pre-harvested in `meta.sideEffects` (detection has live
  // scope/adapter to inline-probe the call).
  // `skip` names the single operand the fold discards, so a text emitter can mark it skipped (an
  // AST emitter drops it implicitly by replacing the node); null when nothing is discarded
  if (meta.object) {
    if (!resolveFallback(meta).result) return { kind: 'noop' };
    const leadingSe = [];
    // peel parens / optional-chain / TS wrappers (`(y=Map) as any`) off both operands here, in the
    // shared planner, so the SE harvest is single-sourced (the symbol path peels the same way). a
    // caller-supplied `unwrap` once left this to the dialect - babel's was identity and dropped the
    // TS-wrapped assignment SE + its import, while unplugin rescued it (divergence)
    const lhsPrefix = sequencePrefixWithSideEffects(unwrapRuntimeExpr(left));
    if (lhsPrefix) leadingSe.push(...lhsPrefix);
    const rhs = unwrapRuntimeExpr(right);
    const rhsPrefix = sequencePrefixWithSideEffects(rhs);
    let skip = right;
    if (rhsPrefix) {
      leadingSe.push(...rhsPrefix);
      skip = rhs.expressions.at(-1);
    } else if (rhs?.type === 'AssignmentExpression') {
      leadingSe.push(rhs);
      skip = null;
    }
    // detection-harvested RHS chain SE runs in RHS position, after any RHS sequence prefix
    if (meta.sideEffects?.length) leadingSe.push(...meta.sideEffects);
    return { kind: 'fold', leadingSe, skip };
  }
  return { kind: 'noop' };
}
