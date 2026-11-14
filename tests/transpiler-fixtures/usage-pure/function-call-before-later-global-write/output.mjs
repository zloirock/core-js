import _atob from "@core-js/pure/actual/atob";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A global function call before the write retains its string result.
export const result = _atMaybeString(_ref = _atob(input)).call(_ref, -1);
if (flag) _globalThis.atob = other;