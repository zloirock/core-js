// A nested static and an independent global read in the same declaration both receive polyfills.
const { Array: { from } } = globalThis, y = globalThis;
const { Map: { groupBy } } = self, sym = Symbol.iterator;
export { from, y, groupBy, sym };
