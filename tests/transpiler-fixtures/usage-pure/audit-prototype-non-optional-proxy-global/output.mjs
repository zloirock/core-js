import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// non-optional `<proxy-global>.<X>.prototype.method(...)` chain. proxy-global root
// at the leaf of the receiver must be polyfilled so `_globalThis.X.prototype.method`
// works on engines without native `globalThis` (ie11) - otherwise the outer call
// rewrite would emit `_method(_ref = globalThis.X.prototype).call(_ref)` verbatim
// and TypeError on the implicit `globalThis.X` lookup. covers the path with no `?.`
_flatMaybeArray(_ref = _globalThis.Array.prototype).call(_ref);