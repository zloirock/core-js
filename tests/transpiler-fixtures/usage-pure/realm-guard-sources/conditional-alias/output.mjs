import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source guard and distinguish realm values from user properties.
const g = _globalThis;
const sel = flag ? g : _globalThis;
export const r = null == sel.window ? void 0 : _Array$from([3]);