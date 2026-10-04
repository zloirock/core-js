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
// Retain the actual inner-default receiver. Keys and repeated native reads keep their slots.
const events = [];
const [{
  Array: {
    of
  },
  [(events.push('key'), 'with-dash')]: dash,
  sibling: first,
  sibling: second
} = globalThis] = [];
use(of(7), dash, first, second, events);