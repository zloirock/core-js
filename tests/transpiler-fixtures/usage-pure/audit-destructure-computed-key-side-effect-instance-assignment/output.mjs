import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// A computed instance assignment captures its receiver, then runs the key before the method read.
// The key and getter each run once; the assignment still yields the captured receiver.
let m;
_ref = arr, null == _ref ? _ref[""] : (effectful(), m = _flatMaybeArray(_ref)), _ref;
const probe = _includesMaybeArray(_ref2 = [1, 2]).call(_ref2, 2);