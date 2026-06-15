import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// the chain-root call of a folded `in` receiver is buried in a SequenceExpression tail
// (`(eff(), mk()).Array`). the fold discards the receiver, but `mk()` carries an observable effect
// and must still run - earlier the sequence wrapper hid it from the chain-root probe and it was
// dropped. the leading push (sequence prefix) and `mk()` (sequence tail) both run, in source order
const log = [];
function mk() {
  _pushMaybeArray(log).call(log, 2);
  return _globalThis;
}
const r = (_pushMaybeArray(log).call(log, 1), mk(), true);
export { r };