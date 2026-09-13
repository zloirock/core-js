import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const guard = 1;
const {
  Array: {
    from,
    ...rest
  }
} = guard && _globalThis;
typeof from;