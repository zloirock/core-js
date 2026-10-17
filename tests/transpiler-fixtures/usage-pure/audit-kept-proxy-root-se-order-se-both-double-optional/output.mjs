import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// An effect around the assignment AND one in a hop key, under TWO optionals: the value effect stays
// inside the root memo (always runs, as written), the key effect rides the migrated key past the
// guard - each lands in its native slot.
let svd;
export const seBothDoubleOptional = null == (c++, svd = _globalThis.window) ? void 0 : _findLastMaybeArray(svd[c++, "Array"].prototype).call([6], v => v);