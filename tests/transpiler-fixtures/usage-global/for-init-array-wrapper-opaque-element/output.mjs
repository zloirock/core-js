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
// A call supplies the element once, before its neighbour. Each extracted method reads
// that captured element after every initializer has evaluated.
export function opaque(make, effect) {
  for (let [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [make(), effect()];;) return [values, at];
}