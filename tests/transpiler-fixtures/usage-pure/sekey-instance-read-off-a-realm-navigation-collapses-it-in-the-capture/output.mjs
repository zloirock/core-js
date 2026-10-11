import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _self from "@core-js/pure/actual/self";
// an instance read under an effectful computed key off a realm navigation collapses the navigation inside
// the receiver it captures, and an effectful prefix stays with that capture and runs once
let k15 = 0;
var _ref = _self.Array.prototype,
  a15 = (k15++, _atMaybeArray(_ref)),
  {
    other15
  } = _ref;
export const r15 = [typeof a15, k15];
let k16 = 0,
  s16 = 0;
var _ref2 = (s16++, _self.Array.prototype),
  f16 = (k16++, _flatMaybeArray(_ref2)),
  {
    other16
  } = _ref2;
export const r16 = [typeof f16, k16, s16];