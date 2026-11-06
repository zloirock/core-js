import _Map from "@core-js/pure/actual/map";
// A literal IIFE retains the effect before its returned wrapper exactly once.
// The substituted constructor must carry the native pattern static.
let hits = 0;
const {
  C: {
    groupBy
  }
} = (() => (hits++, {
  C: _Map
}))();
export const r = [typeof groupBy, hits];