import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// This method is not supplied by loop syntax, so the import set observes the receiver.
for (const realm of [globalThis]) {
  const {
    Array: {
      prototype: {
        at: method
      }
    }
  } = (before(), realm);
  use(method);
}