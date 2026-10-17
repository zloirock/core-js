import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the same destructured alias with a NON-defaulted consumer folds through the registered
// alias hint - the registration verified the alias shape, so the chain resolves without
// the defaulted-consumer inline
const {
  self: {
    Symbol: DestructuredSymbol2
  }
} = {
  self: {
    Symbol: _Symbol
  }
};
const viaDestructuredPlain = _Symbol$iterator;
export const d = _getIteratorMethod([7, 8]);