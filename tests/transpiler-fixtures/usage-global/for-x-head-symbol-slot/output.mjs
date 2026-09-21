import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.symbol.to-string-tag";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.json.to-string-tag";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A symbol-keyed slot keeps its own value beside a polyfilled static in an assignment head.
// Both a direct symbol and its stable alias name the same slot on every iteration.
let tag, from, of;
for ({
  [Symbol.toStringTag]: tag,
  from
} of [Array, Array]) consume(tag, from([1]));
const key = Symbol.toStringTag;
for ({
  [key]: tag,
  of
} of [Array]) consume(tag, of(2));