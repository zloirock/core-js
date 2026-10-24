import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol.foo` is a user property, not a well-known symbol; the access is left intact,
// but bare `Symbol` still gets the constructor polyfill.
const x = obj[_Symbol.foo];