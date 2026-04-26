import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// instance-method access via `super.method` (no call): the lookup is rewritten through
// the superclass binding, with the polyfill emitted accordingly.
class C extends Map {
  m() {
    return super.get(1);
  }
}