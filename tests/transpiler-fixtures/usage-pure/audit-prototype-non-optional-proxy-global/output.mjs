import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// non-optional `<proxy-global>.<X>.prototype.method(...)` chain. proxy-global root at
// the leaf of the receiver is polyfilled so the rewrite reads `_globalThis.X.prototype`
// and works on engines without native `globalThis` (ie11). the outer call wrap then
// resolves the prototype lookup against the polyfilled root rather than the bare global.
// covers the path with no `?.`
_flatMaybeArray(_ref = _globalThis.Array.prototype).call(_ref);