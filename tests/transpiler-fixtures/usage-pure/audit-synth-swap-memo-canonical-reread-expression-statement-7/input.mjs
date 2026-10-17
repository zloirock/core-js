// an SE-bearing chain-root call survives the whole-swap in the rescue plan; a provably-pure
// inline root call is dropped instead (value-identical, effect-free)
let n = 0;
function seCallRoot({ groupBy: g3, gone } = (() => (n++, globalThis))().Map) { return [g3, gone]; }
seCallRoot();
