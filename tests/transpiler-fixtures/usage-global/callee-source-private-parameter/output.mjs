import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A private static parameter retains the built-in supplied at its closed call site.
const effects = [];
let r;
class F {
  static #c(P) {
    return typeof P.allSettled;
  }
  static run() {
    return F.#c(Promise);
  }
}
r = F.run();
export { r, effects };