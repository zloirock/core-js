// an optional proxy chain whose root is a chain-assign storing a CALL value that inline-resolves to
// globalThis (`(w = f())?.self.Array.of(...)`, `f = () => globalThis`). the call is as always-defined as
// a bare `globalThis`, and the receiver collapse already roots through it, so the dead `?.` guard erases
// and the assign SE folds ONCE into the collapsed static - not a kept guard leaving babel a raw `.Array
// .of` (missed polyfill) and unplugin a re-run of the call in the body. named-arrow + inline-IIFE call
// shapes; distinct static + trailing instance per line; both converge (no sidecar).
let w, v;
const f = () => globalThis;
export const arrowVal = ((w = f()))?.self.Array.of(5).at(0);
export const iifeVal = ((v = (() => globalThis)()))?.self.Array.from([1]).includes(1);
