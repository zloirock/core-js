import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr2 = [3, [4]];
const holder = {
  arr: arr2
};
export const viaMemberSingleProp = function (_ref = holder.arr) {
  let at = _atMaybeArray(_ref);
  return typeof at;
}();