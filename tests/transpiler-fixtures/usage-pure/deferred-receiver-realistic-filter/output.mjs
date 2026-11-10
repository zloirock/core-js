import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includes from "@core-js/pure/actual/instance/includes";
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
const items = [{
  tags: ['a']
}, {
  tags: ['b']
}];
const find = _findMaybeArray(_filterMaybeArray(items).call(items, item => {
  const includes = _includes(item.tags);
  return includes.call(item.tags, 'a');
}));
sink(find.call([1, 2], x => x > 1));
export { R as r };
export const effects = [];