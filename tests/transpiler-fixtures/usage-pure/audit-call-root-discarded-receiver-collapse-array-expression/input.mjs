// A DISCARDED call/IIFE-rooted proxy receiver with a pure-ctor leaf whole-swaps the leaf and re-emits every side effect the
// dropped navigation carried - the SE-bearing chain-root call, a computed hop-key effect, and an effect buried in the LEAF's own
// computed key - in source order ahead of it.
let c = 0;
function sf() {
  c++;
  return globalThis;
}
const { groupBy } = sf()[(c++, 'self')].Map;
export const r = [typeof groupBy, c];
