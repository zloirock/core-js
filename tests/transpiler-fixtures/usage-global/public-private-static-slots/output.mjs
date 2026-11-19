import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Private names and public string keys are distinct slots.
// Serving a named static does not require the whole constructor namespace.
class Reader {
  static ["#owner"] = Map;
  static #owner = Object;
  static read(items) {
    return Reader["#owner"].groupBy(items, String);
  }
}
Reader.read([]);