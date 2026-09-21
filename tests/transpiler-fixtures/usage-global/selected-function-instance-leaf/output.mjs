import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Neither constructor has an `at` method; this read must not inject instance `at` polyfills.
export function read(flag) {
  const [{
    at
  }] = [flag ? Array : Object];
  return at;
}