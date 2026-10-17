import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
let b;
export const effectAroundAssign = null == (c++, b = _globalThis.window) ? void 0 : _atMaybeArray(b.Array.prototype).call([1], 0);
export { c };