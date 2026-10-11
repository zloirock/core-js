// a presence test of a prototype method decides like a test of its constructor where core-js implements
// the method on the constructor pure substitutes: the `||` guard never runs its install, and every read
// takes the pure import. a method the build data does not name leaves the guard to the engine - the test
// and the reads after the install stay the user's
if (!window.Promise || !window.Promise.prototype.finally) window.Promise = PromiseShim;
export const ready = Promise.resolve(1);
if (typeof Set === 'undefined' || typeof Set.prototype.union !== 'function') self.Set = SetShim;
export const merged = new Set(list);
if (!window.Map || !window.Map.prototype.getOrInsert) window.Map = MapShim;
export const cache = new Map();
