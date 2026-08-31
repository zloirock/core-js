import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// a TS-cast wrapping a chain-assign root: the cast is meaningless after the polyfill swap but its operand
// parens are semantically required, so the render peels the redundant ones and keeps the cast grouped
// wherever the root survives. a defined alias root erases (the assign folds into the collapsed receiver),
// an undefinable window root keeps its guard - and that is the row the cast has to stay grouped in.
// each under an outer instance dispatch; distinct method per line
let w: any;
let v: any;
const g = _globalThis;
export const aliasCast = _atMaybeArray(_ref = (w = g, _Array$from)([1])).call(_ref, 0);
export const windowCast = null == (v = _globalThis.window) as any ? void 0 : _includesMaybeArray(_ref2 = _Array$of(5)).call(_ref2, 5);