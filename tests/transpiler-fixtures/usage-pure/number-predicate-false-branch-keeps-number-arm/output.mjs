import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isSafeInteger from "@core-js/pure/actual/number/is-safe-integer";
// `Number.isFinite` and `Number.isSafeInteger` hold for only part of `number`: a false answer leaves the
// argument a possible number (`NaN`, `1.5`), so where the test failed the union keeps its number arm
// and a member only that arm carries still injects - only a true answer narrows
export function viaNegatedTest(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  if (!_Number$isFinite(x)) return _toFixedMaybeNumber(x).call(x, 1);
}
export function viaLogicalOr(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _Number$isSafeInteger(x) || _toExponentialMaybeNumber(x).call(x, 1);
}