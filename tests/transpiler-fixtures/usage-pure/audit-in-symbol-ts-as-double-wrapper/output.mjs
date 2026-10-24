import _isIterable from "@core-js/pure/actual/is-iterable";
// doubled TS `as` cast around Symbol. plugin peels both wrappers to see the underlying
// Symbol identifier and polyfills `Symbol.iterator` through `isIterable(obj)` rewrite
_isIterable(obj);