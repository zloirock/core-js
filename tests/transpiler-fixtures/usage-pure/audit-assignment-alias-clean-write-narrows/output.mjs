import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a CLEAN assignment-form ctor alias (the binding's single, unconditionally-placed write): member
// reads narrow through the registered trusted write - the whole-swap (`M = _Map`) alone would strand
// a separate static on the bare pure ctor (`M.groupBy` undefined off the constructor entry). the
// array-wrapped form pairs the slot through the wrapper the same way
let M;
M = _Map;
export const r = typeof _Map$groupBy;
let A;
A = _Map;
export const q = typeof _Map$groupBy;