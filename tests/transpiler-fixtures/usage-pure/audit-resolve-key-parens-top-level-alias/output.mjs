import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// parenthesized alias identifier `(k) in {}` where `k = Symbol.iterator` - parens must
// be transparent, so the `in`-check rewrites through the is-iterable polyfill
const k = _Symbol$iterator;
const hasIter = _isIterable({});
hasIter;