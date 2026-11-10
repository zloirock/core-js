import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
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
const at = (_ref = _atMaybeArray(call(() => {
  const includes = _includesMaybeArray([1]);
  sink(includes.call([1], 1));
}))) === void 0 ? 0 : _ref;
sink(at.call([1, 2], -1));
export { R as r };
export const effects = [];