import _Map from "@core-js/pure/actual/map";
// A descriptor write through a TS wrapper keeps the following call on the mutated constructor.
Object.defineProperty(_Map, 'groupBy', {
  value: dpPatch
});
export const r3 = _Map.groupBy(y, g);