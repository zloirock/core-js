import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `const` declared inside a DOUBLY-nested namespace block is scoped to the inner namespace, so the
// bare `new Map()` outside is the real global. the position-aware over-hoist guard drops the
// over-hoisted inner-namespace const for the outside use so the constructor polyfill is injected
namespace A {
  export namespace B {
    export const Map = 1;
  }
}
new Map();