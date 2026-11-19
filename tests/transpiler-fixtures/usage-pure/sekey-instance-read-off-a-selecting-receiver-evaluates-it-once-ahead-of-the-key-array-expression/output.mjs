import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
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