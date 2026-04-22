import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user-written `_ref0`/`_ref1` stay user-owned; the plugin never generates those names
let _ref0 = 1;
let _ref1 = 2;
const arr = [_ref0, _ref1];
_globalThis.__r = _atMaybeArray(arr).call(arr, -1);