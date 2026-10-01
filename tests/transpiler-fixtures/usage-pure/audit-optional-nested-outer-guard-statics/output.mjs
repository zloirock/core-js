import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
// statics composing in one statement, one root per definedness: a store of a defined realm alias erases
// its guard and folds the assign into the collapsed receiver, while a store of the environment PROBE
// keeps its own - so the guarded static nests inside the erased one's argument, and stands beside it in
// an array. each static emits BARE into the body that owns it and the memos do not collide.
// distinct method per line
let w;
let v;
const g = _globalThis;
export const nestedArg = _atMaybeArray(_ref = (w = g, _Array$of)(null == (v = _globalThis.window) ? void 0 : _atMaybeArray(_ref2 = _Array$from([1])).call(_ref2, 0))).call(_ref, 0);
export const arrayOfTwo = [_atMaybeArray(_ref3 = (w = g, _Array$of)(1)).call(_ref3, 0), null == (v = _globalThis.window) ? void 0 : _includesMaybeArray(_ref4 = _Array$from([2])).call(_ref4, 2)];