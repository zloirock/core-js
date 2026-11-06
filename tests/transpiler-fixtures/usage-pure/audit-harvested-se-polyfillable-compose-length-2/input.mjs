// A retained realm-key read keeps its nested static claim and assignment effect.
let a2;
function sf() {
  return globalThis;
}
const { groupBy } = sf()[(a2 = Object.entries({ q: 1 }), 'self')].Map;
export const r3 = [typeof groupBy, a2.length];
