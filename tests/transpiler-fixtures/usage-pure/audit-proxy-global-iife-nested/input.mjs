// Nested IIFE: the outer IIFE returns the inner IIFE's call, and the inner returns the
// global. Both layers are inlined to the global, so Array.from is polyfilled and the
// result's `.at(0)` narrows to Array.
const out = (() => (() => globalThis)())().Array.from([1, 2, 3]);
out.at(0);
