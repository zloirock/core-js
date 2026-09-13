import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, fromEntries, rest;
({
  Array: {
    from
  },
  Object: {
    fromEntries
  },
  ...rest
} = _globalThis);