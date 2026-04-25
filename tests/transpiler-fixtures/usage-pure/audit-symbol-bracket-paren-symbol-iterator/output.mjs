import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol[(Symbol.iterator)] in obj` - inner `Symbol.iterator` wrapped in extra parens.
// resolveKey peels the parens around the computed key and resolves to `Symbol.iterator`.
// since the key already starts with `Symbol.`, the outer in-handler routes to
// get-iterator-method instead of double-prefixing to `Symbol.Symbol.iterator`.
const x = _getIteratorMethod(_Symbol) in obj;
export { x };