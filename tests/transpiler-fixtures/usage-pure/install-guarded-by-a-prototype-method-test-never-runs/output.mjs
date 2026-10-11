import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// a presence test of a prototype method decides like a test of its constructor where core-js implements
// the method on the constructor pure substitutes: the `||` guard never runs its install, and every read
// takes the pure import. a method the build data does not name leaves the guard to the engine - the test
// and the reads after the install stay the user's
if (!_Promise.prototype.finally) window.Promise = PromiseShim;
export const ready = _Promise$resolve(1);
if (typeof _Set.prototype.union !== 'function') _self.Set = SetShim;
export const merged = new _Set(list);
if (!window.Map || !window.Map.prototype.getOrInsert) window.Map = MapShim;
export const cache = new Map();