import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.values";
// Nested array wrappers preserve their positional captures. Neighbour effects run before
// the nested receiver is read, and each method dispatch uses the inner element.
export function nested(receiver, effect) {
  for (let [[{
    w: {
      values
    },
    y: {
      at
    }
  }]] = [[receiver], effect()];;) return [values, at];
}