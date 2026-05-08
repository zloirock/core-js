import _getIterator from "@core-js/pure/actual/get-iterator";
import _at from "@core-js/pure/actual/instance/at";
// comments between `?.` and the next token (call paren or computed bracket) must NOT
// confuse classification - `?./*c*/(...)`, `?./*c*/[...]`, and `(arr?.at)?.(0)` should
// all dispatch the same way as their no-comment / no-paren forms
const a = arr?. /* call */(0);
const b = obj == null ? void 0 : _getIterator(obj);
const c = arr == null ? void 0 : _at(arr)?.call(arr, 0) /* call */;