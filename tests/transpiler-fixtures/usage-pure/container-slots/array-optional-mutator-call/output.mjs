import _Map from "@core-js/pure/actual/map";
// An optional mutator call can reposition the array element read by the nested pattern.
const repositionedByOptionalCall = function () {
  const optionalMutated = [Object, _Map];
  optionalMutated?.reverse();
  const {
    0: {
      isExtensible
    }
  } = optionalMutated;
  return isExtensible;
}();
export { repositionedByOptionalCall };