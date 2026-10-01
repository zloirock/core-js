import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
// catch destructure with computed key `[Symbol.iterator]`: the well-known symbol resolves
// to its `get-iterator-method` polyfill helper. extraction must use the original computed
// expression so the polyfill identifier is not double-prefixed
try {
  risky();
} catch ({
  [_Symbol$iterator]: iter,
  ...rest
}) {
  iter;
  rest;
}