import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// The superclass initializes the WeakMap from the argument evaluated before super returns.
class C extends WeakMap {
  constructor(key) {
    super(Array.from([[key, 1]]));
    this.set(key, this.get(key) + 1);
  }
}
const key = {};
export const result = new C(key).get(key);