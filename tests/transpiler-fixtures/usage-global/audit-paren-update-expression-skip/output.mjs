import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// parser-preserved parens around `Map` must be peeled so the read side of `(Map)++` still
// triggers the polyfill. Wrapped in `if (false)` because updating a global itself is a
// user bug; only plugin output is asserted, not runtime behavior.
if (false) {
  (Map)++;
}