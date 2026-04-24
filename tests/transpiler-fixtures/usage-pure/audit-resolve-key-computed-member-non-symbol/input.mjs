// `const k = Object.create; k in g` - only the RHS init `Object.create` should polyfill.
// the `in` operator itself should NOT emit any polyfill because `g` is a local binding
// and `k` does not resolve to a well-known symbol
const k = Object.create;
k in g;
