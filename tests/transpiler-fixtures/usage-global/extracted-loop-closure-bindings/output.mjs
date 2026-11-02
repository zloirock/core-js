import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Both extracted and residual locals retain their per-iteration closure.
export function register(rows, handlers) {
  for (const row of rows) {
    const {
      name,
      find
    } = row;
    handlers[name] = () => find();
  }
}