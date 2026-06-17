import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// the computed key's side effect REASSIGNS the receiver binding. the instance extraction is emitted BEFORE
// the residual (which runs the key effect), so the polyfill read sees the receiver as it was before the key
// - matching native, which reads the property off the RHS value evaluated ahead of the key. emitting the
// extraction after the residual would read the reassigned binding (wrong receiver)
let arr = [[1], [2]];
const m = _flatMaybeArray(arr);
const {
  [(arr = [[9]], 'flat')]: _unused
} = arr;
const probe = _includesMaybeArray(_ref = [3]).call(_ref, 3);