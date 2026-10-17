import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the alias-hop scope rule holds across every RESOLUTION CHANNEL, not just the plain static
// destructure: the symbol fold, the array-wrapped alias and the TS declaration forms each reach the
// receiver through their own walk and must agree on which scope a hop resolves in

// symbol fold through a shadowed hop - the well-known key still folds
const symRoot = Symbol;
const symLink = symRoot;
export function viaSymbolChain(symRoot) {
  const {
    iterator
  } = symLink;
  return [1][iterator];
}