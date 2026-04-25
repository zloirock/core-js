import _isIterable from "@core-js/pure/actual/is-iterable";
import _Array$from from "@core-js/pure/actual/array/from";
// `Symbol.iterator in X` when X itself contains a polyfillable call. the outer rewrite
// wraps the whole expression in the is-iterable check, and the inner `Array.from(src)`
// inside the RHS still gets polyfilled independently - two composed transforms land
// cleanly without one eliminating the other
_isIterable(_Array$from(src));