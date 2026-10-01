// Destructuring a repositioning method preserves its possible write to the array receiver.
const repositionedByDestructuredMethod = (function () {
  const patternBox = [Object, Map];
  const { reverse } = patternBox;
  reverse.call(patternBox);
  const { 0: { getOwnPropertyDescriptor } } = patternBox;
  return getOwnPropertyDescriptor;
})();
export { repositionedByDestructuredMethod };
