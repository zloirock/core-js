import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// class private field initialised with `new Map(...)`: the initializer expression is
// still scanned and the constructor call is polyfilled.
class C {
  #map = new Map();
  get(k) {
    return this.#map.get(k);
  }
}