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
// A bodyless assignment reads both nested methods from the original array element.
// Its later initializer may change the source variable before either method is used.
export function read(source, replacement) {
  let values, at;
  if (source) [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [source, source = replacement];
  return [values, at];
}