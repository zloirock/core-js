import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A guarded realm element supplies sibling constructor branches and an opaque key.
// Global usage injects the potentially needed statics without rewriting the pattern.
let enabled = true;
const key = String(Math.random() > 2);
for (const {
  Array: {
    of,
    [key]: extra
  },
  Object: {
    keys
  }
} of [enabled && globalThis]) {
  use(of, keys, extra);
}