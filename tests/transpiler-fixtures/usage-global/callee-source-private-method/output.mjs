import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.push";
// A private static callable supplies the constructor used by its caller.
const effects = [];
let r;
class F {
  static #c() {
    effects.push("callee");
    return Promise;
  }
  static run() {
    return typeof F.#c().withResolvers;
  }
}
r = F.run();
export { r, effects };