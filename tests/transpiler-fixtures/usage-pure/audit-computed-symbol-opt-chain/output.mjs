import _getIterator from "@core-js/pure/actual/get-iterator";
// optional-chained computed access `obj?.[Symbol.iterator]()` must resolve
// like `obj[Symbol.iterator]()` and inject the get-iterator polyfill
obj == null ? void 0 : _getIterator(obj);