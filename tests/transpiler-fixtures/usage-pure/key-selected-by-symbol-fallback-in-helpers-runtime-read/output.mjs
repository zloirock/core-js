import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var $Symbol = _Symbol;
var iteratorSymbol = _Symbol$iterator;
export const runtimeRead = iterable => _getIteratorMethod(iterable);