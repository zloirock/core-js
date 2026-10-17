const arrayIteratorKey = Symbol.iterator;
const previousArrayIterator = Object.getOwnPropertyDescriptor(Array, arrayIteratorKey);
if (previousArrayIterator) Object.defineProperty(Array, arrayIteratorKey, previousArrayIterator);
else delete Array[arrayIteratorKey];
