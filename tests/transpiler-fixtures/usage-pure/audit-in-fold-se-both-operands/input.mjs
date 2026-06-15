// `key in obj` folds to constant `true`, but BOTH operands still evaluate their side effects in
// source-eval order - per ECMA the key (left) runs before the object (right). neither operand's
// value survives the fold, so each SequenceExpression prefix is preserved, left before right
const log = [];
const r = (log.push('k'), 'from') in (log.push('o'), Array);
export { r };
