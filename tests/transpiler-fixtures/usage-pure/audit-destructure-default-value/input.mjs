// `const { Symbol: S = fallback } = globalThis` - destructuring from proxy-global
// with renamed binding and a default value. `S` is recognized as an alias of
// `Symbol`, so `S.iterator in obj` still fires the `is-iterable` polyfill.
const { Symbol: S = () => null } = globalThis;
S.iterator in obj;
