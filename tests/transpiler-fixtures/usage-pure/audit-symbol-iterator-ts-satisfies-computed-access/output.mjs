import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// TSSatisfiesExpression wrapper - unwrapParens peels it via TS_EXPR_WRAPPERS set,
// asSymbolRef must accept the unwrapped Identifier
const iter = _getIteratorMethod(obj);