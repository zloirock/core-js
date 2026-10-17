import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
let b;
export const throughNonNull = null == (b = _globalThis.window) ? void 0 : _atMaybeArray(b.Array.prototype).call([1], 0);