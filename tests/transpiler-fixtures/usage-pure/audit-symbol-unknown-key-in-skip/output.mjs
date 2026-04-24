// `Symbol.someUserKey` is not a well-known symbol - the access resolves to `undefined` at
// runtime. `Symbol.someUserKey in obj` must not be routed through symbol-specialised
// polyfill dispatch (which expects the well-known name set); the expression stays as-is
// and evaluates to `'undefined' in obj` style behaviour, which is user-defined
obj.key;
Symbol.someUserKey in obj;