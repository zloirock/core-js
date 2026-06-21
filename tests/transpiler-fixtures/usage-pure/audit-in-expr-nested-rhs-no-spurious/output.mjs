// `'from' in globalThis.Array` collapses to `true` since Array.from is polyfillable.
// once the whole expression folds, the nested `globalThis` receiver is no longer live -
// importing `_globalThis` for it would be dead weight. the skip must cover the whole
// discarded subtree; absence of `_globalThis` here proves it reached the nested identifier.
const hasFrom = true;
export { hasFrom };