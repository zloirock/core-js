import _Map from "@core-js/pure/actual/map/constructor";
// IIFE returning a proxy-global with a longer chain through `self` (proxy alias of globalThis):
// `(() => globalThis).self.Map.prototype.has`. resolveProxyGlobalRoot's MemberExpression-chain
// walk validates every intermediate link (`self` is in POSSIBLE_GLOBAL_OBJECTS) AND the IIFE
// inlining bottoms out on `globalThis` at the leaf
const has = _Map.prototype.has;
new _Map().has !== has;