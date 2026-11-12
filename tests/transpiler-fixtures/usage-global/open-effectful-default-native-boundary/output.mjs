import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An open caller keeps its parameter pattern. A mirrored default serves the static
// while its native sibling getter still runs after the computed key.
const events = [];
export function read([{
  Array: {
    of
  },
  [(events.push('key'), 'sibling')]: value
} = globalThis]) {
  return [of, value];
}