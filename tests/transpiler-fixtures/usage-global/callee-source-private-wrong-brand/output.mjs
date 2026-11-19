import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.function.name";
// An inherited private call retains its brand check and throws TypeError.
const effects = [];
let r;
class F {
  static #c() {
    return Promise;
  }
  static run() {
    return G.#c().withResolvers;
  }
}
class G extends F {}
try {
  F.run();
} catch (error) {
  r = error.name;
}
export { r, effects };