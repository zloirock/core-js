import _includes from "@core-js/pure/actual/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3, _ref4;
// optional chain over a polyfillable global followed by instance polyfill: receiver memoized
// in `_ref` and reused in the polyfill call. inner `?.` deopts apply only to the optional hop
export const a = null == (_ref = _globalThis.foo) ? void 0 : _includes(_ref).call(_ref, 1);
export const b = null == (_ref2 = _globalThis.foo?.bar) ? void 0 : _at(_ref2).call(_ref2, 0);
export const c = null == (_ref3 = _Promise?.foo) ? void 0 : _includes(_ref3).call(_ref3, 2);
export const d = null == (_ref4 = _Map?.x) ? void 0 : _includes(_ref4).call(_ref4, 3);