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
const {
  at
} = call(() => {
  const {
    includes
  } = call(() => {
    const {
      flat
    } = [[1], [2]];
    sink(flat.call([[1], [2]]).length);
  });
  sink(includes.call([1], 1));
});
sink(at.call([1, 2], -1));
export { R as r };
export const effects = [];
