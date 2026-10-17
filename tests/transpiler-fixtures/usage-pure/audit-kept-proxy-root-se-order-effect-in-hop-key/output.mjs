import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
let d;
export const effectInHopKey = null == (d = _globalThis.window) ? void 0 : _includesMaybeArray(d[c++, "Array"].prototype).call([1], 1);
export { c };