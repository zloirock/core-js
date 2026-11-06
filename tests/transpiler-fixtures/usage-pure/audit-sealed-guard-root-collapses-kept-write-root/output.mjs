import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
let b;
// NEGATIVE: a kept write under the `?.` - the guard tests the write, no seal to preserve
export const keptWriteRoot = null == (b = _globalThis.window) ? void 0 : _Array$of(5);