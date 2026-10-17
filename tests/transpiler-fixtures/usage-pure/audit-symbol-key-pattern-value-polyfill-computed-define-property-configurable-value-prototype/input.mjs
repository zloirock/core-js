const arrayIteratorKey = Symbol.iterator;
Object.defineProperty(Array, arrayIteratorKey, {
  configurable: true,
  value: Array.prototype[Symbol.iterator],
});
