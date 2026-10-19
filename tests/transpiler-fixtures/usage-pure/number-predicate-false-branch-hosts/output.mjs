import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// the false answer of a partial number predicate proves nothing in any host a test sits in: the
// alternate of a conditional, and the false branch of a `||` group beside a `typeof` test - whose own
// false answer still rules strings out - keep the number arm and its members
export function viaConditional(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _Number$isFinite(x) ? null : _toFixedMaybeNumber(x).call(x, 1);
}
export function viaTypeofGroup(x: string | number | boolean) {
  if (typeof x === 'string' || _Number$isInteger(x)) return null;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _toExponentialMaybeNumber(x).call(x, 1);
}