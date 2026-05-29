// An IIFE returning globalThis at the root of a receiver chain
// (`(() => globalThis)().Array.from([...])`). The call is inlined to reach the global, so
// Array.from is polyfilled and the result's `.at(0)` narrows to Array - and the inner
// globalThis is not separately rewritten over the same span.
const out = (() => globalThis)().Array.from([1, 2, 3]);
out.at(0);
