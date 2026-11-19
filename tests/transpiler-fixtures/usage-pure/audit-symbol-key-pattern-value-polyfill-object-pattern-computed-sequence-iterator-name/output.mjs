import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A computed sibling and iterator pattern read the same patched constructor in source order.
let c = 0;
const arrayIteratorKey = _Symbol$iterator;
const previousArrayIterator = _Object$getOwnPropertyDescriptor(Array, arrayIteratorKey);
_Object$defineProperty(Array, arrayIteratorKey, {
  configurable: true,
  value: _getIteratorMethod(Array.prototype)
});
const of = (c++, _Array$of);
const iterName2 = _nameMaybeFunction(_getIteratorMethod(Array));
if (previousArrayIterator) _Object$defineProperty(Array, arrayIteratorKey, previousArrayIterator);else delete Array[arrayIteratorKey];
export { of, iterName2, c };