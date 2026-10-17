// A computed sibling and iterator pattern read the same patched constructor in source order.
let c = 0;
const arrayIteratorKey = Symbol.iterator;
const previousArrayIterator = Object.getOwnPropertyDescriptor(Array, arrayIteratorKey);
Object.defineProperty(Array, arrayIteratorKey, {
  configurable: true,
  value: Array.prototype[Symbol.iterator],
});
const { [(c++, 'of')]: of, [Symbol.iterator]: { name: iterName2 } } = Array;
if (previousArrayIterator) Object.defineProperty(Array, arrayIteratorKey, previousArrayIterator);
else delete Array[arrayIteratorKey];
export { of, iterName2, c };
