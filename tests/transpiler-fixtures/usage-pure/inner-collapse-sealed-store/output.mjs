import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// The sealed read keeps the throw and the independently served stored value.
let held;
export const value = ((null == (held = _self).window ? void 0 : _self).Array, _Array$from)([1]);
export { held };