import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// a TS-cast wrapping a chain-assign / proxy-nav guard root: the cast is meaningless after the polyfill swap
// but its operand parens are semantically required, so the guard-root render peels redundant parens yet keeps
// the cast grouped. covers a defined alias root (verdict erase) and an undefinable window root (verdict guard)
// each under an outer instance dispatch. distinct method per line.
let w: any;
let v: any;
const g = _globalThis;
export const aliasCast = null == (_ref = (w = g) as any) ? void 0 : _at(_ref2 = _Array$from([1])).call(_ref2, 0);
export const windowCast = null == (_ref3 = (v = _globalThis.window) as any) ? void 0 : _includes(_ref4 = _Array$of(5)).call(_ref4, 5);