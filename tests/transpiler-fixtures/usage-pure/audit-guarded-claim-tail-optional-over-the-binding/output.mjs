import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref;
// A guarded computed tail preserves its environment probe and any write inside that probe.
// The unwritten key needs no static namespace. Deeper nullable receivers retain optional steps;
// lowering can also leave a redundant optional step on a backed constructor.
let key, kept;
export const computedTailOverClaim = null == _globalThis.window ? void 0 : _Map[key];
export const keptWriteTest = null == (kept = _globalThis.window) ? void 0 : _Map[key];
export const deeperOptionalStays = null == (_ref = null == _globalThis.window ? void 0 : _self.Array?.prototype) ? void 0 : _atMaybeArray(_ref);
export { kept };