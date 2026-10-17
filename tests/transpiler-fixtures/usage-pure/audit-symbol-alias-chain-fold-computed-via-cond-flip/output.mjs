import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a CONDITIONAL post-capture flip cannot reach the captured binding either - still folds
let kp = 'Symbol';
const CondFlipSymbol = _Symbol;
if (cond) kp = 'Array';
const viaCondFlip = _Symbol$iterator;
export const q = _getIteratorMethod([29, 30]);