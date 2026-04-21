// IIFE synth-swap with mixed siblings: arrow + Identifier arg + ObjectPattern without rest.
// the synth must cover every destructured key (polyfilled → polyfill id, otherwise native
// `R.key` ref) — if `isArray` were dropped from the synth, runtime `isArray(...)` call would
// hit `undefined`. arrow has no `arguments`, so the synth can't leak into the body
(({ from, isArray, of }) => isArray(from([1])) && of(1))(Array);
