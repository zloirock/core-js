// an optional proxy chain whose root STORES a defined realm value: the `?.` guards the store's result,
// which is that value, so the guard is dead whichever way the root is spelled - a sequence with an
// assignment tail, a bare chain-assign, a sequence with no assignment at all. all three erase and fold
// their effects (`c++`, `e++`, the assign) exactly ONCE into the collapsed receiver; a second fold
// would double-run them. the value here is an ALIAS of the realm, which answers as its literal does.
// distinct ctor + method per line
let n, c, a, e;
const gw = globalThis;
export const seqAssign = ((c++, n = gw))?.self.Map.prototype.has.name;
export const chainAssign = ((a = gw))?.self.Set.prototype.add.name;
export const noAssign = ((e++, gw))?.self.WeakMap.prototype.get.name;
export { c, e };
