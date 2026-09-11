import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol.someUserKey` is not a well-known symbol - the access reads `undefined` at runtime.
// `Symbol.someUserKey in obj` must NOT be routed through symbol-keyed polyfill dispatch
// (which only covers the well-known name set). `Symbol` receiver still gets the constructor
// polyfill on legacy targets; the `in` check is preserved as-is
obj.key;
_Symbol.someUserKey in obj;