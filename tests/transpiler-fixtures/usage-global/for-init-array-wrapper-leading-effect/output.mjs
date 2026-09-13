import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// A leading hole discards a value, but its initializer still runs before the nested read.
// The loop head keeps the leading effect ahead of the extracted method.
export function leading(receiver, effect) {
  for (let [, {
    w: {
      includes
    }
  }] = [effect(), receiver];;) return includes;
}