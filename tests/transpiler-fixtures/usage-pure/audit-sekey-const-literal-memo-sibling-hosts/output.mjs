import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Literal receivers with computed keys preserve receiver, key, property, and sibling order.
// Ordinary and for-init var declarations keep the entire sequence in their source slot.
// Each key effect and property read runs once.
let k = 0;
var _ref = [7, 8],
  a = null == _ref ? _ref[""] : (k++, _atMaybeArray(_ref)),
  {
    other
  } = _ref,
  z = 1;
for (var _ref2 = [[1], 2], f = null == _ref2 ? _ref2[""] : (k++, _flatMaybeArray(_ref2)), {
    other2
  } = _ref2, i = 0; i < 1; i++) console.log(f);
var _ref3 = [5, 6],
  inc = null == _ref3 ? _ref3[""] : (k++, _includesMaybeArray(_ref3)),
  {
    other3
  } = _ref3;
console.log(a, z, inc, k, other, other2, other3);