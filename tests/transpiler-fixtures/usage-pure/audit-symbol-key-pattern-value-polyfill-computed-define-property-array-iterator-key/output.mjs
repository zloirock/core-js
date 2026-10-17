import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const arrayIteratorKey = _Symbol$iterator;
const previousArrayIterator = _Object$getOwnPropertyDescriptor(Array, arrayIteratorKey);
if (previousArrayIterator) _Object$defineProperty(Array, arrayIteratorKey, previousArrayIterator);else delete Array[arrayIteratorKey];