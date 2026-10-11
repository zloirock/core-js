// a level the pure build keeps whole - a getter body with an effect, a spread or an unnameable key that
// could override the slot, a write to a numeric slot - is still read through in usage-global, which loads
// what the slot MIGHT hold: over-injection is its safe side
const other = {};
const { w: { WeakSet: keptByGetterEffect } } = { get w() { mark(); return globalThis; } };
function keptBySpread(extra) {
  const { w: { Array: { of: kept } } } = { w: globalThis, ...extra };
  return kept;
}
function keptByKey(key) {
  const ns = { Q: Array, [key]: Map };
  const { Q: { from: kept } } = ns;
  return kept;
}
const holder = { 0: globalThis };
holder[0] = other;
const { 0: { Promise: keptByWrite } } = holder;
function mark() {}
export default [keptByGetterEffect, keptBySpread({}), keptByKey('Q'), keptByWrite];
