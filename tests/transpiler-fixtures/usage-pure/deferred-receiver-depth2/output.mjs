import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
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
const at = _atMaybeArray(call(() => {
  const includes = _includesMaybeArray(call(() => {
    const flat = _flatMaybeArray([[1], [2]]);
    sink(flat.call([[1], [2]]).length);
  }));
  sink(includes.call([1], 1));
}));
sink(at.call([1, 2], -1));
export { R as r };
export const effects = [];