import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// A stored surface contributes one environment probe to both optional reads.
let held;
let effects = 0;
export const value = (null == (held = (effects++, _self)).window ? void 0 : _Array$from)?.((effects++, [1]));
export { held, effects };