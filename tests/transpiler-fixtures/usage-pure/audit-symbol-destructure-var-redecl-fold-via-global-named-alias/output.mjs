import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a fn-local alias NAMED like the global must not shadow the REAL global elsewhere: the
// outer well-known-symbol read still folds (its scope has no such binding)
function globalNamedAlias() {
  const Symbol = _Symbol$iterator;
  return _getIteratorMethod([]);
}
export const viaGlobalNamedAlias = globalNamedAlias();