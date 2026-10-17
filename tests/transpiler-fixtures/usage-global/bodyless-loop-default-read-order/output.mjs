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
// A bodyless loop keeps its original statement after each activation's ordered default reads.
const events = [];
const results = [];
for (const [{
  Array: {
    of
  },
  [(events.push('key'), 'with-dash')]: dash,
  sibling: first,
  sibling: second
} = globalThis] of [[], []]) results.push([of(3), dash, first, second]);
use(results, events);