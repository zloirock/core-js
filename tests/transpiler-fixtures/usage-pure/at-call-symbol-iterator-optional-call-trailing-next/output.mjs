import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// optional-call on a polyfilled member followed by a trailing in-chain access
// (`x[Symbol.iterator]?.().next()`): the trailing `.next()` is part of the optional chain, so on
// a non-iterable `x` the whole chain short-circuits to undefined. the rewrite must keep `.next()`
// IN the new `?.call` chain (not parenthesize it off), else `(undefined).next()` throws where
// native yields undefined
_getIteratorMethod(x)?.call(x).next();