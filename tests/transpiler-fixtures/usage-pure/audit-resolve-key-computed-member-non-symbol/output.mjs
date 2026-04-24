import _Object$create from "@core-js/pure/actual/object/create";
// `const k = Object.create; k in g` - only the RHS init `Object.create` should polyfill.
// the `in` operator itself should NOT emit any polyfill because `g` is a local binding
// and `k` does not resolve to a well-known symbol
const k = _Object$create;
k in g;