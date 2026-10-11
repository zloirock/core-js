import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a key whose every value is the iterator symbol or its `'@@iterator'` fallback reads the iterator
// method, which answers either one: written in both arms of an undecided test, or by a decided test
// ahead of a closure that a later fallback write may reach once it is called again
let eitherArm;
if (flag) eitherArm = '@@iterator';else eitherArm = _Symbol$iterator;
export const readEitherArm = receiver => _getIteratorMethod(receiver);
let laterFallback;
if (typeof _Symbol != 'undefined') laterFallback = _Symbol$iterator;
export const readBeforeLaterFallback = receiver => _getIteratorMethod(receiver);
if (flag) laterFallback = '@@iterator';