import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user-written `_ref0`/`_ref1` look like plugin-emitted refs but the plugin's UID
// scheme skips 0 and 1. orphan-adoption regex must reject these so the plugin
// doesn't quietly hoist `var _ref0;` and convert sloppy globals into module-locals
let _ref0 = 1;
let _ref1 = 2;
const arr = [_ref0, _ref1];
_globalThis.__r = _atMaybeArray(arr).call(arr, -1);