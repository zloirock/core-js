import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A public string key cannot hide the same-spelled private field.
// The private Object receiver still needs its own static method.
class Reader {
  static #owner = Object;
  static ["#owner"] = Map;
  static read(items) {
    return Reader.#owner.groupBy(items, String);
  }
}
Reader.read([]);