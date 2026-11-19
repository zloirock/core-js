import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A private method destructures a constructor out of a literal wrapper.
// The native pattern keeps the supplied constructor's whole namespace.
class Factory {
  static #read({
    C
  }) {
    return typeof C.allSettled;
  }
  static run() {
    return Factory.#read({
      C: Promise
    });
  }
}
Factory.run();