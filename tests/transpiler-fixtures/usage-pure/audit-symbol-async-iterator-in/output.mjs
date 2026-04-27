import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `Symbol.asyncIterator in obj` - well-known symbol other than iterator. resolveSymbolInEntry
// returns `symbol/async-iterator` for the LHS only (no is-iterable rewrite); the BinaryExpression
// itself is kept as-is. second statement uses Map.groupBy independently to anchor the polyfill.
const isAsync = _Symbol$asyncIterator in obj;
const grouped = _Map$groupBy(items, fn);
export { isAsync, grouped };