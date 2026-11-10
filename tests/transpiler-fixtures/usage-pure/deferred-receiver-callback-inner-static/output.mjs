import _values from "@core-js/pure/actual/instance/values";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
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
const values = _values(useMemo(() => {
  const fromEntries = _Object$fromEntries;
  return fromEntries([['a', 1]]);
}));
sink(typeof values);
export { R as r };
export const effects = [];