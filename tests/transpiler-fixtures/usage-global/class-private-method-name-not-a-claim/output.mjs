import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// A private member's name is not a member of anything reachable: `this.#at` reads the class's own
// brand, never `Array.prototype.at`, so no instance claim fires on it. What the class DOES owe is
// the private-method lowering's own brand check, one `WeakSet` per class.
class C {
  #at(i) {
    return i;
  }
  get(i) {
    return this.#at(i);
  }
}