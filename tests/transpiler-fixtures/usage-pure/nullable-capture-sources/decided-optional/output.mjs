import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// An optional reader of a decided selection keeps its undefined result.
export const from = null == _globalThis.window?.Array ? void 0 : _Array$from;