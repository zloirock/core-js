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
// An open caller cannot move its parameter pattern into the body. A native sibling read
// after a key effect keeps this default native; its static may lack a pure polyfill.
const events = [];
export function read([{
  Array: {
    of
  },
  [(events.push('key'), 'sibling')]: value
} = globalThis]) {
  return [of, value];
}