import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// An assignment with two effectful computed keys evaluates each key before reading
// its method. Both bindings share the original receiver and keep source order.
let x, y;
_ref = arr, null == _ref ? _ref[""] : (e1(), x = _flatMaybeArray(_ref)), null == _ref ? _ref[""] : (_ref2 = _ref, null == _ref2 ? _ref2[""] : (e2(), y = _at(_ref2)), _ref2), _ref;