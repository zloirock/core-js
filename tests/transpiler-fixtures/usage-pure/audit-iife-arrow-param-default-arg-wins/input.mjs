// IIFE invoking an arrow with a destructure-default param: `(({from} = Array) => from(...))(Set)`.
// caller's `Set` beats the default `Array` (the default fires only on an undefined arg).
// receiver resolution targets the IIFE arg `Set`, not the dead default `Array`: `Set.from`
// is not a polyfill candidate so no `from`-polyfill is emitted; the `Set` constructor still is
const r = (({ from } = Array) => from([1, 2, 3]))(Set);
