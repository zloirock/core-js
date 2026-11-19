import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a well-known-symbol read off a SIMPLE user alias of the constructor folds to the iterator-method
// helper: the mutation-free estree resolver follows the const-alias to Symbol just as babel does
const AliasedSymbol = _Symbol;
const viaAlias = _Symbol$iterator;
export const a = _getIteratorMethod([1, 2]);