import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// `Symbol.asyncIterator in obj` polyfills the symbol but does not rewrite the `in` test;
// second statement uses `Map.groupBy` independently.
const isAsync = _Symbol$asyncIterator in obj;
const grouped = _Map$groupBy(items, fn);
export { isAsync, grouped };