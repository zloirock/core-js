// simple IIFE-prefix-SE returning `Promise`, then `.resolve(1)` on it. Control case
// against the chain-assign double-eval bug: here `calls++` must run exactly once and
// the static call is subsumed by the polyfill.
let calls = 0;
const r = (() => { calls++; return Promise; })().resolve(1);
[r, calls];
