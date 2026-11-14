import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A named private-field write invalidates its initial constructor even inside a method.
export class Reader {
  static #owner = Map;
  static set(value) {
    Reader.#owner = value;
  }
  static read(items) {
    return Reader.#owner.groupBy(items, String);
  }
}