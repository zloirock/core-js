import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Literal receivers with computed keys preserve receiver, key, property, and sibling order.
// Ordinary and for-init var declarations keep the entire sequence in their source slot.
// Each key effect and property read runs once.
let k = 0;
var _ref = [7, 8],
  _ref2 = _ref,
  a = null == _ref2 ? _ref2[""] : (k++, _atMaybeArray(_ref2)),
  {
    other
  } = _ref,
  z = 1;
for (var _ref3 = [[1], 2], _ref4 = _ref3, f = null == _ref4 ? _ref4[""] : (k++, _flatMaybeArray(_ref4)), {
    other2
  } = _ref3, i = 0; i < 1; i++) console.log(f);
var _ref5 = [5, 6],
  _ref6 = _ref5,
  inc = null == _ref6 ? _ref6[""] : (k++, _includesMaybeArray(_ref6)),
  {
    other3
  } = _ref5;
console.log(a, z, inc, k, other, other2, other3);