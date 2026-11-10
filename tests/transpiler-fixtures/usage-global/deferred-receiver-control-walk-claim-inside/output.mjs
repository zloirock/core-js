import "core-js/modules/es.array.at";
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
const res = (({
  of
}) => typeof of)(getA(() => {
  sink([7].at(0));
}));
sink(res);
export { R as r };
export const effects = [];