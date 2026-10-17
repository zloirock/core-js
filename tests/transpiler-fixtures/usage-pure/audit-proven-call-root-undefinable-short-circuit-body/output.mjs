import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// a body that short-circuits internally reaches the same verdict through one test
export const shortCircuitBody = null == (() => null == _globalThis.window ? void 0 : _self)() ? void 0 : _Promise$resolve(4);