// A selection every branch of which yields the REALM drops whole, and the leaf under its step binds
// the polyfill straight off - no literal is spelled and no branch is left to swap. The well-known-
// symbol hop beside it has no slot such a literal could spell anyway: it stays on the residual,
// which goes on reading the selection the source wrote, the realm on either host.
const { self: { Map: { groupBy: viaSelf }, Symbol: { [Symbol.iterator]: iterateSelf } } } = globalThis.window ?? globalThis;
const { globalThis: { Map: { groupBy: viaRealm }, Symbol: { [Symbol.iterator]: iterateRealm } } } = globalThis.window ?? globalThis;
export { viaSelf, iterateSelf, viaRealm, iterateRealm };
