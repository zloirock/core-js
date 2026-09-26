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
// Independent nested reads retain source order and separate repeated getters.
export function read(source, effect) {
  const [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [source, effect()];
  return [values, at];
}
export function repeated(source) {
  const [{
    w: {
      at: first
    },
    w: {
      at: second
    }
  }] = [source];
  return [first, second];
}