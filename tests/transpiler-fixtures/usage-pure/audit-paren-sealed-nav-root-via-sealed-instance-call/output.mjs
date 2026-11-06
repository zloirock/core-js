import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
export const viaSealedInstanceCall = _findIndexMaybeArray((null == _globalThis.window ? void 0 : _self.window).Array.prototype).call([8], v => v === 8);