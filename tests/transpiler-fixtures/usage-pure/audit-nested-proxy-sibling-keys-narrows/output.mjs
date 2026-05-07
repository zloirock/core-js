import _Set from "@core-js/pure/actual/set/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
// sibling polyfill keys under the same proxy-global intermediate: `window` carries
// both Set and Map. walkProxyDestructurePattern continues iterating siblings after
// the first match, so each sibling resolves independently through the same nested
// chain. tests recursion + multi-key resolution in one nested ObjectPattern
const Set = _Set;
const Map = _Map;
const s = new Set([1, 2, 3]);
const m = new Map();
m.set('a', s);
const v = m.get('a');
const merged = v.union(new Set([4, 5]));
export { merged };