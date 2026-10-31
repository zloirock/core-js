import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// a partial number predicate's false answer keeps the number arm inside a span a claim rebuilds as
// well: the argument of an instance dispatch takes its own number member there too
export function viaDispatchArgument(x: string | number, acc: string[]) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  if (!_Number$isInteger(x)) (_pushMaybeArray(acc) || 0).call(acc, _toFixedMaybeNumber(x).call(x, 1));
}