import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// oxc-parser preserves ParenthesizedExpression on `(k)` - resolveKey must unwrap to resolve
// `k` through const-alias to `Symbol.iterator`. babel path strips parens so both converge
const k = _Symbol$iterator;
const hasIter = _isIterable({});
hasIter;