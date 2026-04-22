// `'from' in globalThis.Array` collapses to `true` since Array.from is polyfillable.
// once the whole expression folds, the nested `globalThis` receiver is no longer live -
// importing `_globalThis` for it would be dead weight (subtree-wide skip, not just the
// direct right node, keeps identifier-visitor from emitting for discarded descendants).
// `globalThis` appears only on the RHS here, so the absence of `_globalThis` in the output
// proves the skip propagated to the nested identifier
const hasFrom = 'from' in globalThis.Array;
export { hasFrom };
