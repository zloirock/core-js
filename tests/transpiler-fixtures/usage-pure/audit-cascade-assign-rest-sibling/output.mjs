import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, rest;
({
  Array: {
    from
  },
  ...rest
} = _globalThis);
export { from, rest };