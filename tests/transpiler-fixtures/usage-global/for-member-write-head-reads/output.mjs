import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Computed keys and defaults in the head are reads before their target writes.
const a = [1, 2];
for ({
  [a.at(0)]: a.at
} of xs) consume(a.at);
const b = [3, 4];
for ([b.includes = b.includes(4)] of ys) consume(b.includes);