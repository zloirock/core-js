// IIFE returning globalThis used as proxy-global receiver: the outer chain
// `<receiver>.Promise.resolve` has its receiver-chain collapsed to the polyfilled binding
// alone, and the rewrites INSIDE the IIFE body must survive that elimination
// (regression: this shape used to crash the transform)
(() => { return globalThis; })().Promise.resolve(1);
