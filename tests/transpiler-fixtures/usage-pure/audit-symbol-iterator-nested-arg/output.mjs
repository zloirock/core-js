import _Array$from from "@core-js/pure/actual/array/from";
import _getIterator from "@core-js/pure/actual/get-iterator";
// nested `[Symbol.iterator]()` call inside `Array.from(...)`: the iterator
// access and the outer `Array.from` must be polyfilled independently.
_Array$from(_getIterator(obj));