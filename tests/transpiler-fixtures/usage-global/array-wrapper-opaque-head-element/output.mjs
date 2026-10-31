import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A captured wrapper retains its effectful static key beside an opaque instance leaf.
// Narrowing the constructor cannot shed the capture or duplicate the key evaluation.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [{
      [(log.push('k'), 'of')]: of,
      fromAsync: from
    }, {
      at,
      length
    }] = [e, unknown];
    use(of, from, at, length);
  }
  return log;
}