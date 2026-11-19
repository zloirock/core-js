import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// Every kept store and prefix belongs to the probe, before either guard outcome.
let first, second;
const holder = {};
export const direct = null == (effect(), first = second = _globalThis.window) ? void 0 : _Array$from([7]);
export const member = null == (holder.first = holder.second = _globalThis.window) ? void 0 : _Map;
export const wrapped = (null == (effect(), first = second = _globalThis.window) ? void 0 : _Array$of)?.(2);
export const nested = null == (effect(), other(), first = _globalThis.window) ? void 0 : _Array$from([1]);
export { first, second, holder };