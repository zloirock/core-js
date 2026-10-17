import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let x;
let c = 0;
let e;
export const effectBothSides = null == (c++, e = _globalThis.window) ? void 0 : _findLastMaybeArray(e[c++, "Array"].prototype).call([1], x => x);
export { c };