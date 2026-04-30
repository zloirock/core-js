import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// async IIFE wraps return value in Promise; inline-call must bail.
// `(async () => Map)().has(1)` - `has(1)` is then called on a Promise<Map>, not Map.
// `inlineCallReturnExpression` rejects async/generator callees to avoid mis-dispatching
// downstream (would tag receiver as Map and emit es.map.* polyfills for a Promise call site)
const a = (async () => _Map)().has(1);
// also async IIFE through binding
const f = async () => _Set;
const b = f().has(1);
export { a, b };