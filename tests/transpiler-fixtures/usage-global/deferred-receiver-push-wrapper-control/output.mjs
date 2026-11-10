import "core-js/modules/es.array.push";
// Nested claims settle before an enclosing extraction or synth copies their receiver.
const R = [];
function sink(value) {
  R[R.length] = value;
}
function getA(fn) {
  fn();
  return Array;
}
const out = [];
out.push(1);
sink(out.length);
export { R as r };
export const effects = [];