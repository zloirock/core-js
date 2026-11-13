import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// A sequence prefix runs once in the environment probe. An instance consumer
// captures that receiver before dispatch; a terminal realm claim keeps the same
// sequence in its test. Both hosts preserve the source order and guard.
let c = 0;
function a() {}
export const instanceTail = null == (_ref = (c++, _globalThis.window)) ? void 0 : _nameMaybeFunction(_ref.Array);
export const plainTail = null == (c++, _globalThis.window) ? void 0 : _self.foo;
export const nestedSequence = null == (_ref2 = (a(), c++, _globalThis.window)) ? void 0 : _nameMaybeFunction(_ref2.Array);
// ... and the prefix already standing INSIDE the probe hop, which must not be re-emitted beside it
export const prefixUnderTheProbe = null == (_ref3 = (c++, _globalThis).window) ? void 0 : _nameMaybeFunction(_ref3.Array);
// controls
export const terminalNav = null == (c++, _globalThis.window) ? void 0 : _self;
export const deadPrefix = null == (_ref4 = (0, _globalThis.window)) ? void 0 : _nameMaybeFunction(_ref4.Array);
export const noSequence = null == (_ref5 = _globalThis.window) ? void 0 : _nameMaybeFunction(_ref5.Array);
export { c };