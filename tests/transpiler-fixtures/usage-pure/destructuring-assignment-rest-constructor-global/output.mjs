import _Promise from "@core-js/pure/actual/promise/constructor";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let resolve, rest;
({
  resolve,
  ...rest
} = _Promise);