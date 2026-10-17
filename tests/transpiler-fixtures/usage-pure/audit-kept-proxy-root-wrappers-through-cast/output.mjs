import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Transparent wrappers preserve a kept proxy assignment, its live guard and the collapse of redundant backed hops. The assigned
// runtime value must remain unchanged.
let a;
export const throughCast = null == (a = _globalThis.window) ? void 0 : _flatMaybeArray(a.Array.prototype).call([1, [2]]);