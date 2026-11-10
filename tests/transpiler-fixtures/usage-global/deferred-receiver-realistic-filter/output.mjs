import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
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
const {
  find
} = items.filter(item => {
  const {
    includes
  } = item.tags;
  return includes.call(item.tags, 'a');
});
sink(find.call([1, 2], x => x > 1));
export { R as r };
export const effects = [];