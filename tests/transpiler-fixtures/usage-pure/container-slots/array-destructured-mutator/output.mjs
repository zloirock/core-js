import _Map from "@core-js/pure/actual/map";
// Destructuring a repositioning method preserves its possible write to the array receiver.
const repositionedByDestructuredMethod = function () {
  const patternBox = [Object, _Map];
  const {
    reverse
  } = patternBox;
  reverse.call(patternBox);
  const {
    0: {
      getOwnPropertyDescriptor
    }
  } = patternBox;
  return getOwnPropertyDescriptor;
}();
export { repositionedByDestructuredMethod };