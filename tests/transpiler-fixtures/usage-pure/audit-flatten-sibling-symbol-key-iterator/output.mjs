import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A flatten declarator shares its declaration with a sibling extracting a Symbol.iterator method.
// the bailed sibling reuses the full byStatement emit, so the iterator helper survives instead of
// rendering the pattern verbatim
const from = _Array$from;
const it = _getIteratorMethod(obj);
from([1]);
console.log(it);