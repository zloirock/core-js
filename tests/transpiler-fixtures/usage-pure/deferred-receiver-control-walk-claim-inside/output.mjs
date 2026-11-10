import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
const R = [];
function sink(value) {
  R[R.length] = value;
}
function getA(fn) {
  fn();
  return Array;
}
const res = (({
  of
}) => typeof of)((getA(() => {
  var _ref;
  sink(_atMaybeArray(_ref = [7]).call(_ref, 0));
}), {
  of: _Array$of
}));
sink(res);
export { R as r };
export const effects = [];