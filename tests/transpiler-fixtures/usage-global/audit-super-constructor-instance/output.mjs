import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// subclass constructor calling `super(...)` with polyfilled arguments: the args are
// still scanned even though `super()` itself is preserved verbatim.
class C extends WeakMap {
  constructor(x) {
    super();
    this.set(x, 1);
  }
}