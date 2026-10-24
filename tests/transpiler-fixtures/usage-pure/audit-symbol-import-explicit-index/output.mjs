import _isIterable from "@core-js/pure/actual/is-iterable";
// `core-js/pure/actual/symbol/iterator/index.js` - explicit `/index.js` suffix follows the
// resolved module path; the regex must accept it so the binding is recognized as a symbol-key
// alias and the `in` rewrite produces `_isIterable(obj)`
import _Iter from "@core-js/pure/actual/symbol/iterator/index.js";
const a = _isIterable(obj);
export { a };