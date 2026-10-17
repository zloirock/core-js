import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
let c;
export const throughParens = null == (c = _globalThis.window) ? void 0 : _includesMaybeArray(c.Array.prototype).call([1], 1);