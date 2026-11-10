import _Array$from from "@core-js/pure/actual/array/from";
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
  of,
  isArray
}) => typeof of + typeof isArray)(function (_ref) {
  return {
    of: _Array$of,
    get isArray() {
      return _ref.isArray;
    }
  };
}(getA(() => {
  function g({
    from
  } = {
    from: _Array$from
  }) {
    return from([1]).length;
  }
  sink(g());
})));
sink(res);
export { R as r };
export const effects = [];