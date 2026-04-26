// catch destructure with computed key `[Symbol.iterator]`: the well-known symbol resolves
// to its `get-iterator-method` polyfill helper. extraction must use the original computed
// expression so the polyfill identifier is not double-prefixed
try {
  risky();
} catch ({ [Symbol.iterator]: iter, ...rest }) {
  iter;
  rest;
}
