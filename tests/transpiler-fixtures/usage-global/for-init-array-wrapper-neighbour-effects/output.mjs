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
// Array wrapper neighbours evaluate before the nested methods are read. The loop head
// keeps that evaluation and extracts each method in property order from the paired receiver.
export function trailing(receiver, effect) {
  for (let [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [receiver, effect()];;) return [values, at];
}