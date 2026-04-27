// `Symbol.asyncIterator in obj` - well-known symbol other than iterator. resolveSymbolInEntry
// returns `symbol/async-iterator` for the LHS only (no is-iterable rewrite); the BinaryExpression
// itself is kept as-is. second statement uses Map.groupBy independently to anchor the polyfill.
const isAsync = Symbol.asyncIterator in obj;
const grouped = Map.groupBy(items, fn);
export { isAsync, grouped };
