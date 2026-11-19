import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Public pattern keys remain public after consuming a private class slot.
class Inner {
  static ['#owner'] = Object;
}
class Outer {
  static #owner = Inner;
  static read() {
    const {
      ['#owner']: {
        groupBy
      }
    } = Outer.#owner;
    return groupBy([3], String)['3'];
  }
}
console.log(Outer.read());