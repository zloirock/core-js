// A PURE constructor reached through a proxy-global and CONSUMED by `.prototype.<key>` (where `<key>` is
// NOT a separately-polyfilled instance method) whole-swaps to its pure import KEEPING `.prototype`:
// `globalThis.Map.prototype.has` -> `_Map.prototype.has`, ie:11-safe (native `_globalThis.Map` is undefined
// off-engine). covers a bare proxy receiver, a `.self` hop, and distinct ctors / methods. a polyfilled
// STATIC (`Map.groupBy`) and a bare `.prototype` access keep their own paths - no-over-swap controls.
const mapHas = globalThis.Map.prototype.has;
const setUnion = globalThis.self.Set.prototype.union;
const promiseThen = globalThis.Promise.prototype.then;
const grouped = globalThis.Map.groupBy([1], x => x);
const setProto = globalThis.Set.prototype;
export { mapHas, setUnion, promiseThen, grouped, setProto };