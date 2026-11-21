import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
class Reader {
  static #owner = Map;
  static set(value) {
    Reader.#owner = value;
  }
  static read(items) {
    return Reader.#owner.groupBy(items, String);
  }
}
Reader.set(Object);
const grouped = Reader.read([3])["3"];
const custom = {
  groupBy(xs) {
    return this === custom && xs;
  }
};
Reader.set(custom);
export const result = [grouped, Reader.read([4])];