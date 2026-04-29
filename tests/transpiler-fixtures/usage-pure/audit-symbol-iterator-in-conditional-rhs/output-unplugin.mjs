import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in (cond ? a : b)` - RHS is a conditional expression. handleBinaryIn
// must wrap the entire RHS through `_isIterable` without disturbing the ternary shape;
// the ternary at runtime evaluates to either `a` or `b` and `_isIterable` accepts either.
const x = _isIterable((cond ? a : b));
export { x };