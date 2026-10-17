import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
// the argument pairs by the PARAMETER's position; a rest sibling keeps the whole pattern native
export const viaMultiArgPairing = ((first, _ref, _unused = void 0) => {
  let entries = _entriesMaybeArray(_ref);
  return entries;
})(other, [1, 2]);