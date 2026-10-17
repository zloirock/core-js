import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
let fallbackInit = '@@iterator';
if (typeof _Symbol != 'undefined') fallbackInit = _Symbol$iterator;
export const readFallbackInit = receiver => _getIteratorMethod(receiver);