import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a TS cast around the kept root: the fallback guard slices the bare assignment (both
// emitters), while a guard-ref rebuild keeps the wrapper INSIDE the memo
let tc;
export const optionalCastCall = null == (tc = _globalThis.window) ? void 0 : _Map.prototype.get.call(new _Map([[1, 2]]), 1);