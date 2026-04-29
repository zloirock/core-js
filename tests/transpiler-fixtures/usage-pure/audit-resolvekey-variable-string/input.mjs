// `const k = 'iterator'; Symbol[k] in obj` - alias `k` must be resolved to the
// string 'iterator', so the `in` check is recognised as `Symbol.iterator in obj`
// and the is-iterable polyfill is injected
const k = 'iterator';
const x = Symbol[k] in obj;
