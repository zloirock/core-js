import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// The loop binding keeps its identity after redundant realm hops are removed.
for (const realm of [globalThis]) {
  const {
    globalThis: {
      Array: {
        prototype: {
          at
        }
      }
    }
  } = realm;
  const {
    self: {
      Array: {
        prototype: {
          includes
        }
      }
    } = globalThis
  } = realm;
  use(at, includes);
}