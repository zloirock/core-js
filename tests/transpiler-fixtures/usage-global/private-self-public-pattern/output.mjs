import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Consuming a private slot permits revisiting its class through a public pattern.
class Same {
  static #owner = Same;
  static ['#owner'] = Object;
  static read() {
    const {
      ['#owner']: {
        groupBy
      }
    } = Same.#owner;
    return groupBy([3], String)['3'];
  }
}
console.log(Same.read());