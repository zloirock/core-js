import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a TYPE-annotation position never re-routes through the mutated slot - only value reads do
_globalThis.Map = function ShimMap() {};
const x: Map<string, number> = new (_globalThis.Map === undefined ? _Map : _globalThis.Map)();
export default x;