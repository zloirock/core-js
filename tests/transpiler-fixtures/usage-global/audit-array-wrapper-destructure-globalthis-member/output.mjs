import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// ArrayPattern-wrapped destructure whose element is a proxy-global member access
// (`[globalThis.Array]`); the `from` receiver resolves through the member chain to `Array`,
// so the dep must be injected just like a bare `const { from } = globalThis.Array`
const [{
  from
}] = [globalThis.Array];
from([1, 2, 3]);