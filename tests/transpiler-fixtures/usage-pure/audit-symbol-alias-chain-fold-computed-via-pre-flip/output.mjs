import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the inverse flip: the capture reads the init 'Symbol'; the later same-scope write cannot
// reach the captured binding, so the chain still folds to the pure constructor
let kf = 'Symbol';
const PreFlipSymbol = _Symbol;
kf = 'Array';
const viaPreFlip = _Symbol$iterator;
export const o = _getIteratorMethod([27, 28]);