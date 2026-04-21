// IIFE synth-swap with mixed siblings: arrow + Identifier arg + ObjectPattern without rest.
// the synth covers every destructured key — polyfilled entries get the polyfill id, the
// rest get a `R.key` native reference. dropping `isArray` would leave the runtime call to
// `undefined`. arrow has no `arguments`, so the synth can't leak into the body
(({ from, isArray, of }) => isArray(from([1])) && of(1))(Array);
