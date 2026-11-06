// A realm selection serves its static beside a well-known-symbol hop.
// The symbol keeps its own receiver and the static receives its pure value.
const { self: { Map: { groupBy: viaSelf }, Symbol: { [Symbol.iterator]: iterateSelf } } } = globalThis.window ?? globalThis;
const { globalThis: { Map: { groupBy: viaRealm }, Symbol: { [Symbol.iterator]: iterateRealm } } } = globalThis.window ?? globalThis;
export { viaSelf, iterateSelf, viaRealm, iterateRealm };
