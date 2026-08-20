import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// outer-guarded statics composing in one statement: a static whose ARGUMENT is itself an outer-guarded
// static (two independent guard memos nest), and two outer-guarded statics side by side in an array. each
// static emits BARE into its own owning guard's body; the memos do not collide. distinct method per line.
let w;
let v;
const g = _globalThis;
export const nestedArg = null == (_ref = w = g) ? void 0 : _at(_ref2 = _Array$of(null == (_ref3 = v = _globalThis.window) ? void 0 : _at(_ref4 = _Array$from([1])).call(_ref4, 0))).call(_ref2, 0);
export const arrayOfTwo = [null == (_ref5 = w = g) ? void 0 : _at(_ref6 = _Array$of(1)).call(_ref6, 0), null == (_ref7 = v = _globalThis.window) ? void 0 : _includes(_ref8 = _Array$from([2])).call(_ref8, 2)];