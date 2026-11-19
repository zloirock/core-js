import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a DESTRUCTURED constructor alias folds through a DEFAULTED consumer (babel resolves the
// destructured chain in place when the default drives an inline)
const {
  self: {
    Symbol: DestructuredSymbol
  }
} = {
  self: {
    Symbol: _Symbol
  }
};
const viaDestructuredDefault = _Symbol$iterator;
export const c = _getIteratorMethod([5, 6]);