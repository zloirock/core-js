import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// Private field writes retain their union within the declaring class.
class Box {
  #data = [10, 20];
  change() {
    this.#data = "1020";
  }
  read() {
    return this.#data.includes("02");
  }
}
const box = new Box();
box.change();
export const result = box.read();