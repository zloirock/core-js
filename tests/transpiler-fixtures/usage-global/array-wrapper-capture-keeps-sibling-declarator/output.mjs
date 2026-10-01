import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Global presence guard; the pure twin observes the shared declaration.
// An effectful array-wrapper leaf keeps its residual beside a trailing declarator.
// Both instance reads keep their source order within the shared declaration.
export function read(log) {
  const [{
      [(log.push('key'), 'at')]: at,
      other
    }] = [[3]],
    [{
      includes
    }] = [[1, 2]];
  return [at, other, includes];
}