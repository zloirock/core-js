import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a non-var (`const`) binding inside a namespace block is scoped to that namespace, so a bare
// `new Map()` outside the block is the real global. the parser over-hoists the namespace const to
// the enclosing scope; the position-aware over-hoist guard drops it for the outside use so the
// global constructor polyfill is injected
namespace N {
  export const Map = 1;
}
new Map();