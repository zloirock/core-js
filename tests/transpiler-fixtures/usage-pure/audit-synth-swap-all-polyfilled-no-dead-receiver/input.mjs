// synth-swap where every destructured key has a polyfill: the emitted object literal reads
// only polyfill ids, the receiver `Promise` identifier is not referenced. the receiver pure
// import must NOT be injected - otherwise an unused `_Promise` leaks into the bundle.
// two shapes exercise the same applySynthSwaps path (IIFE arg + param default)
(({ resolve }) => resolve)(Promise);
function fn({ resolve, reject } = Promise) { return [resolve, reject]; }
