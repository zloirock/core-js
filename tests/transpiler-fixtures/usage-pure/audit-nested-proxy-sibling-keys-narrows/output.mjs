import _Set from "@core-js/pure/actual/set/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
// `{ window: { Set, Map } } = globalThis` extracts two sibling polyfill keys from one nested chain.
// Walker must keep iterating siblings after the first match so both Set and Map resolve.
const Set = _Set;
const Map = _Map;
const s = new Set([1, 2, 3]);
const m = new Map();
m.set('a', s);
const v = m.get('a');
const merged = v.union(new Set([4, 5]));
export { merged };