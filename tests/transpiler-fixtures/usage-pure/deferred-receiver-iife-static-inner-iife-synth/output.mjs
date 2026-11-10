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
  of
}) => typeof of)((getA(() => {
  sink((({
    from
  }) => from([1]).length)({
    from: _Array$from
  }));
}), {
  of: _Array$of
}));
sink(res);
export { R as r };
export const effects = [];