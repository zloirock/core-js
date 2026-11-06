import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// TS non-null assertion `!` wraps Symbol; plugin peels the wrapper alongside parens to
// recover the Symbol identifier and polyfills Symbol.iterator access through the imported
// symbol ref
const iter = _getIteratorMethod(obj);