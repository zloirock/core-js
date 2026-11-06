import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a SYMBOL-key alias chain folds through the same per-hop scope advance, under a same-name
// param shadow of its source
const iter = Symbol.iterator;
const aliasedIter = iter;
export function viaSymbolAliasShadowed(iter) {
  return [7, 8][aliasedIter];
}