import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const [{
  [_Symbol$iterator]: iterator,
  Array: {
    from
  },
  ...rest
}] = [_globalThis];
export { iterator, from, rest };