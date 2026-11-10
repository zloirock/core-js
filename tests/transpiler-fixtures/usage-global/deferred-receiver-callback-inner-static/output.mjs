import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/web.dom-collections.values";
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
  values
} = useMemo(() => {
  const {
    fromEntries
  } = Object;
  return fromEntries([['a', 1]]);
});
sink(typeof values);
export { R as r };
export const effects = [];