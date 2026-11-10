import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
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
  const g = ({
    from
  } = Array) => from([1]).length;
  sink(g());
}));
sink(res);
export { R as r };
export const effects = [];