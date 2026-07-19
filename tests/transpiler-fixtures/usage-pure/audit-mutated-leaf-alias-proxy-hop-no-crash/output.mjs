import _globalThis from "@core-js/pure/actual/global-this";
// a mutated global-ctor leaf reached through an ALIAS proxy hop (`globalThis.Array = Fake; const
// g = globalThis; g.self.Array.from(...)`) drops the `.self` hop like babel and keeps the mutated
// `Array.from` verbatim (the user's replacement wins). the proxy-hop-collapse fired once per
// resolving meta before - two identical range rewrites - and the transform queue folds them
// idempotently instead of throwing its equal-range invariant
_globalThis.Array = Fake;
const g = _globalThis;
export const r = g.Array.from([1]);