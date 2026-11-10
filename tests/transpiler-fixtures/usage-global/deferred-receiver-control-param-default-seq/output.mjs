import "core-js/modules/es.array.of";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
const R = [];
function sink(value) {
  R[R.length] = value;
}
function getA(fn) {
  fn();
  return Array;
}
function f({
  of
} = (sink(0), Array)) {
  return typeof of;
}
sink(f());
export { R as r };
export const effects = [];