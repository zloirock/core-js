import _Map from "@core-js/pure/actual/map/constructor";
// Single-quasi template literal `globalThis[`Map`]` must be treated like a static string key.
// Without recognising it, the inner `globalThis` would be rewritten twice and the flatten would double-emit.
const Map = _Map;
const inner = _Map;
const m = new Map();
m.set('a', inner);
export { m };