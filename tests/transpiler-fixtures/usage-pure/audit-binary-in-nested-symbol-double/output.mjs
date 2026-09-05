import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref;
// nested `Symbol[Symbol.iterator] in obj`: the doubly-nested key shape would resolve
// to a malformed `Symbol.Symbol.iterator`, so the `in` check must NOT polyfill-dispatch.
// the simple `Symbol.iterator in arr` next to it confirms the regular path still works
const a = _getIteratorMethod(_Symbol) in obj;
const b = _isIterable(arr);
_includesMaybeArray(_ref = [a, b]).call(_ref, true);