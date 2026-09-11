import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2;
// computed-key chain hop on a polyfillable global root: `?.['foo']` is semantically
// equivalent to `?.foo` for non-Symbol keys but exercises a different parser shape that
// must still substitute the leaf and emit the correct guard around the polyfill call
export const a = null == (_ref = _globalThis['foo']) ? void 0 : _includes(_ref).call(_ref, 1);
export const b = null == (_ref2 = _Promise?.['foo']) ? void 0 : _includes(_ref2).call(_ref2, 2);