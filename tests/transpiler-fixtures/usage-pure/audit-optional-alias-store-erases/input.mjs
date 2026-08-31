// what a chain-assign store hands on is its VALUE, and the name of that value comes from the
// resolution canon - so an ALIAS of the realm proves the `?.` dead exactly as its literal spelling
// does, with a receiver-DEPENDENT tail as much as a receiver-independent one. definedness is the
// only boundary: an alias holding the environment probe, or holding no realm at all, keeps its guard
let w, a, u;
const gw = globalThis;
const probe = globalThis.window;
const plain = { self: {} };
export const dependentTail = ((w = gw))?.Array.of(5).at(0);
export const overProbeAlias = ((a = probe))?.self.Set.prototype.add.name;
export const overPlainAlias = ((u = plain))?.self.WeakMap.prototype.get.name;
