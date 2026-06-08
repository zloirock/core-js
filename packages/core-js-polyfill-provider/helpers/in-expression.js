// Normalized decision for a polyfillable `key in obj` expression, shared by both emitters so the
// branch selection and side-effect harvest live in one place and cannot diverge. The caller
// renders the returned node references its own way (babel cloneNode / unplugin nodeSrc); a text
// emitter additionally marks the discarded operand skipped, while an AST emitter drops it
// implicitly by replacing the node.
import { sequencePrefixWithSideEffects, visitSymbolInLhsSe } from './ast-patterns.js';
import { resolveSymbolInEntry } from '../detect-usage/members.js';

export function planInExpression({ meta, left, right, unwrap, isEntryNeeded, resolveFallback }) {
  // symbol-sourced LHS (`Symbol.X in obj` / alias binding): polyfill the symbol entry.
  // Symbol.iterator rewrites to a get-iterator call (`call` shape); any other symbol keeps the
  // membership test with the binding swapped in. LHS may carry SE (computed-key sequence /
  // wrapped receiver) the rewrite would otherwise drop, so harvest it to re-prepend
  const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
  if (symbolIn && isEntryNeeded(symbolIn.entry)) {
    const leadingSe = [];
    visitSymbolInLhsSe(left, e => leadingSe.push(e));
    return { kind: 'symbol', call: meta.key === 'Symbol.iterator', entry: symbolIn.entry, hint: symbolIn.hint, leadingSe, right };
  }
  // bare-name LHS with a statically-known polyfilled key (`'from' in Array`) folds to `true`
  // (the polyfill is always defined). BOTH operands still evaluate their SE even though the
  // result is constant: a SequenceExpression keeps its SE-bearing prefix and drops the consumed
  // tail; an AssignmentExpression RHS is kept whole (rescues the assignment + binding update); a
  // CallExpression RHS is intentionally NOT rescued (SE-bearing IIFEs are filtered upstream).
  // `skip` names the single operand the fold discards, so a text emitter can mark it skipped (an
  // AST emitter drops it implicitly by replacing the node); null when nothing is discarded
  if (meta.object) {
    if (!resolveFallback(meta).result) return { kind: 'noop' };
    const leadingSe = [];
    const lhsPrefix = sequencePrefixWithSideEffects(unwrap(left));
    if (lhsPrefix) leadingSe.push(...lhsPrefix);
    const rhs = unwrap(right);
    const rhsPrefix = sequencePrefixWithSideEffects(rhs);
    let skip = right;
    if (rhsPrefix) {
      leadingSe.push(...rhsPrefix);
      skip = rhs.expressions.at(-1);
    } else if (rhs?.type === 'AssignmentExpression') {
      leadingSe.push(rhs);
      skip = null;
    }
    return { kind: 'fold', leadingSe, skip };
  }
  return { kind: 'noop' };
}
