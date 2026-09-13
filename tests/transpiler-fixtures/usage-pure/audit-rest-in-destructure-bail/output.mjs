import _Set from "@core-js/pure/actual/set/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  from,
  ...rest
} = Array;
const a = from([1]);
const {
  of: setOf,
  ...others
} = _Set;
const b = setOf(1, 2, 3);
export { a, rest, b, others };