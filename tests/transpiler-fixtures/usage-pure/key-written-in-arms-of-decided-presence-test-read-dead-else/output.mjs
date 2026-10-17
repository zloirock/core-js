import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
let deadElse;
if (typeof _Symbol != 'undefined') {
  deadElse = _Symbol$iterator;
} else {
  deadElse = '@@iterator';
}
export const readDeadElse = receiver => _getIteratorMethod(receiver);