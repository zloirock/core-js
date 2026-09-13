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
// The wrapper captures the receiver before a neighbour can replace its binding.
// Both nested method reads use that original value after the neighbour's effect.
export function replaced(receiver, other) {
  for (let [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [receiver, receiver = other];;) return [values, at];
}