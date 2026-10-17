import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a SYMBOL-key alias chain folds through the same per-hop scope advance, under a same-name
// param shadow of its source
const iter = _Symbol$iterator;
const aliasedIter = iter;
export function viaSymbolAliasShadowed(iter) {
  return _getIteratorMethod([7, 8]);
}