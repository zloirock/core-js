import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3, _ref4;
// An array host can wrap a keyed array level with prototype navigation.
// Both methods read the captured prototype before the sibling write completes.
let at, flat, tail;
[_ref, _ref2] = [{
  w: [Array]
}, 7], {
  w: _ref3
} = _ref, [,] = _ref3, {
  prototype: _ref4
} = Array, at = _atMaybeArray(_ref4), flat = _flatMaybeArray(_ref4), tail = _ref2;
use(at, flat, tail);