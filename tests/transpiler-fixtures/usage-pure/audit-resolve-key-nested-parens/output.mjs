import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// multiply-nested parens on computed key: `((k))` — resolveKey must unwrap fully
const k = _Symbol$iterator;
const hasIter = _isIterable({});
hasIter;