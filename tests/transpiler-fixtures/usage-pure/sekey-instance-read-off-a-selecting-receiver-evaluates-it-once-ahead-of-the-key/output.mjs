import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise from "@core-js/pure/actual/promise/constructor";
// an instance read under an effectful computed key, off a selecting receiver - a ternary, a `||`, `??` or
// `&&`, an effectful arm or a sequence - evaluates that receiver once, ahead of the key's effect: a decided
// selection re-reads its live operand, any other is captured, guarded to throw on a nullish value before
// the key runs where it may be one, and a user arm reads through the Maybe dispatch
let k1 = 0;
var _ref = _Promise.prototype ? [7, 8] : [],
  a1 = (k1++, _atMaybeArray(_ref)),
  {
    other1
  } = _ref;
export const r1 = [typeof a1, k1];
let k2 = 0;
const arr2 = [1];
var f2 = (k2++, _flatMaybeArray(arr2)),
  {
    other2
  } = arr2;
export const r2 = [typeof f2, k2];
let k3 = 0;
const arr3 = [2];
var inc3 = (k3++, _includesMaybeArray(arr3)),
  {
    other3
  } = arr3;
export const r3 = [typeof inc3, k3];
let k4 = 0;
const arr4 = [3],
  arr5 = [4];
var _ref2 = arr4 && arr5,
  fl4 = null == _ref2 ? _ref2[""] : (k4++, _findLastMaybeArray(_ref2)),
  {
    other4
  } = _ref2;
export const r4 = [typeof fl4, k4];
let k5 = 0;
const userObj = {
  flatMap: undefined
};
function pick(c) {
  var _ref3 = c ? [5] : userObj,
    fm = (k5++, _flatMapMaybeArray(_ref3)),
    {
      other5
    } = _ref3;
  return typeof fm;
}
export const r5 = [pick(true), pick(false), k5];
let k10 = 0;
var _ref4 = k10 >= 0 ? _Array$of([1]) : [],
  f10 = null == _ref4 ? _ref4[""] : (k10++, _toReversedMaybeArray(_ref4)),
  {
    other10
  } = _ref4;
export const r10 = [typeof f10, k10];
let k11 = 0,
  s11 = 0;
var _ref5 = (s11++, s11 > 0 ? _Array$of(2) : []),
  inc11 = null == _ref5 ? _ref5[""] : (k11++, _findLastIndexMaybeArray(_ref5)),
  {
    other11
  } = _ref5;
export const r11 = [typeof inc11, k11, s11];