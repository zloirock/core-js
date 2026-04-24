import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// combo: catch-clause binding destructures the thrown value's `Symbol.iterator` slot + the
// outer for-of consumes an object that carries the same iterator binding as its iteration
// protocol. plugin injects a symbol polyfill import for the computed key and an iterator
// helper for the catch-bound extraction
try {
  throw {};
} catch (_ref) {
  let iter = _getIteratorMethod(_ref);
  for (const x of {
    [_Symbol$iterator]: iter
  }) console.log(x);
}