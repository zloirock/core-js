import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// Multiply-nested parens around a computed key `((k))` still resolve through to
// `Symbol.iterator`, so the specialized `is-iterable` polyfill fires.
const k = _Symbol$iterator;
const hasIter = _isIterable({});
hasIter;