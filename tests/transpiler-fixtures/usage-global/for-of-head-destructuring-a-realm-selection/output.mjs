import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A for-of head destructuring a realm selection out of an array literal: the static and the instance leaf
// count as usage like their plain twins, the instance one generic, since the other arm is unknown.
for (const {
  Array: {
    prototype: {
      at
    },
    of
  }
} of [c ? globalThis : fb]) use(at, of);