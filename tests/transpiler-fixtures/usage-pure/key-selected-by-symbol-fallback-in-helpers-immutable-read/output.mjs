import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var REAL_ITERATOR_SYMBOL = _Symbol$iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
export const immutableRead = iterable => _getIteratorMethod(iterable);