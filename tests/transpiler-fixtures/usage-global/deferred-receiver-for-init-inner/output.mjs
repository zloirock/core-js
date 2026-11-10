import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
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
for (const {
    at
  } = call(() => {
    const {
      includes
    } = [1];
    sink(includes.call([1], 1));
  }), i = 0; i < 1;) {
  sink(at.call([1, 2], -1));
  break;
}
export { R as r };
export const effects = [];