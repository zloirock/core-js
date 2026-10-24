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
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An effectful constructor element retains its call beside an opaque prototype default.
// The instance leaf keeps generic dispatch while the static retains its substitution.
export function read(unknown) {
  const log = [];
  function make() {
    log.push('make');
    return Array;
  }
  for (const {
    fromAsync: from,
    prototype: {
      at,
      length
    } = unknown
  } of [make()]) use(from, at, length);
  return log;
}