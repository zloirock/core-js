// combo: catch-clause binding destructures the thrown value's `Symbol.iterator` slot + the
// outer for-of consumes an object that carries the same iterator binding as its iteration
// protocol. plugin injects a symbol polyfill import for the computed key and an iterator
// helper for the catch-bound extraction
try {
  throw {};
} catch ({ [Symbol.iterator]: iter }) {
  for (const x of { [Symbol.iterator]: iter }) console.log(x);
}
