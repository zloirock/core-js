// IIFE invoking an arrow whose param has a destructure-with-default: `(({from} = Array) => from([1,2,3]))(Set)`.
// caller's `Set` beats the default `Array` at runtime (default fires only when the arg is undefined),
// so the synth swap must target the IIFE arg - not the default - to keep the polyfill aligned with runtime
const r = (({ from } = Array) => from([1, 2, 3]))(Set);
