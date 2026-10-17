import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// a TS cast around a parameter DEFAULT is printer trivia to the type the instance synth dispatches
// on: the default's path is read PEELED, like its node, so the array's own helper lands on both legs
// (one leg typed nothing off the wrapped path and fell to the typeless dispatch)
export function cast(_ref = [1, 2] as number[]) {
  let viaCast = _atMaybeArray(_ref);
  return viaCast;
}
export function assertion(_ref2 = <number[]> [1, 2]) {
  let viaAssertion = _atMaybeArray(_ref2);
  return viaAssertion;
}
export function nonNull(_ref3 = [1, 2]!) {
  let viaNonNull = _at(_ref3);
  return viaNonNull;
}