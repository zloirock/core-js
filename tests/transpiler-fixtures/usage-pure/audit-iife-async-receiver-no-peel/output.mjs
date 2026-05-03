import _at from "@core-js/pure/actual/instance/at";
// peelIIFEReturn must bail when the IIFE callee is async (or generator); inlining
// `await arr.at(0)` as if it were synchronous would mis-resolve the receiver. Here
// the inner expression is a Promise<Array>, the outer .at would polyfill against
// the Promise (incorrect). With the async-bail in place the receiver stays opaque.
const arr = [1, 2, 3];
const p = (async () => arr)();
p.then(a => _at(a).call(a, 0));