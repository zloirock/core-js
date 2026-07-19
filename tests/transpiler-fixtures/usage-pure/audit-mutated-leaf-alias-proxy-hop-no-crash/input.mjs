// a mutated global-ctor leaf reached through an ALIAS proxy hop (`globalThis.Array = Fake; const
// g = globalThis; g.self.Array.from(...)`) drops the `.self` hop like babel and keeps the mutated
// `Array.from` verbatim (the user's replacement wins). the proxy-hop-collapse fired once per
// resolving meta before - two identical range rewrites - and the transform queue folds them
// idempotently instead of throwing its equal-range invariant
globalThis.Array = Fake;
const g = globalThis;
export const r = g.self.Array.from([1]);
