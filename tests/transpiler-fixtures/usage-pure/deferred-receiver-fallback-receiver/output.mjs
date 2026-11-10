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
const U = undefined;
const res = (({
  of
}) => typeof of)(U || (getA(() => {
  function g({
    from
  } = {
    from: _Array$from
  }) {
    return from([1]).length;
  }
  sink(g());
}), {
  of: _Array$of
}));
sink(res);
export { R as r };
export const effects = [];