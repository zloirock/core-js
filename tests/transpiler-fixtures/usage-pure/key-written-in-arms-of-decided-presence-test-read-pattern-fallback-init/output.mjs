import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
let patternFallbackInit = _Symbol$iterator;
if (typeof _Symbol == 'undefined') [patternFallbackInit] = ['@@iterator'];
export const readPatternFallbackInit = receiver => _getIteratorMethod(receiver);