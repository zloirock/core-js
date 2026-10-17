import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
let laterFallback;
if (typeof _Symbol != 'undefined') laterFallback = _Symbol$iterator;
export const readBeforeDeadFallback = receiver => _getIteratorMethod(receiver);
if (typeof _Symbol == 'undefined') laterFallback = '@@iterator';