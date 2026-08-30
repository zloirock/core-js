import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref;
// the tail a guarded claim lifts into its alternate reads the substituted binding itself, and that
// binding is always defined - so the `?.` the source wrote directly on it guards nothing and lands
// plain. a kept WRITE standing in the test changes nothing about that. past the first step the
// value can be absent again, and a `?.` there still stands
let key, kept;
export const computedTailOverClaim = null == _globalThis.window ? void 0 : _Map[key];
export const keptWriteTest = null == (kept = _globalThis.window) ? void 0 : _Map[key];
export const deeperOptionalStays = null == (_ref = null == _globalThis.window ? void 0 : _self.Array?.prototype) ? void 0 : _atMaybeArray(_ref);
export { kept };