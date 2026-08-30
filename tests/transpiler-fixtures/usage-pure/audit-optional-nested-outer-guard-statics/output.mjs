import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
// outer-guarded statics composing in one statement: a static whose ARGUMENT is itself an outer-guarded
// static (two independent guard memos nest), and two outer-guarded statics side by side in an array. each
// static emits BARE into its own owning guard's body; the memos do not collide. distinct method per line.
let w;
let v;
const g = _globalThis;
export const nestedArg = null == (w = g) ? void 0 : _atMaybeArray(_ref = _Array$of(null == (v = _globalThis.window) ? void 0 : _atMaybeArray(_ref2 = _Array$from([1])).call(_ref2, 0))).call(_ref, 0);
export const arrayOfTwo = [null == (w = g) ? void 0 : _atMaybeArray(_ref3 = _Array$of(1)).call(_ref3, 0), null == (v = _globalThis.window) ? void 0 : _includesMaybeArray(_ref4 = _Array$from([2])).call(_ref4, 2)];