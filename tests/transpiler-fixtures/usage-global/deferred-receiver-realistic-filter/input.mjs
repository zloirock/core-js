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
