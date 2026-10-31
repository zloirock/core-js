import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// A transparent type wrapper preserves the environment probe above a store.
// The optional static call keeps its argument on the defined branch only.
let held;
let effects = 0;
export const value = null == ((held = _self) as any).window ? void 0 : _Array$from((effects++, [1]));
export { held, effects };