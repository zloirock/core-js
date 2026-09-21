// Native and custom callers coexist without inferring constructors from method names.
// Only the proven Array.from read needs a static polyfill.
function native(held) { return held.from([1]); }
native(Array);
function read(held) {
  return [held.of([2]), held.resolve(3), held.allSettled([]), held.groupBy([4])];
}
read({
  of: values => values,
  resolve: value => value,
  allSettled: values => values,
  groupBy: values => values
});
