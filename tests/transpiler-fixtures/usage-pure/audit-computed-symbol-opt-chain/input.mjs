// optional-chained computed access `obj?.[Symbol.iterator]()` must resolve
// like `obj[Symbol.iterator]()` and inject the get-iterator polyfill
obj?.[Symbol.iterator]();
