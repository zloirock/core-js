import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// the seal over a LIVE `?.` was always rendered - its short-circuit is the guard's own subject
export const sealedRootLiveOptional = ((null == _globalThis.window ? void 0 : _self).window, _Promise$resolve)(1);