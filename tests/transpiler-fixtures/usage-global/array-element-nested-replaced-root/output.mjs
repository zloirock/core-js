import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A later element can replace the root binding, but not the value already captured.
export function read() {
  let box = {
    y: {
      at: 1
    }
  };
  const [{
    y: {
      at
    }
  }, tail] = [box, box = {
    y: {
      at: 9
    }
  }];
  return [at, tail.y.at];
}