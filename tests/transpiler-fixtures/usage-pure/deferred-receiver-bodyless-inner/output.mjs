import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
const R = [];
function sink(value) {
  R[R.length] = value;
}
function useMemo(fn) {
  return fn();
}
function call(fn) {
  fn();
  return [1, 2];
}
if (R) var at = _atMaybeArray(call(() => {
  const includes = _includesMaybeArray([1]);
  sink(includes.call([1], 1));
}));
sink(at.call([1, 2], -1));
export { R as r };
export const effects = [];