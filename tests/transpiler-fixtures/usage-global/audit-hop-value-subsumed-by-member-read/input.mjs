// a hop-member VALUE read consumed by a RESOLVED member injects only that member's modules
// (the deps chain carries the receiver requirement) - not the whole value entry. distinct
// global per line so each cell's import set is attributable
globalThis.Reflect.ownKeys(obj1);
// a bare VALUE use keeps the whole entry (any member may be read off it downstream)
export const M = globalThis.Map;
// a DYNAMIC outer key keeps the entry too
globalThis.Set[dyn](obj2);
// a WRITE host outer member keeps the constructor injection (the mutated-static receiver)
globalThis.WeakMap.customExt = 1;
// a proxy-hop key is never subsumed: its entry backs the hop read itself (the wide iterator
// set below is the `from` entry's own dependency closure - bare `Iterator.from` injects the same)
globalThis.self.Iterator.from(it1);
