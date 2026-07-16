// a single-key proxy-hop destructure plans like its flat twin, so an unresolvable leaf
// re-anchors to the constructor binding instead of reading the native key off the proxy root
const { Map: { customY } } = globalThis;
// a resolvable sibling extracts; the survivor still re-anchors
const { Promise: { try: tryFn, customZ } } = globalThis;
// boundary: a multi-key outer pattern keeps the proxy-root residual
const { Iterator: { customA }, navigator: nav } = globalThis;
// an SE-prefixed init folds too: the prefix replays exactly once ahead of the re-anchored read
const { Set: { customB } } = (eff(), globalThis);
// a proxy-global KEY peels like a member-chain hop (it binds nothing), then the ctor anchor fires
const { globalThis: { Map: { customG } } } = globalThis;
// an escaped string key resolves to its cooked constructor name
const { "\u0049terator": { customU } } = globalThis;
// a computed static-string key resolves like the literal spelling
const { ['WeakSet']: { customK } } = globalThis;
// boundary: a side-effecting computed key keeps the nested handling (effect must run once)
const { [(effK(), 'WeakMap')]: { customE } } = globalThis;
export const r = [customY, tryFn, customZ, customA, nav, customB, customG, customU, customK, customE];
