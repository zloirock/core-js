// the DOMINATING reassignment's reaching value is a proxy-global wrapped in a side-effect sequence
// (`A = (eff(), self)`): the alias-root walk peels the wrapper to the tail (self, a proxy) exactly as
// the receiver / value paths do, so `A.Array.from` collapses to the pure static while the write's
// `eff()` side effect stays in place
let A = globalThis;
A = (eff(), self);
A.Array.from([1, 2, 3]);
