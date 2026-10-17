import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
export const viaNestedIifes = ((_ref, _unused = void 0) => {
  let fill = _fillMaybeArray(_ref);
  return ((_ref2, _unused2 = void 0) => {
    let concat = _concatMaybeArray(_ref2);
    return concat;
  })([1, [2]]);
})([3, 4]);