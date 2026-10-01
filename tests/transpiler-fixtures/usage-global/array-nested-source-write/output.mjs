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
// A later array element can replace the source name after its object was selected.
// Nested method reads retain the selected element and their original order.
export function read(source, replacement) {
  const [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [source, source = replacement];
  return [values, at];
}