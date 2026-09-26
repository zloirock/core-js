// nested-proxy assignment cascade with multiple polyfillable props inside an unbraced
// if body. without block-wrapping the second polyfill assignment escapes the gate
// and runs unconditionally, breaking the if's runtime semantics
let from, fromEntries;
if (cond) ({ Array: { from }, Object: { fromEntries } } = globalThis);
