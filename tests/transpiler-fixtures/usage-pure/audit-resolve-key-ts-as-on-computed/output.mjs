import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// TS `as` wrapper around a computed key inside an `in`-expression is unwrapped.
// `((k) as any) in {}` still recognizes `k` as `Symbol.iterator`, so the
// `is-iterable` polyfill fires.
const k = _Symbol$iterator;
const hasIter = _isIterable({});
hasIter;