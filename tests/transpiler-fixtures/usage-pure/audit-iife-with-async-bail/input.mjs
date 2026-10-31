// async IIFE wraps return value in Promise; inline-call resolution must bail.
// `(async () => Map)().has(1)` - `has(1)` is then called on a Promise<Map>, not Map.
// async/generator callees must be rejected to avoid mis-dispatching downstream (would tag
// the receiver as Map and emit es.map.* polyfills for a Promise call site)
const a = (async () => Map)().has(1);
// also async IIFE through binding
const f = async () => Set;
const b = f().has(1);
export { a, b };
