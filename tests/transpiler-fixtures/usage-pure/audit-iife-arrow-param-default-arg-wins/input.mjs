// IIFE invoking an arrow whose param has a destructure-with-default: `(({from} = Array) => from([1,2,3]))(Set)`.
// caller's `Set` beats the default `Array` at runtime (default fires only when the arg is undefined).
// receiver resolution targets the IIFE arg (`Set`), not the dead wrapper-default (`Array`):
// since `Set.from` is not a polyfill candidate, no `from`-polyfill is emitted and the user's
// runtime semantic (which falls back to `undefined`) is preserved. `Set` constructor still
// gets its own polyfill on legacy targets
const r = (({ from } = Array) => from([1, 2, 3]))(Set);
