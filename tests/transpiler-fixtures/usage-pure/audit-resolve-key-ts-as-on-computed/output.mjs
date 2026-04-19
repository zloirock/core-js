import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// TS `as` wrapper on computed key reaches resolveKey via the `in` path. previous A1-01
// fixture covered member-access; this covers the BinaryExpression-in entry
const k = _Symbol$iterator;
const hasIter = _isIterable({});
hasIter;