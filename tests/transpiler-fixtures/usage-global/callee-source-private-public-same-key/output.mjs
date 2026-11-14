import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
// A private method and a public string key select different returned values.
const effects = [];
let r;
class F {
  static ["#c"]() {
    return {
      withResolvers: 17
    };
  }
  static #c() {
    return Promise;
  }
  static run() {
    return [typeof F.#c().withResolvers, F["#c"]().withResolvers];
  }
}
r = F.run();
export { r, effects };