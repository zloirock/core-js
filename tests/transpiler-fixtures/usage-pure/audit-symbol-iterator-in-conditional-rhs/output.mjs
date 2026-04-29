import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in (cond ? a : b)` - RHS is a conditional expression. The whole
// ternary is wrapped through `_isIterable` without rewriting the branches; at runtime
// the ternary evaluates to either `a` or `b` and `_isIterable` accepts either.
const x = _isIterable(cond ? a : b);
export { x };