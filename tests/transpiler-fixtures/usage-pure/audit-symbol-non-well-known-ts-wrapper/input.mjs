// `Symbol.foo` is a user property, not a well-known symbol; the access is left intact,
// but bare `Symbol` still gets the constructor polyfill.
const x = obj[(Symbol as any).foo];
