// combo: `Symbol.iterator in x` TS-narrows `x` from nullable-optional to concrete iterable +
// the narrow guards the subsequent `x[Symbol.iterator]()` call. plugin replaces both: the
// `in` check becomes `_isIterable(x)`, the call becomes `_getIterator(x).next()`
declare const x: { [Symbol.iterator]?: () => Iterator<number> } | null;
if (x && Symbol.iterator in x) x[Symbol.iterator]().next();
