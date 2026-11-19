import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// `key in obj` folds to constant `true`, but BOTH operands still evaluate their side effects in
// source-eval order - per ECMA the key (left) runs before the object (right). neither operand's
// value survives the fold, so each SequenceExpression prefix is preserved, left before right
const log = [];
const r = (_pushMaybeArray(log).call(log, 'k'), _pushMaybeArray(log).call(log, 'o'), true);
export { r };