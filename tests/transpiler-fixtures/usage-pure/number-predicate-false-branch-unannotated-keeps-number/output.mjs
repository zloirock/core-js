import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$isNaN from "@core-js/pure/actual/number/is-nan";
// on an unannotated binding a type test excludes what its false answer rules out, but a false
// `Number.isNaN` or `Number.isInteger` rules out no number (`1.5` fails `isInteger`), so a member only
// numbers carry keeps its module where the test failed
export function viaEarlyReturn(x) {
  if (_Number$isNaN(x)) return;
  return _toFixedMaybeNumber(x).call(x, 1);
}
export function viaElse(x) {
  if (_Number$isInteger(x)) return null;else return _toExponentialMaybeNumber(x).call(x, 1);
}