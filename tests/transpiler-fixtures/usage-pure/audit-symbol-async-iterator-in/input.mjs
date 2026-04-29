// `Symbol.asyncIterator in obj` polyfills the symbol but does not rewrite the `in` test;
// second statement uses `Map.groupBy` independently.
const isAsync = Symbol.asyncIterator in obj;
const grouped = Map.groupBy(items, fn);
export { isAsync, grouped };
