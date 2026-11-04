import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
export const viaNestedIifes = (_ref => {
  let fill = _fillMaybeArray(_ref);
  return (_ref2 => {
    let concat = _concatMaybeArray(_ref2);
    return concat;
  })([1, [2]]);
})([3, 4]);