// a proxy-global member chain nested in a re-referenceable literal receiver: the copied-receiver
// substitution rewrites the whole-constructor member (`globalThis.Map` -> `_Map`), matching the in-place
// residual's visitor rewrite
const { [(eff(), 'flat')]: m } = [1, globalThis.Map];
