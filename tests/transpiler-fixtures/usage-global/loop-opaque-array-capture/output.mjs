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
// A loop header captures an opaque nested receiver once before its method is read.
// Keep the source call and getter in their original order.
function read(make) {
  for (const [{
    nested: {
      at
    }
  }] = [make()];;) return at.call([3, 7], -1);
}
use(read);