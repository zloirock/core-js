// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { from, ...rest } = Array;
const a = from([1]);
const { of: setOf, ...others } = Set;
const b = setOf(1, 2, 3);
export { a, rest, b, others };
