import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.join";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
export function control() {
  let list = function* () {
    yield 1;
  }();
  ({
    a: list
  } = {
    a: [1]
  });
  return list.join();
}