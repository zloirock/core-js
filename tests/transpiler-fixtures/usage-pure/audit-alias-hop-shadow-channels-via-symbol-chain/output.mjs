import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the alias-hop scope rule holds across every RESOLUTION CHANNEL, not just the plain static
// destructure: the symbol fold, the array-wrapped alias and the TS declaration forms each reach the
// receiver through their own walk and must agree on which scope a hop resolves in

// symbol fold through a shadowed hop - the well-known key still folds
const symRoot = _Symbol;
const symLink = symRoot;
export function viaSymbolChain(symRoot) {
  const iterator = _Symbol$iterator;
  return _getIteratorMethod([1]);
}