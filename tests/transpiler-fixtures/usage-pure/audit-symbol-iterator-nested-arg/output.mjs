import _Array$from from "@core-js/pure/actual/array/from";
import _getIterator from "@core-js/pure/actual/get-iterator";
// computed [Symbol.iterator]() emits a CallExpression polyfill whose range nests inside
// Array.from's arglist - compose loop substitutes the inner get-iterator into outer's content
_Array$from(_getIterator(obj));