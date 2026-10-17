import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const arrayIteratorKey = _Symbol$iterator;
_Object$defineProperty(Array, arrayIteratorKey, {
  configurable: true,
  value: _getIteratorMethod(Array.prototype)
});