import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a CTOR read through the guarded identity chain: the guard tests the window prefix, both
// legs construct the ponyfill (`new _Map`) - the arrow-paren reprint differs cosmetically
export const viaIdentityCtorNew = (null == (x => x)(_globalThis).window ? void 0 : _Map) && new _Map([[1, 2]]).size;