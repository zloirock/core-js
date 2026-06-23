import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// A PURE constructor reached through a proxy-global and CONSUMED by `.prototype.<key>` (where `<key>` is
// NOT a separately-polyfilled instance method) whole-swaps to its pure import KEEPING `.prototype`:
// `globalThis.Map.prototype.has` -> `_Map.prototype.has`, ie:11-safe (native `_globalThis.Map` is undefined
// off-engine). covers a bare proxy receiver, a `.self` hop, and distinct ctors / methods. a polyfilled
// STATIC (`Map.groupBy`) and a bare `.prototype` access keep their own paths - no-over-swap controls.
const mapHas = _Map.prototype.has;
const setUnion = _Set.prototype.union;
const promiseThen = _Promise.prototype.then;
const grouped = _Map$groupBy([1], x => x);
const setProto = _Set.prototype;
export { mapHas, setUnion, promiseThen, grouped, setProto };