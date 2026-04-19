import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// TSNonNullExpression wrapper on Symbol - unwrapParens handles `!` too
const iter = _getIteratorMethod(obj);