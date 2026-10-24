import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
let k5 = 0;
const userObj = {
  flatMap: undefined
};
function pick(c) {
  var _ref = c ? [5] : userObj,
    fm = (k5++, _flatMapMaybeArray(_ref)),
    {
      other5
    } = _ref;
  return typeof fm;
}
export const r5 = [pick(true), pick(false), k5];