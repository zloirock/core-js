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
// The array getter and default stay between the surrounding initializers.
export function read(receiver, before, fallback, after) {
  const head = before(),
    [{
      /* First read. */at = fallback(),
      other
    }] = [receiver],
    tail = after();
  return [head, at, other, tail];
}