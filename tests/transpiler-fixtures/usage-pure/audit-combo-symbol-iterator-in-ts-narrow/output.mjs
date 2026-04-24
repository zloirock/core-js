import _isIterable from "@core-js/pure/actual/is-iterable";
import _getIterator from "@core-js/pure/actual/get-iterator";
// combo: `Symbol.iterator in x` TS-narrows `x` from nullable-optional to concrete iterable +
// the narrow guards the subsequent `x[Symbol.iterator]()` call. plugin replaces both: the
// `in` check becomes `_isIterable(x)`, the call becomes `_getIterator(x).next()`
declare const x: {
  [Symbol.iterator]?: () => Iterator<number>;
} | null;
if (x && _isIterable(x)) _getIterator(x).next();