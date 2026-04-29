// nested `[Symbol.iterator]()` call inside `Array.from(...)`: the iterator
// access and the outer `Array.from` must be polyfilled independently.
Array.from(obj[Symbol.iterator]());
