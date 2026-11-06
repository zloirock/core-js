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
// The initializer evaluates whole before any method is read. Pattern elements then read in
// source order: the first element's methods precede the next element's property getter.
export function sibling(receiver, effect) {
  for (let [{
    w: {
      values
    },
    y: {
      at
    }
  }, {
    z
  }] = [receiver, effect()];;) return [values, at, z];
}