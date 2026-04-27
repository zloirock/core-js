import _isIterable from "@core-js/pure/actual/is-iterable";
import _Array$from from "@core-js/pure/actual/array/from";
// UTF-8 BOM at start + Symbol.iterator in obj rewrite. BOM is stripped, the symbol
// path resolves through `_isIterable`, and the second statement adds `Array.from`.
const x = _isIterable(obj);
const y = _Array$from(src);
export { x, y };