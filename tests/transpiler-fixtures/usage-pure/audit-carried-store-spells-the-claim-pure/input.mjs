// a SOURCE store the guard's clone carries is still the source's own value position: the claim in its
// value slot spells its pure, not the alias root the spine re-reads. only the PLUGIN-MINTED memo holds
// the value instead of the source - its assignment sits above the clone. read as a memo, the store kept
// the alias (`v = g`) where the reference emitter writes `v = _self`, and the entry never got imported.
// the alias is written ONCE on purpose: a second write to it deopts the follow, and the claim's pure
// then wins for a reason that has nothing to do with this question
let v, g, out;
out = (g = globalThis, v = g.window.self)?.Number.MAX_SAFE_INTEGER.name;
export const read = out;
