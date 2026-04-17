import "core-js/modules/es.symbol.async-dispose";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
async function g() {
  for await (await using r of items) {}
}