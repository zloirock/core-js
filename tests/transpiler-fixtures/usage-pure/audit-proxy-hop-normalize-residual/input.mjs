// a single-key proxy-hop destructure plans like its flat twin, so an unresolvable leaf
// re-anchors to the constructor binding instead of reading the native key off the proxy root
const { Map: { customY } } = globalThis;
// a resolvable sibling extracts; the survivor still re-anchors
const { Promise: { try: tryFn, customZ } } = globalThis;
// boundary: a multi-key outer pattern keeps the proxy-root residual
const { Iterator: { customA }, navigator: nav } = globalThis;
// boundary: an SE-prefixed init keeps the nested handling
const { Set: { customB } } = (eff(), globalThis);
// boundary: a proxy-global KEY keeps the nested handling (only a constructor key hops)
const { globalThis: { Map: { customG } } } = globalThis;
// an escaped string key resolves to its cooked constructor name
const { "\u0049terator": { customU } } = globalThis;
// a computed static-string key resolves like the literal spelling
const { ['WeakSet']: { customK } } = globalThis;
// boundary: a side-effecting computed key keeps the nested handling (effect must run once)
const { [(effK(), 'WeakMap')]: { customE } } = globalThis;
export const r = [customY, tryFn, customZ, customA, nav, customB, customG, customU, customK, customE];
