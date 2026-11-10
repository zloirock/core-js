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
  sink((({
    from
  }) => from([1]).length)(Array));
}));
sink(res);
export { R as r };
export const effects = [];
