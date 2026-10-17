import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// an array-wrapped destructured constructor alias (`const [{ Symbol: S }] = [globalThis]`) folds
// through the same positional peel when the consumer is defaulted
const [{
  Symbol: ArrayWrapSymbol
}] = [{
  Symbol: _Symbol
}];
const viaArrayWrap = _Symbol$iterator;
export const f = _getIteratorMethod([11, 12]);