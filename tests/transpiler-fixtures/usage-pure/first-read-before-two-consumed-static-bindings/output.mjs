import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
prefix();
// Both keys disappear, but their initializer reads the prefix before either binding.
export const from = ((null == _globalThis.window ? void 0 : _self).Array, _Array$from);
export const of = _Array$of;